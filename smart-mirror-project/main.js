/* global __dirname */
/* global process */
const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
// Prevent the monitor from going to sleep.
const powerSaveBlocker = electron.powerSaveBlocker;
powerSaveBlocker.start('prevent-display-sleep');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {

  // Get the displays and render the mirror on a secondary screen if it exists
  var atomScreen = electron.screen;
  var displays = atomScreen.getAllDisplays();
  var externalDisplay = null;
  for (var i in displays) {
    if (displays[i].bounds.x > 0 || displays[i].bounds.y > 0) {
      externalDisplay = displays[i];
      break;
    }
  }

  var browserWindowOptions = {width: 800, height: 600, icon: 'favicon.ico' , kiosk:true, autoHideMenuBar:true, darkTheme:true};
  if (externalDisplay) {
    browserWindowOptions.x = externalDisplay.bounds.x + 50;
    browserWindowOptions.y = externalDisplay.bounds.y + 50
  }

  // Create the browser window.
  mainWindow = new BrowserWindow(browserWindowOptions)

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html')

  // Open the DevTools if run with "npm start dev"
  if(process.argv[2] == "dev"){
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

/* WEB SERVER */
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var smartmirror = express();
smartmirror.use(express.static(__dirname+"/public"));

smartmirror.use(bodyParser());
smartmirror.use(bodyParser.json());
smartmirror.use(bodyParser.urlencoded());

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



smartmirror.post('/insert',function(req,res){


  var article = req.body.articles;
  res.send(200, article);
  var len = article.length;
  for(var i = 0 ;i<len;i++){
    (function(i){
      var query = "insert into  belonging (article) values ('"+article[i]+"');"
      connection.query(query, function (err, rows) {
        if(err)res.send(200,err);
      });
    })(i);
  }

  res.send(200,"success");

});


smartmirror.get('/del/:id',function(req,res){

  var id = req.params.id;
  connection.query("delete from belonging where id = ?",id, function (err, rows) {
    if(err)res.send(200,err);
  });
  res.send(200,'success');

});

