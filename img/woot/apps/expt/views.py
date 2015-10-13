# woot.apps.expt.views

# django
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.core.cache import cache
from django.views.generic import View
from django.conf import settings

# local
from apps.expt.models import Experiment, Series

# util

### Views

# classes
### https://docs.djangoproject.com/en/1.7/topics/class-based-views/intro/
class StartupView(View):
	def get(self, request):

		experiments = Experiment.objects.all()

		return render(request, 'expt/start.html', {'experiments':experiments})
