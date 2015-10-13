# woot.apps.expt.urls

# django
from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView, RedirectView

# local
from apps.expt.views import StartupView

urlpatterns = [
	url(r'^$', StartupView.as_view()),
	url(r'^commands/', include('apps.expt.commands')),
]
