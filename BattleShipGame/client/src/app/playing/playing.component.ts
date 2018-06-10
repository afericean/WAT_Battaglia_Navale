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
import {PrivateMessage} from '../privateMessage';
import { Observable } from 'rxjs/Observable';



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
  messageTurn: boolean = false;
  //shot: boolean = false;
  private intervalID;
  private intervalID2;
  private intervalID3;
  private privateMessage : string = null;
  private prvMsgArr : PrivateMessage[] = new Array();
  private warning : string = null;
  private hit : string;
  private finish : string;

  @Output() posted = new EventEmitter<Message>();

  constructor(private router: Router, private ps: PositioningService, private mhs: MessageHttpService, private us: UserService) { }

  ngOnInit() {
    this.ps.warning = null;
    this.populateTiles(this.tilesShooting);
    this.populateTiles(this.tilesPositioning);
    this.get_turn();
    this.intervalID = setInterval(this.get_turn.bind(this), 1500); //check if it is your turn
    this.intervalID2 = setInterval(this.get_private_messages.bind(this), 1500); //get the private messages
    this.intervalID3 = setInterval(this.get_X.bind(this), 1500); //get the X
  }

  public go_to_game_room(){
    if (this.intervalID) {
      clearInterval(this.intervalID);
    }
    if (this.intervalID2) {
      clearInterval(this.intervalID2);
    }
    if (this.intervalID3) {
      clearInterval(this.intervalID3);
    }
    this.router.navigate(['/game-room']);
  }

  public get_victory(){
    console.log("Getting victory : ");
    this.mhs.get_victory().subscribe( (ok) => {
      console.log(" returned "+JSON.stringify(ok));
      if(ok.won&&ok.lost==false)
      {
        this.finish="You have won!";
        setTimeout(this.go_to_game_room.bind(this), 4000);
      }
      else if(ok.won==false&&ok.lost)
      {
        this.finish="You have lost!";
        setTimeout(this.go_to_game_room.bind(this), 4000);
      }
      else if(ok.won&&ok.lost)
      {
        this.finish="You have lost!";
        setTimeout(this.go_to_game_room.bind(this), 4000);
      }
    }, (error) => {
      console.log('Error occurred while getting victory: ' + error);
    });
  }

  set_empty()
  {
    this.privateMessage = null;
  }

  public get_private_messages() {
    this.mhs.get_private_messages().subscribe(
      ( prvMsg ) => {
        this.prvMsgArr = prvMsg;

      } , (err) => {

        // Try to renew the token
        this.us.renew().subscribe( () => {
          // Succeeded
          this.get_private_messages();
        }, (err2) => {
          // Error again, we really need to logout
          this.logout();
        } );
      }
    );
  }

  logout() {
    this.us.logout();
    this.router.navigate(['/']);
  }

  send_message()
  {
    this.mhs.send_message( this.privateMessage ).subscribe( (arr) => {
      console.log("The array of messages from the game: "+JSON.stringify(arr));
      this.set_empty();
    }, (error) => {
      console.log('Error occurred while sending message: ' + error);
    });
  }

  checkTurn()
  {
    //console.log("Turn has changed : "+this.messageTurn);
    if(this.messageTurn)
      {
        //console.log("My turn!");
        return true;
      }
    else
      {
        //console.log("Not my turn!");
        return false;
      }
  }

  get_shot(pos : string, elem : HTMLElement, children : HTMLCollection){
    console.log("Getting shot : ");
    this.mhs.get_shot(pos).subscribe( (ok) => {
      console.log("Shot : "+ok.ok);
      if(ok.turn)
         {if(ok.arr.length)
              {
                console.log("Full ship hit : "+ok.arr);
                var arr : string[] = ok.arr;
                for(var k=0;k<arr.length;k++)
                {
                  for(var i=0;i<children.length;i++)
                  {
                  if(children[i].getAttribute('id')==arr[k])
                    {
                      (<HTMLElement>children[i]).style.background="#8C001A";
                    }
                  }
                }
                
              }
          else if(ok.ok)
                    elem.style.background="red";
                else
                    elem.style.background="blue";
          } 
          else{
            this.messageTurn=false;
          }
    }, (error) => {
      console.log('Error occurred while getting color: ' + error);
    });
  }

  get_turn(){
    console.log("Getting turn status : ");
    this.mhs.get_turn().subscribe( (turn) => {
      console.log("turn received: "+turn);
      console.log("I am player : "+this.ps.player);
      if(turn==this.ps.player)    
        this.messageTurn=true;
      console.log('Game checked');
    }, (error) => {
      console.log('Error occurred while checking game: ' + error);
    });
  }

  get_X(){
    console.log("Getting the X : ");
    this.mhs.get_X().subscribe( (hit) => {
      console.log("hit received:"+hit);   
        this.hit=hit;
      console.log('Hit saved');
    }, (error) => {
      console.log('Error occurred while getting the X: ' + error);
    });
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

rgb2hex(rgb) { //for reading color
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
  }
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
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
    for(var i=0;i<children2.length;i++) {
      if(children2[i].getAttribute('id')==event.target.id)
      {
        var style = window.getComputedStyle(<HTMLElement>children2[i]);
        var background = style.getPropertyValue('background-color');
        background = this.rgb2hex(background);
        if(background!="#f6f8f9")
            {
            this.ps.warning="You already shot at this position!";
            check = false;
            } 
      }
    }
    this.get_turn();
    if(check&&this.checkTurn()) //now we can shoot
      {
        this.ps.warning = null;
        for(var i=0;i<children2.length;i++)
          {
          if(children2[i].getAttribute('id')==event.target.id)
            {
              this.get_shot(event.target.id,<HTMLElement>children2[i],children2);
              this.get_victory();
            }
          }
      }  
      else
      {
        if(event.target.id=="boat")
        {
          this.ps.warning=null;
        }
      }
      
    //try to put X
    console.log("Lovitura : "+this.hit);
    for(var i=0;i<children.length;i++)
          {
            if(children[i].getAttribute('id')==this.hit)
            {
              (<HTMLElement>children[i]).innerHTML="<center><h2>X</h2></center>"; //pune X unde s-a pus ultima oara - > si sa nu mai puna si la ala care da
            }
          }
  }

  buttonShow(): boolean{
    return this.show;
  }
  
}
