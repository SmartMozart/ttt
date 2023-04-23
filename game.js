window.onload = init;

let ctx;
let canvas;
let player;
let board;
let secret;
let id;
let mode = 'm';

class Board {
    constructor(size) {
        this.size = size;
        this.players = {};
    }
    drawBoard() {
        ctx.beginPath();
        ctx.fillStyle = '#d0d0d0';
        ctx.strokeStyle = '#c0c0c0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = step/(this.size*2);
        for (let i = 0; i <= this.size; i++) {
            ctx.moveTo(0,i*step);
            ctx.lineTo(canvas.width,i*step);
            ctx.moveTo(i*step,0);
            ctx.lineTo(i*step,canvas.width);
        }
        ctx.stroke();
        ctx.closePath();
    }
    drawPlayers() {
        for (let [id, player] of Object.entries(this.players)) {
            player.draw();
        }
    }
}

class Player {
    constructor(player) {
        this.x = player['x'];
        this.y = player['y'];
        this.points = player['points'];
        this.health = player['health'];
        this.range = player['range'];
        this.color = '#ff8080';
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        let margin = step/10;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = margin/2;
        let x = this.x*step + margin;
        let y = this.y*step + margin;
        ctx.rect(x, y, margin*8, margin*8);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
    update(player) {
        this.x = player['x'];
        this.y = player['y'];
        this.points = player['points'];
        this.health = player['health'];
        this.range = player['range'];
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
    canvas.addEventListener('click', (e) => {
        console.log(e.pageX, e.pageY);
    });
    // get board state from server
    secret = localStorage.getItem('secret');
    id = localStorage.getItem('id');
    if (secret == null) {
        [id, secret, player] = join();
        localStorage.setItem('secret', secret);
        localStorage.setItem('id', id);
    } else {
        player = get_player(id);
    }
    let [size, players] = get_board_data(id);
    board = new Board(size);
    for (let [id, player] of Object.entries(players)) {
        board.players[id] = new Player(player)
    }
    player = new Player(player);
    board.players[id] = player;
    player.color = '#7fffff';
    
    window.requestAnimationFrame(gameloop);
}

function gameloop() {
    step = canvas.width/board.size;
    let size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size;
    canvas.height = size;

    // get other player moves (if any)
    get_updates();

    // update board and draw
    board.drawBoard();
    board.drawPlayers();

    window.requestAnimationFrame(gameloop);
}