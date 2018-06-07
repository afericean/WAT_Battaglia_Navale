import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { MessageHttpService } from '../message-http.service';
import { Game } from '../game';

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

  constructor(private us: UserService, private router: Router, private mhs: MessageHttpService) { }

  ngOnInit() {
  }

  logout() {
    this.us.logout();
    this.router.navigate(['/']);
  }

  profile(){
  this.router.navigate(['/profile']);
  }

  createGame() {
    this.wait = true;
    this.create = false;
    this.mhs.create_game().subscribe( () => {
      console.log('Game created');
    }, (error) => {
      console.log('Error occurred while creating game: ' + error);
    });
    
  }
  
  checkList(g : Game): boolean
  {
    if(g.full)
      return false;
    return true;
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
    this.mhs.join_game(s).subscribe( (s) => {
      console.log('Game joined');
    }, (error) => {
      console.log('Error occurred while creating game: ' + error);
    });
    this.router.navigate(['/positioning'])
  }

  checkGame(){
    console.log("Checking game status : ");
    this.mhs.check_game().subscribe( (status) => {
      console.log("status primit:"+status);
      if(status==true)
        this.router.navigate(['/positioning']);
      console.log('Game checked');
    }, (error) => {
      console.log('Error occurred while checking game: ' + error);
    });
  }


}
