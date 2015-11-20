# woot.apps.expt.models

# django
from django.db import models
from django.conf import settings
from django.utils.dateparse import parse_datetime

# local
from apps.expt.data import *
from apps.expt.util import generate_id_token, random_string, block

# util
import re
import os
import json
from os.path import abspath, basename, dirname, join, normpath, exists
from scipy.misc.pilutil import imread, imsave
import numpy as np

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
	partial_metadata_extraction_complete = models.BooleanField(default=False)
	metadata_extraction_complete = models.BooleanField(default=False)
	series_preview_images_extraction_complete = models.BooleanField(default=False)

	# 3. progress
	series_preview_images_extraction_percentage = models.IntegerField(default=0)

	# methods
	def __str__(self):
		return self.name

	# setup utility
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

	# status
	def extraction_status(self):
		status_dict = {
			'experiment_name':self.name,
			'extraction_process_cap':self.extraction_process_cap,
			'extraction_process_counter':self.extraction_process_counter,
			'partial_metadata_extraction_complete':self.partial_metadata_extraction_complete,
			'metadata_extraction_complete':self.metadata_extraction_complete,
			'series_preview_images_extraction_complete':self.series_preview_images_extraction_complete,
			'series_preview_images_extraction_percentage':self.series_preview_images_extraction_percentage,
		}

		return status_dict

	# metadata requests
	# these commands assume the metadata has already been extracted
	def metadata(self):
		experiment_metadata = {}

		return experiment_metadata

	def series_list(self):
		series_list = []
		with open(self.partial_inf_path) as inf:
			series_list = re.findall('Series #([0-9]+)', inf.read())

		return series_list

	def series_metadata(self, series_name):
		# name
		# rs, cs, zs, ts, channel names
		# rmop, cmop, zmop, tpf
		# any titles or any other relevant information
		series_metadata = {}

		with open(self.inf_path) as inf:
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

	def series_preview_image_paths(self):
		return [join(self.preview_path, series.preview_path) for series in self.series.all()]

class Series(models.Model):
	# connections
	experiment = models.ForeignKey(Experiment, related_name='series')

	# 1. properties
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

	# 2. status flags
	metadata_set = models.BooleanField(default=False)
	source_extraction_in_queue = models.BooleanField(default=False)
	source_extraction_complete = models.BooleanField(default=False)
	composition_complete = models.BooleanField(default=False)
	processing_complete = models.BooleanField(default=False)

	# 3. progress
	source_extraction_percentage = models.IntegerField(default=0)
	composition_percentage = models.IntegerField(default=0)
	processing_percentage = models.IntegerField(default=0)

	# methods
	def __str__(self):
		return '{}: series {}'.format(self.experiment, self.index)

	# status methods
	def extraction_status(self):
		status_dict = {
			'experiment_name':self.experiment.name,
			'series_name':self.name,
			'metadata_set':self.metadata_set,
			'source_extraction_in_queue':self.source_extraction_in_queue,
			'source_extraction_complete':self.source_extraction_complete,
			'composition_complete':self.composition_complete,
			'processing_complete':self.processing_complete,
			'source_extraction_percentage':self.source_extraction_percentage,
			'composition_percentage':self.composition_percentage,
			'processing_percentage':self.processing_percentage,
		}

		return status_dict

	# metadata requests
	# methods assume metadata has been extracted
	def metadata(self):
		if not self.metadata_set:
			self.metadata_set = True
			metadata = self.experiment.series_metadata(self.name)

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
