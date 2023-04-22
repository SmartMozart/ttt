window.onload = init;

let ctx;
let canvas;
let player;
let players;
let board;
let step;


class Board {
    constructor() {
        this.size = 10;
        this.tiles = Array(this.size).fill(0).map(() => Array(this.size).fill(0));
    }
    drawBoard() {
        ctx.beginPath();
        ctx.fillStyle = '#d0d0d0';
        ctx.strokeStyle = '#c0c0c0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = step/20;
        for (let i = 0; i <= this.size; i++) {
            ctx.moveTo(0,i*step);
            ctx.lineTo(canvas.width,i*step);
            ctx.moveTo(i*step,0);
            ctx.lineTo(i*step,canvas.width);
        }
        ctx.stroke();
        ctx.closePath();
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.points = 0;
        this.health = 3;
        this.range = 1;
        this.color = '#ff8080'
    }
    draw() {
        ctx.fillStyle = this.color;
        let margin = step/10
        let x = player.x*step + margin;
        let y = player.y*step + margin;
        ctx.fillRect(x, y, margin*8, margin*8);
    }
}

function init() {
    canvas = document.getElementById('gameWindow');
    if (!canvas.getContext) {
        err = document.createElement('h1');
        err.innerText = 'Browser out of date.';
        document.body.appendChild(err);
        return;
    }
    ctx = canvas.getContext('2d');
    player = new Player(3, 2);
    board = new Board();
    step = canvas.width/board.size;
    window.requestAnimationFrame(gameloop);
}

function gameloop() {
    // talk to server and get board state

    // update board and draw
    board.drawBoard();
    player.draw();

    // request player input (if any)

    // send server player move

    window.requestAnimationFrame(gameloop);
}
