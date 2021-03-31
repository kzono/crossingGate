"use strict";


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
        // console.log(this.x);
        if (this.bound == TrainBound.outbound) {
            this.checkOutboundSensor();

            if (this.x + this.length + canvas.width * 0.25 < 0) {
                this.pos = TrainPos.outOfArea;
                this.posState = PosState.before;
                this.x = this.defaultXPos;
                console.log('run(): inbound this.pos = outOfArea.');
                console.log('run(): x = %d', this.x);
                outboundInActiveTrains.push(this);
                outboundActiveTrains.shift();
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
                inboundInActiveTrains.push(this);
                inboundActiveTrains.shift();
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
// Car class start 
var CarBound;
(function (CarBound) {
    CarBound[CarBound["up"] = 0] = "up";
    CarBound[CarBound["down"] = 1] = "down";
})(CarBound || (CarBound = {}));
var CarPos;
(function (CarPos) {
    CarPos[CarPos["inArea"] = 0] = "inArea";
    CarPos[CarPos["outOfArea"] = 1] = "outOfArea";
})(CarPos || (CarPos = {}));

var CarPosState;
(function (CarPosState) {
    CarPosState[CarPosState["before"] = 0] = "before";
    CarPosState[CarPosState["passing"] = 1] = "passing";
    CarPosState[CarPosState["passing"] = 1] = "passing";
})(CarPosState || (CarPosState = {}));

var CarType;
(function (CarType) {
    CarType[CarType["sedan"] = 0] = "sedan";
    CarType[CarType["wagon"] = 1] = "wagon";
    CarType[CarType["truck"] = 2] = "truck";
})(CarType || (CarType = {}));

class Car{
    static waitCount = 0;
    static nextWait = 50;
    static length = 150;
    constructor(bound, cartype){
        this.left = canvas.width * 0.36;
        this.right = canvas.width * 0.48;
        // this.defaultUpYPos = -this.length - canvas.height * 0.5;
        this.defaultUpYPos =  canvas.height * 0.93;
        this.upStopYPos =  canvas.height * 0.68;
        this.defaultDownYPos = canvas.height * (-0.25);
        this.downStopYPos = canvas.height * (-0.02);
        this.defaultYPos = 0;
        this.pos = CarPos.outOfArea;
        this.posState = CarPosState.before;
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.bound = bound;
        this.width = 100; 
        this.height = 150;
        this.image = new Image();
        this.lengthRatio = 4;
        // this.posState = PosState.before
        switch (bound) {
            case CarBound.up:
                this.defaultYPos = this.defaultUpYPos;
                this.x = this.left;
                this.y = this.defaultYPos;
                // this.image.src = "../images/topview_car_up.png";
                switch(cartype){
                    case CarType.sedan:
                        this.image.src = "../images/topview_car_up.png";
                        break;
                    case CarType.wagon:
                        this.image.src = "../images/topview_car_wagon_up.png";
                        break;
                    case CarType.truck:
                        this.image.src = "../images/topview_car_truck_up.png";
                        break;
                    default:
                        ;
                }
                this.speed = -5;
                break;
            case CarBound.down:
                this.defaultYPos = this.defaultDownYPos;
                this.x = this.right;
                this.y = this.defaultYPos;
                // this.image.src = "../images/topview_car_Down.svg";
                switch(cartype){
                    case CarType.sedan:
                        this.image.src = "../images/topview_car_Down.svg";
                        break;
                    case CarType.wagon:
                        this.image.src = "../images/topview_car_wagon_Down.svg";
                        break;
                    case CarType.truck:
                        this.image.src = "../images/topview_car_truck_Down.svg";
                        break;
                    default:
                        ;
                }
                this.speed = 5;
                break;
            default:
                ;
        }
    }
    getDistance(){
        let no = 0;
        if(this.CarBound == CarBound.up){
            for(let i=0; i< upActiveCars.length; ++i){
                if(upActiveCars[i] == this){
                    no = i;
                    break;
                }
            }
            if(no == 0){ // first
                return 2 * this.length;
            }else{
                return this.y - upActiveCars[no - 1].y;
            }
        }else{ // CarBound.down
            for(let i=0; i< downActiveCars.length; ++i){
                if(downActiveCars[i] == this){
                    no = i;
                    break;
                }
            }
            if(no == 0){ // first
                return 2 * this.length;
            }else{
                return this.y - upActiveCars[no - 1].y;
            }
        }
    }
    draw(){
        // if (this.pos == TrainPos.inArea) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            this.run();
        // }       
    }
    run(){
        // if(this.length < this.getDistance()){
        //     this.y += this.speed;
        // }
        // console.log(this.y);
        switch(this.bound){
            case CarBound.up:
                switch(this.posState){
                    case CarPosState.before:
                        // console.log(this.y);
                        if(this.y < this.upStopYPos && (this.y + this.speed) < this.upStopYPos){
                            if(signalLeftBottom.barState == BarState.closed ||
                                signalLeftBottom.barState == BarState.closing){
                                return;
                            }
                        }
                        if(this.y < this.upStopYPos){
                            this.posState = CarPosState.passing;
                            // console.log("up passing");
                        }
                    break;
                    case CarPosState.passing:
                        if(this.y < this.downStopYPos){
                            this.posState = CarPosState.after;
                            // console.log("up after");
                        }
                        break;
                    case CarPosState.after:
                        break;
                    default:
                        // console.log("error!  default");
                }
                break;
            case CarBound.down:
                switch(this.posState){
                    case CarPosState.before:
                        if(this.y < this.upStopYPos && (this.y + this.speed) > this.downStopYPos){
                            if(signalRightTop.barState == BarState.closed ||
                                signalRightTop.barState == BarState.closing){
                                return;
                            }
                        }
                        if(this.y > this.downStopYPos){
                            this.posState = CarPosState.passing;
                            // console.log("down passing");
                        }
                        break;
                    case CarPosState.passing:
                        if(this.y > this.upStopYPos){
                            this.posState = CarPosState.after;
                            // console.log("down after");
                        }
                        break;
                    case CarPosState.after:
                        break;
                    default:
                }
                break;
            default:
                break;
        }

        this.y += this.speed;

        if (this.bound == CarBound.up) {

            if (this.y + this.length + canvas.height * 0.25 < 0) {
                this.pos = CarPos.outOfArea;
                this.CarPosState = CarPosState.before;
                // console.log("up before");
                this.y = this.defaultYPos;
                // console.log('run(): up this.pos = outOfArea.');
                // console.log('run(): y = %d', this.y);
                upInActiveCars.push(this);
                upActiveCars.shift();
            }
        }
        if (this.bound == CarBound.down) {

            if (this.y + this.length > canvas.height) {
                this.pos = CarPos.outOfArea;
                this.carPosState = CarPosState.before;
                // console.log("down before");
                this.y = this.defaultYPos;
                // console.log('run(): down this.pos = outOfArea.');
                // console.log('run(): y = %d', this.y);
                downInActiveCars.push(this);
                downActiveCars.shift();
            }
        }
    }
}
//-- Car class end --------------------------------------------------------
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
const signalLeftTop = new Signal(SignalPos.leftTop);
const signalLeftBottom = new Signal(SignalPos.leftBottom);
const signalRightTop = new Signal(SignalPos.rightTop);
const signalRightBottom = new Signal(SignalPos.rightBottom);

// const inboundTrain = new Train(TrainBound.inbound);
// const outboundTrain = new Train(TrainBound.outbound);
let inboundInActiveTrains = [];
let inboundActiveTrains = [];
let outboundInActiveTrains = [];
let outboundActiveTrains = [];

// const upCar = new Car(CarBound.up);
// const downCar = new Car(CarBound.down);
let upInActiveCars = [];
let upActiveCars = [];
let downInActiveCars = [];
let downActiveCars = [];

window.addEventListener("load", () => {
    const trainMaxNum = 5;
    for(let i = 0; i < trainMaxNum; ++i){
        inboundInActiveTrains.push(new Train(TrainBound.inbound));
        outboundInActiveTrains.push(new Train(TrainBound.outbound));
    }
    const carMaxNum = 10;
    let type;
    for(let i = 0; i < carMaxNum; ++i){
    // upInActiveCars.push(new Car(CarBound.up, CarType.sedan));
        type = Math.round((Math.random() * 10)) % 3;
        upInActiveCars.push(new Car(CarBound.up, type));
        type = Math.round((Math.random() * 10)) % 3;
        // downInActiveCars.push(new Car(CarBound.down, CarType.sedan));
        downInActiveCars.push(new Car(CarBound.down, type));
    }
})


function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.src = "../images/railway_with_road.svg";
    ctx.drawImage(img, -150, -100);
    drawInboundSignals();
    drawInboundTrains();
    drawOutboundTrains();
    drawOutboundSignals();
    drawCars();
}
function drawCars(){
    Car.waitCount++;
    // if(Car.waitCount > 50){
    if(Car.waitCount > Car.nextWait){
        Car.waitCount = 0;
        Car.nextWait = 70 + Math.round((Math.random() * 75));
        upActiveCars.push(upInActiveCars.shift());
        downActiveCars.push(downInActiveCars.shift());
    }
    drawUpCars();
    drawDownCars();
}
function drawUpCars() {
    // upCar.draw();
    // upActiveCars.map(car => car.draw());
    if(0 == upActiveCars.length) return;
    upActiveCars[0].draw();
    for(let i = 0; i < upActiveCars.length - 1; i++){
        let distance = upActiveCars[i+1].y - upActiveCars[i].y;
        // console.log("%d: %d", i ,distance);
        if(distance > Car.length*1.1){
            upActiveCars[i+1].draw();
        }
    }
}
function drawDownCars() {
    // downCar.draw();
    // downInActiveCars[2].draw();
    // downActiveCars.map(car => car.draw());
    if(0 == downActiveCars.length) return;
    downActiveCars[0].draw();
    for(let i = 0; i < downActiveCars.length - 1; i++){
        let distance = downActiveCars[i].y - downActiveCars[i+1].y;
        // console.log("%d: %d", i ,distance);
        if(distance > Car.length*1.1){
            downActiveCars[i+1].draw();
        }
    }
}

function drawOutboundTrains() {
    // outboundTrain.draw();
    outboundActiveTrains.map(train => train.draw());
}
function drawInboundTrains() {
    inboundActiveTrains.map(train => {
        // console.log(train.getXPos());
        train.draw();
    });
    // inboundTrain.draw();
}
function drawOutboundSignals() {
    signalLeftBottom.draw();
    signalRightBottom.draw();
}
function drawInboundSignals() {
    signalLeftTop.draw();
    signalRightTop.draw();
}
// setInterval(drawAll, 300);
setInterval(drawAll, 90);

function trainInbound() {
    console.log("上り電車が来た！");
    // inboundTrain.handleEvent(EventToTrain.runInbound);
    inboundActiveTrains.push(inboundInActiveTrains[0]);
    inboundInActiveTrains.shift();
    inboundActiveTrains.map(train => train.handleEvent(EventToTrain.runInbound));
}
function trainOutbound() {
    console.log("下り電車が来た！");
    // outboundTrain.handleEvent(EventToTrain.runOutbound);
    outboundActiveTrains.push(outboundInActiveTrains[0]);
    outboundInActiveTrains.shift();
    outboundActiveTrains.map(train => train.handleEvent(EventToTrain.runOutbound));
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