# woot.apps.expt.tasks

# django
from django.conf import settings

# local
from woot.celery import apollo_celery_app
from apps.expt import backend
from apps.expt.models import Experiment, Series

# util
# from celery import Task
from subprocess import Popen, PIPE

# articles on tasks
# http://jsatt.com/blog/class-based-celery-tasks/
# http://stackoverflow.com/questions/6393879/celery-task-and-customize-decorator

### TASKS
@apollo_celery_app.task(bind=True)
def extract_partial_metadata(self, lif_path, partial_inf_path):
	showinf = join(settings.BIN_ROOT, 'bftools', 'showinf')
	line_template = r'.+Converted .+/.+ planes \((?P<percentage>.+)%\)'
	with Popen('{} -no-upgrade -novalid -nopix {} > {}'.format(showinf, lif_path, partial_inf_path)) as extract_partial_metadata_proc:
		status = 'extracting'
		current = 0

		# update progress
		backend.set_progress(self.request.id, current, status)

	return 'done'

@apollo_celery_app.task(bind=True)
def extract_metadata(self, lif_path, inf_path):
	showinf = join(settings.BIN_ROOT, 'bftools', 'showinf')
	line_template = r'.+Converted .+/.+ planes \((?P<percentage>.+)%\)'
	with Popen('{} -no-upgrade -novalid -nopix -omexml {} > {}'.format(showinf, lif_path, inf_path)) as extract_metadata_proc:
		status = 'extracting'
		current = 0

		# update progress
		backend.set_progress(self.request.id, current, status)

	return 'done'

@apollo_celery_app.task(bind=True)
def extract_preview_images(self, experiment_pk):
	# this unfortunately has to been done in one lump for speed and consistency purposes.
	# The preview image for the processed series (composite) can be done later with more
	# information.

	experiment = Experiment.objects.get(pk=experiment_pk)

	# 1. get range of images from each series
	# - I have to get all preview images from the series in the same call because the JVM starts and stops every time
	# it is run, which is annoying. This means I have extract using a call that will not throw an error with any
	# series. This mean I can't use "timepoint", "z", "channel" as series might not contain these. If I use "range",
	# it will not throw an error if the range is larger. So, I have decided to use half the maximum z of any
	# series for the upper limit. Then, each series will be in a separate tiff and can be separated again.
	if len(os.listdir(experiment.preview_path)) < experiment.series.count():
		max_z = max([series.zs for series in experiment.series.all()]) + 1

		bfconvert = join(settings.BIN_ROOT, 'bftools', 'bfconvert')
		fake_preview_path = join(experiment.preview_path, '{}_s%s_ch%c_t%t_z%z_preview.tiff'.format(experiment.name))
		call('{bf} -range 0 {max_z} {path} {out}'.format(bf=bfconvert, max_z=max_z, path=experiment.lif_path, out=fake_preview_path), shell=True)

	# 2. convert tiff to png for browser
	for series in experiment.series.all():
		series.preview_path = join(experiment.preview_path, '{}_s{}_ch{}_t{}_z{}_preview.png'.format(experiment.name, series.name, series.max_channel(), 0, series.mid_z()))
		series.save()

		# select preview path using max_channel and mid_z
		if not exists(series.preview_path):
			selected_path = join(experiment.preview_path, '{}_s{}_ch{}_t{}_z{}_preview.tiff'.format(experiment.name, series.name, series.max_channel(), 0, series.mid_z()))
			convert = join(settings.BIN_ROOT, 'convert')
			call('{} -contrast-stretch 0 {} {}'.format(convert, selected_path, series.preview_path), shell=True)

	# delete everything that is not the selected paths
	for file_name in os.listdir(experiment.preview_path):
		if join(experiment.preview_path, file_name) not in [series.preview_path for series in experiment.series.all()]:
			os.remove(join(experiment.preview_path, file_name))

@apollo_celery_app.task(bind=True)
def extract_series(self, experiment_pk, series_name):
	# get series
	experiment = Experiment.objects.get(pk=experiment_pk)
	series = experiment.series.get(name=series_name)

	# wait in queue
	extraction_counter = experiment.extraction_counter
	while extraction_counter == experiment.extraction_cap:
		# reset from db (is this the right way?)
		extraction_counter = experiment.extraction_counter

		# set "in-queue"
		series.in_queue = True
		series.save()

	# when out of queue
	series.in_queue = False
	series.is_new = False
	series.save()

	# extract
	source_path = join(experiment.source_path, '{}_s{}_ch-%c_t%t_z%z.tiff'.format(experiment.name, series_name))
	lif_path = experiment.lif_path
	bfconvert = join(settings.BIN_ROOT, 'bftools', 'bfconvert')
	cmd = '{} -series {} {} {}'.format(bfconvert, series_name, lif_path, source_path)

	with Popen(cmd, shell=True, stdout=PIPE, stderr=PIPE, bufsize=1, universal_newlines=True) as extract_stream:
		ln_template = r'.+Converted .+/.+ planes \((?P<percentage>.+)%\)'
		for ln in extract_stream.stderr:
			if 'Converted' in ln:
				ln_match = re.match(ln_template, ln)
				percentage = int(ln_match.group('percentage'))

				series.source_extraction_percentage = percentage
				series.save()

	series.processing_complete = True
	series.save()
