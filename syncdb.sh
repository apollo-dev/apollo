rm ./img/db/img_db.sqlite3
PYTHONPATH='.' DJANGO_SETTINGS_MODULE=img.woot.settings ./bin/python3.4 ./img/manage.py syncdb
