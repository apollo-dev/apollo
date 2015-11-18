# woot.apps.expt.tasks

# django
from django.conf import settings

# local
from woot.celery import apollo_celery_app
from apps.expt import backend

# util
from celery import Task
from subprocess import Popen, PIPE

# articles on tasks
# http://jsatt.com/blog/class-based-celery-tasks/
# http://stackoverflow.com/questions/6393879/celery-task-and-customize-decorator

### TASKS
@app.task(bind=True)
def extract_partial_metadata(self, lif_path, partial_inf_path):
	showinf = join(settings.BIN_ROOT, 'bftools', 'showinf')
	line_template = r'.+Converted .+/.+ planes \((?P<percentage>.+)%\)'
	with Popen('{} -no-upgrade -novalid -nopix {} > {}'.format(showinf, lif_path, partial_inf_path)) as extract_partial_metadata_proc:
		for line in extract_partial_metadata_proc.stderr:
			status = 'starting'
			if 'Converted' in line:
				# get progress from output
				status = 'converting'

				line_match = re.match(line_template, line)
				current = int(ln_match.group('percentage'))

			# update progress
			backend.set_progress(self.request.id, current, status)

@app.task(bind=True)
def extract_metadata(self):

@app.task(bind=True)
def extract_preview_images(self):

@app.task(bind=True)
def extract_series(self):
