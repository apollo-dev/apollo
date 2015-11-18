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
from apps.expt.models import Experiment, Series
from apps.expt.tasks import extract_partial_metadata_task, extract_metadata_task, extract_preview_images_task, extract_series_task

# util
import json

### Views
@csrf_exempt
def list_experiments(request):
	if request.method == 'POST':
		# safe=False allows non-dict obejcts to be serialised
		# https://docs.djangoproject.com/en/1.8/ref/request-response/#jsonresponse-objects
		return JsonResponse([experiment.name for experiment in Experiment.objects.all()], safe=False)

@csrf_exempt
def create_experiment(request):
	if request.method == 'POST':

		# create experiment using lif path, experiment directory path, inf file name, and experiment name
		experiment_name = request.POST.get('experiment_name')
		lif_path = request.POST.get('lif_path')

		experiment, experiment_created = Experiment.objects.get_or_create(name=experiment_name)

		if experiment_created:
			experiment.lif_path = lif_path
			experiment.make_paths()
			experiment.make_templates()
			experiment.save()
			return JsonResponse({'experiment_name': experiment.name, 'status':'created'})

		else:
			return JsonResponse({'experiment_name': experiment.name, 'status':'exists'})

@csrf_exempt
def extract_partial_metadata(request):
	if request.method == 'POST':
		experiment_name = request.POST.get('experiment_name')
		experiment = Experiment.objects.get(name=experiment_name)

		result = extract_partial_metadata_task.delay(experiment.pk)

		return JsonResponse({'experiment_name':experiment_name, 'task_id':result.task_id})

@csrf_exempt
def extract_partial_metadata_monitor(request):
	if request.method == 'POST':
		

@csrf_exempt
def list_series(request):
	if request.method == 'POST':
		experiment_name = request.POST.get('experiment_name')
		experiment = Experiment.objects.get(name=experiment_name)

		# create series
		series_list = experiment.series_list()
		for series_name in series_list:
			series, series_created = experiment.series.get_or_create(name=series_name)

		return JsonResponse([series.name for series in experiment.series.all()], safe=False)

@csrf_exempt
def extract_metadata(request):
	if request.method == 'POST':
		experiment_name = request.POST.get('experiment_name')
		experiment = Experiment.objects.get(name=experiment_name)

		result = extract_metadata_task.delay(experiment.pk)

		return JsonResponse({'experiment_name':experiment_name, 'task_id':result.task_id})

@csrf_exempt
def extract_preview_images(request):
	if request.method == 'POST':
		experiment_name = request.POST.get('experiment_name')
		experiment = Experiment.objects.get(name=experiment_name)

		# make preview images
		result = extract_preview_images_task.delay(experiment.pk)

		return JsonResponse({'experiment_name':experiment_name, 'task_id':result.task_id})

@csrf_exempt
def experiment_details(request):
	if request.method == 'POST':
		experiment_name = request.POST.get('experiment_name')
		experiment = Experiment.objects.get(name=experiment_name)

		return JsonResponse(experiment.metadata())

@csrf_exempt
def series_details(request):
	if request.method == 'POST':
		experiment_name = request.POST.get('experiment_name')
		series_name = request.POST.get('series_name')

		series = Series.objects.get(experiment__name=experiment_name, name=series_name)

		return JsonResponse(series.metadata())

@csrf_exempt
def extract_series(request):
	if request.method == 'POST':
		experiment_name = request.POST.get('experiment_name')
		series_name = request.POST.get('series_name')
		series = Series.objects.get(experiment__name=experiment_name, name=series_name)

		result = extract_series.delay(series.pk)

		return JsonResponse({'experiment_name':experiment_name, 'series_name':series_name, 'task_id':result.task_id})
