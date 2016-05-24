/* global __dirname */
/* global process */
var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.

// Report crashes to our server. Disabled for now.
//require('crash-reporter').start();

// Prevent the computer from going to sleep
const powerSaveBlocker = require('electron').powerSaveBlocker;
powerSaveBlocker.start('prevent-display-sleep');

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


  // Put the app on a secondary display if availalbe
  var atomScreen = require('screen');
  var displays = atomScreen.getAllDisplays();
  var externalDisplay = null;
  for (var i in displays) {
    if (displays[i].bounds.x > 0 || displays[i].bounds.y > 0) {
      externalDisplay = displays[i];
      break;
    }
  }

  var browserWindowOptions = {width: 800, height: 600, icon: 'favicon.ico' , kiosk:true, autoHideMenuBar:true, darkTheme:true, acceptFirstMouse:true};
  if (externalDisplay) {
    browserWindowOptions.x = externalDisplay.bounds.x + 50;
    browserWindowOptions.y = externalDisplay.bounds.y + 50
  }

  // Create the browser window.
  mainWindow = new BrowserWindow(browserWindowOptions);


  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  mainWindow.setIgnoreMouseEvents(true);

  // Open the DevTools if run with "npm start dev"
  if(process.argv[2] == "dev"){
    mainWindow.webContents.openDevTools();
  }


  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});

/* WEB SERVER */
var http = require('http');
var express = require('express');
var mysql = require('mysql');
var smartmirror = express();
smartmirror.use(express.static(__dirname+"/public"));

var connection = mysql.createConnection({
  host    :'localhost',
  port : 3306,
  user : 'mirror',
  password : 'mirror1234',
  database:'mirror'
});

connection.connect(function(err) {
  if (err) {
    console.error('mysql connection error');
    console.error(err);
    throw err;
  }
});

/* Electron을 위한 전역 객체 */
var events = require('events');
global.sender = new events.EventEmitter();

http.createServer(smartmirror).listen(8080,function() {
  console.log('server on 8080...');
});

/* GET 통신을 위한  */
var url = require('url');
var querystring = require('querystring');

/* 스마트 미러 <-> Android APP Notification 통신 */
smartmirror.get('/noti.do',function(req,res){
  console.log(req.url);
  var query = url.parse(req.url, true).query;
  console.log(query);
  global.sender.emit('data',query);
  res.send("<h1>Noti OK</h1>");
});

smartmirror.post('/inbelong',function(req,res){


    res.send(200,'success');

});