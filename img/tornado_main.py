#!/usr/bin/env python
# Run this with
# PYTHONPATH=. DJANGO_SETTINGS_MODULE=testsite.settings testsite/tornado_main.py
# Serves by default at
# http://localhost:8080/hello-tornado and
# http://localhost:8080/hello-django

from tornado.options import options, define, parse_command_line
import django.core.handlers.wsgi
import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.wsgi
import json
if django.VERSION[1] > 5:
  django.setup()

def main():
  parse_command_line()

  # open json settings file
  port = 8090
  with open('./settings.json') as json_file:
    json_data = json.load(json_file)
    port = int(json_data['port'])

  define('port', type=int, default=port)

  wsgi_app = tornado.wsgi.WSGIContainer(django.core.handlers.wsgi.WSGIHandler())
  tornado_app = tornado.web.Application([
    ('.*', tornado.web.FallbackHandler, dict(fallback=wsgi_app)),
  ])

  server = tornado.httpserver.HTTPServer(tornado_app)
  server.listen(options.port) # define custom port number from command line options

  tornado.ioloop.IOLoop.instance().start()

if __name__ == '__main__':
  main()
