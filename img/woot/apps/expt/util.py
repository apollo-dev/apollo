# apps.expt.util

# django
from django.db import models
from django.conf import settings

# util
import random
import string
import re
import os
from os.path import join, exists

# vars
chars = string.ascii_uppercase + string.digits

# methods
def generate_id_token(app_name, obj_name):

	Obj = models.get_model(app_name, obj_name)

	def get_id_token():
		return random_string()

	id_token = get_id_token()
	while Obj.objects.filter(id_token=id_token).count()>0:
		id_token = get_id_token()

	return id_token

def random_string():
	return ''.join([random.choice(chars) for _ in range(8)]) #8 character string

def str_value(v, vs):
	v_str_len = len(str(v))
	vs_str_len = len(str(vs))

	diff = vs_str_len - v_str_len
	return '{}{}'.format('0'*diff, v)

def block(whole, start, end):
	start_block = whole[whole.index(start):]
	block = start_block[:start_block.index(end)]

	return block

class Stream(object):
	def __init__(self, task_name):
		# task name
		self.task_name = task_name

		# create stream folder if it does not exist
		stream_dir = join(settings.DJANGO_ROOT, 'stream')
		if not exists(stream_dir):
			os.mkdir(stream_dir)

		# use random string to name file
		rs = random_string()

		# create file
		self.path = join(stream_dir, '{}-{}.log'.format(task_name, rs))
		with self.open() as stream: # empty file
			pass

	def cmd(self, cmd):
		return '{} > {}'.format(cmd, self.path)

	def open(self):
		return open(self.path, 'w+')

	def last_line(self):
		with self.open() as stream:
			lines = stream.readlines()
			if len(lines) > 0:
				line = lines[len(lines)-1].rstrip()
				return line
			else:
				return '' # should just fail the match

	def delete(self):
		# remove file
		os.remove(self.path)
