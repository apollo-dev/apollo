# woot.apps.expt.commands

# django
from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView, RedirectView

# local
from apps.expt.command import list_experiments, create_experiment, extract_experiment_details, generate_series_preview

urlpatterns = [
	url(r'^list_experiments/', list_experiments),
	url(r'^create_experiment/', create_experiment),
	url(r'^extract_experiment_details/(?P<experiment_name>.+)/', extract_experiment_details),
	url(r'^generate_series_preview/(?P<experiment_name>.+)/(?P<series_name>.+)/', generate_series_preview),
]
