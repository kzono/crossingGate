"use strict";

// const { TouchBarScrubber } = require("electron");


//----------------------------------------------------------------------------
// ここから Signal クラス
//

// Signal 用グローバル変数
var SignalPos;

// Signal用 enum の定義
(function (SignalPos) {
    SignalPos[SignalPos["leftTop"] = 0] = "leftTop";
    SignalPos[SignalPos["leftBottom"] = 1] = "leftBottom";
    SignalPos[SignalPos["rightTop"] = 2] = "rightTop";
    SignalPos[SignalPos["rightBottom"] = 3] = "rightBottom";
})(SignalPos || (SignalPos = {}));
var EventToSignal;
(function (EventToSignal) {
    EventToSignal[EventToSignal["startSound"] = 0] = "startSound";
    EventToSignal[EventToSignal["stopSound"] = 1] = "stopSound";
    EventToSignal[EventToSignal["startBlink"] = 2] = "startBlink";
    EventToSignal[EventToSignal["stopBlink"] = 3] = "stopBlink";
    EventToSignal[EventToSignal["open"] = 4] = "open";
    EventToSignal[EventToSignal["close"] = 5] = "close";
})(EventToSignal || (EventToSignal = {}));
var EventFromSignal;
(function (EventFromSignal) {
    EventFromSignal[EventFromSignal["inbound_enter"] = 0] = "inbound_enter";
    EventFromSignal[EventFromSignal["inbound_exit"] = 1] = "inbound_exit";
    EventFromSignal[EventFromSignal["outbound_enter"] = 2] = "outbound_enter";
    EventFromSignal[EventFromSignal["outbound_exit"] = 3] = "outbound_exit";
    EventFromSignal[EventFromSignal["closed_enter"] = 4] = "closed_enter";
    EventFromSignal[EventFromSignal["closed_exit"] = 5] = "closed_exit";
    EventFromSignal[EventFromSignal["opend_enter"] = 6] = "opend_enter";
    EventFromSignal[EventFromSignal["opend_exit"] = 7] = "opend_exit"; // 出口側遮断機開
})(EventFromSignal || (EventFromSignal = {}));
var EventToTrain;
(function (EventToTrain) {
    EventToTrain[EventToTrain["runInbound"] = 0] = "runInbound";
    EventToTrain[EventToTrain["runOutbound"] = 1] = "runOutbound";
})(EventToTrain || (EventToTrain = {}));
var BarState;
(function (BarState) {
    BarState[BarState["opened"] = 0] = "opened";
    BarState[BarState["closing"] = 1] = "closing";
    BarState[BarState["closed"] = 2] = "closed";
    BarState[BarState["opening"] = 3] = "opening";
})(BarState || (BarState = {}));
var LampState;
(function (LampState) {
    LampState[LampState["blink"] = 0] = "blink";
    LampState[LampState["noblink"] = 1] = "noblink";
})(LampState || (LampState = {}));
var SignalState;
(function (SignalState) {
    SignalState[SignalState["warning"] = 0] = "warning";
    SignalState[SignalState["closing"] = 1] = "closing";
    SignalState[SignalState["closed"] = 2] = "closed";
    SignalState[SignalState["opening"] = 3] = "opening";
    SignalState[SignalState["opened"] = 4] = "opened";
})(SignalState || (SignalState = {}));

class Signal {
    constructor(pos) {
        this.lampState = LampState.noblink;
        this.barState = BarState.opened;
        this.blinkTime = 5; // 警告ランプの点滅間隔
        this.blinkCount = 0; // 警告ランプ点滅間隔のカウンター
        this.blinkFlag = false; // 点滅パターン用フラグ
        this.countPerImageClosing = 3; // 遮断バーを下ろすとき、画像１枚あたりの表示回数
        this.closingCount = 0; // countPerImageClosing になるまでの表示回数のカウンター
        this.countPerImageOpening = 1; // 遮断バーを上げるとき、画像１枚あたりの表示回数
        this.openingCount = 0; // countPerImageOpening になるまでの表示回数のカウンター 
        this.image_count = 0;
        this.width = 300; // 信号機画像の幅
        this.height = 200; // 信号機画像の幅
        this.sound = new Audio('../sounds/Railroad_Crossing-Signal.mp3');
        this.pos = pos;
        const left = canvas.width * 0.20;
        const right = canvas.width * 0.50;
        // const top = 0;
        const top = 10;
        // const bottom = canvas.height * 0.50;
        const bottom = canvas.height * 0.40;
        switch (pos) {
            case SignalPos.leftTop:
                this.x = left;
                this.y = top;
                break;
            case SignalPos.leftBottom:
                this.x = left;
                this.y = bottom;
                break;
            case SignalPos.rightTop:
                this.x = right;
                this.y = top;
                break;
            case SignalPos.rightBottom:
                this.x = right;
                this.y = bottom;
                break;
            default:
                this.x = 0;
                this.y = 0;
                ;
        }
        this.leftBarImages = new Array();
        this.rightBarImages = new Array();
        this.onOff = new Image();
        this.offOn = new Image();
        this.offOff = new Image();
        this.initImages();
    }
    initImages() {
        this.onOff.src = "../images/Signal_on_off.svg";
        this.offOn.src = "../images/Signal_off_on.svg";
        this.offOff.src = "../images/Signal_off_off.svg";
        const leftBarImage_paths = [
            "../images/Bar00L.svg",
            "../images/Bar05L.svg",
            "../images/Bar10L.svg",
            "../images/Bar15L.svg",
            "../images/Bar20L.svg",
            "../images/Bar25L.svg",
            "../images/Bar30L.svg",
            "../images/Bar35L.svg",
            "../images/Bar40L.svg",
            "../images/Bar45L.svg",
            "../images/Bar50L.svg",
            "../images/Bar55L.svg",
            "../images/Bar60L.svg",
            "../images/Bar65L.svg",
            "../images/Bar70L.svg",
            "../images/Bar75L.svg",
            "../images/Bar80L.svg",
            "../images/Bar85L.svg",
            "../images/Bar90L.svg",
        ];
        leftBarImage_paths.map(e => {
            var img = new Image();
            img.src = e;
            this.leftBarImages.push(img);
        });
        const rightBarImage_paths = [
            "../images/Bar00R.svg",
            "../images/Bar05R.svg",
            "../images/Bar10R.svg",
            "../images/Bar15R.svg",
            "../images/Bar20R.svg",
            "../images/Bar25R.svg",
            "../images/Bar30R.svg",
            "../images/Bar35R.svg",
            "../images/Bar40R.svg",
            "../images/Bar45R.svg",
            "../images/Bar50R.svg",
            "../images/Bar55R.svg",
            "../images/Bar60R.svg",
            "../images/Bar65R.svg",
            "../images/Bar70R.svg",
            "../images/Bar75R.svg",
            "../images/Bar80R.svg",
            "../images/Bar85R.svg",
            "../images/Bar90R.svg",
        ];
        rightBarImage_paths.map(e => {
            var img = new Image();
            img.src = e;
            this.rightBarImages.push(img);
        });
    }
    handleEvent(evt) {
        switch (evt) {
            case EventToSignal.startSound:
                this.startSound();
                break;
            case EventToSignal.stopSound:
                this.stopSound();
                break;
            case EventToSignal.startBlink:
                this.lampState = LampState.blink;
                break;
            case EventToSignal.stopBlink:
                this.lampState = LampState.noblink;
                break;
            case EventToSignal.close:
                switch (this.barState) {
                    case BarState.opened:
                        this.barState = BarState.closing;
                        break;
                    case BarState.closing:
                        // do nothing
                        break;
                    case BarState.closed:
                        // do nothing
                        break;
                    case BarState.opening:
                        this.barState = BarState.closing;
                        break;
                    default:
                        ;
                }
                break;
            case EventToSignal.open:
                switch (this.barState) {
                    case BarState.opened:
                        // do nothing
                        break;
                    case BarState.closing:
                        this.barState = BarState.opening;
                        break;
                    case BarState.closed:
                        this.barState = BarState.opening;
                        break;
                    case BarState.opening:
                        // do nothing
                        break;
                    default:
                        ;
                }
                break;
            default:
                ;
        }
    }
    draw() {
        switch (this.lampState) {
            case LampState.noblink:
                this.noblink();
                break;
            case LampState.blink:
                this.blink();
                break;
            default:
                ;
        }
        switch (this.barState) {
            case BarState.opened:
                this.drawOpenedBar();
                break;
            case BarState.closing:
                this.drawClosingBar();
                break;
            case BarState.closed:
                this.drawClosedBar();
                break;
            case BarState.opening:
                this.drawOpeningBar();
                break;
            default:
                ;
        }
    }
    // private startSound(){// 警告音を開始する
    startSound() {
        this.sound.loop = true;
        this.sound.volume = 0.4; // 0.0 〜 1.0
        this.sound.play();
    }
    drawClosingBar() {
        switch (this.pos) {
            case SignalPos.leftTop:
            case SignalPos.leftBottom:
                ctx.drawImage(this.leftBarImages[this.leftBarImages.length - 1 - this.image_count], this.x - 10, this.y, this.width, this.height);
                break;
            case SignalPos.rightTop:
            case SignalPos.rightBottom:
                ctx.drawImage(this.rightBarImages[this.leftBarImages.length - 1 - this.image_count], this.x - 55, this.y, this.width, this.height);
                break;
            default:
                break;
        }
        this.closingCount++;
        if (this.closingCount > this.countPerImageClosing) {
            this.closingCount = 0;
            this.image_count++;
        }
        if (this.image_count > this.leftBarImages.length - 1) {
            this.image_count = 0;
            this.barState = BarState.closed;
        }
    }
    drawOpeningBar() {
        switch (this.pos) {
            case SignalPos.leftTop:
            case SignalPos.leftBottom:
                ctx.drawImage(this.leftBarImages[this.image_count], this.x - 10, this.y, this.width, this.height);
                break;
            case SignalPos.rightTop:
            case SignalPos.rightBottom:
                ctx.drawImage(this.rightBarImages[this.image_count], this.x - 55, this.y, this.width, this.height);
                break;
            default:
                break;
        }
        this.openingCount++;
        if (this.openingCount > this.countPerImageOpening) {
            this.openingCount = 0;
            this.image_count++;
        }
        if (this.image_count > this.leftBarImages.length - 1) {
            this.image_count = 0;
            this.barState = BarState.opened;
        }
    }
    drawOpenedBar() {
        switch (this.pos) {
            case SignalPos.leftTop:
            case SignalPos.leftBottom:
                ctx.drawImage(this.leftBarImages[18], this.x - 10, this.y, 300, 200);
                break;
            case SignalPos.rightTop:
            case SignalPos.rightBottom:
                ctx.drawImage(this.rightBarImages[18], this.x - 55, this.y, 300, 200);
                break;
            default:
                console.log('Error! SignalPos');
        }
    }
    drawClosedBar() {
        switch (this.pos) {
            case SignalPos.leftTop:
            case SignalPos.leftBottom:
                ctx.drawImage(this.leftBarImages[0], this.x - 10, this.y, 300, 200);
                break;
            case SignalPos.rightTop:
            case SignalPos.rightBottom:
                ctx.drawImage(this.rightBarImages[0], this.x - 55, this.y, 300, 200);
                break;
            default:
                console.log('Error! SignalPos');
        }
    }
    noblink() {
        ctx.drawImage(this.offOff, this.x, this.y, this.width, this.height);
    }
    blink() {
        // 点滅間隔は this.blinkTime で設定し、this.blinkCount で制御する。
        if (this.blinkFlag) {
            ctx.drawImage(this.onOff, this.x, this.y, this.width, this.height);
        }
        else {
            ctx.drawImage(this.offOn, this.x, this.y, this.width, this.height);
        }
        this.blinkCount++;
        if (this.blinkCount > this.blinkTime) {
            this.blinkCount = 0;
            this.blinkFlag = !this.blinkFlag;
        }
    }
    // private stopSound(){ // 警告音を停止する
    stopSound() {
        this.sound.pause();
    }
    stopBlink() {
        // 消灯画像を表示する
    }
}


//---------------------------------------------------------------------
// ここから　Train クラス
//
var TrainBound;
(function (TrainBound) {
    TrainBound[TrainBound["inbound"] = 0] = "inbound";
    TrainBound[TrainBound["outbound"] = 1] = "outbound";
})(TrainBound || (TrainBound = {}));
var TrainPos;
(function (TrainPos) {
    TrainPos[TrainPos["inArea"] = 0] = "inArea";
    TrainPos[TrainPos["outOfArea"] = 1] = "outOfArea";
})(TrainPos || (TrainPos = {}));

var PosState;
(function (PosState){
    PosState[PosState["before"] =  0] = "before";
    PosState[PosState["entering"] =  1] = "entering";
    PosState[PosState["passing"] =  2] = "passing";
    PosState[PosState["exiting"] =  3] = "exiting";
    PosState[PosState["after"] =  4] = "after";
})(PosState || (PosState = {}));

class Train {
    constructor(bound) {
        this.length = 40;
        this.defaultInboundXPos = -this.length - canvas.width*0.3;
        this.defaultOutboundXPos = canvas.width * 0.9;
        this.defaultXPos = 0;
        this.pos = TrainPos.outOfArea;
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.bound = bound;
        this.image = new Image();
        this.left = -100;
        this.right = 400;
        this.lengthRatio = 4;
        this.posState = PosState.before;

        switch (bound) {
            case TrainBound.inbound:
                this.defaultXPos = this.defaultInboundXPos;
                this.x = this.defaultXPos;
                this.y = canvas.height * (-0.51);
                this.image.src = "../images/train_R.svg";
                this.speed = 5;
                break;
            case TrainBound.outbound:
                this.defaultXPos = this.defaultOutboundXPos;
                this.x = this.defaultXPos;
                this.y = canvas.height * (-0.29);
                this.image.src = "../images/train_L.svg";
                this.speed = -5;
                break;
            default:
                ;
        }
    }
    handleEvent(evt) {
        switch (evt) {
            case EventToTrain.runInbound:
                this.pos = TrainPos.inArea;
                break;
            case EventToTrain.runOutbound:
                this.pos = TrainPos.inArea;
                break;
            default:
                ;
        }
        console.log('handleEvent: this.pos = inArea.');
    }
    run() {
        this.x += this.speed;
        if (this.bound == TrainBound.outbound) {
            this.checkOutboundSensor();

            if (this.x + this.length + canvas.width * 0.25 < 0) {
                this.pos = TrainPos.outOfArea;
                this.posState = PosState.before;
                this.x = this.defaultXPos;
                console.log('run(): inbound this.pos = outOfArea.');
                console.log('run(): x = %d', this.x);
            }
        }
        if (this.bound == TrainBound.inbound) {
            this.checkInboundSensor();

            if (this.x + this.length > canvas.width) {
                this.pos = TrainPos.outOfArea;
                this.posState = PosState.before;
                this.x = this.defaultXPos;
                console.log('run(): outbound this.pos = outOfArea.');
                console.log('run(): x = %d', this.x);
            }
        }
    }
    setPos(x, y) {
        this.x = x;
        this.y = -(y * 0.2167);
    }
    draw() {
        if (this.pos == TrainPos.inArea) {
            ctx.drawImage(this.image, this.x, this.y);
            this.run();
        }
    }
    getXPos(){ return this.x; }
    getLength() { return this.length; }

    checkInboundSensor(){
        switch(this.posState){
            case PosState.before:
                if(this.left < this.x){
                    this.posState = PosState.entering;
                    console.log("entering");
                    ipcRenderer.send('asynchronous-message', 'entering');
                }
                break;
            case PosState.entering:
                if(this.left < this.x - this.getLength()*this.lengthRatio){
                    this.posState = PosState.passing;
                    console.log("passing");
                    ipcRenderer.send('asynchronous-message', 'passing');
                }
                break;
            case PosState.passing:
                if(this.right < this.x){
                    this.posState = PosState.exiting;
                    console.log("exiting");
                    ipcRenderer.send('asynchronous-message', 'exiting');
                }
                break;
            case PosState.exiting:
                if(this.right < this.x - this.getLength()*this.lengthRatio){
                    this.posState = PosState.after;
                    console.log("after");
                    ipcRenderer.send('asynchronous-message', 'after');
                }
                break;
            case PosState.after:
                break;
            default:
                console.log("checkInboundSensor:default");
        }
    }    
    checkOutboundSensor(){
        // console.log(this.x);
        switch(this.posState){
            case PosState.before:
                if(this.right > this.x - this.getLength() * this.lengthRatio){
                    this.posState = PosState.entering;
                    console.log("entering");
                    ipcRenderer.send('asynchronous-message', 'entering');
                }
                break;
            case PosState.entering:
                if(this.right > this.x){
                    this.posState = PosState.passing;
                    console.log("passing");
                    ipcRenderer.send('asynchronous-message', 'passing');
                }
                break;
            case PosState.passing:
                if(this.left > this.x - this.getLength() * this.lengthRatio){
                    this.posState = PosState.exiting;
                    console.log("exiting");
                    ipcRenderer.send('asynchronous-message', 'exiting');
                }
                break;
            case PosState.exiting:
                if(this.left > this.x){
                    this.posState = PosState.after;
                    console.log("after");
                    ipcRenderer.send('asynchronous-message', 'after');
                }
                break;
            case PosState.after:
                break;
            default:
                console.log("Error!");
        }
    }
}
// Train クラスここまで
//---------------------------------------------------------

//----------------------------------------------------------------------
// Node.jsの機能は使えないので preload.js で最低限の機能のみ参照できるようにする
// const { ipcRenderer } = require('electron')
const { ipcRenderer } = window.native;

// チャンネル 'asynchronous-reply' で非同期メッセージの受信を待機
ipcRenderer.on('asynchronous-reply', (event, arg) => {
  // 受信時のコールバック関数
  console.log(arg) // pong
});
// 非同期メッセージの送信
// ipcRenderer.send('asynchronous-message', 'ping');


const btnInbound = document.querySelector('.btn-inbound');
btnInbound.addEventListener('click', function (clickEvent) {
    ipcRenderer.send('asynchronous-message', 'inbound enter');
})
const btnOutbound = document.querySelector('.btn-outbound');
btnOutbound.addEventListener('click', function (clickEvent) {
    ipcRenderer.send('asynchronous-message', 'outbound enter');
})







//-----------------------------------------------------------------------
const canvas = document.getElementById('canvas');
// const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
// document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
let blinkFlag = false;
let train_inbound = false;
let train_outbound = false;
const inboundTrain = new Train(TrainBound.inbound);
const outboundTrain = new Train(TrainBound.outbound);
const signalLeftTop = new Signal(SignalPos.leftTop);
const signalLeftBottom = new Signal(SignalPos.leftBottom);
const signalRightTop = new Signal(SignalPos.rightTop);
const signalRightBottom = new Signal(SignalPos.rightBottom);


function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.src = "../images/railway_with_road.svg";
    ctx.drawImage(img, -150, -100);
    drawInboundSignals();
    drawInboundTrains();
    drawOutboundTrains();
    drawOutboundSignals();
}
function drawOutboundTrains() {
    outboundTrain.draw();
}
function drawInboundTrains() {
    inboundTrain.draw();
}
function drawOutboundSignals() {
    signalLeftBottom.draw();
    signalRightBottom.draw();
}
function drawInboundSignals() {
    signalLeftTop.draw();
    signalRightTop.draw();
}
setInterval(drawAll, 90);

function trainInbound() {
    console.log("上り電車が来た！");
    inboundTrain.handleEvent(EventToTrain.runInbound);
}
function trainOutbound() {
    console.log("下り電車が来た！");
    outboundTrain.handleEvent(EventToTrain.runOutbound);
}
function barUp() {
    console.log('遮断バーを上げて！');
    signalLeftTop.handleEvent(EventToSignal.open);
    signalLeftBottom.handleEvent(EventToSignal.open);
    signalRightTop.handleEvent(EventToSignal.open);
    signalRightBottom.handleEvent(EventToSignal.open);
}
function barDown() {
    console.log('遮断バーを下げて！');
    signalLeftTop.handleEvent(EventToSignal.close);
    signalLeftBottom.handleEvent(EventToSignal.close);
    signalRightTop.handleEvent(EventToSignal.close);
    signalRightBottom.handleEvent(EventToSignal.close);
}
function startSound() {
    signalLeftBottom.handleEvent(EventToSignal.startSound);
}
function stopSound() {
    signalLeftBottom.handleEvent(EventToSignal.stopSound);
}
function startBlink() {
    signalLeftTop.handleEvent(EventToSignal.startBlink);
    signalLeftBottom.handleEvent(EventToSignal.startBlink);
    signalRightTop.handleEvent(EventToSignal.startBlink);
    signalRightBottom.handleEvent(EventToSignal.startBlink);
}
function stopBlink() {
    signalLeftTop.handleEvent(EventToSignal.stopBlink);
    signalLeftBottom.handleEvent(EventToSignal.stopBlink);
    signalRightTop.handleEvent(EventToSignal.stopBlink);
    signalRightBottom.handleEvent(EventToSignal.stopBlink);
}


let pollingEvent = () => {
  // 同期メッセージを送信して、返信内容を表示する
  const retValue = ipcRenderer.sendSync('synchronous-message', '');
  const evt = retValue.trim();
  if('' !== evt){
    
    if('START_WARN' == evt){
      console.log(evt); 
      startSound();
    }else if('STOP_WARN' == evt){
      stopSound();
    }else if('START_BLINK' == evt){
        startBlink();
    }else if('STOP_BLINK' == evt){
        stopBlink();
    }else if('BAR_DOWN' == evt){
        barDown();
    }else if('BAR_UP' == evt){
        barUp();
    }
  }
}

setInterval(pollingEvent, 100);