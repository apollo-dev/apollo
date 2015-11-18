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

	# monitor partial metadata extraction
	url(r'^extract_partial_metadata_monitor/', extract_partial_metadata_monitor),

	# list series of a given experiment. Create series if necessary.
	url(r'^list_series/', list_series),

	# extract full omexml metadata for series details
	url(r'^extract_metadata/', extract_metadata),

	# monitor metadata extraction
	url(r'^extract_metadata_monitor/', extract_metadata_monitor),

	# extract a small set of preview images from the archive
	url(r'^extract_preview_images/', extract_preview_images),

	# monitor preview images
	url(r'^extract_preview_images_monitor/', extract_preview_images_monitor),

	# get list of preview images
	url(r'^list_preview_images/', list_preview_images),

	# return the experiment metadata
	url(r'^experiment_metadata/', experiment_metadata),

	# return the series metadata
	url(r'^series_metadata/', series_metadata),

	# extract a full set of series images from the archive
	url(r'^extract_series/', extract_series),

	# monitor series extraction
	url(r'^extract_series_monitor/', extract_series_monitor),
]
