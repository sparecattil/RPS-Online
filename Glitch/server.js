const express = require("express");
const app = express();
const socket = require("socket.io");
const path = require("path");

let raspID; // Raspberry Pi's socket id
let queueCount = 0; // Current queue count - 1
let playerMaster = {}; // Temporary socket ID info stored about the client
let idInQueue = {}; // Clients that are currently in queue


const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Login.html"));
});

app.use(express.static(path.join(__dirname, "public")));

// Listening for requests
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

const io = socket( listener );

io.on( "connection",function (socket)
{
  app.post('/close-tab', (req, res) => {
    if (req.body.ID != null && req.body.ID != "NA") {
      if (req.body.ID % 2 == 1) {
        if (idInQueue[parseInt(req.body.ID) + 1] == "YES") {
          idInQueue[parseInt(req.body.ID) + 1] = "NO";
        }
        else if (queueCount != 0) {
          //queueCount--;
        }
      }
      else if (req.body.ID % 2 == 0) {
        idInQueue[parseInt(req.body.ID) - 1] = "NO";
      }
    }
    idInQueue[req.body.ID] = "NO";
  
    res.sendStatus(200);
  });
  
  /////////////////////////////////////////////////////////////////////////////
  
  // Login check to raspberry pi (web client -> server -> raspberry pi)
  socket.on ( 'login', function( data )
  {
    io.to(raspID).emit('login', data);
  });
  
  // Register account send to raspberry pi (web client -> server -> raspberry pi)
  socket.on ( 'register', function( data )
  {
    io.to(raspID).emit('register', data);
  });
  
  // Saving the raspberry pi's client ID (raspberry pi -> server)
  socket.on ( 'piID', function(data)
  {
    raspID = data.ID;
    console.log(raspID);
  });
  
  // Successfull login (raspberry pi -> server -> web client)
  socket.on ( 'loginSuccessful', function(data)
  {
    io.to(data.clientID).emit('loginSuccessful',data);
  });
  
  // Incorrect username and password (raspberry pi -> server -> web client)
  socket.on ( 'incorrectUP', function(data)
  {
    io.to(data.clientID).emit('incorrectUP',{});
  });
  
  // Account is not registered (raspberry pi -> server -> web client)
  socket.on ( 'registrationNeeded', function(data)
  {
    io.to(data.clientID).emit('registrationNeeded',{});
  });
  
  // Successful registration (raspberry pi -> server -> web client)
  socket.on ( 'registerSuccessful', function(data)
  {
    io.to(data.clientID).emit('registerSuccessful',data);
  });
  
  // Username is taken (raspberry pi -> server -> web client)
  socket.on ( 'usernameTaken', function(data)
  {
    io.to(data.clientID).emit('usernameTaken',{});
  });
  
  // Password is length is not satisfactory (raspberry pi -> server -> web client)
  socket.on ( 'passwordLength', function(data)
  {
    io.to(data.clientID).emit('passwordLength',{});
  });
  
  // Characters used in the password are not satisfactory (raspberry pi -> server -> web client)
  socket.on ( 'passwordCharacters', function(data)
  {
    io.to(data.clientID).emit('passwordCharacters',{});
  });
  
  // (raspberry pi -> server -> web client)
  socket.on ( 'passwordMatch', function(data)
  {
    console.log("Reached Password match");
    io.to(data.clientID).emit('passwordMatch',{});
  });
  
  // (raspberry pi -> server -> web client)
  socket.on ( 'passwordSuccess', function(data)
  {
    io.to(data.clientID).emit('passwordSuccess',{});
  });
  /////////////////////////////////////////////////////////////////////////////
  
  // Updating ranking for the database (web client -> server -> raspberry pi)
  socket.on ( 'updateRank', function(data)
  {
    io.except(raspID).emit('updateRank',data);
  });
  
  // Updating personal ranking (raspberry pi -> server -> web client)
  socket.on ( 'updatePersonalRank', function(data)
  {
    io.to(data.clientID).emit('updatePersonalRank',data);
  });
  
  // Updating leaderboard stats for the database (web client -> server -> raspberry pi)
  socket.on ( 'updateLeaderboardStats', function(data)
  {
    console.log(data);
    io.except(raspID).emit('updateLeaderboardStats',data);
  });
  
  // Leaving the game (web client -> server -> raspberry pi & web client)
  // Updating statistic for the database through the raspberry pi
  // Notifying the other player in session X that their opponent has left
  socket.on ( 'leavingGame', function(data)
  {
    idInQueue[data.ID] = "NO";
    io.to(raspID).emit('updateDashboard',data);
    io.to(raspID).emit('updateStay',{ID : data.ID});
    if (data.ID % 2 == 1) {
      io.to(playerMaster[parseInt(data.ID) + 1]).emit('opponentLeft',{});
    }
    else if (data.ID % 2 == 0) {
      io.to(playerMaster[parseInt(data.ID) - 1]).emit('opponentLeft',{});
    }
  });
  
  /////////////////////////////////////////////////////////////////////////////
  
  // Placing web client in the correct room after socket id change based on the queue number assigned to them
  // The socket id is updated in the database by sending to the raspberry pi
  socket.on ( 'checkQueueID', function(data)
  {
    if (data.ID == "NA" || data.ID == null) {
      
    }
    else if (data.ID % 2 == 1) {
      socket.join('room' + data.ID);
      playerMaster[data.ID] = data.clientID;
    }
    else if (data.ID % 2 == 0) {
      socket.join('room' + (data.ID - 1));
      playerMaster[data.ID] = data.clientID;
    }
    io.to(raspID).emit('usernameID', data);
    console.log(data.username);
  });
  
  // Assigning queue number to a web client 
  // Odd player are placing in waiting
  // Once an even player has queued, both player are sent to game screen
  socket.on ( 'checkQueue', function(data)
  {
    queueCount++;
    io.to(data.clientID).emit('setQueueID',{number : queueCount});
    idInQueue[queueCount] = "YES";
    console.log(idInQueue);
    if (queueCount % 2 == 1) {
      socket.join('room' + queueCount);
      playerMaster[queueCount] = data.clientID;
      io.to(raspID).emit('updateQueue',{queueID : queueCount, username : data.username});
      io.to(raspID).emit('updateConfirm',{queueID : queueCount});
      io.to(raspID).emit('updateStay',{queueID : queueCount});
    }
    else if (queueCount % 2 == 0) {
      socket.join('room' + (queueCount - 1));
      playerMaster[queueCount] = data.clientID;
      io.to(raspID).emit('updateQueue',{queueID : queueCount, username : data.username});
      io.to(raspID).emit('updateConfirm',{queueID : queueCount});
      io.to(raspID).emit('updateStay',{queueID : queueCount});
      io.to(raspID).emit('requestOpponent',{queueID : queueCount});
      setTimeout(function(){
          io.to('room' + (queueCount - 1)).emit('selectMoveScreen',{});
      },3000);
    }
    
  });
  
  // Sending the opponents most and least used picks
  socket.on ( 'sendRoomData', function(data)
  {
    io.to(playerMaster[parseInt(data.IDOne)]).emit('roomData',{opponentMost : data.IDTwoMost, opponentLeast : data.IDTwoLeast});
    io.to(playerMaster[parseInt(data.IDTwo)]).emit('roomData',{opponentMost : data.IDOneMost, opponentLeast : data.IDOneLeast});
  });
  
  // Letting the raspberry pi know when once a pick has been confirmed
  // (web client -> server -> raspberry pi)
  socket.on ( 'pickConfirmed', function(data)
  {
    io.to(raspID).emit('pickConfirmed',data);
  });
  
  // Sending opponents pick (raspberry pi -> server -> web client)
  socket.on ( 'opponentPick', function(data)
  {
    io.to(playerMaster[data.ID]).emit('opponentPick',data);
  });
  
  // Notifying room that both user have made their picks
  socket.on ( 'bothConfirmed', function(data)
  {
    setTimeout(function(){
        io.to("room" + data.ID).emit('bothPicksHaveBeenMade',{});
    },3000);
  });
  
  socket.on ( 'stayPressed', function(data)
  {
    console.log("Stay Pressed");
    io.to(raspID).emit('stayPressed',data);
  });
  
  // Indicating the room that both players have chosen to stay
  socket.on ( 'bothStayed', function(data)
  {
    setTimeout(function(){
        io.to("room" + data.ID).emit('bothStaysHaveBeenMade',{});
    },3000);
  });
  
  // Updating password from the database via raspberry pi (web client -> server -> raspberry pi)
  socket.on( 'password', function ( data ){
    io.to(raspID).emit('updatePassword',data);
  });
  
  // Deleting account from the database via raspberry pi (web client -> server -> raspberry pi)
  socket.on( 'deleteAccount', function ( data ){
    io.to(raspID).emit('deleteAccount',data);
  });
  
  ////////////////////////////////////////////////////////////////////////////////////////
});