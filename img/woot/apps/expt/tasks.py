# woot.apps.expt.tasks

# django
from django.conf import settings

# local
from woot.celery import apollo_celery_app
from apps.expt.models import Experiment, Series
from apps.expt.util import Stream

# util
import os
import re
from celery.app.log import Logging
from os.path import exists, join
from subprocess import Popen, PIPE

# celery logging
logging = Logging(apollo_celery_app)
default_logger = logging.get_default_logger()
logging.redirect_stdouts_to_logger(default_logger, stdout=False, stderr=False)

# articles on tasks
# http://jsatt.com/blog/class-based-celery-tasks/
# http://stackoverflow.com/questions/6393879/celery-task-and-customize-decorator

### TASKS
@apollo_celery_app.task(bind=True)
def extract_partial_metadata_task(self, experiment_pk):
	experiment = Experiment.objects.get(pk=experiment_pk)

	showinf = join(settings.BIN_ROOT, 'bftools', 'showinf')
	line_template = r'.+Converted .+/.+ planes \((?P<percentage>.+)%\)'
	if not exists(experiment.partial_inf_path):
		with Popen('{} -no-upgrade -novalid -nopix {} > {}'.format(showinf, experiment.lif_path, experiment.partial_inf_path), shell=True, stderr=PIPE) as extract_partial_metadata_proc:
			experiment.partial_metadata_extraction_complete = False
			experiment.save()

	experiment.partial_metadata_extraction_complete = True
	experiment.partial_metadata_actions()
	experiment.save()

	return 'done'

@apollo_celery_app.task(bind=True)
def extract_metadata_task(self, experiment_pk):
	experiment = Experiment.objects.get(pk=experiment_pk)

	showinf = join(settings.BIN_ROOT, 'bftools', 'showinf')
	line_template = r'.+Converted .+/.+ planes \((?P<percentage>.+)%\)'
	if not exists(experiment.inf_path):
		with Popen('{} -no-upgrade -novalid -nopix -omexml {} > {}'.format(showinf, experiment.lif_path, experiment.inf_path), shell=True) as extract_metadata_proc:
			experiment.metadata_extraction_complete = False
			experiment.save()

	experiment.metadata_extraction_complete = True
	experiment.metadata_actions()
	experiment.save()

	return 'done'

@apollo_celery_app.task(bind=True)
def extract_preview_images_task(self, experiment_pk):
	# this unfortunately has to been done in one lump for speed and consistency purposes.
	# The preview image for the processed series (composite) can be done later with more
	# information.

	experiment = Experiment.objects.get(pk=experiment_pk)
	stream = Stream('extract_preview_images_task')

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
		line_template = r'.+Series (?P<index>.+): converted .+/.+ planes \((?P<local>.+)%\)'
		extract_preview_proc = Popen(stream.cmd('{bf} -range 0 {max_z} {path} {out}'.format(bf=bfconvert, max_z=max_z, path=experiment.lif_path, out=fake_preview_path)), shell=True)

		while extract_preview_proc.poll() is None:
			line = stream.last_line()

			# get progress percentage from output
			if re.match(line_template, line) is not None:
				series_index = int(re.match(line_template, line).group('index'))
				local_percentage = int(re.match(line_template, line).group('local'))

				# update progress
				experiment.series_preview_images_extraction_complete = False
				experiment.series_preview_images_extraction_percentage = int(90 * ((series_index + local_percentage / 100.0) / float(experiment.series.count())))
				experiment.save()

		stream.delete()

	# 2. convert tiff to png for browser
	for series in experiment.series.all():
		series.preview_path = join(experiment.preview_path, '{}_s{}_ch{}_t{}_z{}_preview.png'.format(experiment.name, series.name, series.max_channel(), 0, series.mid_z()))
		series.save()

		# select preview path using max_channel and mid_z
		if not exists(series.preview_path):
			selected_path = join(experiment.preview_path, '{}_s{}_ch{}_t{}_z{}_preview.tiff'.format(experiment.name, series.name, series.max_channel(), 0, series.mid_z()))
			convert = join(settings.BIN_ROOT, 'convert')
			convert_preview_proc = Popen('{} -contrast-stretch 0 {} {}'.format(convert, selected_path, series.preview_path), shell=True)

			while convert_preview_proc.poll() is None:
				experiment.series_preview_images_extraction_complete = False
				experiment.series_preview_images_extraction_percentage = 95
				experiment.save()

	# delete everything that is not the selected paths
	for file_name in os.listdir(experiment.preview_path):
		if join(experiment.preview_path, file_name) not in [series.preview_path for series in experiment.series.all()]:
			os.remove(join(experiment.preview_path, file_name))

	# set complete
	experiment.series_preview_images_extraction_percentage = 100
	experiment.series_preview_images_extraction_complete = True
	experiment.save()

	return 'done'

@apollo_celery_app.task(bind=True)
def extract_series_task(self, series_pk):
	# get series
	series = Series.objects.get(pk=series_pk)
	experiment = series.experiment

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

	stream = Stream('extract_series_task')
	line_template = r'.+Converted .+/.+ planes \((?P<percentage>.+)%\)'

	extract_series_proc = Popen(stream.cmd(cmd), shell=True, stdout=PIPE, stderr=PIPE, bufsize=1, universal_newlines=True)

	while extract_series_proc.poll() is None:
		line = stream.last_line()

		if 'Converted' in line:
			line_match = re.match(line_template, line)
			percentage = int(line_match.group('percentage'))

			series.source_extraction_percentage = percentage
			series.save()

	series.processing_complete = True
	series.save()

	stream.delete()

	return 'done'
