from django.conf import settings
from django.utils.module_loading import import_string

# set up celery backend
BACKEND_PATH = getattr(settings, 'CELERY_PROGRESS_BACKEND', 'apps.expt.backends.CeleryBackend')

backend = import_string(BACKEND_PATH)()
