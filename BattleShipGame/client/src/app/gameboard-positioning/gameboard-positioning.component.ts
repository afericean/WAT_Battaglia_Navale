import { Component, OnInit, ViewChild } from '@angular/core';
import { ElModule } from 'element-angular'
import { Tile } from '../tile';
import { Ship } from '../ship';
import { Piece } from '../piece';
import { PositioningService } from '../positioning.service';
import { Router } from '@angular/router';
import { MessageHttpService } from '../message-http.service';

@Component({
  selector: 'app-gameboard-positioning',
  templateUrl: './gameboard-positioning.component.html',
  styleUrls: ['./gameboard-positioning.component.css']
})
export class GameboardPositioningComponent implements OnInit {
  tiles: Tile[] = new Array();
  constructor(private ps : PositioningService, private router: Router,private mhs: MessageHttpService) {}

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

toggle(event) {  // this is the click in the gameboard
  if(this.ps.selected.length) //check if something selected
  {
    console.log(event.target.id); 
    var board = document.querySelector("#gameboard");
    var children = board.children;
    console.log("board "+board);
    var id : string = event.target.id;
    var size = Number(this.ps.selected[0]);
    var ok : boolean = true;
  if(this.ps.available[size-2]==0)
  {
    this.ps.warning = "You have exhausted this type of ship!";
  }
  else if(this.ps.selected[1]=="H")
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
          this.ps.warning = "Incorrect position!";
        }
        else if(illegal>=9)
            {
              this.ps.warning = "Incorrect position!";
            }
              else
              {
                this.ps.warning=null;
                var ship = new Ship();
                ship.add(id[1],id[0]);
                var lastBoat: string[] = new Array(); //for undo
                lastBoat.push(id);
                event.target.style.background=this.ps.selectedColor;
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
                          (<HTMLElement>children[i]).style.background=this.ps.selectedColor;
                        }
                    }
                    k++;
                  }
                this.ps.Ships.push(ship);
                this.ps.undoArray.push(lastBoat);
                this.ps.available[size-2]--;
                }
        
            }
            else if(this.ps.selected[1]=="V")
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
                      this.ps.warning = "Incorrect position!";
                    }
                        else if(illegal>=9)
                        {
                          this.ps.warning = "Incorrect position!";
                        }
                        else
                        {
                          this.ps.warning=null;
                          var ship = new Ship();
                          ship.add(id[1],id[0]);
                          var lastBoat: string[] = new Array();  //for undo
                          lastBoat.push(id);
                          event.target.style.background=this.ps.selectedColor;
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
                                    (<HTMLElement>children[i]).style.background=this.ps.selectedColor;
                                  }
                              }
                              k++;
                            }
                          this.ps.Ships.push(ship);
                          this.ps.undoArray.push(lastBoat);
                          this.ps.available[size-2]--;
                          }
                  }
  console.log(this.ps.Ships);
  }
}
rgb2hex(rgb) { //for reading color
rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
function hex(x) {
    return ("0" + parseInt(x).toString(16)).slice(-2);
}
return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

continue(): boolean
{
  if(this.ps.Ships.length == 9)
    {console.log("Continue");
      return true;
    } else
    return false;
}

sendShip(s : Ship)
{
  console.log("Sending ships : ");
    this.mhs.send_ship(s).subscribe( () => {
      console.log('Ships sent');
    }, (error) => {
      console.log('Error occurred while sending ships: ' + error);
    });
}

info(): boolean{
  if(this.ps.info)
    {console.log("Continue");
      return true;
    } else
    return false;
}

play(){
  for(var i=0;i<this.ps.Ships.length;i++)
  {
    this.sendShip(this.ps.Ships[i]);
  }
  this.router.navigate(['/playing']);
}

}
