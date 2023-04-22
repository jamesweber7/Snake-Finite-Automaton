

function draw_stats() {
    draw_current_state();
    draw_input();

    if (fa.q.state == ACCEPT_STATE) {
        draw_accept_transition();
        return;
    }
            
    draw_points_transition();
    draw_incoming_transition();
    draw_chance_transition();
    draw_apple_transition();
    draw_head_transition();
    draw_direction_transition();
    draw_body_transition();

}

function draw_current_state() {
    const margin = 0.96;

    const q_width = (q_window_right - q_window_left) * margin;
    const q_left = median(q_window_left, q_window_right) - q_width / 2;
    const q_right = median(q_window_left, q_window_right) + q_width / 2;

    const q_height = (q_window_bottom - q_window_top) * margin;
    const q_top = median(q_window_top, q_window_bottom) - q_height / 2;
    const q_bottom = median(q_window_top, q_window_bottom) + q_height / 2;


    const q_standard = q_width;

    const standard_margin = q_standard * 0.025;

    const write_left = q_left + standard_margin;

    push();

    stroke(0);
    strokeWeight(4);
    fill(NODE_GRAY);
    
    // state body
    rect(median(q_left, q_right), median(q_top, q_bottom), q_width, q_height, q_width * 0.03);

    let temp_floor = q_top;

    // state #
    let state_str = fa.q.state.toString();
    let step_size = 110;
    for (let i = step_size - 1; i < state_str.length; i += step_size) {
        state_str = state_str.substring(0, i) + "\n" + state_str.substring(i);
    }
    draw_q_subscript_text(state_str, write_left, temp_floor + q_standard * 0.012, q_standard * 0.05, {subscript_size: q_standard * 0.015});

    temp_floor = temp_floor + q_standard * 0.18;
    line(q_left, temp_floor, q_right, temp_floor);

    noStroke();
    fill(0);
    textSize(q_standard * 0.03);
    textAlign(LEFT, TOP);

    if (fa.q.state == ACCEPT_STATE) {
        push();
        textAlign(CENTER, CENTER);
        textSize(q_standard * 0.12);
        text("Accept State", median(q_left, q_right), temp_floor + (q_bottom - temp_floor) * 0.28);
        textSize(q_standard * 0.05);
        text("Game Over!", median(q_left, q_right), temp_floor + (q_bottom - temp_floor) * 0.6);
        pop();
        return;
    }

    // points
    let points = fa.q.points;
    let points_state = enumeratePoints(points);
    let points_subscript = "points" + points_state;
    let points_description = "5 × " + points_state + " → " + points + " points";
    write_normal_variable_state(temp_floor, points_subscript, points_description);

    temp_floor += q_standard * 0.04 + standard_margin;

    // direction
    let direction = fa.q.direction;
    let direction_state = enumerateDirection(direction);
    let direction_subscript = "direction" + direction_state;
    let direction_description = "moving ";
    if (direction == ARROW_LEFT)
        direction_description += "left";
    if (direction == ARROW_RIGHT)
        direction_description += "right";
    if (direction == ARROW_UP)
        direction_description += "up";
    if (direction == ARROW_DOWN)
        direction_description += "down";
    direction_description += direction;
    write_normal_variable_state(temp_floor, direction_subscript, direction_description);

    temp_floor += q_standard * 0.04 + standard_margin;

    // incoming tail
    let incoming = fa.q.incoming_tail;
    let incoming_state = enumerateIncomingTail(incoming);
    let incoming_subscript = "incoming" + incoming_state;
    let incoming_description = incoming_state + " tail units incoming";
    write_normal_variable_state(temp_floor, incoming_subscript, incoming_description);

    temp_floor += q_standard * 0.04 + standard_margin;

    // second chance
    let chance = fa.q.second_chance;
    let chance_state = enumerateSecondChance(chance);
    let chance_subscript = "chance" + chance_state;
    let chance_description;
    if (chance) {
        chance_description = "on";
    } else {
        chance_description = "not on";
    }
    chance_description += " second chance";
    write_normal_variable_state(temp_floor, chance_subscript, chance_description);

    temp_floor += q_standard * 0.04 + standard_margin;

    // apple
    let apple = fa.q.apple_position;
    let apple_state = enumerateApplePosition(apple);
    let apple_subscript = "apple" + apple_state;
    let apple_description = `apple at (${apple_state} mod w, ⌊${apple_state} / w⌋) = (${apple_state % w}, ${Math.floor(apple_state / w)})`;
    write_normal_variable_state(temp_floor, apple_subscript, apple_description);

    temp_floor += q_standard * 0.04 + standard_margin;

    // snake head
    let head = fa.q.snake_head_position;
    let head_state = enumerateSnakeHeadPosition(head);
    let head_subscript = "head" + head_state;
    let head_description = `snake head at (${head_state} mod w, ⌊${head_state} / w⌋) = (${head_state % w}, ${Math.floor(head_state / w)})`;
    write_normal_variable_state(temp_floor, head_subscript, head_description);

    temp_floor += q_standard * 0.04 + standard_margin;

    // snake body
    let snake_body = fa.q.snake_body;
    let snake_body_state = enumerateSnakeBody(snake_body);
    let snake_body_str = "snake_body" + snake_body_state.toString();
    step_size = 104;
    for (let i = step_size - 1; i < snake_body_str.length; i += step_size) {
        snake_body_str = snake_body_str.substring(0, i) + "\n" + snake_body_str.substring(i);
    }
    draw_q_subscript_text(snake_body_str, write_left, temp_floor + q_standard * 0.01, q_standard * 0.04, {subscript_size:q_standard * 0.016});

    let text_top = temp_floor + standard_margin * 1.2;
    if (snake_body_str.length > 11) {
        text_top += Math.ceil(snake_body_str.length / step_size) * q_standard * 0.022;
    }
    text("information about each pixel in the snake's body", write_left + q_standard * 0.18, text_top);

    // state
    temp_floor = q_bottom;

    pop();

    function write_normal_variable_state(temp_floor, subscript, text_right) {
        draw_q_subscript_text(subscript, write_left, temp_floor + q_standard * 0.01, q_standard * 0.04);
        
        let temp_left = write_left + q_standard * 0.18;

        text(text_right, temp_left, temp_floor + standard_margin * 1.2);
    }
}

function draw_input() {
    push();

    let input_width = input_window_right - input_window_left;

    textAlign(LEFT, CENTER);
    textSize(input_width * 0.015);
    fill(0);
    text("input: " + fa.input, input_window_left + input_width * 0.01, median(input_window_top, input_window_bottom));

    text("string: ", input_window_left + input_width * 0.07, median(input_window_top, input_window_bottom));
    let left = input_window_left + input_width * 0.115;
    let right = input_window_right - input_width * 0.02;

    let input_string = fa.input_string;

    let width = right - left;
    let height = (input_window_bottom - input_window_top) * 0.96;
    let size = input_width * 0.015;
    textSize(size);
    let numLines;
    size++;
    do {
        size--;
        textSize(size);
        numLines = textWidth(input_string) / width;
    } while (size > 0 && textAscent() * TEXT_ASCENT_SCALAR * numLines > height);

    let current_str = "";
    for (let i = 0; i < input_string.length; i++) {
        if (textWidth(current_str + input_string[i]) > width) {
            input_string = input_string.substring(0, i) + "\n" + input_string.substring(i);
            current_str = "";
            i++;
        }
        current_str += input_string[i];
    }
    text(input_string, left, median(input_window_top, input_window_bottom));

    pop();
}

function draw_points_transition() {
    // title
    // left, right
    // top, bottom
    // last_state, state
    // extra_input[]
    let state = enumeratePoints(fa.q.points);
    let last_state = enumeratePoints(fa.last_q.points);
    let subtext = fa.q.points;
    let last_subtext = fa.last_q.points;
    const params = {
        title: "Points",
        left: points_window_left,
        right: points_window_right,
        top: points_window_top,
        bottom: points_window_bottom,
        last_state: last_state,
        state: state,
        subtext: subtext,
        last_subtext: last_subtext,
        extra_input: [
            `Apple ${pointString(fa.last_q.apple_position)}`,
            `Head ${pointString(fa.last_q.snake_head_position)}`
        ],
        current_only: state == last_state,
        start_state: fa.q.state == START_STATE,
        transition_options: {
            self: state == last_state,
            input: fa.input,
            focus: state == last_state
        }
    };
    draw_standard_state_transition(params);
}

function draw_incoming_transition() {
    // title
    // left, right
    // top, bottom
    // last_state, state
    // extra_input[]
    let last_state = enumerateIncomingTail(fa.last_q.incoming_tail);
    let state = enumerateIncomingTail(fa.q.incoming_tail);
    const params = {
        title: "Incoming Tail",
        left: incoming_window_left,
        right: incoming_window_right,
        top: incoming_window_top,
        bottom: incoming_window_bottom,
        last_state: last_state,
        state: state,
        last_subtext: fa.last_q.incoming_tail,
        subtext: fa.q.incoming_tail,
        extra_input: [
            `Apple ${pointString(fa.last_q.apple_position)}`,
            `Head ${pointString(fa.last_q.snake_head_position)}`
        ],
        current_only: fa.q.state == START_STATE || last_state == state,
        start_state: fa.q.state == START_STATE,
        swap_direction: state < last_state,
        transition_options: {
            self: state == last_state,
            input: fa.input,
            focus: state == last_state
        }
    };
    draw_standard_state_transition(params);
    return;
}

function draw_chance_transition() {
    // title
    // left, right
    // top, bottom
    // last_state, state
    // extra_input[]
    let left_transition_input = "";
    let right_transition_input = "";

    if (fa.last_q.second_chance) {
        // how second chance was exited
        left_transition_input = fa.input;
    }
    if (fa.q.second_chance) {
        // how second chance was entered
        right_transition_input = fa.input;

        // how to exit second chance
        let head = copyPoint(fa.q.snake_head_position);
        let direction = fa.q.direction;
        if (direction != ARROW_LEFT) {
            head.x ++;
            if (!collision(head)) {
                if(left_transition_input.length)
                    left_transition_input += ", ";
                left_transition_input += ARROW_RIGHT;
            }
            head.x --;
        }
        if (direction != ARROW_RIGHT) {
            head.x --;
            if (!collision(head)) {
                if(left_transition_input.length)
                    left_transition_input += ", ";
                left_transition_input += ARROW_LEFT;
            }
            head.x ++;
        }
        if (direction != ARROW_UP) {
            head.y ++;
            if (!collision(head)) {
                if(left_transition_input.length)
                    left_transition_input += ", ";
                left_transition_input += ARROW_DOWN;
            }
            head.y --;
        }
        if (direction != ARROW_DOWN) {
            head.y --;
            if (!collision(head)) {
                if(left_transition_input.length)
                    left_transition_input += ", ";
                left_transition_input += ARROW_UP;
            }
            head.y ++;
        }
    } else {
        // how to enter second chance
        let head = copyPoint(fa.q.snake_head_position);
        let direction = fa.q.direction;
        if (direction != ARROW_LEFT) {
            head.x ++;
            if (collision(head)) {
                if(right_transition_input.length)
                    right_transition_input += ", ";
                right_transition_input += ARROW_RIGHT;
                if (direction == ARROW_RIGHT)
                    right_transition_input += ", " + NUL;
            }
            head.x --;
        }
        if (direction != ARROW_RIGHT) {
            head.x --;
            if (collision(head)) {
                if(right_transition_input.length)
                    right_transition_input += ", ";
                right_transition_input += ARROW_LEFT;
                if (direction == ARROW_LEFT)
                    right_transition_input += ", " + NUL;
            }
            head.x ++;
        }
        if (direction != ARROW_UP) {
            head.y ++;
            if (collision(head)) {
                if(right_transition_input.length)
                    right_transition_input += ", ";
                right_transition_input += ARROW_DOWN;
                if (direction == ARROW_DOWN)
                    right_transition_input += ", " + NUL;
            }
            head.y --;
        }
        if (direction != ARROW_DOWN) {
            head.y --;
            if (collision(head)) {
                if(right_transition_input.length)
                    right_transition_input += ", ";
                right_transition_input += ARROW_UP;
                if (direction == ARROW_UP)
                    right_transition_input += ", " + NUL;
            }
            head.y ++;
        }
    }

    let last_state = enumerateSecondChance(fa.last_q.second_chance);
    let state = enumerateSecondChance(fa.q.second_chance);
    let other_state = enumerateSecondChance(!fa.q.second_chance);
    let left_state, right_state;
    if (fa.q.second_chance) {
        left_state = other_state;
        right_state = state;
    } else {
        left_state = state;
        right_state = other_state;
    }

    let is_start = fa.q.state == START_STATE;
    let self_focus = !is_start && state == last_state;

    let left_subtext = "Off";
    let right_subtext = "On";
    
    const params = {
        title: "Second Chance",
        left: chance_window_left,
        right: chance_window_right,
        top: chance_window_top,
        bottom: chance_window_bottom,
        last_state: left_state,
        state: right_state,
        last_subtext: left_subtext,
        subtext: right_subtext,
        focus: state,
        extra_input: [
            `Head ${pointString(fa.q.snake_head_position)}`
        ],
        transition_options: {
            both_ways: true, 
            transition_forward_options: {
                input: right_transition_input,
                focus: fa.q.second_chance
            },
            transition_backward_options: {
                input: left_transition_input,
                focus: fa.last_q.second_chance
            }
        },
        start_state: is_start,
        left_self_transition_options: {
            self: true,
            input: self_focus ? fa.input : "",
            focus: self_focus
        },
        buffer: 0.8
    };
    draw_standard_state_transition(params);
}

function draw_apple_transition() {
    // title
    // left, right
    // top, bottom
    // last_state, state
    // extra_input[]
    let state = enumerateApplePosition(fa.q.apple_position);
    let last_state = enumerateApplePosition(fa.last_q.apple_position);
    let subtext = pointString(fa.q.apple_position);
    let last_subtext = pointString(fa.last_q.apple_position);
    const params = {
        title: "Apple",
        left: apple_window_left,
        right: apple_window_right,
        top: apple_window_top,
        bottom: apple_window_bottom,
        last_state: last_state,
        state: state,
        subtext: subtext,
        last_subtext: last_subtext,
        extra_input: [
            `Head ${pointString(fa.last_q.snake_head_position)}`
        ],
        current_only: fa.q.state == START_STATE || state == last_state,
        start_state: fa.q.state == START_STATE,
        transition_options: {
            self: state == last_state,
            input: fa.input,
            focus: state == last_state
        }
    };
    draw_standard_state_transition(params);
}

function draw_body_transition() {
    // title
    // left, right
    // top, bottom
    // last_state, state
    // extra_input[]
    let state = enumerateSnakeBody(fa.q.snake_body).toString();
    let last_state = enumerateSnakeBody(fa.last_q.snake_body).toString();
    const params = {
        title: "Snake Body",
        left: body_window_left,
        right: body_window_right,
        top: body_window_top,
        bottom: body_window_bottom,
        last_state: last_state,
        state: state,
        super_long: state.length > 6,
        current_only: state == last_state,
        start_state: fa.q.state == START_STATE,
        transition_options: {
            self: state == last_state,
            input: fa.input,
            focus: state == last_state
        }
    };
    draw_standard_state_transition(params);
}

function draw_head_transition() {
    // title
    // left, right
    // top, bottom
    // states
    // extra_input[]

    let head = fa.q.snake_head_position;
    let last_head = fa.last_q.snake_head_position;
    let other_head;

    let current_id = enumerateSnakeHeadPosition(fa.q.snake_head_position);
    let last_id = enumerateSnakeHeadPosition(fa.last_q.snake_head_position);
    let other_id;

    let current_state, last_state, other_state;
    let states;
    current_state = {
        state: current_id,
        subtext: pointString(head),
        start: fa.q.state == START_STATE,
        focus: true
    };
    last_state = {
        state: last_id,
        subtext: pointString(last_head)
    };

    // up
    if (head.y == last_head.y - 1) {
        // q    q'
        // pq
        other_head = createPoint(head.x + 1, head.y);
        other_id = enumerateSnakeHeadPosition(other_head);
        other_state = {
            state: other_id,
            subtext: pointString(other_head)
        };
        current_state.transitions = [
            {
                to: last_id,
                input: ARROW_RIGHT
            },
            {
                to: other_id,
                input: ARROW_DOWN
            }
        ];
        last_state.transitions = [
            {
                to: current_id,
                input: ARROW_UP,
                focus: true
            }
        ];
        other_state.transitions = [
            {
                to: current_id,
                input: ARROW_LEFT
            }
        ];
        states = [
            [current_state, other_state],
            [last_state, null]
        ];
        
    }
    // down
    else if (head.y == last_head.y + 1) {
        // pq
        // q    q'
        other_head = createPoint(head.x + 1, head.y);
        other_id = enumerateSnakeHeadPosition(other_head);
        other_state = {
            state: other_id,
            subtext: pointString(other_head)
        };
        current_state.transitions = [
            {
                to: last_id,
                input: ARROW_RIGHT
            },
            {
                to: other_id,
                input: ARROW_UP
            }
        ];
        last_state.transitions = [
            {
                to: current_id,
                input: ARROW_DOWN,
                focus: true
            }
        ];
        other_state.transitions = [
            {
                to: current_id,
                input: ARROW_LEFT
            }
        ];
        states = [
            [last_state, null],
            [current_state, other_state]
        ];
    }
    // left
    else if (head.x == last_head.x - 1) {
        // q    pq
        // q'
        other_head = createPoint(head.x, head.y + 1);
        other_id = enumerateSnakeHeadPosition(other_head);
        other_state = {
            state: other_id,
            subtext: pointString(other_head)
        };
        current_state.transitions = [
            {
                to: last_id,
                input: ARROW_RIGHT
            },
            {
                to: other_id,
                input: ARROW_DOWN
            }
        ];
        last_state.transitions = [
            {
                to: current_id,
                input: ARROW_LEFT,
                focus: true
            }
        ];
        other_state.transitions = [
            {
                to: current_id,
                input: ARROW_UP
            }
        ];
        states = [
            [current_state, last_state],
            [other_state, null]
        ];
    }
    // right
    else if (head.x == last_head.x + 1) {
        // pq    q
        //      q'
        other_head = createPoint(head.x, head.y + 1);
        other_id = enumerateSnakeHeadPosition(other_head);
        other_state = {
            state: other_id,
            subtext: pointString(other_head)
        };
        current_state.transitions = [
            {
                to: last_id,
                input: ARROW_LEFT
            },
            {
                to: other_id,
                input: ARROW_DOWN
            }
        ];
        last_state.transitions = [
            {
                to: current_id,
                input: ARROW_RIGHT,
                focus: true
            }
        ];
        other_state.transitions = [
            {
                to: current_id,
                input: ARROW_UP
            }
        ];
        states = [
            [last_state, current_state],
            [null, other_state]
        ];
    } else {
        // no change
        // q    q'
        // q''

        // q' → last
        last_head = createPoint(head.x + 1, head.y);
        last_id = enumerateSnakeHeadPosition(last_head);
        last_state = {
            state: last_id,
            subtext: pointString(last_head)
        };

        // q'' → other
        other_head = createPoint(head.x, head.y + 1);
        other_id = enumerateSnakeHeadPosition(other_head);
        other_state = {
            state: other_id,
            subtext: pointString(other_head)
        };
        
        current_state.transitions = [
            {
                to: current_id,
                input: fa.q.state != START_STATE ? fa.input : "",
                focus: fa.q.state != START_STATE
            },
            {
                to: last_id,
                input: ARROW_RIGHT
            },
            {
                to: other_id,
                input: ARROW_DOWN
            }
        ];
        last_state.transitions = [
            {
                to: current_id,
                input: ARROW_LEFT
            }
        ];
        other_state.transitions = [
            {
                to: current_id,
                input: ARROW_UP
            }
        ];
        states = [
            [current_state, last_state],
            [other_state, null]
        ];
    }
    
    const params = {
        title: "Snake Head",
        left: head_window_left,
        right: head_window_right,
        top: head_window_top,
        bottom: head_window_bottom,
        states: states,
        current: enumerateDirection(fa.q.direction),
        last: enumerateDirection(fa.last_q.direction)
    };
    draw_multi_state_transition(params);
}

function draw_direction_transition() {
    // title
    // left, right
    // top, bottom
    // states
    // extra_input[]
    let up = enumerateDirection(ARROW_UP);
    let down = enumerateDirection(ARROW_DOWN);
    let left = enumerateDirection(ARROW_LEFT);
    let right = enumerateDirection(ARROW_RIGHT);

    let states = [
        [
            {
                state: up,
                transitions: [
                    {
                        to: up,
                        input: ARROW_UP + ",\n" + NUL,
                    },
                    {
                        to: right,
                        input: ARROW_RIGHT,
                    },
                    {
                        to: left,
                        input: ARROW_LEFT,
                    }
                ],
                subtext: "Up"
            },
            {
                state: right,
                transitions: [
                    {
                        to: up,
                        input: ARROW_UP,
                    },
                    {
                        to: down,
                        input: ARROW_DOWN,
                    },
                    {
                        to: right,
                        input: ARROW_RIGHT + ",\n" + NUL,
                    }
                ],
                subtext: "Right",
                start: fa.q.state == START_STATE
            }
        ],
        [
            {
                state: left,
                transitions: [
                    {
                        to: up,
                        input: ARROW_UP,
                    },
                    {
                        to: down,
                        input: ARROW_DOWN,
                    },
                    {
                        to: left,
                        input: ARROW_LEFT + ",\n" + NUL,
                    }
                ],
                subtext: "Left"
            },
            {
                state: down,
                transitions: [
                    {
                        to: down,
                        input: ARROW_DOWN + ",\n" + NUL,
                    },
                    {
                        to: right,
                        input: ARROW_RIGHT,
                    },
                    {
                        to: left,
                        input: ARROW_LEFT,
                    }
                ],
                subtext: "Down"
            }
        ]
    ];

    // current state
    let current_state;
    for (let i = 0; i < states.length; i++) {
        for (let j = 0; j < states[i].length; j++) {
            if (states[i][j].state == enumerateDirection(fa.q.direction)) {
                current_state = states[i][j];
            }
            
        }
    }
    current_state.focus = true;
    // last transition
    let last_transition;
    for (let i = 0; i < states.length; i++) {
        for (let j = 0; j < states[i].length; j++) {
            if (enumerateDirection(fa.last_q.direction) == states[i][j].state) {
                for (let t = 0; t < states[i][j].transitions.length; t++) {
                    if (states[i][j].transitions[t].to == current_state.state) {
                        last_transition = states[i][j].transitions[t];
                    }
                }
            }
        }
    }
    last_transition.focus = true;
    // last transition input
    last_transition.input = fa.input;
    const params = {
        title: "Direction",
        left: direction_window_left,
        right: direction_window_right,
        top: direction_window_top,
        bottom: direction_window_bottom,
        states: states,
        current: enumerateDirection(fa.q.direction),
        last: enumerateDirection(fa.last_q.direction)
    };
    draw_multi_state_transition(params);
}

// params:
// title
// left, right
// top, bottom
// last_state, state
// extra_input[]
function draw_standard_state_transition(params) {
    const aspect_ratio = 3;
    const title_bottom = params.top + (params.bottom - params.top) - (params.right - params.left) / aspect_ratio;


    push();
    textAlign(CENTER, CENTER);
    fill(0);
    noStroke();
    textSize((title_bottom - params.top) * 0.5);
    text(params.title, median(params.left, params.right), median(params.top, title_bottom));
    pop();

    const buffer = params.buffer ? params.buffer : 0.9;

    const width = (params.right - params.left) * buffer;
    const height = (params.bottom - title_bottom) * buffer;

    const left = median(params.left, params.right) - width * 0.5;
    const right = median(params.left, params.right) + width * 0.5;

    const top = median(title_bottom, params.bottom) - height * 0.5;
    const bottom = median(title_bottom, params.bottom) + height * 0.5;

    const standard = width;

    const nodeSize = height;

    if (params.current_only) {

        let focus = true;
        if (params.focus != undefined)
            focus = params.focus == params.state;
        let node = create_node(median(left, right), median(top, bottom), nodeSize, {state: params.state, focus: focus, start: params.start_state, subtext: params.subtext, super_long: params.super_long});

        draw_node(node);

        if (params.transition_options && params.transition_options.self) {
            draw_self_transition(node, params.transition_options)
        }

        if (params.extra_input && params.extra_input.length) {
            push();
            noStroke();
            fill(0);
            textAlign(CENTER, CENTER);
            textSize(width * 0.03);
            let x_offset = median(node.x + node.w / 2, right) - node.x;
            let y_offset = 0;
            
            for (let i = 0; i < params.extra_input.length; i++) {
                text(params.extra_input[i], node.x + x_offset, node.y + y_offset + width * 0.04 * i);
            }
            pop();
        }

    } else {
        let last_focus = false;
        let focus = true;
        if (params.focus != undefined) {
            last_focus = params.focus == params.last_state;
            focus = params.focus == params.state;
        }
        let left_node = create_node(left + nodeSize / 2 + standard * 0.04, median(top, bottom), nodeSize, {state: params.last_state, focus: last_focus, start: params.start_state, subtext: params.last_subtext, super_long: params.super_long});
        let right_node = create_node(right - nodeSize / 2 - standard * 0.04, median(top, bottom), nodeSize, {state: params.state, focus: focus, subtext: params.subtext, super_long: params.super_long});

        if (params.swap_direction) {
            let x = right_node.x;
            right_node.x = left_node.x;
            left_node.x = x;
        }
        

        let transition_options = params.transition_options;
        if (!transition_options)
            transition_options = {};
        if (transition_options.input == undefined)
            transition_options.input = fa.input;
        if (transition_options.focus == undefined)
            transition_options.focus = true;

        draw_transition(left_node, right_node, transition_options);

        if (params.left_self_transition_options && params.left_self_transition_options.self) {
            draw_self_transition(left_node, params.left_self_transition_options)
        }

        draw_node(left_node);
        draw_node(right_node);

        if (params.extra_input && params.extra_input.length) {
            push();
            textAlign(CENTER, CENTER);
            textSize(width * 0.03);
            let x_offset = 0;
            let y_offset = width * 0.07;
            if (params.transition_options && params.transition_options.both_ways)
                y_offset = 0;
            for (let i = 0; i < params.extra_input.length; i++) {
                text(params.extra_input[i], median(left_node.x, right_node.x) + x_offset, median(left_node.y, right_node.y) + y_offset + width * 0.04 * i);
            }
            pop();
        }
    }
}

function draw_multi_state_transition(params) {
    const states = params.states;

    let size_y = states.length;
    let size_x = 0; 
    for (let i = 0; i < states.length; i++) {
        if (states[i])
            size_x = max(size_x, states[i].length);
    }

    const aspect_ratio = (states[0].length + 1) / (states.length + 1);
    const title_bottom = params.top + (params.bottom - params.top) - (params.right - params.left) / aspect_ratio;


    push();
    textAlign(CENTER, CENTER);
    fill(0);
    noStroke();
    textSize((title_bottom - params.top) * 0.5);
    text(params.title, median(params.left, params.right), median(params.top, title_bottom));
    pop();

    const buffer = params.buffer ? params.buffer : 0.875;

    const width = (params.right - params.left) * buffer;
    const height = (params.bottom - title_bottom) * buffer;

    const left = median(params.left, params.right) - width * 0.5;
    const right = median(params.left, params.right) + width * 0.5;

    const top = median(title_bottom, params.bottom) - height * 0.5;
    const bottom = median(title_bottom, params.bottom) + height * 0.5;

    const standard = width;

    const node_size = 0.7 * width / size_x;

    const margin_x = (width - node_size * size_x - 1) / size_x;
    const margin_y = (height - node_size * size_y - 1) / size_y;

    const nodes = [];

    for (let i = 0; i < size_y; i++) {
        const row = [];
        for (let j = 0; j < size_x; j++) {
            if (!states[i][j]) {
                row.push(null);
            } else {
                let node;
                node = create_node(left + node_size / 2 + margin_x / 2 + margin_x * j + node_size * j, top + node_size / 2 + margin_y / 2 + node_size * i + margin_y * i, node_size, {state: states[i][j].state, start: states[i][j].start, focus: states[i][j].focus, subtext: states[i][j].subtext})
                row.push(node);
            }
        }
        nodes.push(row);
    }

    // define transitions
    let transitions = [];
    for (let i = 0; i < size_y; i++) {
        for (let j = 0; j < size_x; j++) {
            let state = states[i][j];
            if (state) {
                for (let t = 0; state.transitions && t < state.transitions.length; t++) {
                    state.transitions[t].from = state.state;
                    if (j > 0)
                        state.transitions[t].is_right = true;
                    transitions.push(state.transitions[t]);
                }
            }
        }
    }

    // draw transitions
    while (transitions.length) {
        let transition1 = transitions[0];
        // self transition
        while (transition1 && transition1.from == transition1.to) {
            draw_self_transition(getNode(transition1.from), transition1);
            transitions.splice(0, 1);
            transition1 = transitions[0];
        }
        // both ways
        for (let t2 = 1; t2 < transitions.length; t2++) {
            let transition2 = transitions[t2];
            let options = transition1;
            if (transition1.from == transition2.to && transition2.from == transition1.to) {
                options = {};
                options.both_ways = true;
                options.transition_forward_options = transition1;
                options.transition_backward_options = transition2;
                options.from = transition1.from;
                options.to = transition1.to;
                transition1 = options;
                transitions[0] = transition1;

                transitions.splice(t2, 1);
                t2 --;
            }            
        }
        // draw transition
        if (transitions.length && transition1) {
            draw_transition(getNode(transition1.from), getNode(transition1.to), transition1);
            transitions.splice(0, 1);
        }
    }

    // draw states
    for (let i = 0; i < size_y; i++) {
        for (let j = 0; j < size_x; j++) {
            let node = nodes[i][j];
            if (node) {
                draw_node(nodes[i][j]);
            }
        }
    }

    function getNode(state) {
        for (let i = 0; i < size_y; i++)
            for (let j = 0; j < size_x; j++)
                if (nodes[i][j] && nodes[i][j].options.state == state)
                    return nodes[i][j];
    }
    
}

function draw_accept_transition() {
    // title
    // left, right
    // top, bottom
    // last_state, state
    // extra_input[]
    let state = "accept";
    const params = {
        title: "Accept",
        left: accept_window_left,
        right: accept_window_right,
        top: accept_window_top,
        bottom: accept_window_bottom,
        state: state,
        current_only: true
    };
    draw_standard_state_transition(params);
}

function draw_q_subscript_text(subscript_text, left, top, size, options={}) {
    push();
    textSize(size);
    textAlign(LEFT, TOP);
    noStroke();
    fill(0);
    text('q', left, top);
    let subscript_size = options.subscript_size ? options.subscript_size : size / 2;
    if (options.width && options.height) {
        let text_size = subscript_size;
        textSize(text_size);
        let numLines;
        text_size++;
        do {
            text_size--;
            textSize(text_size);
            numLines = ceil(textWidth(subscript_text) / options.width);
        } while (text_size > 0 && textAscent() * TEXT_ASCENT_SCALAR * numLines > options.height);

        let current_str = "";
        for (let i = 0; i < subscript_text.length; i++) {
            if (textWidth(current_str + subscript_text[i]) > options.width) {
                subscript_text = subscript_text.substring(0, i) + "\n" + subscript_text.substring(i);
                current_str = "";
                i++;
            }
            current_str += subscript_text[i];
        }
        text(subscript_text, left + size*0.55, top + size - subscript_size * 0.95)
    } else {
        textSize(subscript_size);
        text(subscript_text, left + size * 0.55, top + size - subscript_size * 0.95);
    }
    pop();
}

function draw_node(node) {
    const NORMAL_STROKE = node.w / 24;
    const FOCUS_STROKE = node.w / 12;
    const STROKE_WEIGHT = node.options.focus ? FOCUS_STROKE : NORMAL_STROKE;

    fill(NODE_GRAY);
    stroke(0);
    strokeWeight(STROKE_WEIGHT);

    circle(node.x, node.y, node.w);

    if (node.options.state != undefined) {
        noStroke();
        fill(0);
        if (node.options.super_long) {
            const size = node.w * 0.65;
            draw_q_subscript_text(node.options.state, node.x - size / 2 - size * 0.05, node.y - size / 2, node.w * 0.15, {width: size, height: size});
        } else {
            draw_q_subscript_text(node.options.state, node.x - node.w * (0.1 + 0.04 * node.options.state.toString().length), node.y - node.w * 0.2, node.w * 0.3);
        }
        
    }

    if (node.options.subtext != undefined) {
        push();
        noStroke();
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(node.w * 0.15);
        text(node.options.subtext, node.x, node.y + node.w * 0.3);
        pop();
    }

    if (node.options.start) {
        let x1 = node.x - node.w / 2;
        let y1 = node.y;
        stroke(0);
        strokeWeight(STROKE_WEIGHT);
        line(x1, y1, x1 - node.w * 0.12, y1 + node.w * 0.08);
        line(x1, y1, x1 - node.w * 0.12, y1 - node.w * 0.08);
    }
}

function create_node(x, y, w, options={}) {
    return {
        x: x,
        y: y,
        w: w,
        options: options
    }
}

function draw_transition(node1, node2, options={}) {
    const dist = sqrt((node2.y - node1.y) ** 2 + (node2.x - node1.x) **2);
    const standard = max(node1.w, node2.w, width * 0.075);
    const NORMAL_STROKE = standard * 0.04;
    const FOCUS_STROKE = standard * 0.06;

    const STROKE_WEIGHT = options.focus ? FOCUS_STROKE : NORMAL_STROKE;

    strokeWeight(STROKE_WEIGHT);
    stroke(0);

    let arrow_head_len = min(NORMAL_STROKE * 5, dist * 0.8);

    let x1 = node1.x;
    let y1 = node1.y;
  
    let x2 = node2.x;
    let y2 = node2.y;
  
    let m = (y2 - y1) / (x2 - x1);
    let theta = atan(m);
    if (x2 < x1)
      theta += PI;

    if (options.both_ways) {
        let d_theta = PI * 0.2;

        // forward →

        let forward_x1 = x1 + cos(theta - d_theta) * node1.w / 2;
        let forward_y1  = y1 + sin(theta - d_theta) * node1.w / 2;

        theta -= PI;

        let forward_x2 = x2 + cos(theta + d_theta) * node2.w / 2;
        let forward_y2  = y2 + sin(theta + d_theta) * node2.w / 2;

        const FORWARD_STROKE_WEIGHT = options.transition_forward_options.focus ? FOCUS_STROKE : NORMAL_STROKE;
        strokeWeight(FORWARD_STROKE_WEIGHT);

        draw_arrow(forward_x1, forward_y1, forward_x2, forward_y2, arrow_head_len);

        // backward ←

        let backward_x1 = x2 + cos(theta - d_theta) * node1.w / 2;
        let backward_y1  = y2 + sin(theta - d_theta) * node1.w / 2;

        theta -= PI;

        let backward_x2 = x1 + cos(theta + d_theta) * node2.w / 2;
        let backward_y2  = y1 + sin(theta + d_theta) * node2.w / 2;
        
        const BACKWARD_STROKE_WEIGHT = options.transition_backward_options.focus ? FOCUS_STROKE : NORMAL_STROKE;
        strokeWeight(BACKWARD_STROKE_WEIGHT);

        draw_arrow(backward_x1, backward_y1, backward_x2, backward_y2, arrow_head_len);

        if (options.transition_forward_options.input != undefined) {
            if (options.textSize) {
                textSize(options.textSize);
            } else {
                textSize(node1.w * 0.2);
            }
            push();
            noStroke();
            textAlign(CENTER, CENTER);
            fill(0);
            let offset_amt = FOCUS_STROKE * 2 + arrow_head_len * 0.2;
            let x_offset = offset_amt * cos(theta - PI / 2);
            let y_offset = offset_amt * sin(theta - PI / 2);
            // text((theta % (2*PI)) / PI + " PI", forward_x1 + (forward_x2 - forward_x1) / 2 + x_offset, forward_y1 + (forward_y2 - forward_y1) / 2 - (forward_y2 - forward_y1) * 0.1 + y_offset);
            text(options.transition_forward_options.input, forward_x1 + (forward_x2 - forward_x1) / 2 + x_offset, forward_y1 + (forward_y2 - forward_y1) / 2 - (forward_y2 - forward_y1) * 0.1 + y_offset);
            pop();
        }

        if (options.transition_backward_options.input != undefined) {
            if (options.textSize) {
                textSize(options.textSize);
            } else {
                textSize(node1.w * 0.2);
            }
            noStroke();
            push();
            textAlign(CENTER, CENTER);
            fill(0);
            let offset_amt = FOCUS_STROKE * 2 + arrow_head_len * 0.2;
            let x_offset = -offset_amt * cos(theta - PI / 2);
            let y_offset = -offset_amt * sin(theta - PI / 2);
            text(options.transition_backward_options.input, backward_x1 + (backward_x2 - backward_x1) / 2 + x_offset, backward_y1 + (backward_y2 - backward_y1) / 2 + (backward_y1 - backward_y1) * 0.1 + y_offset);
            pop();
        }

    } else {
  
        let draw_x1 = x1 + cos(theta) * node1.w / 2;
        let draw_y1 = y1 + sin(theta) * node1.w / 2;

        theta -= PI;

        let draw_x2 = x2 + cos(theta) * node2.w / 2;
        let draw_y2 = y2 + sin(theta) * node2.w / 2;

        draw_arrow(draw_x1, draw_y1, draw_x2, draw_y2, arrow_head_len);

        if (options.input != undefined) {
            if (options.textSize) {
                textSize(options.textSize);
            } else {
                textSize(node1.w * 0.2);
            }
            noStroke();
            push();
            textAlign(CENTER, CENTER);
            fill(0);
            text(options.input, node1.x + (node2.x - node1.x) / 2 - arrow_head_len / 2, node1.y + (node2.y - node1.y) / 2 - STROKE_WEIGHT * 2 - (node2.y - node1.y) * 0.1);
            pop();
        }
    }
}

function draw_self_transition(node, options={}) {

    const IS_RIGHT = options.is_right;
    const O_FACTOR = IS_RIGHT ? -1 : 1;
    let theta = IS_RIGHT ? 0 : PI;
    let d_theta = PI * 0.2;
    let start_theta = theta - PI / 2;
    let end_theta = theta + PI / 2;

    const standard = max(node.w, width * 0.075);
    const NORMAL_STROKE = standard * 0.04;
    const FOCUS_STROKE = standard * 0.06;
    const STROKE_WEIGHT = options.focus ? FOCUS_STROKE : NORMAL_STROKE;
    stroke(0);
    strokeWeight(STROKE_WEIGHT);

    let x1 = node.x + cos(theta - d_theta) * node.w / 2;
    let y1 = node.y + sin(theta - d_theta) * node.w / 2;

    let x2 = node.x + cos(theta + d_theta) * node.w / 2;
    let y2 = node.y + sin(theta + d_theta) * node.w / 2;

    let arc_size = node.w * 0.75;
    
    noFill();
    arc(x1, node.y, arc_size, y2 - y1, start_theta, end_theta);

    // arrow head
    let arrow_head_len = arc_size * 0.25;
    if (STROKE_WEIGHT == FOCUS_STROKE)
        arrow_head_len *= 1.1;

    theta = end_theta - PI / 2 - PI * 0.03;
    d_theta = PI / 6;

    line(x2, y2, x2 + cos(theta + d_theta) * arrow_head_len, y2 + sin(theta + d_theta) * arrow_head_len);
    line(x2, y2, x2 + cos(theta - d_theta) * arrow_head_len, y2 + sin(theta - d_theta) * arrow_head_len);

    if (options.input != undefined) {
        if (options.textSize) {
            textSize(options.textSize);
        } else {
            textSize(node.w * 0.15);
        }
        noStroke();
        push();
        textAlign(CENTER, CENTER);
        fill(0);
        if (IS_RIGHT) {
            text(options.input, median(x2, x2 + arc_size / 2) + arc_size * 0.05, node.y);
        } else {
            text(options.input, median(x1 - arc_size / 2, x1) - arc_size * 0.05, node.y);
        }
        pop();
    }
}

function draw_arrow(x1, y1, x2, y2, arrow_head_len=undefined) {
    if (!arrow_head_len) {
        const dist = sqrt((y2 - y1) ** 2 + (x2 - x1) **2);
        arrow_head_len = dist * 0.2;
    }

    let m = (y2 - y1) / (x2 - x1);
    let theta = atan(m);
    if (x2 >= x1)
      theta += PI;

    line(x1, y1, x2, y2);

    // arrow head
    let d_theta = PI / 6;
    line(x2, y2, x2 + cos(theta + d_theta) * arrow_head_len, y2 + sin(theta + d_theta) * arrow_head_len);
    line(x2, y2, x2 + cos(theta - d_theta) * arrow_head_len, y2 + sin(theta - d_theta) * arrow_head_len);
}