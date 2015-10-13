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
if django.VERSION[1] > 5:
  django.setup()

define('port', type=int, default=8090)

def main():
  parse_command_line()
  wsgi_app = tornado.wsgi.WSGIContainer(django.core.handlers.wsgi.WSGIHandler())
  tornado_app = tornado.web.Application([
    ('.*', tornado.web.FallbackHandler, dict(fallback=wsgi_app)),
  ])

  server = tornado.httpserver.HTTPServer(tornado_app)
  server.listen(options.port) # define custom port number from command line options

  tornado.ioloop.IOLoop.instance().start()

if __name__ == '__main__':
  main()
