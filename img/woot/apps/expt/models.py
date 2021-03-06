# woot.apps.expt.models

# django
from django.db import models
from django.conf import settings
from django.utils.dateparse import parse_datetime

# local
from apps.expt.data import *
from apps.expt.util import generate_id_token, random_string, block
from apps.expt.lif import LifFile

# util
import re
import os
import json
from os.path import abspath, basename, dirname, join, normpath, exists
from scipy.misc.pilutil import imread, imsave
import numpy as np
from celery import current_app
from celery.result import AsyncResult

### Models
class Experiment(models.Model):
	# properties
	name = models.CharField(max_length=255)

	# 1. location
	lif_path = models.CharField(max_length=255)
	img_path = models.CharField(max_length=255)
	source_path = models.CharField(max_length=255)
	composite_path = models.CharField(max_length=255)
	preview_path = models.CharField(max_length=255)
	inf_path = models.CharField(max_length=255)
	partial_inf_path = models.CharField(max_length=255)

	# 2. status
	extraction_process_cap = 4
	extraction_process_counter = models.IntegerField(default=0)

	# methods
	def __str__(self):
		return self.name

	def make_paths(self):
		self.img_path = join(dirname(self.lif_path), self.name)
		self.source_path = join(self.img_path, 'source')
		self.composite_path = join(self.img_path, 'composite')
		self.preview_path = join(self.img_path, 'preview')
		self.inf_path = join(self.img_path, '{}.txt'.format(self.name))
		self.partial_inf_path = join(self.img_path, '{}_partial.txt'.format(self.name))

		for path in [self.img_path, self.source_path, self.composite_path, self.preview_path]:
			if not exists(path):
				os.makedirs(path)

	def make_templates(self):
		# templates
		for name, template in templates.items():
			self.templates.get_or_create(name=name, rx=template['rx'], rv=template['rv'])
		self.save()

	def list_series(self):
		return self.lif.series_list()

	def make_preview_images(self):
		self.lif.preview_images()

class Series(models.Model):
	# connections
	experiment = models.ForeignKey(Experiment, related_name='series')

	# properties
	name = models.CharField(max_length=255)
	title = models.CharField(max_length=255)
	acquisition_date = models.DateTimeField(null=True)
	rs = models.IntegerField(default=0)
	cs = models.IntegerField(default=0)
	zs = models.IntegerField(default=0)
	ts = models.IntegerField(default=0)
	rmop = models.FloatField(default=0.0)
	cmop = models.FloatField(default=0.0)
	zmop = models.FloatField(default=0.0)
	tpf = models.FloatField(default=0.0)
	preview_image_index = models.IntegerField(default=0)
	preview_path = models.CharField(max_length=255)

	# status flags
	is_new = models.BooleanField(default=True)
	metadata_set = models.BooleanField(default=False)
	in_queue = models.BooleanField(default=False)
	extraction_processing_id = models.IntegerField(default=0)
	source_extracted = models.BooleanField(default=False)
	processing_complete = models.BooleanField(default=False)

	# progress
	source_extraction_percentage = models.IntegerField(default=0)
	processing_percentage = models.IntegerField(default=0)

	# methods
	def __str__(self):
		return '{}: series {}'.format(self.experiment, self.index)

	def extraction_status(self):
		status_dict = {
			'experiment_name':self.experiment.name,
			'series_name':self.name,
			'new':self.is_new,
			'in_queue':self.in_queue,
			'source_extracted':self.source_extracted,
			'processing_complete':self.processing_complete,
			'source_extraction_percentage':self.source_extraction_percentage,
			'processing_percentage':self.processing_percentage,
		}

		return status_dict

	def metadata(self):
		if not self.metadata_set:
			self.metadata_set = True
			metadata = self.experiment.lif.series_metadata(self.name)

			self.title = metadata['title']
			self.acquisition_date = parse_datetime(metadata['acquisition_date'])
			self.rs = int(metadata['rs'])
			self.cs = int(metadata['cs'])
			self.zs = int(metadata['zs'])
			self.ts = int(metadata['ts'])
			self.rmop = float(metadata['rmop'])
			self.cmop = float(metadata['cmop'])
			self.zmop = float(metadata['zmop']) if 'zmop' in metadata else 0.0
			self.tpf = float(metadata['tpf_in_seconds']) / 60.0
			for channel_name in metadata['channel_names']:
				self.channels.create(experiment=self.experiment, name=channel_name)
			self.preview_image_index = int(metadata['preview_image_index'])
			self.save()

		return {
			'title':self.title,
			'acquisition_date':str(self.acquisition_date),
			'rs':str(self.rs),
			'cs':str(self.cs),
			'zs':str(self.zs),
			'ts':str(self.ts),
			'rmop':str(self.rmop),
			'cmop':str(self.cmop),
			'zmop':str(self.zmop),
			'tpf':str(self.tpf),
			'channels':json.dumps([channel.name for channel in self.channels.all()]),
		}

	def extract(self):
		return self.experiment.lif.extract_series(self.name)

	def mid_z(self):
		return int(self.zs / 2.0)

	def max_channel(self):
		return max([int(channel.name) for channel in self.channels.all()])

class PathChannel(models.Model):
	# connections
	experiment = models.ForeignKey(Experiment, related_name='channels')
	series = models.ForeignKey(Series, related_name='channels')

	# properties
	name = models.CharField(max_length=255)

	# methods
	def __str__(self):
		return '{}: path channel {}'.format(self.experiment, self.name)

class Template(models.Model):
	# connections
	experiment = models.ForeignKey(Experiment, related_name='templates')

	# properties
	name = models.CharField(max_length=255)
	rx = models.CharField(max_length=255)
	rv = models.CharField(max_length=255)

	# methods
	def __str__(self):
		return '{}: {} - {}'.format(self.experiment, self.name, self.rx)

	def match(self, string):
		return re.match(self.rx, string)

	def dict(self, string):
		return self.match(string).groupdict()

class Path(models.Model):
	# connections
	experiment = models.ForeignKey(Experiment, related_name='paths')
	series = models.ForeignKey(Series, related_name='paths')
	channel = models.ForeignKey(PathChannel, related_name='paths')
	template = models.ForeignKey(Template, related_name='paths')

	# properties
	root = models.CharField(max_length=255)
	file_name = models.CharField(max_length=255)

	# methods
	def __str__(self):
		return '{}: path {}'.format(self.experiment, self.url())

	def url(self):
		return join(self.root, self.file_name)

class LifFile(models.Model):
	# connections
	experiment = models.OneToOneField(Experiment, related_name='lif')

	# properties
	partial_metadata_extracted = models.BooleanField(default=False)
	metadata_extracted = models.BooleanField(default=False)

	# methods
	def partial_metadata(self):
		# omit the "-omexml" to only get some of the metadata
		if not self.partial_metadata_extracted:
			if not exists(self.experiment.partial_inf_path):
				showinf = join(settings.BIN_ROOT, 'bftools', 'showinf')
				call('{} -no-upgrade -novalid -nopix {} > {}'.format(showinf, self.experiment.lif_path, self.experiment.partial_inf_path), shell=True)
			self.partial_metadata_extracted = True
			self.save()

		return open(self.experiment.partial_inf_path, 'r')

	def metadata(self):
		if not self.metadata_extracted:
			if not exists(self.experiment.inf_path):
				showinf = join(settings.BIN_ROOT, 'bftools', 'showinf')
				call('{} -no-upgrade -novalid -nopix -omexml {} > {}'.format(showinf, self.experiment.lif_path, self.experiment.inf_path), shell=True)
			self.metadata_extracted = True
			self.save()

		return open(self.experiment.inf_path, 'r')

	def series_list(self):
		series = []
		with self.partial_metadata() as inf:
			series = re.findall('Series #([0-9]+)', inf.read())

		return series

	def series_metadata(self, series_name):
		# name
		# rs, cs, zs, ts, channel names
		# rmop, cmop, zmop, tpf
		# any titles or any other relevant information
		series_metadata = {}

		with self.metadata() as inf:
			content = inf.read()
			series_block = block(content, 'Image:{}'.format(series_name), '</Image>')

			# 1. title
			series_metadata['title'] = re.findall(r'Name="(.+)"', series_block)[0]

			# 2. acquisition date
			series_metadata['acquisition_date'] = re.findall(r'<AcquisitionDate>(.+)</AcquisitionDate>', series_block)[0]

			# 2. rs, cs, zs, ts, rmop, cmop, zmop
			pixels_line = block(series_block, '<Pixels', '>')
			pixels_line_template = r'^<.+PhysicalSizeX="(?P<cmop>.+)" PhysicalSizeY="(?P<rmop>.+)" PhysicalSizeZ="(?P<zmop>.+)" SignificantBits=".+" SizeC=".+" SizeT="(?P<ts>.+)" SizeX="(?P<cs>.+)" SizeY="(?P<rs>.+)" SizeZ="(?P<zs>.+)" Type=".+"$'
			pixels_line_template_no_Z = r'^<.+PhysicalSizeX="(?P<cmop>.+)" PhysicalSizeY="(?P<rmop>.+)" SignificantBits=".+" SizeC=".+" SizeT="(?P<ts>.+)" SizeX="(?P<cs>.+)" SizeY="(?P<rs>.+)" SizeZ="(?P<zs>.+)" Type=".+"$'

			if re.match(pixels_line_template, pixels_line) is not None:
				match_dict = re.match(pixels_line_template, pixels_line).groupdict()
			else:
				match_dict = re.match(pixels_line_template_no_Z, pixels_line).groupdict()

			series_metadata.update(match_dict)

			# 3. tpf
			tpf_in_seconds = 0
			preview_image_index = 0
			line_template = r'^<Plane DeltaT="(?P<delta_t>.+)" PositionX=".+" PositionY=".+" PositionZ=".+" TheC="(?P<c>.+)" TheT="(?P<t>.+)" TheZ="(?P<z>.+)"/>$'
			lines = [l for l in series_block.split('\n') if 'Plane DeltaT' in l]
			for line in lines:
				line_dict = re.match(line_template, line.strip()).groupdict()
				if (line_dict['c'], line_dict['t'], line_dict['z']) == ('0','1','0'):
					tpf_in_seconds = float(line_dict['delta_t'])

				if (line_dict['c'], line_dict['t'], line_dict['z']) == ('1','0', str(int(float(series_metadata['zs']) / 2.0))):
					# get number of occurences of the string "<Plane" before this point in the whole file
					previous_block = block(series_block, 'Pixels', line)
					preview_image_index = len(re.findall(r'<Plane', previous_block))

			series_metadata['tpf_in_seconds'] = tpf_in_seconds
			series_metadata['preview_image_index'] = preview_image_index

			# 4. channel names
			channel_names = re.findall(r'Channel:.+:(.+)" N', series_block)
			series_metadata['channel_names'] = channel_names

		return series_metadata

	def preview_images(self):
		# this unfortunately has to been done in one lump for speed and consistency purposes.
		# The preview image for the processed series (composite) can be done later with more
		# information.

		# 1. get range of images from each series
		# - I have to get all preview images from the series in the same call because the JVM starts and stops every time
		# it is run, which is annoying. This means I have extract using a call that will not throw an error with any
		# series. This mean I can't use "timepoint", "z", "channel" as series might not contain these. If I use "range",
		# it will not throw an error if the range is larger. So, I have decided to use half the maximum z of any
		# series for the upper limit. Then, each series will be in a separate tiff and can be separated again.
		if len(os.listdir(self.experiment.preview_path)) < self.experiment.series.count():
			max_z = max([series.zs for series in self.experiment.series.all()]) + 1

			bfconvert = join(settings.BIN_ROOT, 'bftools', 'bfconvert')
			fake_preview_path = join(self.experiment.preview_path, '{}_s%s_ch%c_t%t_z%z_preview.tiff'.format(self.experiment.name))
			call('{bf} -range 0 {max_z} {path} {out}'.format(bf=bfconvert, max_z=max_z, path=self.experiment.lif_path, out=fake_preview_path), shell=True)

		# 2. convert tiff to png for browser
		for series in self.experiment.series.all():
			series.preview_path = join(self.experiment.preview_path, '{}_s{}_ch{}_t{}_z{}_preview.png'.format(self.experiment.name, series.name, series.max_channel(), 0, series.mid_z()))
			series.save()

			# select preview path using max_channel and mid_z
			if not exists(series.preview_path):
				selected_path = join(self.experiment.preview_path, '{}_s{}_ch{}_t{}_z{}_preview.tiff'.format(self.experiment.name, series.name, series.max_channel(), 0, series.mid_z()))
				convert = join(settings.BIN_ROOT, 'convert')
				call('{} -contrast-stretch 0 {} {}'.format(convert, selected_path, series.preview_path), shell=True)

		# delete everything that is not the selected paths
		for file_name in os.listdir(self.experiment.preview_path):
			if join(self.experiment.preview_path, file_name) not in [series.preview_path for series in self.experiment.series.all()]:
				os.remove(join(self.experiment.preview_path, file_name))

	def extract_series(self, series_name):
		# get series
		series = self.experiment.series.get(name=series_name)

		# wait in queue
		extraction_counter = self.experiment.extraction_counter
		while extraction_counter == self.experiment.extraction_cap:
			# reset from db (is this the right way?)
			extraction_counter = self.experiment.extraction_counter

			# set "in-queue"
			series.in_queue = True
			series.save()

		# when out of queue
		series.in_queue = False
		series.is_new = False
		series.save()

		# extract
		source_path = join(self.experiment.source_path, '{}_s{}_ch-%c_t%t_z%z.tiff'.format(self.experiment.name, series_name))
		lif_path = self.experiment.lif_path
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
