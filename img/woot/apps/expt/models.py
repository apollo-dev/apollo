# woot.apps.expt.models

# django
from django.db import models

# local
from apps.expt.data import *
from apps.expt.util import generate_id_token, random_string

# util
import os
from os.path import join
import re
from scipy.misc.pilutil import imread, imsave
import numpy as np
import subprocess

### Models
class Experiment(models.Model):
	# properties
	name = models.CharField(max_length=255)

	# 1. location
	lif_path = models.CharField(max_length=255)
	img_path = models.CharField(max_length=255)
	storage_path = models.CharField(max_length=255)
	composite_path = models.CharField(max_length=255)
	inf_path = models.CharField(max_length=255)

	# 2. details
	total_time = models.FloatField(default=0.0);

	def __str__(self):
		return self.name

class Series(models.Model):
	# connections
	experiment = models.ForeignKey(Experiment, related_name='series')

	# properties
	name = models.CharField(max_length=255)

	# methods
	def __str__(self):
		return '{}: series {}'.format(self.experiment.name, self.name)

class PathChannel(models.Model):
	# connections
	experiment = models.ForeignKey(Experiment, related_name='channels')

	# properties
	name = models.CharField(max_length=255)

	# methods
	def __str__(self):
		return '{}: channel {}'.format(self.experiment.name, self.name)

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
		return '{}: {}'.format(self.experiment.name, self.url)

	def url(self):
		return join(self.root, self.file_name)
