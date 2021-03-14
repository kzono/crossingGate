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
    private readonly blink_time : number = 5; // 警告ランプの点滅間隔
    private blink_count : number = 0; // 警告ランプ点滅間隔のカウンター
    private blink_flag : boolean = false; // 点滅パターン用フラグ

    private readonly warning_time : number = 10000; // 警報が始まってから遮断バーをおろし始めるまでの時間
    private warning_count = 0; // warning_time のカウンター

    private readonly count_per_image_closing : number = 3; // 遮断バーを下ろすとき、画像１枚あたりの表示回数
    private closing_count : number = 0; // count_per_image_closing になるまでの表示回数のカウンター
    private readonly count_per_image_opening : number = 1;  // 遮断バーを上げるとき、画像１枚あたりの表示回数
    private opening_count : number = 0; // count_per_image_opening になるまでの表示回数のカウンター 

    private state : SignalState = SignalState.opened;
    private left_down_images : Array<HTMLImageElement>; // 遮断機の画像
    private left_up_images : HTMLImageElement[]; // 遮断機の画像
    private right_down_images : HTMLImageElement[]; // 遮断機の画像
    private right_up_images : HTMLImageElement[]; // 遮断機の画像
    private left_bar_images : HTMLImageElement[]; // 左遮断機用バーの画像
    private right_bar_images : HTMLImageElement[]; // 左遮断機用バーの画像

    private on_off : HTMLImageElement; // 遮断機の画像
    private off_on : HTMLImageElement; // 遮断機の画像
    private off_off : HTMLImageElement; // 遮断機の画像
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
        this.left_down_images = new Array<HTMLImageElement>();
        this.left_up_images = new Array<HTMLImageElement>();
        this.right_down_images = new Array<HTMLImageElement>();
        this.right_up_images = new Array<HTMLImageElement>();

        this.left_bar_images = new Array<HTMLImageElement>();
        this.right_bar_images = new Array<HTMLImageElement>();

        this.on_off = new Image();
        this.off_on = new Image();
        this.off_off = new Image();
        this.initImages();
    }
    private initImages(){
        this.on_off.src = "../../images/Signal_on_off.svg";
        this.off_on.src = "../../images/Signal_off_on.svg";
        this.off_off.src = "../../images/Signal_off_off.svg";

        const left_bar_image_paths = [
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
        left_bar_image_paths.map(e =>
            {
                var img = new Image();
                img.src = e;
                this.left_bar_images.push(img);
            }
        );
        const right_bar_image_paths = [
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
        right_bar_image_paths.map(e =>
            {
                var img = new Image();
                img.src = e;
                this.right_bar_images.push(img);
            }
        );
        const left_down_file_paths = [
            "../../images/Signal_L01.png",
            "../../images/Signal_L02.png",
            "../../images/Signal_L03.png",
            "../../images/Signal_L04.png",
            "../../images/Signal_L05.png",
            "../../images/Signal_L06.png",
            "../../images/Signal_L07.png",
            "../../images/Signal_L08.png",
            "../../images/Signal_L09.png",
            "../../images/Signal_L10.png",
            "../../images/Signal_L11.png",
            "../../images/Signal_L12.png",
            "../../images/Signal_L13.png",
            "../../images/Signal_L14.png",
            "../../images/Signal_L15.png",
            "../../images/Signal_L16.png",
            "../../images/Signal_L17.png",
            "../../images/Signal_L18.png",
            "../../images/Signal_L19.png",
            "../../images/Signal_L20.png",
            "../../images/Signal_L21.png"
        ];

        left_down_file_paths.map(e =>
            {
                var img = new Image();
                img.src = e;
                this.left_down_images.push(img);
            }
        );
        const left_up_file_paths = [
            "../../images/Signal_LUp01.png",
            "../../images/Signal_LUp02.png",
            "../../images/Signal_LUp03.png",
            "../../images/Signal_LUp04.png",
            "../../images/Signal_LUp05.png",
            "../../images/Signal_LUp06.png",
            "../../images/Signal_LUp07.png",
            "../../images/Signal_LUp08.png",
            "../../images/Signal_LUp09.png",
            "../../images/Signal_LUp10.png"
        ];
        left_up_file_paths.map(e =>
            {
                var img = new Image();
                img.src = e;
                this.left_up_images.push(img);
            }
        );
    
        const right_down_file_paths = [
            "../../images/Signal_R01.svg",
            "../../images/Signal_R02.svg",
            "../../images/Signal_R03.svg",
            "../../images/Signal_R04.svg",
            "../../images/Signal_R05.svg",
            "../../images/Signal_R06.svg",
            "../../images/Signal_R07.svg",
            "../../images/Signal_R08.svg",
            "../../images/Signal_R09.svg",
            "../../images/Signal_R10.svg",
            "../../images/Signal_R11.svg",
            "../../images/Signal_R12.svg",
            "../../images/Signal_R13.svg",
            "../../images/Signal_R14.svg",
            "../../images/Signal_R15.svg",
            "../../images/Signal_R16.svg",
            "../../images/Signal_R17.svg",
            "../../images/Signal_R18.svg",
            "../../images/Signal_R19.svg",
            "../../images/Signal_R20.svg",
            "../../images/Signal_R21.svg"
        ];
    
        right_down_file_paths.map(e =>
            {
                var img = new Image();
                img.src = e;
                this.right_down_images.push(img);
            }
        );
    
    
        const right_up_file_paths = [
            "../../images/Signal_RUp01.svg",
            "../../images/Signal_RUp02.svg",
            "../../images/Signal_RUp03.svg",
            "../../images/Signal_RUp04.svg",
            "../../images/Signal_RUp05.svg",
            "../../images/Signal_RUp06.svg",
            "../../images/Signal_RUp07.svg",
            "../../images/Signal_RUp08.svg",
            "../../images/Signal_RUp09.svg",
            "../../images/Signal_RUp10.svg"
        ];
        right_up_file_paths.map(e =>
            {
                var img = new Image();
                img.src = e;
                this.right_up_images.push(img);
            }
        );
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     const img = new Image();
    //     img.src = "../../images/railway.svg";
    //     ctx.drawImage(img, 0, 20);
    //     const left   = 150;
    //     const right  = 310;
    //     const top    =  0;
    //     const bottom = 350;
    //     ctx.drawImage(this.left_down_images[0], left, top, this.width, this.height);
    //     ctx.drawImage(this.left_down_images[0], left, bottom, this.width, this.height);
    //     ctx.drawImage(this.right_down_images[0], right, top, this.width, this.height);
    //     ctx.drawImage(this.right_down_images[0], right, bottom, this.width, this.height);
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
        // console.log('handleEvent:%d', evt);
        // switch(this.state){
        //     case SignalState.opened:
        //         this.onOpened(evt);
        //         break;
        //     case SignalState.warning:
        //         this.onWarning(evt);
        //         break;
        //     case SignalState.closing:
        //         this.onClosing(evt);
        //         break;
        //     case SignalState.closed:
        //         this.onClosed(evt);
        //         break;
        //     case SignalState.opening:
        //         this.onOpening(evt);
        //     default:
        //         break;
        // }

    }
    // private onWarning(evt : EventToSignal){

    //     switch(evt){
    //         case EventToSignal.close:
    //             this.state = SignalState.closing;
    //             console.log('closing state');
    //             // startClose();
    //             break;
    //         case EventToSignal.open:
    //         case EventToSignal.warn:
    //         default:
    //             break;
    //     }
    //     this.state = SignalState.warning;
    // }
    // private onClosing(evt : EventToSignal){
    //     switch(evt){
    //         case EventToSignal.close:
    //         case EventToSignal.open:
    //         case EventToSignal.warn:
    //         default:
    //             break;
    //     }
    //     this.closing_count++;
    //     if(this.closing_count > this.count_per_image_closing){
    //         this.closing_count = 0;
    //         this.image_count++;
    //     }
    //     if(this.image_count > this.left_down_images.length - 1){
    //         this.image_count = 0;
    //         this.state = SignalState.closed;
    //         console.log('closed state');
    //     }
    // }
    // private onClosed(evt : EventToSignal){
    //     switch(evt){
    //         case EventToSignal.open:
    //             this.state = SignalState.opening;
    //             console.log('opening state');
    //             this.stopSound();
    //             break;
    //         case EventToSignal.close:
    //         case EventToSignal.warn:
    //         default:
    //             break;
    //     }
    // }
    // private onOpening(evt : EventToSignal){
    //     switch(evt){
    //         case EventToSignal.close:
    //             this.state = SignalState.closing;
    //             // 遮断バーを上げている途中で下ろすことになるので、下ろす時間を調整する
    //             break;
    //         case EventToSignal.open:
    //         case EventToSignal.warn:
    //         default:
    //             break;
    //     }
    //     this.opening_count++;
    //     if(this.opening_count > this.count_per_image_opening){
    //         this.opening_count = 0;
    //         this.image_count++;
    //     }
    //     if(this.image_count > this.left_up_images.length - 1){
    //         this.image_count = 0;
    //         this.state = SignalState.opened;
    //         console.log('opened state');
    //     }

    // }
    // private onOpened(evt : EventToSignal){
    //     switch(evt){
    //         case EventToSignal.warn:
    //             this.state = SignalState.warning;
    //             console.log('warning state');
    //             this.startSound(); // 警告音を開始する
    //             break;
    //         case EventToSignal.close:
    //         case EventToSignal.open:
    //         default:
    //             break;
    //     }

    // }
    draw(){
        // // const org_width = 1500;
        // // const org_hight = 1000;
        // // const scale = 0.2;
        // // const new_width = org_width * scale;
        // // const new_hight = org_hight * scale;

        // switch(this.state){
        //     case SignalState.opened:
        //         // 表示の更新はなし

        //         break;
        //     case SignalState.warning:
        //         this.warning_count++;
        //         if(this.warning_count > this.warning_time){
        //             this.warning_count = 0;
        //             this.state = SignalState.closing;
        //         }
        //         // 警報が鳴って警告ランプが点滅している。
        //         this.blink();
        //         // 遮断バーは上がったままで表示の更新は無い。
        //         break;
        //     case SignalState.closing:
        //         // 警報が鳴って警告ランプが点滅している。（warning と同じ）
        //         this.blink();
        //         // 遮断バーが下がり続けている
        //         this.close();
        //         break;
        //     case SignalState.closed:
        //         // 警報が鳴り、警告ランプが点滅。遮断バーは降りたままで表示の更新は無い。
        //         this.blink();
        //         break;
        //     case SignalState.opening:
        //         // 警報と警告ランプの点滅は止んでいる。
        //         // 遮断バーが上がり続けている
        //         this.open();
        //         break;
        //     default:
        //         break;
        // }

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
                ctx.drawImage(this.left_bar_images[this.left_bar_images.length - 1 - this.image_count], this.x - 10, this.y, this.width, this.height);
                break;
            case SignalPos.rightTop:
            case SignalPos.rightBottom:
                ctx.drawImage(this.right_bar_images[this.left_bar_images.length - 1 - this.image_count], this.x - 55, this.y, this.width, this.height);
                break;
            default:
                break;
        }
        this.closing_count++;
        if(this.closing_count > this.count_per_image_closing){
            this.closing_count = 0;
            this.image_count++;
        }
        if(this.image_count > this.left_bar_images.length - 1){
            this.image_count = 0;
            this.barState = BarState.closed;
        }
    }
    private drawOpeningBar(){
        switch(this.pos){
            case SignalPos.leftTop:
            case SignalPos.leftBottom:
                ctx.drawImage(this.left_bar_images[this.image_count], this.x - 10, this.y, this.width, this.height);
                break;
            case SignalPos.rightTop:
            case SignalPos.rightBottom:
                ctx.drawImage(this.right_bar_images[this.image_count], this.x - 55, this.y, this.width, this.height);
                break;
            default:
                break;
        }
        this.opening_count++;
        if(this.opening_count > this.count_per_image_opening){
            this.opening_count = 0;
            this.image_count++;
        }
        if(this.image_count > this.left_bar_images.length - 1){
            this.image_count = 0;
            this.barState = BarState.opened;
        }
    }
    private drawOpenedBar(){
        switch(this.pos){
            case SignalPos.leftTop:
            case SignalPos.leftBottom:
                ctx.drawImage(this.left_bar_images[18], this.x - 10, this.y, 300, 200);
                break;
            case SignalPos.rightTop:
            case SignalPos.rightBottom:
                ctx.drawImage(this.right_bar_images[18], this.x - 55, this.y, 300, 200);
                break;
            default:
                console.log('Error! SignalPos');
        }
    }

    private drawClosedBar(){
        switch(this.pos){
            case SignalPos.leftTop:
            case SignalPos.leftBottom:
                ctx.drawImage(this.left_bar_images[0], this.x - 10, this.y, 300, 200);
                break;
            case SignalPos.rightTop:
            case SignalPos.rightBottom:
                ctx.drawImage(this.right_bar_images[0], this.x - 55, this.y, 300, 200);
                break;
            default:
                console.log('Error! SignalPos');
        }
    }
    private noblink(){
        ctx.drawImage(this.off_off, this.x, this.y, this.width, this.height);
    }
    private blink(){// 警告ランプの点滅する
        // 点灯画像と消灯画像を交互に表示する。表示位置は遮断機の位置によって異なる。（４通り）
        // 点滅間隔は this.blink_time で設定し、this.blink_count で制御する。
        if(this.blink_flag){
            ctx.drawImage(this.on_off, this.x, this.y, this.width, this.height);
        }else{
            ctx.drawImage(this.off_on, this.x, this.y, this.width, this.height);
        }

        this.blink_count++;
        if(this.blink_count > this.blink_time){
            this.blink_count = 0;
            this.blink_flag = !this.blink_flag;
        }
    }
    // private stopSound(){ // 警告音を停止する
    public stopSound(){ // 警告音を停止する
        this.sound.pause();
    }
    private stopBlink(){ // 警告ランプの点滅を停止する
        // 消灯画像を表示する
    }
    private close(){ // 遮断バーを下ろす
        switch(this.pos){
            case SignalPos.leftTop:
                ctx.drawImage(this.left_down_images[this.image_count], this.x, this.y, this.width, this.height);
                break;
            case SignalPos.leftBottom:
                ctx.drawImage(this.left_down_images[this.image_count], this.x, this.y, this.width, this.height);
                break;
            case SignalPos.rightTop:
                ctx.drawImage(this.right_down_images[this.image_count], this.x, this.y, this.width, this.height);
                break;
            case SignalPos.rightBottom:
                ctx.drawImage(this.right_down_images[this.image_count], this.x, this.y, this.width, this.height);
                break;
            default:
                break;
        }
        this.closing_count++;
        if(this.closing_count > this.count_per_image_closing){
            this.closing_count = 0;
            this.image_count++;
        }
        if(this.image_count > this.left_down_images.length - 1){
            this.image_count = 0;
            this.state = SignalState.closed;
        }
    }
    private open(){ // 遮断バーを上げる

    }
}

class Train{
    readonly length : number = 40;
    readonly default_inbound_x_pos : number =  - this.length; 
    readonly default_outbound_x_pos : number = canvas.width * 0.9; 
    default_x_pos : number = 0;
    x : number = 0;
    y : number = 0;
    speed : number = 0;
    image : HTMLImageElement
    constructor(bound : TrainBound){
        this.image = new Image();
        switch(bound){
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
    run(){
        this.x += this.speed;
        if(this.x + this.length < 0) {
            train_inbound = false;
            this.x = this.default_x_pos;
        } 
        if(this.x + this.length > canvas.width) {
            train_outbound = false;
            this.x = this.default_x_pos;
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

let blink_flag : boolean = false;
let train_inbound : boolean = false;
let train_outbound : boolean = false;

const inboundTrain = new Train(TrainBound.inbound);
const outboundTrain = new Train(TrainBound.outbound);
const signal_left_top = new Signal(SignalPos.leftTop);
const signal_left_bottom = new Signal(SignalPos.leftBottom);
const signal_right_top = new Signal(SignalPos.rightTop);
const signal_right_bottom = new Signal(SignalPos.rightBottom);

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
    signal_left_bottom.draw();
    signal_right_bottom.draw();
}

function drawInboundSignals(){
    signal_left_top.draw();
    signal_right_top.draw();
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
    signal_left_top.handleEvent(EventToSignal.open);
    signal_left_bottom.handleEvent(EventToSignal.open);
    signal_right_top.handleEvent(EventToSignal.open);
    signal_right_bottom.handleEvent(EventToSignal.open);
}

function barDown(){
    console.log('遮断バーを下げて！');
    signal_left_top.handleEvent(EventToSignal.close);
    signal_left_bottom.handleEvent(EventToSignal.close);
    signal_right_top.handleEvent(EventToSignal.close);
    signal_right_bottom.handleEvent(EventToSignal.close);
}
function startSound(){
    signal_left_bottom.handleEvent(EventToSignal.startSound);
}
function stopSound(){
    signal_left_bottom.handleEvent(EventToSignal.stopSound);
}
function startBlink(){
    signal_left_top.handleEvent(EventToSignal.startBlink);
    signal_left_bottom.handleEvent(EventToSignal.startBlink);
    signal_right_top.handleEvent(EventToSignal.startBlink);
    signal_right_bottom.handleEvent(EventToSignal.startBlink);
}
function stopBlink(){
    signal_left_top.handleEvent(EventToSignal.stopBlink);
    signal_left_bottom.handleEvent(EventToSignal.stopBlink);
    signal_right_top.handleEvent(EventToSignal.stopBlink);
    signal_right_bottom.handleEvent(EventToSignal.stopBlink);
}