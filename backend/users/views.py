from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.conf import settings

from .models import CustomUser
from .serializers import UserSerializer


# ── Helpers ──

# In development (DEBUG=True), Secure=False so cookies work over http://localhost
_COOKIE_SECURE = not settings.DEBUG
_COOKIE_SAMESITE = 'Lax'


def _set_auth_cookies(response, access_token, refresh_token):
    """Attach HttpOnly JWT cookies to a response."""
    response.set_cookie(
        'access_token',
        str(access_token),
        httponly=True,
        secure=_COOKIE_SECURE,
        samesite=_COOKIE_SAMESITE,
        max_age=3600,          # 1 hour
        path='/',
    )
    response.set_cookie(
        'refresh_token',
        str(refresh_token),
        httponly=True,
        secure=_COOKIE_SECURE,
        samesite=_COOKIE_SAMESITE,
        max_age=86400 * 7,     # 7 days
        path='/',
    )
    return response


def _clear_auth_cookies(response):
    """Remove both JWT cookies."""
    response.delete_cookie('access_token', path='/')
    response.delete_cookie('refresh_token', path='/')
    return response


# ── Registration (unchanged) ──

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer


# ── Login — sets HttpOnly cookies, returns only user metadata ──

class CookieTokenObtainView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'detail': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response(
                {'detail': 'Invalid credentials.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.check_password(password):
            return Response(
                {'detail': 'Invalid credentials.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        # Embed custom claims (same as before)
        refresh['role'] = user.role
        refresh['email'] = user.email
        refresh['username'] = user.username
        access = refresh.access_token

        # Build response — body has NO tokens, only user info
        response = Response({
            'role': user.role,
            'username': user.username,
            'email': user.email,
        })

        _set_auth_cookies(response, access, refresh)
        return response


# ── Logout — clears cookies ──

class LogoutView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        response = Response({'detail': 'Logged out.'})
        _clear_auth_cookies(response)
        return response


# ── /me/ — returns current user info from the cookie session ──

class CurrentUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'role': user.role,
            'username': user.username,
            'email': user.email,
        })


# ── Token Refresh — reads refresh cookie, sets new access cookie ──

class CookieTokenRefreshView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        raw_refresh = request.COOKIES.get('refresh_token')
        if not raw_refresh:
            return Response(
                {'detail': 'Refresh token not found.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(raw_refresh)
            new_access = refresh.access_token
        except TokenError:
            response = Response(
                {'detail': 'Refresh token is expired or invalid.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            _clear_auth_cookies(response)
            return response

        response = Response({'detail': 'Token refreshed.'})
        # Update only the access cookie; refresh stays the same
        response.set_cookie(
            'access_token',
            str(new_access),
            httponly=True,
            secure=_COOKIE_SECURE,
            samesite=_COOKIE_SAMESITE,
            max_age=3600,
            path='/',
        )
        return response
