"use strict";
var SignalPos;
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
var TrainBound;
(function (TrainBound) {
    TrainBound[TrainBound["inbound"] = 0] = "inbound";
    TrainBound[TrainBound["outbound"] = 1] = "outbound"; // 下り
})(TrainBound || (TrainBound = {}));
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
        this.sound = new Audio('../../sounds/Railroad_Crossing-Signal.mp3');
        this.pos = pos;
        const left = canvas.width * 0.20;
        const right = canvas.width * 0.50;
        const top = 0;
        const bottom = canvas.height * 0.50;
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
        this.on_off = new Image();
        this.off_on = new Image();
        this.off_off = new Image();
        this.initImages();
    }
    initImages() {
        this.on_off.src = "../../images/Signal_on_off.svg";
        this.off_on.src = "../../images/Signal_off_on.svg";
        this.off_off.src = "../../images/Signal_off_off.svg";
        const leftBarImage_paths = [
            "../../images/Bar00L.svg",
            "../../images/Bar05L.svg",
            "../../images/Bar10L.svg",
            "../../images/Bar15L.svg",
            "../../images/Bar20L.svg",
            "../../images/Bar25L.svg",
            "../../images/Bar30L.svg",
            "../../images/Bar35L.svg",
            "../../images/Bar40L.svg",
            "../../images/Bar45L.svg",
            "../../images/Bar50L.svg",
            "../../images/Bar55L.svg",
            "../../images/Bar60L.svg",
            "../../images/Bar65L.svg",
            "../../images/Bar70L.svg",
            "../../images/Bar75L.svg",
            "../../images/Bar80L.svg",
            "../../images/Bar85L.svg",
            "../../images/Bar90L.svg",
        ];
        leftBarImage_paths.map(e => {
            var img = new Image();
            img.src = e;
            this.leftBarImages.push(img);
        });
        const rightBarImage_paths = [
            "../../images/Bar00R.svg",
            "../../images/Bar05R.svg",
            "../../images/Bar10R.svg",
            "../../images/Bar15R.svg",
            "../../images/Bar20R.svg",
            "../../images/Bar25R.svg",
            "../../images/Bar30R.svg",
            "../../images/Bar35R.svg",
            "../../images/Bar40R.svg",
            "../../images/Bar45R.svg",
            "../../images/Bar50R.svg",
            "../../images/Bar55R.svg",
            "../../images/Bar60R.svg",
            "../../images/Bar65R.svg",
            "../../images/Bar70R.svg",
            "../../images/Bar75R.svg",
            "../../images/Bar80R.svg",
            "../../images/Bar85R.svg",
            "../../images/Bar90R.svg",
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
    ;
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
        ctx.drawImage(this.off_off, this.x, this.y, this.width, this.height);
    }
    blink() {
        // 点灯画像と消灯画像を交互に表示する。表示位置は遮断機の位置によって異なる。（４通り）
        // 点滅間隔は this.blinkTime で設定し、this.blinkCount で制御する。
        if (this.blinkFlag) {
            ctx.drawImage(this.on_off, this.x, this.y, this.width, this.height);
        }
        else {
            ctx.drawImage(this.off_on, this.x, this.y, this.width, this.height);
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
class Train {
    constructor(bound) {
        this.length = 40;
        this.default_inbound_x_pos = -this.length;
        this.default_outbound_x_pos = canvas.width * 0.9;
        this.default_x_pos = 0;
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.image = new Image();
        switch (bound) {
            case TrainBound.inbound:
                this.default_x_pos = this.default_inbound_x_pos;
                this.x = this.default_x_pos;
                this.y = canvas.height * (-0.2);
                this.image.src = "../../images/train_R.svg";
                this.speed = 5;
                break;
            case TrainBound.outbound:
                this.default_x_pos = this.default_outbound_x_pos;
                this.x = this.default_x_pos;
                this.y = canvas.height * (-0.5);
                this.image.src = "../../images/train_L.svg";
                this.speed = -5;
                break;
            default:
                ;
        }
    }
    run() {
        this.x += this.speed;
        if (this.x + this.length < 0) {
            train_inbound = false;
            this.x = this.default_x_pos;
        }
        if (this.x + this.length > canvas.width) {
            train_outbound = false;
            this.x = this.default_x_pos;
        }
    }
    setPos(x, y) {
        this.x = x;
        this.y = -(y * 0.2167);
    }
    draw() {
        ctx.drawImage(this.image, this.x, this.y);
        this.run();
    }
}
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
const signal_left_top = new Signal(SignalPos.leftTop);
const signal_left_bottom = new Signal(SignalPos.leftBottom);
const signal_right_top = new Signal(SignalPos.rightTop);
const signal_right_bottom = new Signal(SignalPos.rightBottom);
function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.src = "../../images/railway.svg";
    ctx.drawImage(img, 0, 20);
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
    signal_left_bottom.draw();
    signal_right_bottom.draw();
}
function drawInboundSignals() {
    signal_left_top.draw();
    signal_right_top.draw();
}
setInterval(drawAll, 90);
function trainInbound() {
    console.log("上り電車が来た！");
    train_inbound = true;
}
function trainOutbound() {
    console.log("下り電車が来た！");
    train_outbound = true;
}
function barUp() {
    console.log('遮断バーを上げて！');
    signal_left_top.handleEvent(EventToSignal.open);
    signal_left_bottom.handleEvent(EventToSignal.open);
    signal_right_top.handleEvent(EventToSignal.open);
    signal_right_bottom.handleEvent(EventToSignal.open);
}
function barDown() {
    console.log('遮断バーを下げて！');
    signal_left_top.handleEvent(EventToSignal.close);
    signal_left_bottom.handleEvent(EventToSignal.close);
    signal_right_top.handleEvent(EventToSignal.close);
    signal_right_bottom.handleEvent(EventToSignal.close);
}
function startSound() {
    signal_left_bottom.handleEvent(EventToSignal.startSound);
}
function stopSound() {
    signal_left_bottom.handleEvent(EventToSignal.stopSound);
}
function startBlink() {
    signal_left_top.handleEvent(EventToSignal.startBlink);
    signal_left_bottom.handleEvent(EventToSignal.startBlink);
    signal_right_top.handleEvent(EventToSignal.startBlink);
    signal_right_bottom.handleEvent(EventToSignal.startBlink);
}
function stopBlink() {
    signal_left_top.handleEvent(EventToSignal.stopBlink);
    signal_left_bottom.handleEvent(EventToSignal.stopBlink);
    signal_right_top.handleEvent(EventToSignal.stopBlink);
    signal_right_bottom.handleEvent(EventToSignal.stopBlink);
}
//# sourceMappingURL=main.js.map