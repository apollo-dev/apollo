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

urlpatterns = [
	# get a list of current experiment names
	url(r'^list_experiments/', list_experiments),

	# create an experiment given a name and a lif path
	url(r'^create_experiment/', create_experiment),

	# extract partial metadata with series names
	url(r'^extract_partial_metadata/', extract_partial_metadata),

	# list series of a given experiment. Create series if necessary.
	url(r'^list_series/', list_series),

	# extract full omexml metadata for series details
	url(r'^extract_metadata/', extract_metadata),

	# extract a small set of preview images from the archive
	url(r'^extract_preview_images/', extract_preview_images),

	# return the series metadata
	url(r'^series_details/', series_details),

	# return the experiment metadata
	url(r'^experiment_details/', experiment_details),

	# extract a full set of series images from the archive
	url(r'^extract_series/', extract_series),
]

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
def list_series(request):
	if request.method == 'POST':
		experiment_name = request.POST.get('experiment_name')
		experiment = Experiment.objects.get(name=experiment_name)

		return JsonResponse([series.name for series in experiment.series.all()], safe=False)

@csrf_exempt
def extract_experiment_details(request):
	if request.method == 'POST':
		experiment_name = request.POST.get('experiment_name')

		# get experiment image size, total duration, number of series
		experiment = Experiment.objects.get(name=experiment_name)
		series_list = experiment.series_list()

		# for each series make a series object
		for series_name in series_list:
			series, series_created = experiment.series.get_or_create(name=series_name)

		return JsonResponse({'number_of_series':str(len(series_list))})

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

		# CELERY
		metadata = series.metadata()
		# metadata = get_metadata.call() or something

		return JsonResponse({'metadata':metadata})

@csrf_exempt
def extract_series(request):
	if request.method == 'POST':
		experiment_name = request.POST.get('experiment_name')
		series_name = request.POST.get('series_name')

		series = Series.objects.get(experiment__name=experiment_name, name=series_name)

		# THIS HAS TO BE A CELERY TASK
		series.extract()

		return JsonResponse({'status':'complete'})
