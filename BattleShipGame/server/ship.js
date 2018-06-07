"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const piece_1 = require("./piece");
class Ship {
    constructor() {
        this.Ship = new Array();
    }
    add(x, y) {
        var newPiece = new piece_1.Piece(x, y);
        this.Ship.push(newPiece);
    }
    getShip() {
        return this.Ship;
    }
    getPiece(x) {
        return this.Ship[x];
    }
}
exports.Ship = Ship;
//# sourceMappingURL=ship.js.map