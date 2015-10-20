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
from apps.expt.models import Experiment

# util
import json

### Views

# methods
@csrf_exempt
def list_experiments(request):
	if request.method == 'GET':
		# safe=False allows non-dict obejcts to be serialised
		# https://docs.djangoproject.com/en/1.8/ref/request-response/#jsonresponse-objects
		return JsonResponse([experiment.name for experiment in Experiment.objects.all()], safe=False)

@csrf_exempt
def create_experiment(request):
	if request.method == 'POST':

		# create experiment using lif path, experiment directory path, inf file name, and experiment name
		experiment_name = request.POST.get('experiment_name')
		experiment_path = request.POST.get('experiment_path')
		experiment_file_type = request.POST.get('experiment_file_type')
		experiment_inf_path = request.POST.get('experiment_inf_path')

		experiment, experiment_created = Experiment.objects.get_or_create(name=experiment_name)

		if experiment_created:
			if experiment_file_type == 'D':
				experiment.storage_path = experiment_path
				experiment.inf_path = experiment_inf_path
			else:
				experiment.lif_path = experiment_path

			experiment.get_templates()

			return JsonResponse({'name': experiment.name, 'status':'created'})

		else:
			return JsonResponse({'name': experiment.name, 'status':'exists'})

@csrf_exempt
def extract_experiment_details(request, experiment_name):
	if request.method == 'GET':
		# get experiment dimensions in Ch and T
		# get list of series names

		return JsonResponse()

@csrf_exempt
def generate_series_preview(request, experiment_name, series_name):
	if request.method == 'GET':
		# get experiment dimensions in Ch and T
		# get list of series names

		return JsonResponse()
