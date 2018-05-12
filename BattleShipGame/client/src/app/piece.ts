export class Piece {
    x: string;
    y: string;
    hit: boolean;

    constructor(x: string,y: string) {
        this.x = x;
        this.y = y;
        this.hit = false;
    }
}