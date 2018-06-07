"use strict";
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
 *     /sendShips                             POST         send ships to one of the players
 *
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
Object.defineProperty(exports, "__esModule", { value: true });
const result = require('dotenv').config(); // The dotenv module will load a file named ".env"
// file and load all the key-value pairs into
// process.env (environment variable)
if (result.error) {
    console.log("Unable to load \".env\" file. Please provide one to store the JWT secret key");
    process.exit(-1);
}
if (!process.env.JWT_SECRET) {
    console.log("\".env\" file loaded but JWT_SECRET=<secret> key-value pair was not found");
    process.exit(-1);
}
const http = require("http"); // HTTP module
const colors = require("colors");
colors.enabled = true;
const mongoose = require("mongoose");
const message = require("./Message");
const user = require("./User");
const express = require("express");
const bodyparser = require("body-parser"); // body-parser middleware is used to parse the request body and
// directly provide a Javascript object if the "Content-type" is
// application/json
const passport = require("passport"); // authentication middleware for express
const passportHTTP = require("passport-http"); // implements Basic and Digest authentication for HTTP (used for /login endpoint)
const jsonwebtoken = require("jsonwebtoken"); // JWT generation
const jwt = require("express-jwt"); // JWT parsing middleware for express
const cors = require("cors"); // Enable CORS middleware
const io = require("socket.io"); // Socket.io websocket library
//this is the logic of the game keeper
const game_1 = require("./game");
const ship_1 = require("./ship");
var games = new Array();
var ios = undefined;
var app = express();
// We create the JWT authentication middleware
// provided by the express-jwt library.  
// 
// How it works (from the official documentation):
// If the token is valid, req.user will be set with the JSON object 
// decoded to be used by later middleware for authorization and access control.
//
var auth = jwt({ secret: process.env.JWT_SECRET });
app.use(cors());
// Install the top-level middleware "bodyparser"
app.use(bodyparser.json());
// Add API routes to express application
//
app.get("/", (req, res) => {
    res.status(200).json({ api_version: "1.0", endpoints: ["/messages", "/users", "/login", "/create", "/games", "/join", "/status"] }); // json method sends a JSON response (setting the correct Content-Type) to the client
});
app.route("/messages").get(auth, (req, res, next) => {
    var filter = {};
    console.log("Using filter: " + JSON.stringify(filter));
    console.log(" Using query: " + JSON.stringify(req.query));
    req.query.skip = parseInt(req.query.skip || "0") || 0;
    req.query.limit = parseInt(req.query.limit || "20") || 20;
    message.getModel().find(filter).sort({ timestamp: -1 }).skip(req.query.skip).limit(req.query.limit).then((documents) => {
        return res.status(200).json(documents);
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
}).post(auth, (req, res, next) => {
    console.log("Received: " + JSON.stringify(req.body));
    var recvmessage = req.body;
    recvmessage.timestamp = new Date();
    recvmessage.authormail = req.user.mail;
    if (message.isMessage(recvmessage)) {
        message.getModel().create(recvmessage).then((data) => {
            // Notify all socket.io clients
            ios.emit('broadcast', data);
            return res.status(200).json({ error: false, errormessage: "", id: data._id });
        }).catch((reason) => {
            return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
        });
    }
    else {
        return next({ statusCode: 404, error: true, errormessage: "Data is not a valid Message" });
    }
});
app.delete('/messages/:id', auth, (req, res, next) => {
    // Check moderator role
    if (!user.newUser(req.user).hasModeratorRole()) {
        return next({ statusCode: 404, error: true, errormessage: "Unauthorized: user is not a moderator" });
    }
    // req.params.id contains the :id URL component
    message.getModel().deleteOne({ _id: req.params.id }).then(() => {
        return res.status(200).json({ error: false, errormessage: "" });
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
});
app.get('/users', auth, (req, res, next) => {
    user.getModel().find({}, { digest: 0, salt: 0 }).then((users) => {
        return res.status(200).json(users);
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
});
app.post('/users', (req, res, next) => {
    var u = user.newUser(req.body);
    if (!req.body.password) {
        return next({ statusCode: 404, error: true, errormessage: "Password field missing" });
    }
    u.setPassword(req.body.password);
    u.save().then((data) => {
        return res.status(200).json({ error: false, errormessage: "", id: data._id });
    }).catch((reason) => {
        if (reason.code === 11000)
            return next({ statusCode: 404, error: true, errormessage: "User already exists" });
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason.errmsg });
    });
});
app.route("/create").post((req, res, next) => {
    var game = new game_1.Game(req.body.id);
    games.push(game);
    console.log("ID of player one : " + game.idPlayerOne);
    console.log("Array of games : " + games.length);
    return res.status(200).json(game.idPlayerOne);
});
app.route("/join").post((req, res, next) => {
    console.log("attempt to join game");
    var id1 = req.body.id1;
    var id2 = req.body.id2;
    console.log("The 2 ids: " + id1 + " " + id2);
    for (var i = 0; i < games.length; i++) {
        if (games[i].idPlayerOne == id1) {
            console.log("True: " + id2);
            games[i].joinSecondPlayer(id2);
            console.log("Game joined-  player one : " + games[i].idPlayerOne);
            console.log("Game joined-  player two : " + games[i].idPlayerTwo);
        }
    }
    return res.status(200).json(id2);
});
app.route("/status").post((req, res, next) => {
    console.log("check if " + req.body.id + " game is full");
    var id = req.body.id;
    var ok = false;
    for (var i = 0; i < games.length; i++) {
        if (games[i].idPlayerOne == id && games[i].getFull()) {
            console.log("Game will start!");
            console.log("Full game -  player one : " + games[i].idPlayerOne);
            console.log("Full game -  player two : " + games[i].idPlayerTwo);
            games[i].createGameId();
            console.log("Game ID: " + games[i].gameID);
            console.log("Whose turn is it: " + games[i].turn);
            ok = true;
        }
    }
    console.log("Status " + ok);
    return res.status(200).json(ok);
});
app.route("/sendShips").post((req, res, next) => {
    console.log("send to " + req.body.id);
    var id = req.body.id;
    var ships = req.body.ships;
    console.log(JSON.stringify(req.body.ship));
    var ship = JSON.parse(JSON.stringify(req.body.ship));
    console.log(ship);
    console.log(ship.Ship);
    var pieceArray = ship.Ship;
    var newShip = new ship_1.Ship();
    for (var i = 0; i < pieceArray.length; i++) {
        var x = pieceArray[i].x;
        var y = pieceArray[i].y;
        newShip.add(x, y);
        console.log("A piece: " + pieceArray[i].x + " : " + pieceArray[i].y);
    }
    console.log("Ship to be added : " + newShip.toString());
    for (var i = 0; i < games.length; i++) {
        if (games[i].getFull()) {
            if (id == games[i].idPlayerOne) {
                games[i].addToPlayerOne(newShip);
                console.log("Ship added to player one : " + newShip);
                var p = newShip.getPiece(0);
                console.log("First piece : " + p.x + " : " + p.y);
            }
            else if (id == games[i].idPlayerTwo) {
                games[i].addToPlayerTwo(newShip);
                console.log("Ship added to player two : " + newShip);
                var p = newShip.getPiece(0);
                console.log("First piece : " + p.x + " : " + p.y);
            }
        }
    }
    /*    console.log("Ships were sent!");
    pieces1=ships[0].getShip();
    console.log("First ships length : "+pieces1.length);
    for(var i=0;i<ships.length;i++)
    {
      var pieces: Piece[];
      pieces=ships[i].getShip();
      console.log("Ship "+i+" length : "+pieces.length);
      for(var j=0;j<pieces.length;j++)
        {
          console.log("Ship "+i);
          console.log(pieces[j].x+" "+pieces[j].y+" "+pieces[j].hit);
        }
    }*/
    return res.status(200).json(ships);
});
app.route("/games").get((req, res, next) => {
    return res.status(200).json(games);
});
app.get('/users/:mail', auth, (req, res, next) => {
    // req.params.mail contains the :mail URL component
    user.getModel().findOne({ mail: req.params.mail }, { digest: 0, salt: 0 }).then((user) => {
        return res.status(200).json(user);
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
});
app.get('/renew', auth, (req, res, next) => {
    var tokendata = req.user;
    delete tokendata.iat;
    delete tokendata.exp;
    console.log("Renewing token for user " + JSON.stringify(tokendata));
    var token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ error: false, errormessage: "", token: token_signed });
});
// Configure HTTP basic authentication strategy 
// trough passport middleware.
// NOTE: Always use HTTPS with Basic Authentication
passport.use(new passportHTTP.BasicStrategy(function (username, password, done) {
    // Delegate function we provide to passport middleware
    // to verify user credentials 
    console.log("New login attempt from ".green + io.id);
    console.log("New login attempt from ".green + username);
    user.getModel().findOne({ mail: username }, (err, user) => {
        if (err) {
            return done({ statusCode: 500, error: true, errormessage: err });
        }
        if (!user) {
            return done({ statusCode: 500, error: true, errormessage: "Invalid user" });
        }
        if (user.validatePassword(password)) {
            return done(null, user);
        }
        return done({ statusCode: 500, error: true, errormessage: "Invalid password" });
    });
}));
// Login endpoint uses passport middleware to check
// user credentials before generating a new JWT
app.get("/login", passport.authenticate('basic', { session: false }), (req, res, next) => {
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
    console.log("Login granted. Generating token");
    var token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Note: You can manually check the JWT content at https://jwt.io
    return res.status(200).json({ error: false, errormessage: "", token: token_signed });
});
// Add error handling middleware
app.use(function (err, req, res, next) {
    console.log("Request error: ".red + JSON.stringify(err));
    res.status(err.statusCode || 500).json(err);
});
// The very last middleware will report an error 404 
// (will be eventually reached if no error occurred and if
//  the requested endpoint is not matched by any route)
//
app.use((req, res, next) => {
    res.status(404).json({ statusCode: 404, error: true, errormessage: "Invalid endpoint" });
});
// Connect to mongodb and launch the HTTP server trough Express
//
mongoose.connect('mongodb://localhost:27017/postmessages').then(function onconnected() {
    console.log("Connected to MongoDB");
    var u = user.newUser({
        username: "admin",
        mail: "admin@postmessages.it",
        points: 0,
        win: 0,
        lost: 0
    });
    u.setAdmin();
    u.setModerator();
    u.setPassword("admin");
    u.save().then(() => {
        console.log("Admin user created");
        message.getModel().count({}).then((count) => {
            if (count == 0) {
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
                    .then(function () {
                    console.log("Messages saved");
                })
                    .catch(function (reason) {
                    console.log("Unable to save: " + reason);
                });
            }
        });
    }).catch((err) => {
        console.log("Unable to create admin user: " + err);
    });
    // To start a standard HTTP server we directly invoke the "listen"
    // method of express application
    let server = http.createServer(app);
    ios = io(server);
    ios.on('connection', function (client) {
        console.log("Socket.io client connected".green);
    });
    server.listen(8080, () => console.log("HTTP Server started on port 8080"));
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
}, function onrejected() {
    console.log("Unable to connect to MongoDB");
    process.exit(-2);
});
//# sourceMappingURL=postmessages.js.map