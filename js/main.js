/*

メッセージの表示
メッセージクラスの作成
インスタンス化
オブジェクトヒット時にメッセージを表示
ゲームを止める
Aボタンでゲームスタート

*/
const canvas = document.getElementById("screen");
const context = canvas.getContext("2d");

// 方向の定数
const DIR_LEFT = 0;
const DIR_RIGHT = 1;
const DIR_UP = 2;
const DIR_DOWN = 3;




//レイヤークラスのようなものを作ってもいいね
class Map {

    constructor(){
        this.cols = 20;
        this.rows = 15;
        this.tileSize = 32;
        this.tileLayers = [];
        this.objectLayers = [];
        // コライダー用のレイヤーを用意する
        this.colLayer = [];
        // clearようフラグ
        this.goal = false;
    }
    init(info){

        // ifの順序をミスるといけない。name=colもtilelayerなので順番を注意
        if (info.name === "col") {
            this.colLayer = info;
            console.log(this.colLayer)
        } else if (info.type === "objectgroup") {
            this.objectLayers.push(info);
        } else if (info.type === "tilelayer"){
            this.tileLayers.push(info);
        }

    }
    getTile(layer,index){
        // (1,1)の場合は
        // 32 * 32 の位置を返却すればいい
        return this.tileLayers[layer].data[index];

    }
    debug(){
        // console.log(this.tileLayers);
        // console.log(this.objectLayers);
    }
    hitTile(index){
        return this.colLayer.data[index];
    }
    hitObject(vecotr){

        // 当たり判定
        // objの x y がvecotrに入っていた場合。
        this.objectLayers[0].objects.forEach( obj => {
            if( Vector.ColliderEnter(vecotr, new Vector(obj.x,obj.y) )){
                console.log(obj)
                if(obj.properties.message != null){
                    message.drawMessage(obj.properties.message);
                }
                if(obj.properties.goal != null){
                    this.goal = obj.properties.goal;
                }

            }
        });


    }
}

// 追加
class Vector{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    static ColliderEnter(vectorA,vectorB){
        // プレイヤーの向いている方向にオブジェクトが存在している場合はtrueを返却する
        if (vectorA.x < vectorB.x && vectorA.x + map.tileSize > vectorB.x
                && vectorA.y < vectorB.y && vectorA.y + map.tileSize > vectorB.y){
                    return true;
                } else {
                    return false;
                }

    }

}

class Message{
    constructor(){
        this.message = "";
        this.isVisivle = false;
    }
    drawMessage(text){
        this.isVisivle = true;

        context.fillStyle = "rgba(0,0,0,0.8)";
        context.fillRect(0,280,canvas.width,100);
        context.fillStyle = "#fff";
        context.font = "18px serif";
        context.fillText(text,10,320);

    }
}


class Player{
    constructor(frameSpeed){
        this.posx = 0;
        this.posy = 0;
        this.size = 32;
        // 追加
        this.frameSpeed = frameSpeed;
        this.indexFrameX = 0;
        this.indexFrameY = 0;
        this.lastUpdate = 0;
        this.isMoving = false;
        this.moveSpeedX = 0;
        this.moveSpeedY = 0;
        this.nextPosx = 0;
        this.nextPosy = 0;
        //移動距離
        this.moveDistance = 0;
        this.dir = DIR_DOWN;
    }
    init(x,y){
        this.posx = x;
        this.posy = y;
    }
    update(){

        if(Date.now() - this.lastUpdate >= this.frameSpeed){

            this.indexFrameX ++;
            if(this.indexFrameX >= 3){
                this.indexFrameX = 0;
            }
            this.lastUpdate = Date.now();
        }
    }
    setDir(dir){
        this.dir = dir;
    }
    setNextPosition(dir){

        //これ何故か追加（前から追加しておけって意味）
        this.dir = dir;

        this.moveSpeedX = 0;
        this.moveSpeedY = 0;

        if (dir === DIR_LEFT) {
            this.nextPosx = this.posx - 1;
            this.moveSpeedX = -0.1;

        } else if (dir === DIR_RIGHT) {
            this.nextPosx = this.posx + 1;
            this.moveSpeedX = 0.1;

        } else if (dir === DIR_UP) {
            this.nextPosy = this.posy - 1;
            this.moveSpeedY = -0.1;

        } else {
            this.nextPosy = this.posy + 1;
            this.moveSpeedY = 0.1;

        }

    }
    draw(image){

        // 移動中の時はmoveSpeedをセットする
        if(!this.isMoving){
            this.moveSpeedX = 0;
            this.moveSpeedY = 0;
        }

        this.moveDistance += this.moveSpeedX;
        this.moveDistance += this.moveSpeedY;

        // 移動距離を測る
        // floorは切り捨て　absは絶対値　-1 = 1 / 1 = 1
        if(Math.floor(Math.abs(this.moveDistance)) >= 1){
            this.isMoving = false;
            this.moveDistance = 0;
            this.moveSpeedX = 0;
            this.moveSpeedY = 0;
            //小数点を切り捨てる
            this.posx = this.nextPosx;
            this.posy = this.nextPosy;
        }

        context.drawImage(
            image,
            this.indexFrameX * this.size, this.indexFrameY * this.size, //画像の始点
            this.size, this.size,
            ( (this.posx += this.moveSpeedX) - (camera.x / 32) ) * 32, ( (this.posy += this.moveSpeedY) - (camera.y /32) ) * 32 ,//canvasへの描画始点
            this.size,this.size //canvasへの描画
        );

    }

}


class Camera{

    constructor(map,player,width,height){
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.maxX = map.cols * map.tileSize - width;
        this.maxY = map.rows * map.tileSize - height;
        this.player = player;
    }
    update(){


            // プレイヤーを中心とするカメラの位置にする
            this.x = (this.player.posx) * 32 - this.width / 2;
            this.y = this.player.posy * 32  - this.height / 2;
            // 補正
            this.x = Math.max(0, Math.min(this.x, this.maxX));
            this.y = Math.max(0, Math.min(this.y, this.maxY));



    }


}

function loadImage(url){
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener("load", () => {
            resolve(image);
        });
        image.src = url;
    });
}


//ついでにドローする必要があるけど、それはこんな感じです。
function drawTile(image){

    //これ邪魔だからいつか消してね
    context.fillRect(0,0,canvas.width,canvas.height)


    // カメラ起点で描画箇所を決定する
    let startCol = Math.floor(camera.x / map.tileSize);
    let endCol = startCol + (camera.width / map.tileSize);
    let startRow = Math.floor(camera.y / map.tileSize);
    let endRow = startRow + (camera.height / map.tileSize);
    let offsetX = -camera.x + startCol * map.tileSize;
    let offsetY = -camera.y + startRow * map.tileSize;


    // レイヤー化の為に、reduceを使用して再現する
    for (let index = 0; index < map.tileLayers.length; index++) {


        for(let c = startCol; c <= endCol; c ++){
            for(let r = startRow; r <= endRow; r++){

                let tile = map.getTile(index,r * map.cols + c);
                var x = (c - startCol) * map.tileSize + offsetX;
                var y = (r - startRow) * map.tileSize + offsetY;

                let sx = Math.ceil( ( tile - 1 ) % 8 ) * 32; // Math.ceil( (11 - 1 ) % 5 )  これは画像のタイル数 マップのcolsじゃないよグッチ！
                // 8で割り算するとtile 8の時に1 * 32 で 32になるので　8.00001にすると。。（無限のマップだとそのうちだめになるけどね）タイル番号が170の時を考えてごらん
                //170 / 8.1 = 20.3293304 = 20になり、21をえるばずが失敗する
                let sy = (Math.floor( ( tile / 8.00000000001 ) ) * 32); // Math.ceil( (16) / 5 ) - 1

                if(tile !== 0){
                    context.drawImage(
                        image,
                        sx,sy, //画像の始点
                        map.tileSize,map.tileSize, //画像のサイズ
                        x, y,//canvasへの描画始点
                        map.tileSize,map.tileSize //canvasへの描画
                    );
                }

            }
        }


    }// end index


} //end function



function drawPlayer(image){

    /*
    player.indexFrameX ++;
    if(player.indexFrameX >= 4){
        player.indexFrameX = 0;
    }
    */


    // posx posy に微量を移動する


    context.drawImage(
        image,
        player.indexFrameX * player.size, player.indexFrameY * player.size, //画像の始点
        player.size, player.size,
        (player.posx - (camera.x / 32) ) * 32, (player.posy - (camera.y /32) ) * 32 ,//canvasへの描画始点
        player.size,player.size //canvasへの描画
    );


}

const map = new Map();
// 8で変更
const player = new Player(180);
//カメラのサイズを
const camera = new Camera(map,player,canvas.width,canvas.height);

const message = new Message();




function createBuffer(image){

    const bufferMap = document.createElement('canvas');
    //画像の大きさ
    bufferMap.width = 256;
    bufferMap.height = 1856;

    const bufferContext = bufferMap.getContext("2d");
    bufferContext.drawImage(image,0,0);

    return bufferMap;

}

function loadMainEngine(json,image,playerimage){
    return Promise.all([
        // jsonの読み込み
        loadMan(json),
        // 画像の読み込み
        loadImage(image),
        // プレイヤー画像
        loadImage(playerimage)
    ])
    // 全ての非同期処理が終わったらその結果を配列に入れる。
    .then(([stage,image,playerimage]) => {

        //console.log(stage)
        stage.layers.forEach(s => {
            map.init(s);
        })

        // 移動時のチラツキがなくなる
        context.imageSmoothingEnabled = false;

        //bufferを受け取ってupdateに渡す
        const buffer = createBuffer(image);

        update(buffer,playerimage);

    });
}


function update(image,playerimage){

    if(map.goal && !message.isVisivle){
        // 直接書いちゃいます
        alert("ゲームクリア");
    }

    // メッセージが表示されていない場合は、タイルなど塗り
    if(!message.isVisivle){

        //マップをびゃっと描いているので、不要と言えば不要です
        context.clearRect(0,0,context.width,context.height);

        // レイヤーの描画
        drawTile(image);

        // プレイヤーの更新よりも先に行う
        camera.update();

        // アップデート
        player.update();
        // プレイヤーの描画
        // drawPlayer(playerimage);
        player.draw(playerimage);

    }

    window.requestAnimationFrame(update.bind(null,image,playerimage));

}



document.addEventListener("keydown", e => {


    // 移動中は処理しない
    if(player.isMoving){
        return;
    }


    /*
     *   Aボタン
     *   やり方としては、プレイヤーのポジションをマップポジションに変換する
     *   で、DIR方向のマップポジションとの当たり判定を行い実施すればよいね。
     *   player.posx * map.tileSize = mapPos
     *
     */

    if(e.key === "a"){

        if(message.isVisivle){
            message.isVisivle = false;
            return;
        }

        let dirx = 0;
        let diry = 0;

        // プレイヤーの向き先をマップサイズに変換する
        switch (player.dir) {
            case DIR_LEFT :
                dirx = -1;
                break;
            case DIR_RIGHT :
                dirx = 1;
                break;
            case DIR_UP :
                diry = -1;
                break;
            case DIR_DOWN :
                diry = 1;
                break;
            default :
                break;
        }

        const playerVector =
            new Vector( (player.posx + dirx) * map.tileSize, (player.posy + diry) * map.tileSize);

        map.hitObject(playerVector);


     }


    if(message.isVisivle){
        return;
    }


    if(e.key === "ArrowRight"){
        player.setDir(DIR_RIGHT);
        let index = player.posy * map.cols + (player.posx + 1);
        if(map.hitTile(index) === 0){
            //プレイヤーを移動中にする
            player.setNextPosition(DIR_RIGHT);
            player.isMoving = true;
        }
    }
    if(e.key === "ArrowLeft"){
        player.setDir(DIR_LEFT);
        let index = player.posy * map.cols + (player.posx - 1);
        if(map.hitTile(index) === 0){
            player.setNextPosition(DIR_LEFT);
            player.isMoving = true;
        }
    }
    if(e.key === "ArrowUp"){
        player.setDir(DIR_UP);
        let index = (player.posy - 1) * map.cols + player.posx;
        if(map.hitTile(index) === 0){
            player.setNextPosition(DIR_UP);
            player.isMoving = true;
        }
    }
    if(e.key === "ArrowDown"){
        player.setDir(DIR_DOWN);
        let index = (player.posy + 1) * map.cols + player.posx;
        if(map.hitTile(index) === 0){
            player.setNextPosition(DIR_DOWN);
            player.isMoving = true;
        }
    }




});



loadMainEngine("rpggame01/tilerelad/kenshi","/rpggame01/tilerelad/offi.png","/rpggame01/tilerelad/player.png");

map.debug();

function loadMan(name){
    // まずは非同期処理でリクエストを発行
    // 今回は同一サーバーなのでlocalhost/hoge.json
    // を取得するような流れになりますな。
    return fetch (`/${name}.json`)
        .then( res => res.json() )
        //.then( result => console.log(result));
}
