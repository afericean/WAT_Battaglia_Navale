import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';
import { MessageEditorComponent } from './message-editor/message-editor.component';
import { MessageListComponent } from './message-list/message-list.component';

// Services
import { MessageService } from './message.service';
import { MessageHttpService } from './message-http.service';
import { UserService } from './user.service';
import { UserHttpService } from './user-http.service';
import { UserLoginComponent } from './user-login/user-login.component';
import { AppRoutingModule } from './/app-routing.module';
import { UserSignupComponent } from './user-signup/user-signup.component';
import { SocketioService } from './socketio.service';
import { GameRoomComponent } from './game-room/game-room.component';
import { ProfileComponent } from './profile/profile.component';


@NgModule({
  declarations: [
    AppComponent,
    MessageEditorComponent,
    MessageListComponent,
    UserLoginComponent,
    UserSignupComponent,
    GameRoomComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    {provide: UserService, useClass: UserHttpService },
    {provide: SocketioService, useClass: SocketioService },
    {provide: MessageService, useClass: MessageHttpService /* Here we can select the specifc service instance */}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
