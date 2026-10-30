import { Ship } from "./ship.js";

export class Gameboard {
  constructor() {
    this.ships = [];
    this.attacks = [];
    this.missedAttacks = [];
  }
  // e.g. coordinates = [[1,2],[1,3]]
  placeShip(length, coordinates) {
    if (coordinates.length !== length) {
      throw new Error("Number of coordinates must match ship length.");
    }
    const ship = new Ship(length);

    this.ships.push({ ship, coordinates });
  }

  receiveAttack(coordinates) {
    // Checks if coordinate has already been attacked
    const alreadyAttacked = this.attacks.some((attack) => attack[0] === coordinates[0] && attack[1] === coordinates[1]);
    if (alreadyAttacked) return false;
    this.attacks.push(coordinates);

    // Find the ship occupying the attacked coordinates
    const target = this.ships.find((entry) =>
      entry.coordinates.some((position) => position[0] === coordinates[0] && position[1] === coordinates[1]),
    );

    if (target) {
      target.ship.hit();
      const result = target.ship.isSunk() ? "sunk" : "hit";
      return { result, ship: target };
    } else {
      this.missedAttacks.push(coordinates);
      return {
        result: "miss",
        ship: null,
      };
    }
  }

  isValidPlacement(coordinates) {
    const inBounds = coordinates.every(([x, y]) => x >= 1 && x <= 10 && y >= 1 && y <= 10);

    const overlaps = this.ships.some((ship) =>
      ship.coordinates.some(([px, py]) => coordinates.some(([x, y]) => x === px && y === py)),
    );

    return inBounds && !overlaps;
  }

  allShipsSunk() {
    // Returns true if every ship on the board has sunk
    return this.ships.every((entry) => entry.ship.isSunk());
  }
}
