# woot.apps.expt.commands

# django
from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView, RedirectView

# local
from apps.expt.command import *

urlpatterns = [
	url(r'^list_experiments/', list_experiments),
	url(r'^create_experiment/', create_experiment),
	url(r'^extract_experiment_details/(?P<experiment_name>.+)/', extract_experiment_details),
	url(r'^list_series/(?P<experiment_name>.+)/', list_series),
	url(r'^generate_series_preview/(?P<experiment_name>.+)/(?P<series_name>.+)/', generate_series_preview),
]
