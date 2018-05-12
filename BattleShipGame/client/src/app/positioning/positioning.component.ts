import { Component, OnInit, ViewChild } from '@angular/core';
import { ElModule } from 'element-angular'
import { Tile } from '../tile';
import { Ship } from '../ship';

@Component({
  selector: 'app-positioning',
  templateUrl: './positioning.component.html',
  styleUrls: ['./positioning.component.css']
})
export class PositioningComponent implements OnInit {
  tiles: Tile[] = new Array();
  TwoHShip: Tile[] = new Array(); 
  ThreeHShip: Tile[] = new Array();
  FourHShip: Tile[] = new Array();
  FiveHShip: Tile[] = new Array();
  TwoVShip: Tile[] = new Array(); 
  ThreeVShip: Tile[] = new Array(); 
  FourVShip: Tile[] = new Array();
  FiveVShip: Tile[] = new Array();
  destroyer: number = 4;
  submarine: number = 2;
  ironclad: number = 2;
  carrier: number = 1;
  Ships: Ship[] = new Array();
  selected: String;

  constructor() {
    this.TwoHShip=this.createHorizontalShip(2,0);
    this.ThreeHShip=this.createHorizontalShip(3,60);
    this.FourHShip=this.createHorizontalShip(4,120);
    this.FiveHShip=this.createHorizontalShip(5,180);
    this.TwoVShip=this.createVerticalShip(2,260);
    this.ThreeVShip=this.createVerticalShip(3,320);
    this.FourVShip=this.createVerticalShip(4,380);
    this.FiveVShip=this.createVerticalShip(5,440);
   }

  ngOnInit() {
    this.populateTiles();
  }
 
  populateTiles(): void {
    // make the grid columns and rows
    for (var i = 0; i < 10; i++) { //columns
        for (var j = 0; j < 10; j++) { //rows
    
            var ident: string;
            // give each div element a unique id based on its row and column, like "00"
            ident = String(j) + i;		
    
            // set each grid square's coordinates: multiples of the current row or column number
            var topPosition = j * 50;
            var leftPosition = i * 50;			
    
            // use CSS absolute positioning to place each grid square on the page
            var t = topPosition + 'px';
            var l = leftPosition + 'px';	
            this.tiles.push({id:ident,top:t,left:l});		
          }
      }
}

createHorizontalShip(x,position): Tile[] {
  var HorizontalShip: Tile[] = new Array();
  for (var i = 0; i < x; i++) { 
    for (var j = 0; j < 1; j++) {
      var id: string;
      id = "Horizontal" + x;		

      var topPosition = j * 50+position;
      var leftPosition = i * 50;			

      var t = topPosition + 'px';
      var l = leftPosition + 'px';	
      HorizontalShip.push({id:id,top:t,left:l});	
    }
  }
  return HorizontalShip;
}

createVerticalShip(x,position): Tile[] {
  var VerticalShip: Tile[] = new Array();
  for (var i = 0; i < 1; i++) { 
    for (var j = 0; j < x; j++) {
      var id: string;
      id = "Vertical" + x;		

      var topPosition = j * 50;
      var leftPosition = i * 50+position;			

      var t = topPosition + 'px';
      var l = leftPosition + 'px';	
      VerticalShip.push({id:id,top:t,left:l});	
    }
  }
  return VerticalShip;
}

  click2H(): void
  {
    this.selected = "2H";
  }

  click3H(): void
  {
    this.selected = "3H";
  }

  click4H(): void
  {
    this.selected = "4H";
  }

  click5H(): void
  {
    this.selected = "5H";
  }

  click2V(): void
  {
    this.selected = "2V";
  }

  click3V(): void
  {
    this.selected = "3V";
  }

  click4V(): void
  {
    this.selected = "4V";
  }

  click5V(): void
  {
    this.selected = "5V";
  }

  toggle(event) {  // this is the click in the gameboard
    console.log(event.target.id); 
    event.target.style.background='red';
    
 }
  

}
