import { Ship } from "./ship.js";

export class Gameboard {
  constructor() {
    this.ships = [];
    this.attacks = [];
    this.missedAttacks = [];
  }

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
    if (alreadyAttacked) return;
    this.attacks.push(coordinates);

    // Find the ship occupying the attacked coordinates
    const target = this.ships.find((entry) =>
      entry.coordinates.some((position) => position[0] === coordinates[0] && position[1] === coordinates[1]),
    );

    if (target) {
      target.ship.hit();
    } else {
      this.missedAttacks.push(coordinates);
    }
  }

  allShipsSunk() {
    // Returns true if every ship on the board has sunk
    return this.ships.every((entry) => entry.ship.isSunk());
  }
}
