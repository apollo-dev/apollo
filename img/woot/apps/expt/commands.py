# woot.apps.expt.commands

# django
from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView, RedirectView

# local
from apps.expt.command import *

urlpatterns = [
	url(r'^list_experiments/', list_experiments),
	url(r'^create_experiment/', create_experiment),
	url(r'^extract_experiment_details/', extract_experiment_details),
	url(r'^list_series/', list_series),
	url(r'^generate_series_preview/', generate_series_preview),
	url(r'^series_details/', series_details),
	url(r'^extract_series/', extract_series),
	url(r'^series_extraction_status/', series_extraction_status),
]
