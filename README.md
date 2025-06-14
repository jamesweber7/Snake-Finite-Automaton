# Snake Game Finite Automaton
Video Presentation: [YouTube | Snake Game Finite Automaton](https://www.youtube.com/watch?v=kmC9GL1Bz0E)

This webpage simulates a finite automaton that uses ≈1.656 E+619 states to represent an implementation of the snake game.

The snake game is represented by a 5-tuple (Q, Σ, δ, q<sub>0</sub>, F), where:
- Q is the set of states, which represent:
  - points
  - direction
  - incoming tail
  - second chance
  - apple position
  - snake head position
  - snake body
- Σ is the set of inputs:
  - ↑ 
  - → 
  - ↓ 
  - ← 
  - ␀ represents a game tick with no user input
- δ : Q × Σ → Q is the transition function between states
- q<sub>0</sub> is the start state
- F is the set containing the accept state

The webpage goes into detail on how the automaton is constructed:

[Check it out](https://snake.jamesweber.dev)
