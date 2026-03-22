from django.contrib import admin

# Register your models here.
from .models import Category, Issue          # This imports your models

# This tells Django: "Show these tables in the Admin UI"
admin.site.register(Category)
admin.site.register(Issue)