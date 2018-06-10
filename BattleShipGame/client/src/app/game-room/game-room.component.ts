import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { MessageHttpService } from '../message-http.service';
import { Game } from '../game';
import { PositioningService } from '../positioning.service';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit {
  private errmessage = undefined;
  private wait: boolean = false;
  private availableGames: boolean = false; //see if there are available games
  private create: boolean = true;
  //private status: boolean = false;
  private games: Game[] = new Array();
  private start: boolean = false;
  private intervalID;
  private intervalID2;
  private intervalID3;

  constructor(private us: UserService, private router: Router, private mhs: MessageHttpService, private ps:PositioningService) { }

  ngOnInit() {
    this.intervalID3 = setInterval(this.remove_finished.bind(this), 10000); //check if there are games finished to remove
  }

  logout() {
    this.us.logout();
    this.stop_intervals();
    this.router.navigate(['/']);
  }

  profile(){
    this.stop_intervals();
    this.router.navigate(['/profile']);
  }

  stop_intervals()
  {
    if (this.intervalID) {
      clearInterval(this.intervalID);
    }
    if (this.intervalID2) {
      clearInterval(this.intervalID2);
    }
    if (this.intervalID3) {
      clearInterval(this.intervalID3);
    }
  }

  createGame() {
    this.wait = true;
    this.create = false;
    this.ps.player = 1;
    console.log(this.us.get_username()+" is player"+this.ps.player);
    this.mhs.create_game().subscribe( () => {
      console.log('Game created');
    }, (error) => {
      console.log('Error occurred while creating game: ' + error);
    });
    this.intervalID = setInterval(this.checkGame.bind(this), 2000); //check if someone joins the game
  }
  
  checkList(g : Game): boolean
  {
    if(g.full)
      return false;
    return true;
  }

  gamesList(){
    this.get_games();
    this.intervalID2 = setInterval(this.get_games.bind(this), 2000);
  }

  get_games() {
    var ok: boolean = false;
    this.mhs.get_games().subscribe(
      ( games ) => {
        if(games.length==0)
          this.availableGames=true;
        else
          this.availableGames=false;
        for(var i=0;i<games.length;i++)
        {
          if(!games[i].full)
            ok=true;
        }
        if(ok)
        {
          this.availableGames=false;
        }
        else
        {
          this.availableGames=true;
        }
          this.games = games;
            
      } , (err) => {

        // Try to renew the token
        this.us.renew().subscribe( () => {
          // Succeeded
          this.get_games();
        }, (err2) => {
          // Error again, we really need to logout
          this.logout();
        } );
      }
    );
    
  }

  join(s: string){
    console.log("Join : "+s);
    this.ps.player = 2;
    console.log(this.us.get_username()+" is player"+this.ps.player);
    this.mhs.join_game(s).subscribe( ( gameId ) => {
      this.ps.gameId = gameId;
      console.log('Game joined');
      console.log('Game id : '+this.ps.gameId);
    }, (error) => {
      console.log('Error occurred while creating game: ' + error);
    });
    this.stop_intervals();
    this.router.navigate(['/positioning'])
  }

  remove_finished()
  {
    console.log("Checking to remove");
    this.mhs.remove_finished().subscribe( (game) => {
      console.log('Removed game : '+game);
    }, (error) => {
      console.log('Error occurred while removing finished games: ' + error);
    });
  }

  checkGame(){
    console.log("Checking game status : ");
    this.mhs.check_game().subscribe( (response) => {
      console.log("status primit:"+response.status);
      if(response.status==true)
        {this.start = response.status;
          this.stop_intervals();
          this.router.navigate(['/positioning']);}
      this.ps.gameId = response.id;
      console.log("Game Id : "+this.ps.gameId);
      console.log('Game checked');
    }, (error) => {
      console.log('Error occurred while checking game: ' + error);
    });
  }


}
