import { Injectable } from '@angular/core';
import { Ship } from './ship';
import { Piece } from './piece';

@Injectable()
export class PositioningService {
  selected: String = new String();
  Ships: Ship[] = new Array();
  warning: String = null;
  available: number[] = [4, 2, 2, 1];
  undoArray: any[] = new Array();
  selectedColor: string = null;
  info: boolean = true;
  player: number; //this is so the player knows his turn
  gameId: string;
  constructor() { }

}
