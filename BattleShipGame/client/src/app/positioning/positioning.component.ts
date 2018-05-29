import { Component, OnInit, ViewChild } from '@angular/core';
import { ElModule } from 'element-angular'
import { Tile } from '../tile';
import { Ship } from '../ship';
import { Piece } from '../piece';
import { PositioningService } from '../positioning.service';

@Component({
  selector: 'app-positioning',
  templateUrl: './positioning.component.html',
  styleUrls: ['./positioning.component.css']
})
export class PositioningComponent implements OnInit {
  TwoHShip: Tile[] = new Array(); 
  ThreeHShip: Tile[] = new Array();
  FourHShip: Tile[] = new Array();
  FiveHShip: Tile[] = new Array();
  TwoVShip: Tile[] = new Array(); 
  ThreeVShip: Tile[] = new Array(); 
  FourVShip: Tile[] = new Array();
  FiveVShip: Tile[] = new Array();
  selectedInfo: string = null;
  

  constructor(private ps: PositioningService) {
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
    this.selectedInfo = "Horizontal Destroyer"
    this.ps.selected = "2H";
    this.ps.selectedColor = "#996633";
    this.ps.warning = null;
    this.ps.info=false;
    if(this.ps.available[0]==0)
    {
      this.ps.warning = "You do not have anymore Destroyers available!";
    }
  }

  click3H(): void
  {
    this.selectedInfo = "Horizontal Submarine"
    this.ps.selected = "3H";
    this.ps.selectedColor = "#ff0066";
    this.ps.warning=null;
    this.ps.info=false;
    if(this.ps.available[1]==0)
    {
      this.ps.warning = "You do not have anymore Submarines available!";
    }
  }

  click4H(): void
  {
    this.selectedInfo = "Horizontal Ironclad"
    this.ps.selected = "4H";
    this.ps.selectedColor = "#009900";
    this.ps.warning=null;
    this.ps.info=false;
    if(this.ps.available[2]==0)
    {
      this.ps.warning = "You do not have anymore Ironclads available!";
    }
  }

  click5H(): void
  {
    this.selectedInfo = "Horizontal Aircraft Carrier"
    this.ps.selected = "5H";
    this.ps.selectedColor = "#cc0099";
    this.ps.warning=null;
    this.ps.info=false;
    if(this.ps.available[3]==0)
    {
      this.ps.warning = "You do not have anymore Aircraft Carriers available!";
    }
  }

  click2V(): void
  {
    this.selectedInfo = "Vertical Destroyer"
    this.ps.selected = "2V";
    this.ps.selectedColor = "#996633";
    this.ps.warning=null;
    this.ps.info=false;
    if(this.ps.available[0]==0)
    {
      this.ps.warning = "You do not have anymore Destroyers available!";
    }
  }

  click3V(): void
  {
    this.selectedInfo = "Vertical Submarine"
    this.ps.selected = "3V";
    this.ps.selectedColor = "#ff0066";
    this.ps.warning=null;
    this.ps.info=false;
    if(this.ps.available[1]==0)
    {
      this.ps.warning = "You do not have anymore Submarines available!";
    }
  }

  click4V(): void
  {
    this.selectedInfo = "Vertical Ironclad"
    this.ps.selected = "4V";
    this.ps.selectedColor = "#009900"
    this.ps.warning=null;
    this.ps.info=false;
    if(this.ps.available[2]==0)
    {
      this.ps.warning = "You do not have anymore Ironclads available!";
    }
  }

  click5V(): void
  {
    this.selectedInfo = "Vertical Aircraft Carrier"
    this.ps.selected = "5V";
    this.ps.selectedColor = "#cc0099";
    this.ps.warning=null;
    this.ps.info=false;
    if(this.ps.available[3]==0)
    {
      this.ps.warning = "You do not have anymore Aircraft Carriers available!";
    }
  }

  undo() {
    if(this.ps.undoArray.length)
    {
      var boatToDelete = this.ps.undoArray.pop();
      this.ps.available[boatToDelete.length-2]++;
      if(boatToDelete.length)
      {
        this.ps.Ships.pop();
        var board = document.querySelector("#gameboard");
        var children = board.children;
        while(boatToDelete.length)
          {
            var k = boatToDelete.pop();
            for(var i=0;i<children.length;i++) {
              if(children[i].getAttribute('id')==k)
                {
                  (<HTMLElement>children[i]).style.background="#f6f8f9";
                }
            }
          }
      }
  }
    //console.log(this.undoArray);
    console.log(this.ps.Ships);
  }

}
