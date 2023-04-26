window.onload = init;

let ctx;
let canvas;
let player;
let board;
let secret;
let id;
let mode = 's';
let selection = null;

class Board {
    constructor(sizex, sizey) {
        this.sizex = sizex;
        this.sizey = sizey;
        this.highlights = {};
        this.players = {};
    }
    drawBoard() {
        ctx.beginPath();
        ctx.fillStyle = '#d0d0d0';
        ctx.strokeStyle = '#c0c0c0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.closePath();
        ctx.beginPath();
        for (let [x, y, w, h, c] of Object.values(this.highlights)) {
            ctx.fillStyle = c;
            ctx.fillRect(x*step, y*step, w*step, h*step);
        }
        ctx.lineWidth = step/20;
        for (let i = 0; i <= this.sizex; i++) {
            ctx.moveTo(i*step,0);
            ctx.lineTo(i*step,canvas.height);
        }
        for (let j = 0; j <= this.sizey; j++) {
            ctx.moveTo(0,j*step);
            ctx.lineTo(canvas.width,j*step);
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
    constructor(id, player) {
        this.id = id;
        this.x = player['x'];
        this.y = player['y'];
        this.points = player['points'];
        this.health = player['health'];
        this.range = player['range'];
        this.color = ['#ff8080', '#ff0000'];
    }
    draw() {
        ctx.beginPath();
        let color = this.color;
        if (this.health == 0) {
            color = ['#c0c0c0', '#d0d0d0'];
        }
        ctx.fillStyle = color[0];
        if (isInRange(this.x, this.y, player.range, true)) {
            ctx.fillStyle = color[1];
        }
        let margin = step/10;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = margin/2;
        let x = this.x*step + margin;
        let y = this.y*step + margin;
        ctx.rect(x, y, margin*8, margin*8);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.font = 'bold '+(step/2).toString()+'px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.fillText(this.health.toString(), x-margin+step/2, y-margin+step/2);
        ctx.closePath();
    }
    update(p) {
        if (Object.keys(p).includes('customColor')) {
            this.color = p['customColor'];
        }
        if (this.id != id) {
            this.x = p['x'];
            this.y = p['y'];
        }
        this.points = p['points'];
        this.health = p['health'];
        this.range = p['range'];
    }
}

function playerAt(x, y) {
    for (let pi of Object.keys(board.players)) {
        let p = board.players[pi]
        if (p.x == x && p.y == y) {
            return pi;
        }
    }
    return null;
}

function doAction() {
    if (player.health == 0 || player.points == 0) {
        return;
    }
    if (mode == 'u') {
        if (player.points < 3) {
            return;
        }
        player.range += 1;
        player.points -= 3;
        action('upgrade', {});
        return;
    }
    if (selection == null) {
        return;
    }
    let p = playerAt(selection[0], selection[1]);
    if (mode == 'm') {
        if (p != null) {
            return;
        }
        player.x = selection[0];
        player.y = selection[1];
        player.points -= 1;
        action('move', {'x':selection[0],'y':selection[1]});
        return;
    }
    if (p == null) {
        return;
    }
    if (mode == 's') {
        if (board.players[p].health == 0) {
            return;
        }
        board.players[p].health -= 1;
        if (board.players[p].health == 0) {
            player.points += board.players[p].points
            board.players[p].points = 0;
        }
        action('shoot', {'id':p});
    } else if (mode == 'h') {
        if (board.players[p].health > 8) {
            return;
        }
        board.players[p].health += 1;
        action('heal', {'id':p});
    } else if (mode == 'g') {
        board.players[p].points += 1;
        action('give', {'id':p});
    }
    player.points -= 1;
}

function drawPoints() {
    ctx.font = 'bold '+(step/2).toString()+'px serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.fillText(player.points.toString()+' AP', step/5, step/5);
    ctx.closePath();
}

function getBoardXY(x, y) {
    return [Math.floor(x/step), Math.floor(y/step)];
}

function drawHighlights() {
    if (player.health == 0 || player.points == 0) {
        delete board.highlights['selection'];
        delete board.highlights['range'];
        return;
    }
    if (selection != null) {
        board.highlights['selection'] = [selection[0], selection[1], 1, 1, '#d0f0d0']
    } else {
        delete board.highlights['selection'];
    }
    if (player.points == 0) {
        delete board.highlights['range'];
        return;
    }
    if (mode == 'm') {
        board.highlights['range'] = [player.x-1, player.y-1, 3, 3, '#d8d8d8'];
    } else {
        board.highlights['range'] = [player.x-player.range, player.y-player.range, player.range*2+1, player.range*2+1, '#d8d8d8'];
    }
}

function isInRange(x, y, r, f) {
    if (f && 'mu'.includes(mode)) {
        return false;
    }
    let tx = player.x;
    let ty = player.y;
    if (tx-r > x || tx+r < x || ty-r > y || ty+r < y) {
        return false;
    }
    return true;
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
        if (player.health == 0 || player.points == 0) {
            return;
        }
        if (mode == 'u') {
            return;
        }
        let r = player.range;
        if (mode == 'm') {
            r = 1;
        }
        let sel = getBoardXY(e.pageX, e.pageY)
        if (isInRange(sel[0], sel[1], r, false)) {
            selection = getBoardXY(e.pageX, e.pageY);
        }
    });
    window.addEventListener('keydown', (e) => {
        if ('shumg'.includes(e.key)) {
            mode = e.key;
            selection = null;
        }
        if (e.key == 'Enter') {
            doAction();
        }
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
    let [sizex, sizey, players] = get_board_data(id);
    board = new Board(sizex, sizey);
    for (let [id, player] of Object.entries(players)) {
        board.players[id] = new Player(id, player);
    }
    player = new Player(id, player);
    board.players[id] = player;
    player.color = ['#80ffff', '#00ffff'];
    
    window.requestAnimationFrame(gameloop);
}

function gameloop() {
    drawHighlights();
    stepx = window.innerWidth/board.sizex;
    stepy = window.innerHeight/board.sizey;
    step = Math.min(stepx, stepy);
    canvas.width = board.sizex*step;
    canvas.height = board.sizey*step;

    // get other player moves (if any)
    get_updates();

    // update board and draw
    board.drawBoard();
    board.drawPlayers();
    drawPoints();

    window.requestAnimationFrame(gameloop);
}