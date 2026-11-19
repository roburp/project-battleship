# Battleship

A Battleship game built with JavaScript as part of The Odin Project's Full Stack JavaScript curriculum.

## About

This project is a browser-based implementation of the classic Battleship game. Players deploy their fleet onto a 10×10 grid and take turns attacking their opponent's board until one player's entire fleet has been sunk.

The game uses JavaScript classes to separate game logic from DOM manipulation and user interactions.

## Features

The game supports:

- **Ship Placement** — allows players to deploy ships onto their board using drag-and-drop interactions
- **Ship Rotation** — rotates ships between horizontal and vertical orientations
- **Placement Preview** — displays a visual preview of ship placement and indicates invalid positions
- **Randomized Fleet Placement** — automatically deploys ships at random valid positions
- **Board Reset** — clears the player's board and allows ships to be deployed again
- **Turn-Based Gameplay** — alternates attacks between the human player and computer
- **Computer Opponent** — allows the computer to select targets and attack the player's board
- **Hit and Miss Detection** — identifies successful hits and missed attacks
- **Sunk Ship Detection** — tracks ship damage and determines when an entire ship has been sunk
- **Win Condition** — ends the game when all ships belonging to one player have been sunk

## Game Structure

The game is organized into separate modules, each responsible for a specific part of the application.

- `Ship` — manages ship health, hits, and sunk status
- `Gameboard` — manages ship placement, attacks, and board state
- `Player` — represents the human player and computer opponent
- `GameController` — manages game phases, player turns, attacks, and win conditions
- `DOM` — handles rendering game elements and updating the interface
- `EventHandlers` — handles user interactions such as ship placement and attacking

## Game Flow

The game progresses through three main phases:

```text
Deployment
    ↓
Playing
    ↓
Game Over
```

**Deployment**

Players position their fleet on a 10×10 grid. Ships can be placed manually or randomized.

**Playing**

Players take turns attacking coordinates on their opponent's board. The game tracks hits, misses, and sunk ships.

**Game Over**

The game ends when all ships belonging to one player have been sunk. The winner is then declared.

## Fleet

Each player deploys five ships:

| Ship       | Length |
| ---------- | -----: |
| Carrier    |      5 |
| Battleship |      4 |
| Cruiser    |      3 |
| Submarine  |      3 |
| Destroyer  |      2 |

## Concepts Practiced

- Object-oriented programming (OOP)
- JavaScript classes and modules
- Encapsulation and separation of concerns
- DOM manipulation
- Event handling
- Drag-and-drop interactions
- Coordinate-based grid systems
- Array methods and iteration
- Game state management
- Conditional logic
- Randomization
- Unit testing with Jest
- Test-driven development (TDD)
