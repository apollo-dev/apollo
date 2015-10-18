# woot.apps.expt.urls

# django
from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView, RedirectView

urlpatterns = [
	url(r'^commands/', include('apps.expt.commands')),
]
