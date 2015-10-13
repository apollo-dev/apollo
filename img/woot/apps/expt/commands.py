# woot.apps.expt.commands

# django
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.core.cache import cache
from django.views.generic import View
from django.conf import settings

# local

# util

### Views

# methods
def test_command(request):
	if request.method == 'GET':
		return HttpResponse('test_command')
