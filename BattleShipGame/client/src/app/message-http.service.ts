import { Injectable } from '@angular/core';
import { Message } from './Message';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { UserService } from './user.service';
import { Ship } from './ship';



@Injectable()
export class MessageHttpService {

  private messages = [];

  constructor( private http: HttpClient, private us: UserService ) {
    console.log('Message service instantiated');
    console.log('User service token: ' + us.get_token() );
   }


  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        'body was: ' + JSON.stringify(error.error));
    }

    // return an ErrorObservable with a user-facing error message
    return new ErrorObservable('Something bad happened; please try again later.');
  }

  private create_options( params = {} ) {
    return  {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.us.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      }),
      params: new HttpParams( {fromObject: params} )
    };

  }

  get_messages(): Observable<Message[]> {
    return this.http.get<Message[]>( this.us.url + '/messages', this.create_options( {limit: '10', skip: '0'} ) ).pipe(
        tap( (data) => console.log(JSON.stringify(data))) ,
        catchError( this.handleError )
      );
  }

  post_message( m: Message ): Observable<Message> {
    console.log('Posting ' + JSON.stringify(m) );
    return this.http.post<Message>( this.us.url + '/messages', m,  this.create_options() ).pipe(
      catchError(this.handleError)
    );
  }

  get_turn(): Observable<any> {
    return this.http.get<any>( this.us.url + '/turn', this.create_options({id: this.us.get_username()}) ).pipe(
        tap( (data) => console.log("turn "+ JSON.stringify(data))) ,
        catchError( this.handleError )
      );
  }

  create_game(): Observable<any> {
    console.log('Creating game ' + this.us.get_username() );
    var id : string = this.us.get_username();
    console.log("Id to be sent: "+id);
    return this.http.post<any>( this.us.url + '/create',{"id":id}).pipe(
      catchError(this.handleError)
    );
  }

  get_games(): Observable<any> {
    return this.http.get<any>( this.us.url + '/games').pipe(
      catchError(this.handleError)
    );
  }

  join_game(s: string): Observable<any> {
    console.log('Joining game ' + JSON.stringify(s)  );
    var id : string = this.us.get_username();
    console.log("Id to be sent: "+id);
    return this.http.post<any>( this.us.url + '/join',{"id1":s, "id2":id}).pipe(
      catchError(this.handleError)
    );
  }

  check_game(): Observable<any> {
    var id : string = this.us.get_username();
    console.log('Checking game ' + JSON.stringify(id)  );
    return this.http.post<any>( this.us.url + '/status',{"id":id}).pipe(
      catchError(this.handleError)
    );
  }

  send_ship(s: Ship): Observable<any> {
    var id : string = this.us.get_username();
    console.log('Checking game ' + JSON.stringify(id)  );
    return this.http.post<any>( this.us.url + '/sendShips',{"id":id,"ship":s}).pipe(
      catchError(this.handleError)
    );
  }

}
