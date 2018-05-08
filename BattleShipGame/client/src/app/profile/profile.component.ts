import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private us: UserService, private router: Router) { }

  ngOnInit() {
  }

  logout() {
    this.us.logout();
    this.router.navigate(['/']);
  }

  gamero(){
    this.router.navigate(['/game-room']);
    }
}
