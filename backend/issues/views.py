from rest_framework import generics, permissions
from .models import Issue
from .serializers import IssueSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count

class UserIssueListView(generics.ListAPIView):
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Issue.objects.filter(reported_by=self.request.user).order_by('-created_at')

class IssueListCreateView(generics.ListCreateAPIView):
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['category', 'status', 'reported_by']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return Issue.objects.all()

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)

class IssueDetailView(generics.RetrieveUpdateAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]

class AnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        status_counts = Issue.objects.values('status').annotate(count=Count('id'))
        category_counts = Issue.objects.values('category').annotate(count=Count('id'))
        
        return Response({
            'status_counts': status_counts,
            'category_counts': category_counts,
        })
