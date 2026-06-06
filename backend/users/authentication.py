"""
Custom JWT authentication that reads tokens from HttpOnly cookies
instead of the Authorization header, eliminating XSS vulnerability.
"""

from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """
    Extends SimpleJWT's default authentication to read the access token
    from an HttpOnly cookie named 'access_token' instead of the
    Authorization header.
    """

    def authenticate(self, request):
        raw_token = request.COOKIES.get('access_token')
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
