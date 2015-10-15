# woot.apps.expt.commands

# django
from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView, RedirectView

# local
from apps.expt.command import create_experiment

urlpatterns = [
	url(r'^create_experiment/', create_experiment),
]
