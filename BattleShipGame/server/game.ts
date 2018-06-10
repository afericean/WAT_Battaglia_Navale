import {Ship} from './ship';
import {PrivateMessage} from './privateMessage';

export class Game {

    idPlayerOne: String;
    idPlayerTwo: String;
    full: boolean;
    gameID: string;
    turn: Number; // 1 first player , 2 second player
    shipsOne: Ship[] = new Array();
    shipsTwo: Ship[] = new Array();
    privateMsgArray: PrivateMessage[] = new Array();
    xOne: string;
    xTwo: string;
    readyPlayerOne: boolean;
    readyPlayerTwo: boolean;
    finished: boolean;

    constructor(id: String) {
        this.idPlayerOne=id;
        this.full=false;
        this.readyPlayerOne = false;
        this.readyPlayerTwo = false;
        this.finished = false;
        console.log("Game created in server by: "+this.idPlayerOne.toString);
        }
    
    addMessage(m: PrivateMessage)
    {
        this.privateMsgArray.push(m);
    }

    getPrivateMsgArr()
    {
        return this.privateMsgArray;
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
    changeTurn()
    {
        if(this.turn==1)
        {
            this.turn = 2;
        }
        else if(this.turn==2)
                {
                    this.turn = 1;
                }
    }
}