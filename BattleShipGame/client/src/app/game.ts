export class Game {

    idPlayerOne: String;
    idPlayerTwo: String;
    full: boolean;

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
    }

    public getFull() : boolean
    {
        return this.full;
    }
}