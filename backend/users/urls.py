from django.urls import path
from .views import RegisterView, CookieTokenObtainView, CookieTokenRefreshView, LogoutView, CurrentUserView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CookieTokenObtainView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
]
