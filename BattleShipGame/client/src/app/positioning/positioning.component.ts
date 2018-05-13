import { Component, OnInit, ViewChild } from '@angular/core';
import { ElModule } from 'element-angular'
import { Tile } from '../tile';
import { Ship } from '../ship';
import { Piece } from '../piece';

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
  selected: String = new String();
  warning: String = null;
  selectedColor: string = null;
  selectedInfo: string = null;
  undoArray: any[] = new Array();
  info: boolean = true;
  continue: boolean = false;

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
            var topPosition = j * 10;
            var leftPosition = i * 10;			
    
            // use CSS absolute positioning to place each grid square on the page
            var t = topPosition + '%';
            var l = leftPosition + '%';	
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
    this.selectedInfo = "Horizontal Destroyer"
    this.selected = "2H";
    this.selectedColor = "#996633";
    this.warning = null;
    this.info=false;
  }

  click3H(): void
  {
    this.selectedInfo = "Horizontal Submarine"
    this.selected = "3H";
    this.selectedColor = "#ff0066";
    this.warning=null;
    this.info=false;
  }

  click4H(): void
  {
    this.selectedInfo = "Horizontal Ironclad"
    this.selected = "4H";
    this.selectedColor = "#009900";
    this.warning=null;
    this.info=false;
  }

  click5H(): void
  {
    this.selectedInfo = "Horizontal Aircraft Carrier"
    this.selected = "5H";
    this.selectedColor = "#cc0099";
    this.warning=null;
    this.info=false;
  }

  click2V(): void
  {
    this.selectedInfo = "Vertical Destroyer"
    this.selected = "2V";
    this.selectedColor = "#996633";
    this.warning=null;
    this.info=false;
  }

  click3V(): void
  {
    this.selectedInfo = "Vertical Submarine"
    this.selected = "3V";
    this.selectedColor = "#ff0066";
    this.warning=null;
    this.info=false;
  }

  click4V(): void
  {
    this.selectedInfo = "Vertical Ironclad"
    this.selected = "4V";
    this.selectedColor = "#009900"
    this.warning=null;
    this.info=false;
  }

  click5V(): void
  {
    this.selectedInfo = "Vertical Aircraft Carrier"
    this.selected = "5V";
    this.selectedColor = "#cc0099";
    this.warning=null;
    this.info=false;
  }

  toggle(event) {  // this is the click in the gameboard
    if(this.selected.length) //check if something selected
    {
      console.log(event.target.id); 
      var board = document.querySelector("#gameboard");
      var children = board.children;
      var id : string = event.target.id;
      var size = Number(this.selected[0]);
      var ok : boolean = true;
    if(this.selected[1]=="H")
        {
          var illegal : number = Number(id[1])+size-2;
          console.log(illegal);
          var k=0;
          var nextId : string = id;
          while(k<=size){
              console.log("nextId "+nextId);
              for(var i=0;i<children.length;i++) {
                if(children[i].getAttribute('id')==nextId)
                {
                  var style = window.getComputedStyle(<HTMLElement>children[i]);
                  var background = style.getPropertyValue('background-color');
                  background = this.rgb2hex(background);
                  if(background!="#f6f8f9")
                      ok = false;
                }
            }
            nextId = id[0] + String((Number(id[1])+k));
            k++;
            if(ok==false)
              break;
          }
          if(ok==false)
          {
            this.warning = "Incorrect position!";
          }
          else if(illegal>=9)
              {
                this.warning = "Incorrect position!";
              }
                else
                {
                  this.warning=null;
                  var ship = new Ship();
                  ship.add(id[1],id[0]);
                  var lastBoat: string[] = new Array(); //for undo
                  lastBoat.push(id);
                  event.target.style.background=this.selectedColor;
                  var k=1;
                  console.log(size);
                  while(k<=size-1)
                    { var nextId : string;
                      nextId = id[0] + String((Number(id[1])+1));
                      lastBoat.push(nextId);
                      //console.log("Next: "+nextId);
                      for(var i=0;i<children.length;i++) {
                        if(children[i].getAttribute('id')==nextId)
                          {
                            //console.log("True");
                            id = (<HTMLElement>children[i]).id;
                            ship.add(id[1],id[0]);
                            (<HTMLElement>children[i]).style.background=this.selectedColor;
                          }
                      }
                      k++;
                    }
                  this.Ships.push(ship);
                  this.undoArray.push(lastBoat);
                  if(size==2)
                    {this.destroyer--;
                     // this.continueChecker();
                    }
                  if(size==3)
                    {this.submarine--;
                     // this.continueChecker();
                    }
                  if(size==4)
                    {this.ironclad--;
                     // this.continueChecker();
                    }
                  if(size==5)
                    {this.carrier--;
                      //this.continueChecker();
                    }
                    
                  }
          
              }
              else if(this.selected[1]=="V")
                    {
                      illegal = Number(id[0])+size-2;
                      console.log(illegal);
                      var k=0;
                      var nextId : string = id;
                      while(k<=size){
                          console.log("nextId "+nextId);
                          for(var i=0;i<children.length;i++) {
                            if(children[i].getAttribute('id')==nextId)
                            {
                              var style = window.getComputedStyle(<HTMLElement>children[i]);
                              var background = style.getPropertyValue('background-color');
                              background = this.rgb2hex(background);
                              if(background!="#f6f8f9")
                                  ok = false;
                            }
                        }
                        nextId = String((Number(id[0])+k)) + id[1];
                        k++;
                        if(ok==false)
                          break;
                      }
                      if(ok==false)
                      {
                        this.warning = "Incorrect position!";
                      }
                          else if(illegal>=9)
                          {
                            this.warning = "Incorrect position!";
                          }
                          else
                          {
                            this.warning=null;
                            var ship = new Ship();
                            ship.add(id[1],id[0]);
                            var lastBoat: string[] = new Array();  //for undo
                            lastBoat.push(id);
                            event.target.style.background=this.selectedColor;
                            var k=1;
                            console.log(size);
                            while(k<=size-1)
                              { var nextId : string;
                                nextId = String((Number(id[0])+1))+ id[1];
                                lastBoat.push(nextId);
                                //console.log("Next: "+nextId);
                                for(var i=0;i<children.length;i++) {
                                  if(children[i].getAttribute('id')==nextId)
                                    {
                                      //console.log("True");
                                      id = (<HTMLElement>children[i]).id;
                                      ship.add(id[1],id[0]);
                                      (<HTMLElement>children[i]).style.background=this.selectedColor;
                                    }
                                }
                                k++;
                              }
                            this.Ships.push(ship);
                            this.undoArray.push(lastBoat);
                            if(size==2)
                              {this.destroyer--;
                                //this.continueChecker();
                              }
                            if(size==3)
                              {this.submarine--;
                                //this.continueChecker();
                              }
                            if(size==4)
                              {this.ironclad--;
                                //this.continueChecker();
                              }
                            if(size==5)
                              {this.carrier--;
                                //this.continueChecker();
                              }
                  
                            }
                    }
    console.log(this.Ships);
    }
 }
 rgb2hex(rgb) { //for reading color
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
  }
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}
  undo() {
    if(this.undoArray.length)
    {
      var boatToDelete = this.undoArray.pop();
      if(boatToDelete.length)
      {
        this.Ships.pop();
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
    console.log(this.Ships);
  }

 /* continueChecker() {
    if(this.destroyer==0 && this.submarine==0&&this.ironclad==0&&this.carrier==0)
      this.continue = true;
    console.log("Continue: "+this.continue);
  }*/
}
