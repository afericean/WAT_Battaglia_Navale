import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { MessageHttpService } from '../message-http.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  private users: any[] = [];

  constructor(private us: UserService, private router: Router, private mhs: MessageHttpService) { }

  ngOnInit() {
    this.get_users();
    /*this.us.renew().subscribe( () => {
      console.log('Renew succeded: ' + this.us.get_id() );
      //this.router.navigate(['/game-room']);
    }, (err) => {
      console.log('Renew error: ' + JSON.stringify(err.error.errormessage) );
    });*/
  }


  get_users(){
    console.log("Getting users :");
    this.mhs.get_users().subscribe(
      ( users ) => {
        console.log(users);
        this.users = users;
      }, (error) => {
        console.log('Error occurred while getting the users: ' + error);
    });
  }

  logout() {
    this.us.logout();
    this.router.navigate(['/']);
  }

  gameroom(){
    this.router.navigate(['/game-room']);
    }
}
