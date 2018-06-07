import { Piece } from './piece';

export class Ship {
    Ship: Piece[] = new Array();
    add(x,y): void {
        var newPiece= new Piece(x,y);
        this.Ship.push(newPiece);
    }
    getShip(): Piece[] {
        return this.Ship;
    }
    getPiece(x: number): Piece{
        return this.Ship[x];
    }
}