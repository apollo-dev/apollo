from django.conf import settings
from django.utils.module_loading import import_by_path

# set up celery backend
BACKEND_PATH = getattr(settings, 'CELERY_PROGRESS_BACKEND', 'apps.expt.backends.CeleryBackend')

backend = import_by_path(BACKEND_PATH)()
