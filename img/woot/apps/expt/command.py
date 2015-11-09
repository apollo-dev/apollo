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
from apps.expt.models import Experiment, LifFile, Series

# util
import json

### Views

# methods
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
			lif = LifFile.objects.create(experiment=experiment)
			experiment.lif = lif
			lif.save()
			experiment.make_paths()
			experiment.make_templates()
			experiment.save()
			return JsonResponse({'name': experiment.name, 'status':'created'})

		else:
			return JsonResponse({'name': experiment.name, 'status':'exists'})

@csrf_exempt
def extract_experiment_details(request):
	if request.method == 'POST':
		experiment_name = request.POST.get('experiment_name')

		# get experiment image size, total duration, number of series
		experiment = Experiment.objects.get(name=experiment_name)
		series_list = experiment.list_series()

		# for each series make a series object
		for series_name in series_list:
			series, series_created = experiment.series.get_or_create(name=series_name)

		return JsonResponse({'number_of_series':str(len(series_list))})

@csrf_exempt
def list_series(request):
	if request.method == 'POST':
		experiment_name = request.POST.get('experiment_name')

		experiment = Experiment.objects.get(name=experiment_name)

		# get series metadata from LifFile
		# rs, cs, zs, ts, channel names
		# rmop, cmop, zmop, tpf
		for series in experiment.series.all():
			series_metadata = series.metadata()

		return JsonResponse([{'name':series.name, 'title':series.title} for series in experiment.series.all()], safe=False)

@csrf_exempt
def generate_series_preview(request):
	if request.method == 'POST':
		experiment_name = request.POST.get('experiment_name')

		experiment = Experiment.objects.get(name=experiment_name)

		# make preview images
		experiment.make_preview_images()

		# data
		series_list = [series.name for series in experiment.series.all()]
		series_path_dictionary = {series.name:{'path':series.preview_path,'half':'true' if not series.rs==series.cs else 'false'} for series in experiment.series.all()}

		return JsonResponse({'experiment_name':experiment_name, 'series_list':series_list, 'series_paths':series_path_dictionary})

@csrf_exempt
def series_details(request):
	if request.method == 'POST':
		experiment_name = request.POST.get('experiment_name')
		series_name = request.POST.get('series_name')

		series = Series.objects.get(experiment__name=experiment_name, name=series_name)

		return JsonResponse({'metadata':series.metadata()})

@csrf_exempt
def extract_series(request):
	if request.method == 'POST':
		experiment_name = request.POST.get('experiment_name')
		series_name = request.POST.get('series_name')

		series = Series.objects.get(experiment__name=experiment_name, name=series_name)
		series.extract()

		return JsonResponse('')

@csrf_exempt
def is_series_extracting(request):
	if request.method == 'POST':
		experiment_name = request.POST.get('experiment_name')
		series_name = request.POST.get('series_name')

		series = Series.objects.get(experiment__name=experiment_name, name=series_name)
