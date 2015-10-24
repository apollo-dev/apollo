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
from os.path import abspath, basename, dirname, join, normpath, exists
from scipy.misc.pilutil import imread, imsave
import numpy as np
from subprocess import call

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

		os.makedirs(self.img_path)
		os.makedirs(self.source_path)
		os.makedirs(self.composite_path)
		os.makedirs(self.preview_path)

	def make_templates(self):
		# templates
		for name, template in templates.items():
			self.templates.get_or_create(name=name, rx=template['rx'], rv=template['rv'])
		self.save()

	def list_series(self):
		return self.lif.series_list()

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
	metadata_set = models.BooleanField(default=False)
	source_extracted = models.BooleanField(default=False)
	processing_complete = models.BooleanField(default=False)

	# methods
	def __str__(self):
		return '{}: series {}'.format(self.experiment, self.index)

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
			'channels':[channel.name for channel in self.channels.all()],
		}

	def preview_image(self):
		if not self.preview_path:
			self.preview_path = self.experiment.lif.preview_image(self.name)
			self.save()

		return self.preview_path

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
			showinf = join(settings.BIN_ROOT, 'bftools', 'showinf')
			call('{} -no-upgrade -novalid -nopix {} > {}'.format(showinf, self.experiment.lif_path, self.experiment.partial_inf_path), shell=True)
			self.partial_metadata_extracted = True
			self.save()

		return open(self.experiment.partial_inf_path, 'r')

	def metadata(self):
		if not self.metadata_extracted:
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
			pixels_line_template = r'^<.+PhysicalSizeX="(?P<cmop>.+)" PhysicalSizeY="(?P<rmop>.+)" (PhysicalSizeZ="(?P<zmop>.+)" )?SignificantBits=".+" SizeC=".+" SizeT="(?P<ts>.+)" SizeX="(?P<cs>.+)" SizeY="(?P<rs>.+)" SizeZ="(?P<zs>.+)" Type=".+"$'

			series_metadata.update(re.match(pixels_line_template, pixels_line).groupdict())

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

	def preview_image(self, series_name):
		series = self.experiment.series.get(name=series_name)

		if not series.preview_path:
			# determine parameters for preview image
			# - must be from brightfield channel
			# - must be t0, z-mid

			# 1. extract image and place in the experiment preview_path
			bfconvert = join(settings.BIN_ROOT, 'bftools', 'bfconvert')
			fake_preview_path = join(self.experiment.preview_path, '{}_s{}_preview.tiff'.format(self.experiment.name, series_name))

			call('{bf} -series {series} -range {index} {index} {path} {out}'.format(bf=bfconvert, series=series.name, index=series.preview_image_index, path=self.experiment.lif_path, out=fake_preview_path), shell=True)

			# convert tiff to png for browser
			series.preview_path = join(self.experiment.preview_path, '{}_s{}_preview.png'.format(self.experiment.name, series_name))
			series.save()

			convert = join(settings.BIN_ROOT, 'convert')

			call('{} {} {}'.format(convert, fake_preview_path, series.preview_path), shell=True)

			# remove fake path
			os.remove(fake_preview_path)

		return series.preview_path
