import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit {

  constructor(private us: UserService, private router: Router) { }

  ngOnInit() {
  }

  logout() {
    this.us.logout();
    this.router.navigate(['/']);
  }

  gamero(){
    this.router.navigate(['/game-room'])
  }

  profile(){
  this.router.navigate(['/profile']);
  }
  go(){
    this.router.navigate(['positioning']);
  }
}
