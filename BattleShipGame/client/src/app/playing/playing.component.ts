import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { ElModule } from 'element-angular'
import { PositioningService } from '../positioning.service';
import { Tile } from '../tile';
import { Ship } from '../ship';
import { Piece } from '../piece';
import { MessageService } from '../message.service';
import {Message} from '../Message';
import { UserService } from '../user.service';
import { SocketioService } from '../socketio.service';
import { Router } from '@angular/router';
import { MessageHttpService } from '../message-http.service';

@Component({
  selector: 'app-playing',
  templateUrl: './playing.component.html',
  styleUrls: ['./playing.component.css']
})



export class PlayingComponent implements OnInit {
  tilesPositioning: Tile[] = new Array();
  tilesShooting: Tile[] = new Array();
  color: string;
  show: boolean = true;
  alreadyShot: string[] = new Array();

  private message: Message;
  private recvmessage: Message;

  @Output() posted = new EventEmitter<Message>();

  constructor(private router: Router, private ps: PositioningService, private mhs: MessageHttpService, private us: UserService, private sio: SocketioService ) { }

  ngOnInit() {
    this.ps.warning = null;
    this.populateTiles(this.tilesShooting);
    this.populateTiles(this.tilesPositioning);
  }

  populateTiles(tiles: Tile[]): void {
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
            tiles.push({id:ident,top:t,left:l});	
          }
      }
}

toggle(event) {
    //code for my board
    console.log(event.target.id);
    this.show=false;
    var board = document.querySelector("#gameboard");
    var children = board.children;
    console.log("board children length "+children.length);
    //console.log("Last Message: "+this.messages.pop());
    for(var k=0;k < this.ps.Ships.length;k++)
    {
      var ships: Piece[] = this.ps.Ships[k].getShip();
      if(ships.length==2)
          this.color = '#ffa64d';
      if(ships.length==3)
          this.color = '#ff99cc';
      if(ships.length==4)
          this.color = '#66ff66';
      if(ships.length==5)
          this.color = '#e6b3cc';
      for(var j=0;j < ships.length;j++)
      {
        var idForColor : String = ships[j].y+ships[j].x;
        console.log(idForColor);
        console.log(this.color);
        for(var i=0;i<children.length;i++)
          {
            if(children[i].getAttribute('id')==idForColor)
            {
              (<HTMLElement>children[i]).style.background=this.color;
            }
          }
      }
    }
   

    //code for shooting
    var board2 = document.querySelector("#gameboard-shooting");
    var children2 = board2.children;
    var check = true;
    for(var k=0; k<this.alreadyShot.length;k++)
        {
          if(this.alreadyShot[k]==event.target.id)
            {
             this.ps.warning="You already shot at this position!";
              check = false;
            }
        }
    if(check)
      {
        this.ps.warning = null;
        for(var i=0;i<children2.length;i++)
          {
          if(children2[i].getAttribute('id')==event.target.id)
            {
             (<HTMLElement>children2[i]).style.background="red";  //de aici luam id-ul unde am dat
              this.alreadyShot.push(event.target.id);
              this.message.content=event.target.id;
            }
          }
      }             
    //this.post_message();   
    console.log("Shots: "+this.alreadyShot);
  }

  buttonShow(): boolean{
    return this.show;
  }


}
