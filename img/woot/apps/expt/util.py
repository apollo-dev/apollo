# apps.expt.util

# django
from django.db import models

# util
import random
import string
import re

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
