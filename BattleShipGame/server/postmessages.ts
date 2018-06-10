/**
 *  Simple HTTP REST server + MongoDB (Mongoose) + Express
 * 
 *  Post and get simple text messages. Each message has a text content
 *  and an associated timestamp.
 *  All the posted messages are stored in a MongoDB collection.
 * 
 *  The application also provide user authentication through JWT. The provided
 *  APIs are fully stateless.
 * 
 * 
 * 
 *  Endpoints          Attributes          Method        Description
 * 
 *     /                  -                  GET         Returns the version and a list of available endpoints
 *     /messages        
 *                      ?skip=n
 *                      ?limit=m
 *     /messages          -                  POST        Post a new message
 *     /messages/:id      -                  DELETE      Delete a message by id

 * 
 *     /users             -                  GET         List all users
 *     /users/:mail       -                  GET         Get user info by mail
 *     /users             -                  POST        Add a new user
 *     /login             -                  POST        login an existing user, returning a JWT
 * 
 *     /create            -                  POST        create a game
 * 
 *     /games             -                  GET          returns all created games
 * 
 *     /join              -                  POST         join a game
 * 
 *     /status            -                  POST         send id and returns status of the created game
 * 
 *     /sendShips                            POST         send ships to one of the players
 * 
 *     /turn              -                  GET          Get turn
 *    
 *     /shoot             -                  GET          Get shot
 *          
 *     /private           -                  POST         Send private message
 * 
 *     /prvmsg            -                  GET          Get the private messages
 * 
 *     /getX              -                  GET          Get the hit
 * 
 *     /victory           -                  GET          Get if you won / lost
 * 
 *    /continue           -                  GET          Send ready
 * 
 *    /start              -                  GET          Get to playing phase
 * 
 *    /remove             -                  GET          Removing finished games
 * ------------------------------------------------------------------------------------ 
 *  To install the required modules:
 *  $ npm install
 * 
 *  To compile:
 *  $ npm run compile
 * 
 *  To setup:
 *  1) Create a file ".env" to store the JWT secret:
 *     JWT_SECRET=<secret>
 * 
 *    $ echo "JWT_SECRET=secret" > ".env"
 * 
 *  2) Generate HTTPS self-signed certificates
 *    $ cd keys
 *    $ openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 36
 *    $ openssl rsa -in key.pem -out newkey.pem && mv newkey.pem key.pem
 * 
 *  3) In postman go to settings and deselect HTTPS certificate check (self-signed
 *     certificate will not work otherwise)
 * 
 *  To run:
 *  $ node run start
 * 
 *  To manually inspect the database:
 *  > use postmessages
 *  > show collections
 *  > db.messages.find( {} )
 *  
 *  to delete all the messages:
 *  > db.messages.deleteMany( {} )
 * 
 */


const result = require('dotenv').config()     // The dotenv module will load a file named ".env"
                                              // file and load all the key-value pairs into
                                              // process.env (environment variable)
if (result.error) {
  console.log("Unable to load \".env\" file. Please provide one to store the JWT secret key");
  process.exit(-1);
}
if( !process.env.JWT_SECRET ) {
  console.log("\".env\" file loaded but JWT_SECRET=<secret> key-value pair was not found");
  process.exit(-1);
}

import fs = require('fs');
import http = require('http');                // HTTP module
import https = require('https');              // HTTPS module
import colors = require('colors');
colors.enabled = true;


import mongoose = require('mongoose');
import {Message} from './Message';
import * as message from './Message';

import { User } from './User';
import * as user from './User';

import express = require('express');
import bodyparser = require('body-parser');      // body-parser middleware is used to parse the request body and
                                                 // directly provide a Javascript object if the "Content-type" is
                                                 // application/json

import passport = require('passport');           // authentication middleware for express
import passportHTTP = require('passport-http');  // implements Basic and Digest authentication for HTTP (used for /login endpoint)

import jsonwebtoken = require('jsonwebtoken');  // JWT generation
import jwt = require('express-jwt');            // JWT parsing middleware for express

import cors = require('cors');                  // Enable CORS middleware
import io = require('socket.io');               // Socket.io websocket library

//this is the logic of the game keeper
import { Game } from './game';
import { Socket } from 'net';
import {Ship} from './ship';
import { Piece } from './piece';
import {PrivateMessage} from './privateMessage';

var games : Game[] = new Array();

var ios = undefined;

var app = express();

// We create the JWT authentication middleware
// provided by the express-jwt library.  
// 
// How it works (from the official documentation):
// If the token is valid, req.user will be set with the JSON object 
// decoded to be used by later middleware for authorization and access control.
//
var auth = jwt( {secret: process.env.JWT_SECRET} );


app.use( cors() );

// Install the top-level middleware "bodyparser"
app.use( bodyparser.json() );


// Add API routes to express application
//

app.get("/", (req,res) => {

    res.status(200).json( { api_version: "1.0", endpoints: [ "/messages", "/users", "/login", "/create", "/games", "/join", "/status", "/turn"] } ); // json method sends a JSON response (setting the correct Content-Type) to the client

});

app.route("/messages").get( auth, (req,res,next) => {

    var filter = {};
    console.log("Using filter: " + JSON.stringify(filter) );
    console.log(" Using query: " + JSON.stringify(req.query) );

    req.query.skip = parseInt( req.query.skip || "0" ) || 0;
    req.query.limit = parseInt( req.query.limit || "20" ) || 20;

    message.getModel().find( filter ).sort({timestamp:-1}).skip( req.query.skip ).limit( req.query.limit ).then( (documents) => {
      return res.status(200).json( documents );
    }).catch( (reason) => {
      return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    })

}).post( auth, (req,res,next) => {

    console.log("Received: " + JSON.stringify(req.body) );

    var recvmessage = req.body;
    recvmessage.timestamp = new Date();
    recvmessage.authormail = req.user.mail;

    if( message.isMessage( recvmessage ) ) {

      message.getModel().create( recvmessage ).then( ( data ) => {
        // Notify all socket.io clients
        ios.emit('broadcast', data );

        return res.status(200).json({ error: false, errormessage: "", id: data._id });
      }).catch((reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
      } )

    } else {
      return next({ statusCode:404, error: true, errormessage: "Data is not a valid Message" });
    }

});

app.get('/turn' , (req,res,next) => { 
  //console.log("Query: "+JSON.stringify(req.query.id));
  var id : String = JSON.parse(JSON.stringify(req.query.id));
  //console.log("ID from query : "+ id);
  var turn = null;
  for(var i=0;i<games.length;i++)
  {
    if(games[i].idPlayerOne==id && games[i].getFull())
    {
        turn=games[i].turn;
      }
       else if(games[i].idPlayerTwo==id && games[i].getFull())
          {
            turn=games[i].turn;
          }
    }
  console.log("Turn from turn endpoint "+turn);
  return res.status(200).json(turn);
});

app.get('/shoot' , (req,res,next) => { 
  console.log("Query: "+JSON.stringify(req.query.id));
  var id : string = JSON.parse(JSON.stringify(req.query.id));
  var ok : boolean = false;
  console.log("ID from query : "+ id);
  var position : string = req.query.position;
  console.log("Position to shoot : "+position);
  var fullShip : string[] = new Array();
  var turn : boolean = true;
  for(var i=0;i<games.length;i++)
  {
    if(games[i].idPlayerOne==id && games[i].getFull())
    {
          if(games[i].turn==2)
          {
            turn = false;
            break;
          }
          var ships : Ship[] = games[i].shipsTwo; //put ships of player two
          console.log("Length of ships sent : "+ships.length);
          for(var k=0;k<ships.length;k++)
          {
            var currentShip : Piece[] = ships[k].getShip();
            console.log("Length of ship "+k+" : "+currentShip.length);
            for(var j=0;j<currentShip.length;j++)
            {
              if(currentShip[j].y==position[0]&&currentShip[j].x==position[1])
                {
                  ok=true;
                  currentShip[j].hit=true;
                  var hitArr : string[] = new Array();
                  var check : boolean = true;
                  for(var w=0;w<currentShip.length;w++)
                  {
                    var s : string;
                    s = currentShip[w].y+currentShip[w].x;
                    hitArr.push(s);
                    if(currentShip[w].hit==false)
                    {
                      check = false;
                    }
                  }
                  if(check)
                  {
                    fullShip = hitArr;
                  }
                }
            }
          }
          games[i].xTwo = position;
          console.log("The X of player2 "+id+" "+games[i].xTwo);
          games[i].changeTurn();
          console.log("Turn after changing turn "+games[i].turn);
        }
       else if(games[i].idPlayerTwo==id && games[i].getFull())
                {
                      if(games[i].turn==1)
                      {
                        turn = false;
                        break;
                      }
                      var ships : Ship[] = games[i].shipsOne; //put ships of player two
                      console.log("Length of ships sent : "+ships.length);
                      for(var k=0;k<ships.length;k++)
                      {
                        var currentShip : Piece[] = ships[k].getShip();
                        console.log("Length of ship "+k+" : "+currentShip.length);
                        for(var j=0;j<currentShip.length;j++)
                        {
                          if(currentShip[j].y==position[0]&&currentShip[j].x==position[1])
                            {
                              ok=true;
                              currentShip[j].hit=true;
                              var hitArr : string[] = new Array(); //check if all ship was hit
                              var check : boolean = true;
                              for(var w=0;w<currentShip.length;w++)
                              {
                                var s : string;
                                s = currentShip[w].y+currentShip[w].x;
                                hitArr.push(s);
                                if(currentShip[w].hit==false)
                                {
                                  check = false;
                                }
                              }
                              if(check)
                              {
                                fullShip = hitArr;
                              }
                            }
                        }
                      }
                      games[i].xOne = position;
                      console.log("The X of player1 "+id+" "+games[i].xOne);
                      games[i].changeTurn();
                      console.log("Turn after changing turn "+games[i].turn);
                  }
  }
  console.log("To be sent after shot : "+JSON.stringify({"ok":ok,"arr":fullShip}));
  return res.status(200).json({"turn":turn,"ok":ok,"arr":fullShip});
});

app.get('/victory' , (req,res,next) => { 
  console.log("Query: "+JSON.stringify(req.query));
  var id : string = req.query.id;
  var gameid : string = req.query.gameid;
  var won : boolean = true;
  var lost : boolean = true;
  for(var i=0;i<games.length;i++)
  {
    if(games[i].gameID==gameid && games[i].getFull())
    {
        if(games[i].idPlayerOne==id)
          {
          var ships : Ship[] = games[i].shipsTwo; //check opponent ships
          for(var k=0;k<ships.length;k++)
          {
            var currentShip : Piece[] = ships[k].getShip();
            console.log("Length of ship "+k+" : "+currentShip.length);
            for(var j=0;j<currentShip.length;j++)
            {
              if(currentShip[j].hit==false)
                    {
                      won = false;
                      break;
                    }
                  }
                }
                var ships2 : Ship[] = games[i].shipsOne; //check my ships
                for(var k=0;k<ships2.length;k++)
                {
                  var currentShip : Piece[] = ships2[k].getShip();
                  console.log("Length of ship "+k+" : "+currentShip.length);
                  for(var j=0;j<currentShip.length;j++)
                  {
                    if(currentShip[j].hit==false)
                          {
                            lost = false;
                            break;
                          }
                        }
                      }
            }
       else if(games[i].idPlayerTwo==id)
       {
        var ships : Ship[] = games[i].shipsOne; //check ships of player two
        for(var k=0;k<ships.length;k++)
        {
          var currentShip : Piece[] = ships[k].getShip();
          console.log("Length of ship "+k+" : "+currentShip.length);
          for(var j=0;j<currentShip.length;j++)
          {
            if(currentShip[j].hit==false)
                  {
                    won = false;
                    break;
                  }
                }
              }
              var ships2 : Ship[] = games[i].shipsTwo; //check my ships
              for(var k=0;k<ships2.length;k++)
              {
                var currentShip : Piece[] = ships2[k].getShip();
                console.log("Length of ship "+k+" : "+currentShip.length);
                for(var j=0;j<currentShip.length;j++)
                {
                  if(currentShip[j].hit==false)
                        {
                          lost = false;
                          break;
                        }
                      }
                    }
        }
      }
  }

  user.getModel().findOne( {username: id }, {digest: 0, salt:0 }).then( (user)=> {
    console.log("Updating user "+id);
    if(won&&lost==false)
      {
        user.points += 2;
        user.win += 1;
        for(var i=0;i<games.length;i++)
        {
          if(games[i].gameID==gameid && games[i].getFull())
            {
              games[i].finished=true;
              console.log("Game "+gameid+" set on finished "+games[i].finished);
            }
        }
      }
      else if(won==false&&lost)
      {
        user.points -= 1;
        user.lost += 1;
        for(var i=0;i<games.length;i++)
        {
          if(games[i].gameID==gameid && games[i].getFull())
            {
              games[i].finished=true;
              console.log("Game "+gameid+" set on finished "+games[i].finished);
            }
        }
      }
      else if(won&&lost)
      {
        user.points -= 1;
        user.lost += 1;
        for(var i=0;i<games.length;i++)
        {
          if(games[i].gameID==gameid && games[i].getFull())
            {
              games[i].finished=true;
              console.log("Game "+gameid+" set on finished "+games[i].finished);
            }
        }
      }
    user.save();
  });
  console.log("To be sent after shot : "+JSON.stringify({"won":won,"lost":lost}));
  return res.status(200).json({"won":won,"lost":lost});
});

app.get('/continue' , (req,res,next) => { 
  console.log("Query: "+JSON.stringify(req.query));
  var id : string = req.query.id;
  var gameid : string = req.query.gameid;
  var ok : boolean;
  for(var i=0;i<games.length;i++)
  {
    if(games[i].gameID==gameid && games[i].getFull())
    {
        if(games[i].idPlayerOne==id)
          {
            games[i].readyPlayerOne=true;
            ok=true;
          }
       else if(games[i].idPlayerTwo==id)
       {
         games[i].readyPlayerTwo=true;
         ok=true;
        }
      }
  }
  console.log("Continue sent : "+JSON.stringify(ok));
  return res.status(200).json(ok);
});

app.get('/start' , (req,res,next) => { 
  console.log("Query: "+JSON.stringify(req.query));
  var gameid : string = req.query.gameid;
  var ok : boolean = false;
  for(var i=0;i<games.length;i++)
  {
    if(games[i].gameID==gameid && games[i].getFull())
    {
        if(games[i].readyPlayerOne&&games[i].readyPlayerTwo)
          {
            ok=true;
          }
      }
  }
  console.log("Start sent : "+JSON.stringify(ok));
  return res.status(200).json(ok);
});

app.get('/remove' , (req,res,next) => { 
  console.log("Removing finished games");
  var removed = null;
  //console.log("Length of games before removal: "+games.length);
  if(games.length)
    {for(var i=0;i<games.length;i++)
    {
      if(games[i].finished)
      {
        console.log("Found finished game : "+games[i].gameID);
        removed = games.splice(i, 1);
      }
    }
  }
  console.log("Removed game : "+removed);
  //console.log("Length of games after removal: "+games.length);
  return res.status(200).json(removed);
});



app.delete( '/messages/:id', auth, (req,res,next) => {

  // Check moderator role
  if( !user.newUser(req.user).hasModeratorRole() ) {
    return next({ statusCode:404, error: true, errormessage: "Unauthorized: user is not a moderator"} );
  }
  
  // req.params.id contains the :id URL component

  message.getModel().deleteOne( {_id: req.params.id } ).then( ()=> {
      return res.status(200).json( {error:false, errormessage:""} );
  }).catch( (reason)=> {
      return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
  })

});

app.route("/users").get( auth, (req,res,next) => {

  var filter = {};
  console.log("Using filter: " + JSON.stringify(filter) );
  console.log(" Using query: " + JSON.stringify(req.query) );

  req.query.skip = parseInt( req.query.skip || "0" ) || 0;
  req.query.limit = parseInt( req.query.limit || "10" ) || 20;

  user.getModel().find( filter ).sort({points:-1}).skip( req.query.skip ).limit( req.query.limit ).then( (users) => {
    return res.status(200).json( users );
  }).catch( (reason) => {
    return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
  })
});

app.post('/users', (req,res,next) => {

    var u = user.newUser( req.body);
    
    if( !req.body.password ) {
      return next({ statusCode:404, error: true, errormessage: "Password field missing"} );
    }
    u.setPassword( req.body.password );
    u.save().then( (data) => {
      return res.status(200).json({ error: false, errormessage: "", id: data._id });
    }).catch( (reason) => {
      if( reason.code === 11000 )
        return next({statusCode:404, error:true, errormessage: "User already exists"} );
      return next({ statusCode:404, error: true, errormessage: "DB error: "+reason.errmsg });
    })

});

app.route("/create").post( (req,res,next) => {
  var game : Game = new Game(req.body.id);
  games.push(game);
  //console.log("ID of player one : "+game.idPlayerOne);
  //console.log("Array of games : "+games.length);
  return res.status(200).json( game.idPlayerOne );
});

app.route("/join").post( (req,res,next) => {
    //console.log("attempt to join game");
    var id1 : string = req.body.id1;
    var id2 : string = req.body.id2;
    var gameId : string;
    //console.log("The 2 ids: "+id1+" "+id2);
    for(var i=0;i<games.length;i++)
    {
      if(games[i].idPlayerOne==id1)
      {
        //console.log("True: "+id2);
        games[i].joinSecondPlayer(id2);
       // console.log("Game joined-  player one : "+games[i].idPlayerOne);
       // console.log("Game joined-  player two : "+games[i].idPlayerTwo);
        //console.log("Game is full :"+games[i].getFull());
        games[i].createGameId();
        gameId = games[i].gameID;
       // console.log("Game ID :"+gameId);
      }
    }
    return res.status(200).json( gameId );
});

app.route("/status").post( (req,res,next) => {
  //console.log("check if "+req.body.id+" game is full");
  var id : string = req.body.id;
  var ok : boolean = false;
  var gameId : string;
  for(var i=0;i<games.length;i++)
  {
    if(games[i].idPlayerOne==id&&games[i].getFull())
    {
      //console.log("Game will start!");
      //console.log("Full game -  player one : "+games[i].idPlayerOne);
      //console.log("Full game -  player two : "+games[i].idPlayerTwo);
      //console.log("Game ID: "+games[i].gameID);
      gameId = games[i].gameID;
      //console.log("Whose turn is it: "+games[i].turn);
      ok=true;
    }
  }
 // console.log("Status "+ok);
  return res.status(200).json({status : ok, id : gameId});
});

app.route("/sendShips").post( (req,res,next) => {
  //console.log("send to "+req.body.id);
  var id : string = req.body.id;
  //console.log(JSON.stringify(req.body.ship));
  var ship = JSON.parse(JSON.stringify(req.body.ship));
  //console.log(ship);
  //console.log(ship.Ship);
  var pieceArray : Piece[] = ship.Ship;
  var newShip : Ship = new Ship();
  for(var i=0;i<pieceArray.length;i++)
  {
    var x : string = pieceArray[i].x;
    var y : string = pieceArray[i].y;
    newShip.add(x,y);
    //console.log("A piece: "+pieceArray[i].x+" : "+pieceArray[i].y);
  }
 // console.log("Ship to be added : "+newShip.toString());
  for(var i=0;i<games.length;i++)
  {
    if(games[i].full)
    {
      if(id==games[i].idPlayerOne)
        {
          games[i].addToPlayerOne(newShip);
          //console.log("Ship added to player one : "+newShip);
          var p : Piece = newShip.getPiece(0);
          //console.log("First piece : "+p.x+" : "+p.y);
        }
      else if(id==games[i].idPlayerTwo)
            {
              games[i].addToPlayerTwo(newShip);
              //console.log("Ship added to player two : "+newShip);
              var p : Piece = newShip.getPiece(0);
             // console.log("First piece : "+p.x+" : "+p.y);
            }
    }
  }
  return res.status(200).json(ship);
});

app.get('/prvmsg' , (req,res,next) => { 
  //console.log("Query: "+JSON.stringify(req.query));
  var gameid : string = req.query.gameid;
  var msgArr : PrivateMessage [] ;
  for(var i=0;i<games.length;i++)
  {
    if(games[i].gameID==gameid && games[i].getFull())
    {
      msgArr=games[i].getPrivateMsgArr();
    }
  }
  //console.log("The array of messages "+msgArr);
  return res.status(200).json(msgArr);

});

app.get('/getX' , (req,res,next) => { 
  console.log("Query: "+JSON.stringify(req.query));
  var gameid : string = req.query.gameid;
  var id : string = req.query.id;
  var hit : string;
  for(var i=0;i<games.length;i++)
  {
    if(games[i].gameID==gameid && games[i].getFull())
    {
      console.log("Found the game : "+games[i].gameID);
      if(games[i].idPlayerOne==id)
      {
        hit = games[i].xOne;
        console.log("Returning for player1 : "+hit);
      }
      else if(games[i].idPlayerTwo==id)
      {
        hit = games[i].xTwo;
        console.log("Returning for player2 : "+hit);
      }
    }
  }
  console.log("Hit at position: "+hit);
  return res.status(200).json(hit);
});

app.route("/games").get((req,res,next) => {
  return res.status(200).json( games );
});

app.route("/private").post( (req,res,next) => {
 // console.log("Received "+JSON.stringify(req.body));
  var id : string = req.body.id;
  var gameId : string = req.body.gameid;
  var content : string = req.body.message;
  var prvMsg : PrivateMessage = new PrivateMessage(id,content);
  var k = 0;
  for(var i=0;i<games.length;i++)
  {
    if(games[i].gameID==gameId&&games[i].getFull())
    {
      games[i].addMessage(prvMsg);
      //console.log("Message pushed");
      k=i;
    }
  }
  //console.log("Array of messages : "+games[k].getPrivateMsgArr());
  return res.status(200).json(games[k].getPrivateMsgArr());
});

app.get('/users/:mail', auth, (req,res,next) => {

  // req.params.mail contains the :mail URL component
  user.getModel().findOne( {mail: req.params.mail }, {digest: 0, salt:0 }).then( (user)=> {
    return res.status(200).json( user );
  }).catch( (reason) => {
    return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
  })

});

app.get('/renew', auth, (req,res,next) => {
  var tokendata = req.user;
  delete tokendata.iat;
  delete tokendata.exp;
  console.log("Renewing token for user " + JSON.stringify( tokendata ));
  var token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn: '1h' } );
  return res.status(200).json({ error: false, errormessage: "", token: token_signed });
});



// Configure HTTP basic authentication strategy 
// trough passport middleware.
// NOTE: Always use HTTPS with Basic Authentication

passport.use( new passportHTTP.BasicStrategy(
  function(username, password, done) {

    // Delegate function we provide to passport middleware
    // to verify user credentials 

    console.log("New login attempt from ".green + io.id );
    console.log("New login attempt from ".green + username );
    user.getModel().findOne( {mail: username} , (err, user)=>{
      if( err ) {
        return done({statusCode: 500, error: true, errormessage:err});
      }
      if( !user ) {
        return done({statusCode: 500, error: true, errormessage:"Invalid user"});
      }
      if( user.validatePassword( password ) ) {
        return done(null, user);
      }
      return done({statusCode: 500, error: true, errormessage:"Invalid password"});
    })
  }
));


// Login endpoint uses passport middleware to check
// user credentials before generating a new JWT
app.get("/login", passport.authenticate('basic', { session: false }), (req,res,next) => {

  // If we reach this point, the user is successfully authenticated and
  // has been injected into req.user

  // We now generate a JWT with the useful user data
  // and return it as response

  var tokendata = {
    username: req.user.username,
    roles: req.user.roles,
    mail: req.user.mail,
    id: req.user.id,
    points: req.user.points,
    win: req.user.win,
    lost: req.user.lost
  };

  console.log("Login granted. Generating token" );
  var token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn: '1h' } );

  // Note: You can manually check the JWT content at https://jwt.io

  return res.status(200).json({ error: false, errormessage: "", token: token_signed });

});



// Add error handling middleware
app.use( function(err,req,res,next) {

  console.log("Request error: ".red + JSON.stringify(err) );
  res.status( err.statusCode || 500 ).json( err );

});


// The very last middleware will report an error 404 
// (will be eventually reached if no error occurred and if
//  the requested endpoint is not matched by any route)
//
app.use( (req,res,next) => {
  res.status(404).json({statusCode:404, error:true, errormessage: "Invalid endpoint"} );
})



// Connect to mongodb and launch the HTTP server trough Express
//
mongoose.connect( 'mongodb://localhost:27017/postmessages' ).then( 
    function onconnected() {

        console.log("Connected to MongoDB");

        var u = user.newUser( {
          username: "admin",
          mail: "admin@postmessages.it",
          points: 0,
          win: 0,
          lost: 0
        } );
        u.setAdmin();
        u.setModerator();
        u.setPassword("admin");
        u.save().then( ()=> {
          console.log("Admin user created");

          message.getModel().count({}).then(
              ( count ) => {
                  if( count == 0 ) {
                      console.log("Adding some test data into the database");
                      var m1 = message
                        .getModel()
                        .create({
                          content: "Post 1",
                          timestamp: new Date(),
                          authormail: u.mail
                        });
                      var m2 = message
                        .getModel()
                        .create({
                          content: "Post 2",
                          timestamp: new Date(),
                          authormail: u.mail
                        });
                      var m3 = message
                        .getModel()
                        .create({
                          content: "Post 3",
                          timestamp: new Date(),
                          authormail: u.mail
                        });

                      Promise.all([m1, m2, m3])
                        .then(function() {
                          console.log("Messages saved");
                        })
                        .catch(function(reason) {
                          console.log("Unable to save: " + reason);
                        });

                  }
              })
        }).catch( (err)=> {
          console.log("Unable to create admin user: " + err );
        });


        // To start a standard HTTP server we directly invoke the "listen"
        // method of express application
        let server = http.createServer(app);
        ios = io(server);
        ios.on('connection', function(client) {
          console.log( "Socket.io client connected".green );
        });
        server.listen( 8080, () => console.log("HTTP Server started on port 8080") );

        // To start an HTTPS server we create an https.Server instance 
        // passing the express application middleware. Then, we start listening
        // on port 8443
        //
        /*
        https.createServer({
          key: fs.readFileSync('keys/key.pem'),
          cert: fs.readFileSync('keys/cert.pem')
        }, app).listen(8443);
        */

    },
    function onrejected() {
        console.log("Unable to connect to MongoDB");
        process.exit(-2);
    }
)
