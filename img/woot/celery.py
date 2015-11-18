from __future__ import absolute_import
import os
from celery import Celery

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'woot.settings')

from django.conf import settings  # noqa

apollo_celery_app = Celery('woot')

# Using a string here means the worker will not have to
# pickle the object when using Windows.
apollo_celery_app.config_from_object('django.conf:settings')
apollo_celery_app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

apollo_celery_app.conf.update(
	CELERY_RESULT_BACKEND='djcelery.backends.database:DatabaseBackend',
)
