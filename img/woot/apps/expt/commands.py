# woot.apps.expt.commands

# django
from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView, RedirectView

# local
from apps.expt.command import list_experiments, create_experiment

urlpatterns = [
	url(r'^list_experiments/', list_experiments),
	url(r'^create_experiment/', create_experiment),
]
