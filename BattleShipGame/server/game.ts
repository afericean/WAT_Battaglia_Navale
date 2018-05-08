export class Game {
    matrixPlayerOne: number[][];
    matrixPlayerTwo: number[][];

    constructor() {
        for(var i: number = 0; i < 10; i++) {
            for(var j: number = 0; j< 10; j++) {
                this.matrixPlayerOne[i][j] = 0;
                this.matrixPlayerTwo[i][j] = 0;
            }
        }
        //console.log(this.matrixPlayerOne , this.matrixPlayerTwo);
    }

    /*populateMatrixPlayerOne(ships: ship[]): void
    {

    }*/
}