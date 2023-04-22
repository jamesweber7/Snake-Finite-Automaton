
const START_SIZE = 1;
const START_POINTS = 0;
const POINTS_PER_APPLE = 5;

// [0,1007]
const NUM_POINTS_STATES = w * h - START_POINTS - START_SIZE + 1;
// UP, DOWN, LEFT, RIGHT
const NUM_DIRECTION_STATES = 4;
// ⌊(5 possible incoming points - 1 used incoming point) x ((w x h - 1 start size (head)) / 5 points per apple)⌋ + 1
const NUM_INCOMING_TAIL_STATES = Math.floor((POINTS_PER_APPLE - 1) * (w * h - START_SIZE) / POINTS_PER_APPLE) + 1;
// true, false
const NUM_SECOND_CHANCE_STATES = 2;
// [0, w-1][0, h-1]
const NUM_APPLE_POSITION_STATES = w * h;
// [0, w-1][0, h-1]
const NUM_SNAKE_HEAD_POSITION_STATES = w * h;
// \Sigma_{i=0}^1007{4^{i}} = (4^1008 - 1) / 3
const NUM_SNAKE_BODY_STATES = 4n**BigInt(w * h - 1 + 1) / 3n;

// accept state, state matrix
const NUM_STATES = BigInt(NUM_POINTS_STATES) * BigInt(NUM_DIRECTION_STATES) * BigInt(NUM_INCOMING_TAIL_STATES) * BigInt(NUM_SECOND_CHANCE_STATES) * BigInt(NUM_APPLE_POSITION_STATES) * BigInt(NUM_SNAKE_HEAD_POSITION_STATES) * NUM_SNAKE_BODY_STATES + 1n /* accept */ + 1n /* reject */;

const ACCEPT_STATE = NUM_STATES - 1n /* accept */ - 1n /* reject */;
const REJECT_STATE = NUM_STATES - 1n /* reject */;
var START_STATE;

let unit;
let limitingSize;
let pixelSize;
const GAME_ASPECT_RATIO = w / h;

let game_width, game_height;
let game_left, game_right;
let game_top, game_bottom;

var fa;
var user_input = NUL;


update_game_size();
initialize_fa();


function initialize_fa() {

    // points, movement direction, incoming tail, second chance, apple position, snake head position, and snake body
    fa = {
        q: {
            state: 0,
            points: START_POINTS,
            direction: ARROW_RIGHT,
            incoming_tail: 0,
            second_chance: false,
            apple_position: createPoint(3,0),   // good for hash start position
            snake_head_position: createPoint(1, 1),
            snake_body: []
        },
        last_q: {
            state: ACCEPT_STATE,
            points: START_POINTS,
            direction: ARROW_RIGHT,
            incoming_tail: 0,
            second_chance: false,
            apple_position: createPoint(3,0),
            snake_head_position: createPoint(1, 1),
            snake_body: []
        },
        input: "",
        input_string: "",
        accept: false
    };

    // state for generating first apple position
    fa.q.state = enumerateState(fa.q);
    
    // apple position
    newApple();

    fa.q.state = enumerateState(fa.q);
    START_STATE = fa.q.state;
}

function update_fa() {

    // previous state
    update_last_fa();

    // input
    fa.input = user_input;
    fa.input_string += user_input;

    // direction
    updateDirection();
    user_input = NUL;

    // move head
    moveHead();

    if (isKilled())
        return;

    if (pointEquals(fa.q.snake_head_position, fa.q.apple_position)) {
        fa.q.points += POINTS_PER_APPLE;
        fa.q.points = min(fa.q.points, NUM_POINTS_STATES*5 - 1);
        fa.q.incoming_tail += POINTS_PER_APPLE;
        fa.q.incoming_tail = min(fa.q.incoming_tail, NUM_INCOMING_TAIL_STATES - 1);
    }

    // tail
    if (!fa.q.second_chance && fa.q.points) {
        // back of tail
        if (!fa.q.incoming_tail) {    // no incoming tail
            fa.q.snake_body.splice(fa.q.snake_body.length - 1, 1); // remove tail
        } else {
            fa.q.incoming_tail --;  // decrement incoming tail
        }
        // front of tail
        fa.q.snake_body.unshift(enumerateDirection(fa.q.direction));
    }
    if (fa.q.snake_body.length == w * h - 1) {
        gameOver();
        return;
    }

    if (pointEquals(fa.q.snake_head_position, fa.q.apple_position)) {
        newApple();
    }

    // update state number
    fa.q.state = enumerateState(fa.q);
}

function moveHead() {
    let nextPos = copyPoint(fa.q.snake_head_position);
    switch (fa.q.direction) {
        case ARROW_LEFT:
            nextPos.x --;
            break;
        case ARROW_RIGHT:
            nextPos.x ++;
            break;
        case ARROW_UP:
            nextPos.y --;
            break;
        case ARROW_DOWN:
            nextPos.y ++;
            break;
    }
    // if (collision(nextPos)) {
    if (collision(fa.q.snake_head_position)) {
        if (fa.q.second_chance) {
            gameOver();
            return;
        }
        fa.q.second_chance = true;
    } else {
        fa.q.second_chance = false;
        fa.q.snake_head_position = nextPos;
    }
}

function collision(head) {
    let next_head = shiftPoint(head, fa.q.direction);
    if (next_head.x < 0)
        return true;
    if (next_head.x > w - 1)
        return true;
    if (next_head.y < 0)
        return true;
    if (next_head.y > h - 1)
        return true;
    
    let p = copyPoint(head);
    for (let i = 0; i < fa.q.snake_body.length; i++) {
        p = unshiftPoint(p, fa.q.snake_body[i]);
        if (pointEquals(p, next_head))
            return true;
    }
    return false;
}

function isReadyToPlay() {
    return !isPlaying() && !isKilled();
}

function isBrowsingOptions() {
    return !isKilled() && !isPlaying() && !isStepping() && !isReadyToPlayThrough();
}

function isStepping() {
    return stepping;
}

function isReadyToPlayThrough() {
    return !isStepping() && playThrough;
}

function preparePlayThrough() {
    playThrough = true;
}

function prepareStepping() {
    stepping = true;
}

function startGame() {
    if (isKilled())
        initialize_fa();
    active = true;
    killed = false;
    draw();
}

function gameOver() {
    active = false;
    killed = true;
    fa.q.state = ACCEPT_STATE;

    stepping = false;
    playThrough = false;
}

function restartGame() {
    initialize_fa();
    active = false;
    killed = false;
    stepping = false;
    playThrough = false;
}

function isPlaying() {
    return active;
}

function isKilled() {
    return killed;
}

function draw_game() {

    draw_game_background();
    
    if (isKilled())
        draw_restart();

    if (isBrowsingOptions())
        draw_options();
    
    if (isStepping())
        draw_keys();

    if (isReadyToPlayThrough())
        draw_start_message();
    draw_points();

    fill(0);
    noStroke();

    let p = copyPoint(fa.q.snake_head_position);
    draw_pixel(p);
    for (let i = 0; i < fa.q.snake_body.length; i++) {
        p = unshiftPoint(p, fa.q.snake_body[i]);
        draw_pixel(p);
    }
    
    draw_apple(fa.q.apple_position);

}

function draw_game_background() {
    fill(0);
    noStroke();
    for (let x = -1; x < w + 1; x ++) {
        draw_pixel(createPoint(x, -1));
        draw_pixel(createPoint(x, h));
    }
    for (let y = -1; y < h + 1; y ++) {
        draw_pixel(createPoint(-1, y));
        draw_pixel(createPoint(w, y));
    }

}

function draw_restart() {
    button(game_left - unit * 0.5, game_bottom + unit * 1.25, game_right - unit * 0.5, game_window_bottom - unit * 0.75, 
        {
            text:"restart", 
            textSize:unit * 2, 
            onclick:restartGame
        }, CORNERS);
}

function draw_options() {
    // play | step
    button(game_left + (game_width - unit * 4) / 4, game_bottom + (game_window_bottom - game_bottom) / 2, game_width / 2 - unit, (game_window_bottom - game_bottom) - unit * 2, 
        {
            text:"play in real time", 
            textSize:unit * 2, 
            onclick:preparePlayThrough
        });
    button(game_right - (game_width + unit * 4) / 4 + unit, game_bottom + (game_window_bottom - game_bottom) / 2, game_width / 2 - unit, (game_window_bottom - game_bottom) - unit * 2, 
        {
            text:"play step by step", 
            textSize:unit * 2,
            onclick:prepareStepping
        });
}

function draw_keys() {
    const keys = [ ARROW_LEFT, ARROW_UP, ARROW_DOWN, ARROW_RIGHT, NUL ];
    // arrows, NUL
    const size = Math.min((game_width - unit * 2) / keys.length - unit, game_window_bottom - game_bottom - unit * 2);
    const width = (size + unit) * keys.length;
    const left = median(game_left, game_right) - width / 2 - unit * 0.5;
    for (let i = 0; i < keys.length; i++) {
        button(left + (size + unit) * i + (size + unit) * 0.5, median(game_bottom + unit * 0.4, game_window_bottom), size, size, 
        {
            text:keys[i], 
            textSize:unit * 2, 
            onclick:() => {setDirection(keys[i]); gameTick();},
        });
    }
}

function draw_start_message() {
    // press arrow key to begin
    push();
    textAlign(CENTER, CENTER);
    textSize(unit * 2);
    fill(0);
    noStroke();
    text("Press a key ← ↑ → ↓ to begin", median(game_left, game_right) - unit * 0.5, median(game_bottom, game_window_bottom));
    pop();
}

function draw_points() {
    push();
    textAlign(LEFT, BOTTOM);
    textSize(unit * 2);
    text(`Score: ${fa.q.points}`, game_left - unit, game_top - unit * 1.5);
    pop();
}

function keyToDirection(key) {
    let left = 'ArrowLeft';
    let up = 'ArrowUp';
    let right = 'ArrowRight';
    let down = 'ArrowDown';
    let space = ' ';
    switch (key) {
        case left:
            return ARROW_LEFT;
        case up:
            return ARROW_UP;
        case right:
            return ARROW_RIGHT;
        case down:
            return ARROW_DOWN;
        case space:
            return NUL;
    }
}

function setDirection(direction) {
    user_input = direction;
}

function updateDirection() {
    switch (user_input) {
        case NUL:
            return;
        case ARROW_LEFT:
            if (fa.q.direction != ARROW_RIGHT)
                fa.q.direction = ARROW_LEFT;
            break;
        case ARROW_UP:
            if (fa.q.direction != ARROW_DOWN)
                fa.q.direction = ARROW_UP;
            break;
        case ARROW_RIGHT:
            if (fa.q.direction != ARROW_LEFT)
                fa.q.direction = ARROW_RIGHT;
            break;
        case ARROW_DOWN:
            if (fa.q.direction != ARROW_UP)
                fa.q.direction = ARROW_DOWN;
            break;
    }
}

function update_game_size() {
    let game_window_width = game_window_right - game_window_left;

    let horizontal_buffer = 0.9;
    
    let theoretical_width = game_window_width * horizontal_buffer;

    unit = Math.floor(theoretical_width / w);

    game_width = unit * w;
    game_left = game_window_left + game_window_width / 2 - game_width / 2;
    game_right = game_left + game_width;


    game_height = unit * h;
    game_top = game_window_top + unit * 5;
    game_bottom = game_top + game_height;

    pixelSize = Math.floor(unit * 0.95);
}

function update_last_fa() {
    fa.last_q = {
        points: fa.q.points,
        direction: fa.q.direction,
        incoming_tail: fa.q.incoming_tail,
        second_chance: fa.q.second_chance,
        apple_position: copyPoint(fa.q.apple_position),
        snake_head_position: copyPoint(fa.q.snake_head_position),
        snake_body: Array(fa.q.snake_body.length)
    };
    
    for (let i = 0; i < fa.last_q.snake_body.length; i++)
        fa.last_q.snake_body[i] = fa.q.snake_body[i];
}

function newApple() {
    let snake_body_length = fa.q.points - fa.q.incoming_tail;
    let open_spaces = w * h - snake_body_length - 1;

    let apple_index = hash(open_spaces, fa.q.state);

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (y*w + x <= apple_index) {
                let p1 = createPoint(x, y);
                let p2 = copyPoint(fa.q.snake_head_position);
                if (pointEquals(p1, p2)) {
                    apple_index ++;
                }
                for (let i = 0; i < snake_body_length; i++) {
                    p2 = unshiftPoint(p2, fa.q.snake_body[i]);
                    if (pointEquals(p1, p2)) {
                        apple_index ++;
                    }
                }
            }
        }
    }
    fa.q.apple_position.x = apple_index % w;
    fa.q.apple_position.y = Math.floor(apple_index / w);

}

function hash(max, n) {
    if (max <= 1)
        return 0;
    let h = 0;
    while (n) {
        h += Number(n % BigInt(max)) * 37;
        h %= max;
        n /= BigInt(max);
    }
    return h
}

function enumerateBodyRepresentation(snake_body) {
    let n = 0n;
    for (let i = 0; i < snake_body.length; i++)
        n += BigInt(snake_body[i]) * (4n ** BigInt(i));
    return n;
}

function enumerateSnakeBody(snake_body) {
    let offset = (4n ** BigInt(snake_body.length) - 1n) / 3n;
    return offset + enumerateBodyRepresentation(snake_body);
}

function enumerateSnakeHeadPosition(snake_head_position) {
    return enumeratePixel(snake_head_position);
}

function enumerateApplePosition(apple_position) {
    return enumeratePixel(apple_position);
}

function enumeratePixel(pixel) {
    return w * pixel.y + pixel.x;
}

function enumerateSecondChance(second_chance) {
    return second_chance ? 1 : 0;
}

function enumerateIncomingTail(incoming_tail) {
    return incoming_tail;
}

function enumerateDirection(direction) {
    switch(direction) {
        case ARROW_UP:
            return 0;
        case ARROW_RIGHT:
            return 1;
        case ARROW_DOWN:
            return 2;
        case ARROW_LEFT:
            return 3;
    }
}

function enumeratePoints(points) {
    return points / 5;
}

function enumerateState(q) {
    let n = 0n;
    let num_states = 1n;
    n += enumerateSnakeBody(q.snake_body) * num_states;
    num_states *= NUM_SNAKE_BODY_STATES;
    n += BigInt(enumerateSnakeHeadPosition(q.snake_head_position)) * num_states;
    num_states *= BigInt(NUM_SNAKE_HEAD_POSITION_STATES);
    n += BigInt(enumerateApplePosition(q.apple_position)) * num_states;
    num_states *= BigInt(NUM_APPLE_POSITION_STATES);
    n += BigInt(enumerateSecondChance(q.second_chance)) * num_states;
    num_states *= BigInt(NUM_SECOND_CHANCE_STATES);
    n += BigInt(enumerateIncomingTail(q.incoming_tail)) * num_states;
    num_states *= BigInt(NUM_INCOMING_TAIL_STATES);
    n += BigInt(enumerateDirection(q.direction)) * num_states;
    num_states *= BigInt(NUM_DIRECTION_STATES);
    n += BigInt(enumeratePoints(q.points)) * num_states;
    return n;
}

function draw_pixel(point, size=pixelSize) {
    rectMode(CENTER);
    rect(game_left + unit * point.x, game_top + unit * point.y, size, size);
}

function draw_apple(point) {
    fill(255, 0, 0);
    draw_pixel(point, unit);
}

function pointEquals(point1, point2) {
    return point1.x === point2.x && point1.y === point2.y;
}

function copyPoint(point) {
    return {
        x: point.x,
        y: point.y
    };
}

function shiftPoint(point, direction) {
    if (typeof direction != 'number')
        return shiftPoint(point, enumerateDirection(direction));
    let p = copyPoint(point);
    switch (direction) {
        case enumerateDirection(ARROW_LEFT):
            p.x --;
            break;
        case enumerateDirection(ARROW_RIGHT):
            p.x ++;
            break;
        case enumerateDirection(ARROW_UP):
            p.y --;
            break;
        case enumerateDirection(ARROW_DOWN):
            p.y ++;
            break;
    }
    return p;
}

function unshiftPoint(point, direction) {
    if (typeof direction != 'number')
        return unshiftPoint(point, enumerateDirection(direction));
    let p = copyPoint(point);
    switch (direction) {
        case enumerateDirection(ARROW_LEFT):
            p.x ++;
            break;
        case enumerateDirection(ARROW_RIGHT):
            p.x --;
            break;
        case enumerateDirection(ARROW_UP):
            p.y ++;
            break;
        case enumerateDirection(ARROW_DOWN):
            p.y --;
            break;
    }
    return p;
}

function createPoint(x, y) {
    return {
        x: x,
        y: y
    };
}

function pointString(point) {
    return `(${point.x}, ${point.y})`;
}