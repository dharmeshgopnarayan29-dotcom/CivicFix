from django.urls import path
from .views import IssueListCreateView, IssueDetailView, AnalyticsView, UserIssueListView

urlpatterns = [
    path('my/', UserIssueListView.as_view(), name='my-issues'),
    path('', IssueListCreateView.as_view(), name='issue-list-create'),
    path('<int:pk>/', IssueDetailView.as_view(), name='issue-detail'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
]
