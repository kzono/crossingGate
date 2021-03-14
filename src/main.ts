enum SignalPos{
    leftTop,
    leftBottom,
    rightTop,
    rightBottom
}
enum EventToSignal{
    startSound,
    stopSound,
    startBlink,
    stopBlink,
    open,
    close
}
enum EventFromSignal{
    inbound_enter, // 上り電車入場 
    inbound_exit,  // 上り電車退場
    outbound_enter,// 下り電車入場
    outbound_exit, // 下り電車退場
    closed_enter,  // 入口側遮断機閉
    closed_exit,   // 出口側遮断機閉
    opend_enter,   // 入口側遮断機開
    opend_exit     // 出口側遮断機開
}
enum TrainBound{
    inbound, // 上り
    outbound // 下り
}

enum BarState{
    opened,
    closing,
    closed,
    opening
}
enum LampState{blink, noblink}
enum SignalState {
    warning, closing, closed, opening, opened
}
class Signal{
    public lampState : LampState = LampState.noblink;
    public barState : BarState = BarState.opened;

    private pos : SignalPos;
    private x : number; // 位置の x 座標
    private y : number; // 位置の y 座標
    private readonly blinkTime : number = 5; // 警告ランプの点滅間隔
    private blinkCount : number = 0; // 警告ランプ点滅間隔のカウンター
    private blinkFlag : boolean = false; // 点滅パターン用フラグ


    private readonly countPerImageClosing : number = 3; // 遮断バーを下ろすとき、画像１枚あたりの表示回数
    private closingCount : number = 0; // countPerImageClosing になるまでの表示回数のカウンター
    private readonly countPerImageOpening : number = 1;  // 遮断バーを上げるとき、画像１枚あたりの表示回数
    private openingCount : number = 0; // countPerImageOpening になるまでの表示回数のカウンター 

    private leftBarImages : HTMLImageElement[]; // 左遮断機用バーの画像
    private rightBarImages : HTMLImageElement[]; // 左遮断機用バーの画像

    private onOff : HTMLImageElement; // 遮断機の画像
    private offOn : HTMLImageElement; // 遮断機の画像
    private offOff : HTMLImageElement; // 遮断機の画像
    private image_count : number = 0;

    private readonly width : number = 300; // 信号機画像の幅
    private readonly height : number = 200; // 信号機画像の幅

    private sound : HTMLAudioElement = new Audio('../../sounds/Railroad_Crossing-Signal.mp3');
    constructor(pos:SignalPos){
        this.pos = pos;
        const left   = canvas.width * 0.20;
        const right  = canvas.width * 0.50;
        const top    =  0;
        const bottom = canvas.height * 0.50;
        switch(pos){
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

        this.leftBarImages = new Array<HTMLImageElement>();
        this.rightBarImages = new Array<HTMLImageElement>();

        this.onOff = new Image();
        this.offOn = new Image();
        this.offOff = new Image();
        this.initImages();
    }
    private initImages(){
        this.onOff.src = "../../images/Signal_on_off.svg";
        this.offOn.src = "../../images/Signal_off_on.svg";
        this.offOff.src = "../../images/Signal_off_off.svg";

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
        leftBarImage_paths.map(e =>
            {
                var img = new Image();
                img.src = e;
                this.leftBarImages.push(img);
            }
        );
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
        rightBarImage_paths.map(e =>
            {
                var img = new Image();
                img.src = e;
                this.rightBarImages.push(img);
            }
        );
    }

    public handleEvent(evt : EventToSignal){
        switch(evt){
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
                switch(this.barState){
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
                switch(this.barState){
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
    draw(){
        switch(this.lampState){
            case LampState.noblink:
                this.noblink();
                break;
            case LampState.blink:
                this.blink();
                break;
            default:
                ;
        }

        switch(this.barState){
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
    public startSound(){// 警告音を開始する
        this.sound.loop = true;
        this.sound.volume = 0.4; // 0.0 〜 1.0
        this.sound.play()
    };
    private drawClosingBar(){
        switch(this.pos){
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
        if(this.closingCount > this.countPerImageClosing){
            this.closingCount = 0;
            this.image_count++;
        }
        if(this.image_count > this.leftBarImages.length - 1){
            this.image_count = 0;
            this.barState = BarState.closed;
        }
    }
    private drawOpeningBar(){
        switch(this.pos){
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
        if(this.openingCount > this.countPerImageOpening){
            this.openingCount = 0;
            this.image_count++;
        }
        if(this.image_count > this.leftBarImages.length - 1){
            this.image_count = 0;
            this.barState = BarState.opened;
        }
    }
    private drawOpenedBar(){
        switch(this.pos){
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

    private drawClosedBar(){
        switch(this.pos){
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
    private noblink(){
        ctx.drawImage(this.offOff, this.x, this.y, this.width, this.height);
    }
    private blink(){// 警告ランプの点滅する
        // 点滅間隔は this.blinkTime で設定し、this.blinkCount で制御する。
        if(this.blinkFlag){
            ctx.drawImage(this.onOff, this.x, this.y, this.width, this.height);
        }else{
            ctx.drawImage(this.offOn, this.x, this.y, this.width, this.height);
        }

        this.blinkCount++;
        if(this.blinkCount > this.blinkTime){
            this.blinkCount = 0;
            this.blinkFlag = !this.blinkFlag;
        }
    }
    // private stopSound(){ // 警告音を停止する
    public stopSound(){ // 警告音を停止する
        this.sound.pause();
    }
    private stopBlink(){ // 警告ランプの点滅を停止する
        // 消灯画像を表示する
    }
}

class Train{
    readonly length : number = 40;
    readonly defaultInboundXPos : number =  - this.length; 
    readonly defaultOutboundXPos : number = canvas.width * 0.9; 
    defaultXPos : number = 0;
    x : number = 0;
    y : number = 0;
    speed : number = 0;
    image : HTMLImageElement
    constructor(bound : TrainBound){
        this.image = new Image();
        switch(bound){
            case TrainBound.inbound:
                this.defaultXPos = this.defaultInboundXPos;
                this.x = this.defaultXPos;
                this.y = canvas.height * (-0.2);
                this.image.src = "../../images/train_R.svg";
                this.speed = 5;
                break;
            case TrainBound.outbound:
                this.defaultXPos = this.defaultOutboundXPos;
                this.x = this.defaultXPos;
                this.y = canvas.height * (-0.5);
                this.image.src = "../../images/train_L.svg";
                this.speed = -5;
                break;
            default:
                ;
        }
    }
    run(){
        if(train_inbound){
            this.x += this.speed;
            if(this.x + this.length < 0) {
                train_inbound = false;
                this.x = this.defaultXPos;
            } 
        }
        if(train_outbound){
            this.x += this.speed;
            if(this.x + this.length > canvas.width) {
                train_outbound = false;
                this.x = this.defaultXPos;
            } 
        }
    }
    setPos(x:number, y:number){
        this.x = x;
        this.y = -(y * 0.2167);
    }
    draw(){
        ctx.drawImage(this.image, this.x, this.y);
        this.run();
    }
}


const canvas = <HTMLCanvasElement> document.getElementById('canvas');
// const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
// document.body.appendChild(canvas);

const ctx = < CanvasRenderingContext2D > canvas.getContext("2d");

let blinkFlag : boolean = false;
let train_inbound : boolean = false;
let train_outbound : boolean = false;

const inboundTrain = new Train(TrainBound.inbound);
const outboundTrain = new Train(TrainBound.outbound);
const signalLeftTop = new Signal(SignalPos.leftTop);
const signalLeftBottom = new Signal(SignalPos.leftBottom);
const signalRightTop = new Signal(SignalPos.rightTop);
const signalRightBottom = new Signal(SignalPos.rightBottom);

function drawAll(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.src = "../../images/railway.svg";
    ctx.drawImage(img, 0, 20);

    drawInboundSignals();
    drawInboundTrains();
    drawOutboundTrains();
    drawOutboundSignals();
}

function drawOutboundTrains(){
    outboundTrain.draw();
}
function drawInboundTrains(){
    inboundTrain.draw();
}

function drawOutboundSignals(){
    signalLeftBottom.draw();
    signalRightBottom.draw();
}

function drawInboundSignals(){
    signalLeftTop.draw();
    signalRightTop.draw();
}

setInterval(drawAll, 90);

function trainInbound(){ // 上り電車入場
    console.log("上り電車が来た！");
    train_inbound = true;
}
function trainOutbound(){ // 下り電車入場
    console.log("下り電車が来た！");
    train_outbound = true;
}

function barUp(){
    console.log('遮断バーを上げて！');
    signalLeftTop.handleEvent(EventToSignal.open);
    signalLeftBottom.handleEvent(EventToSignal.open);
    signalRightTop.handleEvent(EventToSignal.open);
    signalRightBottom.handleEvent(EventToSignal.open);
}

function barDown(){
    console.log('遮断バーを下げて！');
    signalLeftTop.handleEvent(EventToSignal.close);
    signalLeftBottom.handleEvent(EventToSignal.close);
    signalRightTop.handleEvent(EventToSignal.close);
    signalRightBottom.handleEvent(EventToSignal.close);
}
function startSound(){
    signalLeftBottom.handleEvent(EventToSignal.startSound);
}
function stopSound(){
    signalLeftBottom.handleEvent(EventToSignal.stopSound);
}
function startBlink(){
    signalLeftTop.handleEvent(EventToSignal.startBlink);
    signalLeftBottom.handleEvent(EventToSignal.startBlink);
    signalRightTop.handleEvent(EventToSignal.startBlink);
    signalRightBottom.handleEvent(EventToSignal.startBlink);
}
function stopBlink(){
    signalLeftTop.handleEvent(EventToSignal.stopBlink);
    signalLeftBottom.handleEvent(EventToSignal.stopBlink);
    signalRightTop.handleEvent(EventToSignal.stopBlink);
    signalRightBottom.handleEvent(EventToSignal.stopBlink);
}