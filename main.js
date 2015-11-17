// required packages
var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var globalShortcut = require('global-shortcut'); // https://github.com/atom/electron/blob/master/docs/api/global-shortcut.md
var http = require('http'); // Make web requests to the server process: https://docs.nodejitsu.com/articles/HTTP/clients/how-to-create-a-HTTP-request
var spawn = require('child_process').spawn; // used to make server process
app.commandLine.appendSwitch('disable-web-security'); // remove browser security

// Report crashes to our server.
require('crash-reporter').start();

///////////////////////////////////
///////////////////////////////////
///////////////
/////////////// DEFINE SERVER SUBPROCESS AND CHECK THAT IT IS RUNNING
/////////////// Keep global variable that can be terminated when other stuff is done.
///////////////
// processes: http://krasimirtsonev.com/blog/article/Nodejs-managing-child-processes-starting-stopping-exec-spawn
// https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
// http://www.graemeboy.com/node-child-processes
// https://www.npmjs.com/package/virtualenv

// Don't forget django setup:
// PYTHONPATH='.' DJANGO_SETTINGS_MODULE=img.woot.settings ./bin/python3.4 ./img/manage.py collectstatic
// PYTHONPATH='.' DJANGO_SETTINGS_MODULE=img.woot.settings ./bin/python3.4 ./img/manage.py syncdb
// run from 'app' directory

// open settings json
var settings = require('./settings.json');

// 1. define host (maybe with random url identifier)
var port = settings['port'];
var host = 'localhost:' + port;

// 2. define environment vars
var env = process.env;
var env_duplicate = {};

// Duplicate the parent's environment object
var dummy_env;
for (dummy_env in env) {
  env_duplicate[dummy_env] = env[dummy_env];
}

// Now, extend this with some new variables:
env_duplicate['PYTHONPATH'] = __dirname;
env_duplicate['DJANGO_SETTINGS_MODULE'] = 'img.woot.settings';

// 3. spawn server process
// for production, all packages used by tornado, including python3.4, must be on the python path,
// so, inside the current folder.
// use argparse python module to pass port number
var tornado_proc = spawn(__dirname + '/bin/python3.4', [__dirname + '/img/tornado_main.py'], {env: env_duplicate});
console.log('tornado process id: ' + tornado_proc.pid);

tornado_proc.stderr.on('data',
  function (data) {
	  console.log('server_err: ' + data);
  }
);

tornado_proc.stdout.on('data',
  function (data) {
	  console.log('server_output: ' + data);
  }
);

// 4. spawn rabbitmq process
var rabbitmq_proc = spawn('sh', [__dirname + '/run_rabbitmq.sh'], {env: env_duplicate})
console.log('rabbitmq process id: ' + rabbitmq_proc.pid);

rabbitmq_proc.stderr.on('data',
	function (data) {
		console.log('rabbit_err: ' + data);
	}
);

rabbitmq_proc.stdout.on('data',
	function (data) {
		console.log('rabbit_output: ' + data);
	}
);

// 5. spawn celery process
var celery_proc = spawn(__dirname + '/bin/python3.4', [__dirname + '/img/manage.py', 'celery', 'worker', '--loglevel=info'], {env: env_duplicate});
console.log('celery process id: ' + celery_proc.pid);

celery_proc.stderr.on('data',
	function (data) {
		console.log('celery_err: ' + data);
	}
);

celery_proc.stdout.on('data',
	function (data) {
		console.log('celery_output: ' + data);
	}
);

///////////////////////////////////
///////////////////////////////////
///////////////
/////////////// SET UP BROWSER WINDOW THAT WILL RUN THE INTERFACE
/////////////// Some keyboard shortcuts will control window events. Others will send requests to
/////////////// the server process via "http"
///////////////

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {

	///////////////////////////////////
	/////////////// BROWSER WINDOW
	///////////////
	// browser window api: https://github.com/atom/electron/blob/master/docs/api/browser-window.md
	// frameless: https://github.com/atom/electron/blob/master/docs/api/frameless-window.md

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1024, height: 768, 'title-bar-style': 'hidden', 'web-preferences': {'web-security': false}});

  // POINT AT THE SERVER PROCESS URL HERE
	// still need to find a way to pass the port number to the startup.html page.
	mainWindow.loadUrl('file://' + __dirname + '/main.html'); // temporary until server process is loaded
  // mainWindow.loadUrl('file://' + __dirname + '/assets/js/paperjs/docs/index.html'); // temporary until server process is loaded

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
		tornado_proc.kill();
		rabbitmq_proc.kill();
		celery_proc.kill();
  });
});

app.on('quit', function () { // when cmd + Q or anything else is pressed
	tornado_proc.kill();
	rabbitmq_proc.kill();
	celery_proc.kill();
});

///////////////////////////////////
/////////////// MENU: https://github.com/atom/electron/blob/master/docs/api/menu.md
/////////////// https://github.com/atom/electron/blob/master/docs/api/global-shortcut.md
// 1. Cmd + N for new series import, new experiment import, or new channel creation
// 2. Cmd + , for application settings
