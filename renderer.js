// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
// const log = require('electron-log');

// Node.jsの機能は使えないので preload.js で最低限の機能のみ参照できるようにする
// const { ipcRenderer } = require('electron')
const { ipcRenderer } = window.native;

// チャンネル 'asynchronous-reply' で非同期メッセージの受信を待機
ipcRenderer.on('asynchronous-reply', (event, arg) => {
  // 受信時のコールバック関数
  console.log(arg) // pong
});
// 非同期メッセージの送信
ipcRenderer.send('asynchronous-message', 'ping');


const btnInbound = document.querySelector('.btn-inbound');
btnInbound.addEventListener('click', function (clickEvent) {
    ipcRenderer.send('asynchronous-message', 'inbound enter');
})
const btnOutbound = document.querySelector('.btn-outbound');
btnOutbound.addEventListener('click', function (clickEvent) {
    ipcRenderer.send('asynchronous-message', 'outbound enter');
})

// import { startSound, stopSound } from './dist/crossingSignal';

// let pollingEvent = () => {
//   // 同期メッセージを送信して、返信内容を表示する
//   const retValue = ipcRenderer.sendSync('synchronous-message', '');
//   if('' !== retValue){
//     // console.log(retValue); 
//     if('START_WARN' == retValue){
//       crossingSignal.startSound;
//     }else if('STOP_WARN' == retValue){
//       crossingSignal.stopSound;
//     }
//   }
// }

// setInterval(pollingEvent, 100);