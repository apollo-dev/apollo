# woot.apps.expt.commands

# django
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from django.core.cache import cache
from django.views.generic import View
from django.conf import settings
from django.template import Template
from django.views.decorators.csrf import csrf_exempt

# local

# util
import json

### Views

# methods
@csrf_exempt
def create_experiment(request):
	if request.method == 'POST':

		# create experiment using lif path, experiment directory path, inf file name, and experiment name
		experiment_name = request.POST.get('experiment_name')
		experiment_path = request.POST.get('experiment_path')
		experiment_file_type = request.POST.get('experiment_file_type')
		experiment_inf_path = request.POST.get('experiment_inf_path')

		return HttpResponse('success')
