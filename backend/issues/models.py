from django.db import models

# Create your models here.
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Category Name")
    description = models.TextField(blank=True, verbose_name="Category Description")

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Issue(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    )
    title = models.CharField(max_length=200, verbose_name="Issue Title")
    description = models.TextField(verbose_name="Issue Description")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='issues')
    photo = models.ImageField(blank=True, null=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    department = models.CharField(max_length=100, blank=True, null=True)
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reported_issues')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Issue Date-Time")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title}"
