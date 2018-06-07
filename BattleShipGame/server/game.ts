import {Ship} from './ship';

export class Game {

    idPlayerOne: String;
    idPlayerTwo: String;
    full: boolean;
    gameID: String;
    turn: Number; // 1 first player , 2 second player
    shipsOne: Ship[] = new Array();
    shipsTwo: Ship[] = new Array();

    constructor(id: String) {
        this.idPlayerOne=id;
        this.full=false;
        console.log("Game created in server by: "+this.idPlayerOne.toString);
        }
    
    joinSecondPlayer(id: String)
    {
        this.idPlayerTwo=id;
        this.full=true;
        console.log("Second player joined: "+this.idPlayerTwo.toString);
        this.turn = Math.floor(Math.random() * 2) + 1;
    }

    getFull()
    {
        return this.full;
    }

    createGameId()
    {
        if(this.full)
        {
            this.gameID=this.idPlayerOne+":"+this.idPlayerTwo;

        }
    }
    addToPlayerOne(s : Ship): void {
        this.shipsOne.push(s);
    }
    addToPlayerTwo(s : Ship): void {
        this.shipsTwo.push(s);
    }
}