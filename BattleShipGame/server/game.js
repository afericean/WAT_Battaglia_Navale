"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Game {
    constructor(id) {
        this.shipsOne = new Array();
        this.shipsTwo = new Array();
        this.privateMsgArray = new Array();
        this.idPlayerOne = id;
        this.full = false;
        this.readyPlayerOne = false;
        this.readyPlayerTwo = false;
        this.finished = false;
        console.log("Game created in server by: " + this.idPlayerOne.toString);
    }
    addMessage(m) {
        this.privateMsgArray.push(m);
    }
    getPrivateMsgArr() {
        return this.privateMsgArray;
    }
    joinSecondPlayer(id) {
        this.idPlayerTwo = id;
        this.full = true;
        console.log("Second player joined: " + this.idPlayerTwo.toString);
        this.turn = Math.floor(Math.random() * 2) + 1;
    }
    getFull() {
        return this.full;
    }
    createGameId() {
        if (this.full) {
            this.gameID = this.idPlayerOne + ":" + this.idPlayerTwo;
        }
    }
    addToPlayerOne(s) {
        this.shipsOne.push(s);
    }
    addToPlayerTwo(s) {
        this.shipsTwo.push(s);
    }
    changeTurn() {
        if (this.turn == 1) {
            this.turn = 2;
        }
        else if (this.turn == 2) {
            this.turn = 1;
        }
    }
}
exports.Game = Game;
//# sourceMappingURL=game.js.map