# woot.apps.expt.tasks

# django
from django.conf import settings

# local
from woot.celery import app
from apps.expt import backend

# util
from subprocess import Popen, PIPE

### TASKS
@app.task(bind=True)
def extract_partial_metadata(lif_path, partial_inf_path):
	showinf = join(settings.BIN_ROOT, 'bftools', 'showinf')
	with Popen('{} -no-upgrade -novalid -nopix {} > {}'.format(showinf, lif_path, partial_inf_path)) as extract_partial_metadata_proc:
		for line in extract_partial_metadata_proc.stderr:
			# update progress
			

@app.task(bind=True)
def extract_metadata(self):

@app.task(bind=True)
def extract_preview_images(self):

@app.task(bind=True)
def extract_series(self):
