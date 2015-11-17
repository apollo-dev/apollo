from celery import current_app
from celery.result import AsyncResult

class CeleryBackend(object):
	progress_state = 'PROGRESS'

	def __init__(self):
		self.app = current_app

	def get_result(self, task_id):
		result = AsyncResult(task_id)
		return result.result if result.ready() else None

	def get_progress(self, task_id):
		result = AsyncResult(task_id)

		if result.ready():
			return 100

		if result.state == self.progress_state:
			meta = result.info
			return float(meta['current']) / float(meta['total']) * 100

		return 0

	def set_progress(self, task_id, current, total=100):
		meta = {'current': current, 'total': total}

		self.app.backend.store_result(task_id, meta, self.progress_state)
