window.onload = init;

let ctx;
let canvas;
let player;
let players;
let board;

class Board {
    constructor() {
        this.size = 10;
        this.tiles = [];
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
    drawItems() {
        this.tiles.forEach(function(e) {
            e.draw();
        });
    }
}

class Player {
    constructor(x, y, p, h, r) {
        this.x = x;
        this.y = y;
        board.tiles.push(this);
        this.points = p;
        this.health = h;
        this.range = r;
        this.color = '#ff8080';
    }
    draw() {
        ctx.fillStyle = this.color;
        let margin = step/10;
        // ctx.strokeStyle = '#000000';
        // ctx.lineWidth = margin/2;
        let x = this.x*step + margin;
        let y = this.y*step + margin;
        ctx.fillRect(x, y, margin*8, margin*8);
        // ctx.stroke();
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
    board = new Board();
    player = createRandomPlayer();
    player.color = '#007fff'
    console.log(board.tiles);
    // get board state from server
    
    window.requestAnimationFrame(gameloop);
}

window.addEventListener('keydown', (e) => {
    if (e.code == 'KeyW') {
        player.y -= 1;
    } else if (e.code == 'KeyA') {
        player.x -= 1;
    } else if (e.code == 'KeyS') {
        player.y += 1;
    } else if (e.code == 'KeyD') {
        player.x += 1;
    }
});

function createRandomPlayer() {
    return new Player(Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), 0, 3, 1)
}

function gameloop() {
    step = canvas.width/board.size;
    let size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size;
    canvas.height = size;
    // get other player moves (if any)

    // update board and draw
    board.drawBoard();
    board.drawItems();

    // request player input (if any)

    // send server player move

    window.requestAnimationFrame(gameloop);
}