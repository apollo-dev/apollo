# woot.apps.expt.commands

# django
from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView, RedirectView

# local
from apps.expt.command import *

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

	# return the experiment metadata
	url(r'^experiment_details/', experiment_details),

	# return the series metadata
	url(r'^series_details/', series_details),

	# extract a full set of series images from the archive
	url(r'^extract_series/', extract_series),
]
