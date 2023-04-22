
var active = false;
var killed = false;
var stepping = false;
var playThrough = false;

var buttons = [];


// snake game dimensions
const w = 42;
const h = 24;

const margin = 0.95;

var game_window_left, game_window_right;
var game_window_top, game_window_bottom;

var q_window_left, q_window_right;
var q_window_top, q_window_bottom;

var input_window_left, input_window_right;
var input_window_top, input_window_bottom;

var points_window_left, points_window_right;
var points_window_top, points_window_bottom;

var incoming_window_left, incoming_window_right;
var incoming_window_top, incoming_window_bottom;

var chance_window_left, chance_window_right;
var chance_window_top, chance_window_bottom;

var apple_window_left, apple_window_right;
var apple_window_top, apple_window_bottom;

var head_window_left, head_window_right;
var head_window_top, head_window_bottom;

var direction_window_left, direction_window_right;
var direction_window_top, direction_window_bottom;

var body_window_left, body_window_right;
var body_window_top, body_window_bottom;

var accept_window_left, accept_window_right;
var accept_window_top, accept_window_bottom;

const GAME_Q_DIVIDE = 0.5;
const game_vertical_margin = 0.35;
const game_vertical_divide = h / w;
const q_vertical_divide = (1 + game_vertical_margin) * game_vertical_divide;

const ARROW_LEFT = "←";
const ARROW_RIGHT = "→";
const ARROW_UP = "↑";
const ARROW_DOWN = "↓";
const NUL = "␀"

const FRAME_RATE = 8;
const TIMEOUT = 1000 / FRAME_RATE;

const NODE_GRAY = 90;

const TEXT_ASCENT_SCALAR = 1.5;

function setup() {
  createCanvas(windowWidth, windowHeight);
  updateWindowDimensions();
  frameRate(FRAME_RATE);
  rectMode(CENTER);

  // gh link
  document.getElementsByTagName('main')[0].after(document.getElementById('gh-link'));
}

function draw() {
  buttons = [];
  drawBackground();
  drawBorders();
  if (isPlaying()) {
    gameTick();
  }
  draw_game();
  draw_stats();
}

function gameTick() {
  update_fa();
}

function drawBackground() {
  // bg
  background(100);
}

function drawBorders() {
  strokeWeight(2);
  stroke(255);

  // game |
  line(game_window_right, game_window_top, game_window_right, game_window_bottom);
  // _____
  line(game_window_left, game_window_bottom, game_window_right, game_window_bottom);

  // q
  // _____
  line(q_window_left, q_window_bottom, q_window_right, q_window_bottom);

  // input
  // _____
  line(input_window_left, input_window_bottom, input_window_right, input_window_bottom);

  if (fa.q.state == ACCEPT_STATE) {
    // accept
    // _______
    line(accept_window_left, accept_window_bottom, accept_window_right, accept_window_bottom);
    return;
  }

  // points |
  line(points_window_right, points_window_top, points_window_right, points_window_bottom);
  // _______
  line(points_window_left, points_window_bottom, points_window_right, points_window_bottom);

  // incoming
  // _______
  line(incoming_window_left, incoming_window_bottom, incoming_window_right, incoming_window_bottom);

  // chance |
  line(chance_window_right, chance_window_top, chance_window_right, chance_window_bottom);
  // _______
  line(chance_window_left, chance_window_bottom, chance_window_right, chance_window_bottom);

  // apple
  // _______
  line(apple_window_left, apple_window_bottom, apple_window_right, apple_window_bottom);

  // head |
  line(head_window_right, head_window_top, head_window_right, head_window_bottom);
  // _______
  line(head_window_left, head_window_bottom, head_window_right, head_window_bottom);

  // | direction
  line(direction_window_left, direction_window_top, direction_window_left, direction_window_bottom);
  // _______
  line(direction_window_left, direction_window_bottom, direction_window_right, direction_window_bottom);

  // body |
  line(body_window_right, body_window_top, body_window_right, body_window_bottom);

}

function updateWindowDimensions() {
  const width = windowWidth * margin;

  // game & q horizontal division
  game_window_left = 0;
  game_window_right = GAME_Q_DIVIDE * width;
  q_window_left = GAME_Q_DIVIDE * width;
  q_window_right = width;

  // game vertical size

  // game   | q
  // -------+-------
  // input
  // ---------------
  // points | tail
  // -------+-------
  // chance | apple
  // -------+-------
  // head   | direction
  //        |   
  // -------+-------
  // body   |
  game_window_top = 0;
  game_window_bottom = (game_window_right - game_window_left) * game_vertical_divide * (1 + game_vertical_margin);

  update_game_size();

  // q vertical size
  q_window_top = 0;
  q_window_bottom = (q_window_right - q_window_left) * q_vertical_divide;

  // input window size
  input_window_left = 0;
  input_window_right = width;
  input_window_top = q_window_bottom;
  input_window_bottom = input_window_top + width * 0.06;

  // points window
  points_window_top = input_window_bottom;
  points_window_left = 0;
  points_window_right = width * 0.5;
  points_window_bottom = (points_window_right - points_window_left) / 3 + (points_window_right - points_window_left) * 0.15 + points_window_top;

  // incoming window;
  incoming_window_top = input_window_bottom;
  incoming_window_left = points_window_right;
  incoming_window_right = width;
  incoming_window_bottom = (incoming_window_right - incoming_window_left) / 3 + (incoming_window_right - incoming_window_left) * 0.15 + incoming_window_top;

  // chance window
  chance_window_top = points_window_bottom;
  chance_window_left = 0;
  chance_window_right = width * 0.5;
  chance_window_bottom = (chance_window_right - chance_window_left) / 3 + (chance_window_right - chance_window_left) * 0.15 + chance_window_top;

  // apple window
  apple_window_top = incoming_window_bottom;
  apple_window_left = chance_window_right;
  apple_window_right = width;
  apple_window_bottom = (apple_window_right - apple_window_left) / 3 + (apple_window_right - apple_window_left) * 0.15 + apple_window_top;

  // head window
  head_window_top = chance_window_bottom;
  head_window_left = 0;
  head_window_right = width * 0.5;
  head_window_bottom = 3 * (head_window_right - head_window_left) / 3 + (head_window_right - head_window_left) * 0.15 + head_window_top;

  // direction window
  direction_window_top = apple_window_bottom;
  direction_window_left = chance_window_right;
  direction_window_right = width;
  direction_window_bottom = 3 * (direction_window_right - direction_window_left) / 3 + (direction_window_right - direction_window_left) * 0.15 + direction_window_top;

  // body window
  body_window_top = head_window_bottom;
  body_window_left = 0;
  body_window_right = width * 0.5;
  body_window_bottom = (body_window_right - body_window_left) / 3 + (body_window_right - body_window_left) * 0.15 + body_window_top;

  // accept window
  accept_window_top = input_window_bottom;
  accept_window_left = 0;
  accept_window_right = width;
  accept_window_bottom = (accept_window_right - accept_window_left) / 3 + (accept_window_right - accept_window_left) * 0.15 + accept_window_top;

  const height = body_window_bottom;

  resizeCanvas(width, height);
}

function windowResized() {
  updateWindowDimensions();
}

function keyPressed(e) {
  let left = 'ArrowLeft';
  let up = 'ArrowUp';
  let right = 'ArrowRight';
  let down = 'ArrowDown';
  let space = ' ';

  switch (key) {
    case left:
    case up:
    case right:  
    case down:
    case space:
      e.preventDefault();
  }

  if (isPlaying())
    return playingGameKeyPressed();

  if (isStepping())
    return steppingKeyPressed();

  if (isReadyToPlay())
    return readyToPlayKeyPressed();

  print(key);

}

function playingGameKeyPressed() {
  let left = 'ArrowLeft';
  let up = 'ArrowUp';
  let right = 'ArrowRight';
  let down = 'ArrowDown';

  switch (key) {
    case left:
    case up:
    case right:  
    case down:
      setDirection(keyToDirection(key));
  }
}

function steppingKeyPressed() {
  let left = 'ArrowLeft';
  let up = 'ArrowUp';
  let right = 'ArrowRight';
  let down = 'ArrowDown';
  let space = ' ';

  switch (key) {
    case left:
    case up:
    case right:  
    case down:
      setDirection(keyToDirection(key));
    case space:
      gameTick();
  }
}

function readyToPlayKeyPressed() {
  let left = 'ArrowLeft';
  let up = 'ArrowUp';
  let right = 'ArrowRight';
  let down = 'ArrowDown';

  switch (key) {
    case left:
    case up:
    case right:  
    case down:
      playingGameKeyPressed();
      startGame();
  }
}

function mousePressed() {
  if (mouseX < 0 || mouseX > width)
    return;
  if (mouseY < 0 || mouseY > height)
    return;

  print(round(mouseX / width, 2) + ", " + round(mouseY / height, 2));
  print(mouseX, mouseY);

  for (let i = 0; i < buttons.length; i++) {
    let x1 = buttons[i].x1;
    let y1 = buttons[i].y1;
    let x2 = buttons[i].x2;
    let y2 = buttons[i].y2;

    if (buttons[i].options.onclick)
      if (mouseX > x1 && mouseX < x2)
        if (mouseY > y1 && mouseY < y2)
          buttons[i].options.onclick();
  }
}

function button(a1, a2, a3, a4, options={}, rectMode=CENTER) {
  let x1, y1, x2, y2;
  if (rectMode == CENTER) {
    x1 = a1 - a3 / 2;
    x2 = a1 + a3 / 2;
    y1 = a2 - a4 / 2;
    y2 = a2 + a4 / 2;
    return button(x1, y1, x2, y2, options, CORNERS);
  } 

  if (rectMode != CORNERS)
    return;

  x1 = a1;
  y1 = a2;
  x2 = a3;
  y2 = a4;
  let btn = {
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2,
    options: options
  };

  buttons.push(btn);

  draw_button(btn);
}

function draw_button(btn) {
  push();
  rectMode(CORNERS);
  let hovering = mouseX > btn.x1 && mouseX < btn.x2
              && mouseY > btn.y1 && mouseY < btn.y2;
  const STATIC_COLOR = 100;
  const HOVER_COLOR = STATIC_COLOR - 20;
  if (hovering) {
    fill(HOVER_COLOR);
  } else {
    fill(STATIC_COLOR);
  }
  strokeWeight(5);
  stroke(0);
  rect(btn.x1, btn.y1, btn.x2, btn.y2, (btn.x2 - btn.x1) * 0.02);
  if (btn.options.text) {
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    if (btn.options.textSize) {
      textSize(btn.options.textSize);
    } else {
      textSize(2 * (btn.x2 - btn.x1) / btn.text.length);
    }
    text(btn.options.text, btn.x1 + (btn.x2 - btn.x1) / 2, btn.y1 + (btn.y2 - btn.y1) / 2);
  }
  pop();
}


function median(n1, n2) {
  return n1 + (n2 - n1) / 2;
}
