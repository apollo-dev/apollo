# img.urls

from django.conf.urls import include, url
from django.views.generic import TemplateView, RedirectView
from django.conf import settings
from django.conf.urls.static import static

from django.contrib import admin
admin.autodiscover()

urlpatterns = [
	# Serving media
	url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT, 'show_indexes': True }),

	# static
	# url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root', settings.STATIC_ROOT}),

	# redirect home page to expt app
	url(r'^expt/', include('apps.expt.urls')),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
