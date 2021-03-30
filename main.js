
const net = require('net');
let server;

//
// 外部プログラムから TCP socket で送信されたイベントを受け取り、
// renderer に渡すために一旦グローバル変数に保存する。
// renderer から main にポーリングして、イベントを受け取る。
//
var receiveEvent = '';


//---------------------------------------------------------------------
// Electron の画面を制御する機能
//
// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 1020,
    webPreferences: {
      nodeIntegration: false, // <----  この２行を追加しないと動かない。
      // nodeIntegration: true, // <----  
      contextIsolation: false, // <---- ipc のセキュリティの設定
      // contextIsolation: true, // <---- ipc のセキュリティの設定
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')
  mainWindow.loadFile('./html/index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
// Window制御の機能はここまで
//--------------------------------------------------------------------------

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//--------------------------------------------------------------------------
// TCP Socket 通信のサーバ機能　ここから
//
const port = 3456; // ポート番号
// const net = require('net');
let socket; 
server = net.createServer(function(socket){
  console.log('server-> tcp server created');
  socket.setEncoding("utf8");  // as String

  socket.on("data", (data)=>{
    // data.reply('asynchronous-reply', 'pong')
    console.log(data);
    receiveEvent = data;
  });
  socket.on('close', () =>{
    console.log('server-> client closed connection');
  }); // 通信終了時の処理

}).listen(port); 
//----------------------------------------------------

//--------------------------------------------------
// renderer と IPC 通信をするための機能。
const { ipcMain } = require('electron');

//----------------------------------------------------
// TCP Socket 通信クライアント機能
const { Socket } = require('dgram');

var client = new net.Socket();
client.setEncoding('utf8');
client.connect('5678', 'localhost', () => {
  console.log('main to ext');
});

//---------------------------------------------------
// renderer からの非同期メッセージの受信と返信
ipcMain.on('asynchronous-message', (event, arg) => {
  // 受信したコマンドの引数を表示する
  console.log(arg);
  // 送信元のチャンネル('asynchronous-reply')に返信する
  // event.reply('asynchronous-reply', 'pong')

  // TCP Socket で外部にイベントを送信する
  // client.write('my event\n');
  client.write(arg);
})

// 同期メッセージの受信と返信
ipcMain.on('synchronous-message', (event, arg) => {
  // console.log(arg) // ping

  // 非同期との違いは reply を使うか returnValue を使うか
  // event.returnValue = 'pong'

  // グローバル変数 receivedEvent の値を読み取り、
  // renderer に戻り値として返す。
  event.returnValue = receiveEvent;
  receiveEvent = '';
})

//------------------------------------------------------------


