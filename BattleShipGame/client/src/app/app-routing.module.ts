import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UserLoginComponent } from './user-login/user-login.component';
import { AppComponent } from './app.component';
import { MessageListComponent } from './message-list/message-list.component';
import { UserSignupComponent } from './user-signup/user-signup.component';
import { GameRoomComponent } from './game-room/game-room.component';
import{ ProfileComponent } from './profile/profile.component';
import{ PositioningComponent } from './positioning/positioning.component';
import{ PlayingComponent } from './playing/playing.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: UserLoginComponent },
  { path: 'signup', component: UserSignupComponent },
  { path: 'messages', component: MessageListComponent },
  { path: 'game-room', component: GameRoomComponent },
  { path: 'profile',component: ProfileComponent },
  { path: 'positioning',component: PositioningComponent },
  { path: 'playing',component: PlayingComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
