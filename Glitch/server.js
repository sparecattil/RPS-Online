// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const socket = require("socket.io");
const path = require("path");
let raspID;
let queueCount = 0;
let playerQueueID = {1: "NA", 2 : "NA"};
let playerMaster = {};
let usernameIDMaster = {};
let stayPick = {};
let confirmPick = {};
let idInQueue = {};
let pickCount = 0;
let stayCount = 0;


const bodyParser = require('body-parser');

app.use(bodyParser.json());

// Log endpoint for Beacon API

//Serve Login.html as default route - DONT DELETE - SHIV
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Login.html"));
});

app.use(express.static(path.join(__dirname, "public")));

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

const io = socket( listener ); //Test---

io.on( "connection",function (socket)
{
  app.post('/close-tab', (req, res) => {
    if (req.body.ID != null && req.body.ID != "NA") {
      if (req.body.ID % 2 == 1) {
        if (idInQueue[parseInt(req.body.ID) + 1] == "YES") {
          idInQueue[parseInt(req.body.ID) + 1] = "NO";
          //io.to(playerMaster[parseInt(req.body.ID) + 1]).emit('playerLeftGame',{});
        }
        else if (queueCount != 0) {
          //queueCount--;
        }
        //io.to(raspID).emit('updateClosed',{one : req.body.ID, two : parseInt(req.body.ID) + 1});
      }
      else if (req.body.ID % 2 == 0) {
        idInQueue[parseInt(req.body.ID) - 1] = "NO";
        //io.to(playerMaster[parseInt(req.body.ID) - 1]).emit('playerLeftGame',{});
        //io.to(raspID).emit('updateClosed',{one : parseInt(req.body.ID) - 1, two : req.body.ID});
      }
    }
    idInQueue[req.body.ID] = "NO";
    //console.log("Closed" + (req.body.ID + 1));
  
    res.sendStatus(200);
  });
  
  /////////////////////////////////////////////////////////////////////////////
  
  socket.on ( 'login', function( data )
  {
    io.to(raspID).emit('login', data);
  });
  
  socket.on ( 'register', function( data )
  {
    io.to(raspID).emit('register', data);
  });
  
  socket.on ( 'piID', function(data)
  {
    raspID = data.ID;
    console.log(raspID);
  });
  
  socket.on ( 'loginSuccessful', function(data)
  {
    io.to(data.clientID).emit('loginSuccessful',data); //clientID and username
  });
  
  socket.on ( 'incorrectUP', function(data)
  {
    io.to(data.clientID).emit('incorrectUP',{});
  });
  
  socket.on ( 'registrationNeeded', function(data)
  {
    io.to(data.clientID).emit('registrationNeeded',{});
  });
  
  socket.on ( 'registerSuccessful', function(data)
  {
    io.to(data.clientID).emit('registerSuccessful',data); //clientID and username
  });
  
  socket.on ( 'usernameTaken', function(data)
  {
    io.to(data.clientID).emit('usernameTaken',{});
  });
  
  socket.on ( 'passwordLength', function(data)
  {
    io.to(data.clientID).emit('passwordLength',{});
  });
  
  socket.on ( 'passwordCharacters', function(data)
  {
    io.to(data.clientID).emit('passwordCharacters',{});
  });
  
  socket.on ( 'passwordMatch', function(data)
  {
    console.log("Reached Password match");
    io.to(data.clientID).emit('passwordMatch',{});
  });
  
  socket.on ( 'passwordSuccess', function(data)
  {
    io.to(data.clientID).emit('passwordSuccess',{});
  });
  /////////////////////////////////////////////////////////////////////////////
  
  socket.on ( 'updateRank', function(data)
  {
    //console.log("Update Rank Log");
    //console.log(data);
    //console.log(data.ranks[1]);
    io.except(raspID).emit('updateRank',data);
  });
  
  socket.on ( 'updatePersonalRank', function(data)
  {
    //io.emit('updatePersonalRank',data);
    io.to(data.clientID).emit('updatePersonalRank',data);
    //console.log(data);
  });
  
  socket.on ( 'updateLeaderboardStats', function(data)
  {
    console.log(data);
    io.except(raspID).emit('updateLeaderboardStats',data);
  });
  
  socket.on ( 'leavingGame', function(data)
  {
    //stayPick[data.ID] = "NO";
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
  
  socket.on ( 'checkQueueID', function(data)
  {
    if (data.ID == "NA" || data.ID == null) {
      
    }
    else if (data.ID % 2 == 1) {
      //queueCount++; //Check
      socket.join('room' + data.ID);
      playerMaster[data.ID] = data.clientID;
    }
    else if (data.ID % 2 == 0) {
      //queueCount++; //Check
      socket.join('room' + (data.ID - 1));
      playerMaster[data.ID] = data.clientID;
    }
    io.to(raspID).emit('usernameID', data);
    console.log(data.username);
  });
  
  socket.on ( 'checkQueue', function(data)
  {
    queueCount++;
    io.to(data.clientID).emit('setQueueID',{number : queueCount});
    idInQueue[queueCount] = "YES";
    console.log(idInQueue);
    //stayPick[queueCount] = "NO";
    //confirmPick[queueCount] = "NO";
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
  
  socket.on ( 'sendRoomData', function(data)
  {
    io.to(playerMaster[parseInt(data.IDOne)]).emit('roomData',{opponentMost : data.IDTwoMost, opponentLeast : data.IDTwoLeast});
    io.to(playerMaster[parseInt(data.IDTwo)]).emit('roomData',{opponentMost : data.IDOneMost, opponentLeast : data.IDOneLeast});
    //io.to('room' + (parseInt(data.IDTwo) - 1)).emit('selectMoveScreen',{});
  });
  
  socket.on ( 'pickConfirmed', function(data)
  {
    io.to(raspID).emit('pickConfirmed',data);
    /*
    confirmPick[data.ID] = "YES";
    if (data.ID % 2 == 1) {
      if (confirmPick[data.ID] == "YES" && confirmPick[data.ID + 1] == "YES") {
        confirmPick[data.ID] = "NO";
        confirmPick[data.ID + 1] = "NO";
      }
      io.to(playerMaster[parseInt(data.ID) + 1]).emit('opponentPick',data);
      if (confirmPick[data.ID] == "NO" && confirmPick[data.ID + 1] == "NO") {
        setTimeout(function(){
          io.to("room" + data.ID).emit('bothPicksHaveBeenMade',{});
        },3000);
      }
    }
    else if (data.ID % 2 == 0) {
      if (confirmPick[data.ID] == "YES" && confirmPick[data.ID - 1] == "YES") {
        confirmPick[data.ID] = "NO";
        confirmPick[data.ID - 1] = "NO";
      }
      io.to(playerMaster[parseInt(data.ID) - 1]).emit('opponentPick',data);
      if (confirmPick[data.ID] == "NO" && confirmPick[data.ID - 1] == "NO") {
        setTimeout(function(){
          io.to("room" + (parseInt(data.ID) - 1)).emit('bothPicksHaveBeenMade',{});
        },3000);
      }
    }
    */
  });
  
  socket.on ( 'opponentPick', function(data)
  {
    io.to(playerMaster[data.ID]).emit('opponentPick',data);
  });
  
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
    /*
    stayPick[data.ID] = "YES";
    if (data.ID % 2 == 1) {
      if (stayPick[data.ID] == "YES" && stayPick[data.ID + 1] == "YES") {
        setTimeout(function(){
          stayPick[data.ID] = "NO";
          stayPick[data.ID + 1] = "NO";
          io.to("room" + data.ID).emit('bothStaysHaveBeenMade',{});
        },3000);
      }
    }
    else if (data.ID % 2 == 0) {
      if (stayPick[data.ID] == "YES" && stayPick[data.ID - 1] == "YES") {
        setTimeout(function(){
          stayPick[data.ID] = "NO";
          stayPick[data.ID - 1] = "NO";
          io.to("room" + (parseInt(data.ID) - 1)).emit('bothStaysHaveBeenMade',{});
        },3000);
      }
    }
    */
  });
  
  socket.on ( 'bothStayed', function(data)
  {
    setTimeout(function(){
        io.to("room" + data.ID).emit('bothStaysHaveBeenMade',{});
    },3000);
  });
  
  /*
  socket.on( 'disconnect', function ( data ){
    for (var key in playerMaster) {
      if (playerMaster[key] == socket.id) {
        queueCount--; //Check
      }
    }
  });
  */
  
  socket.on( 'password', function ( data ){
    io.to(raspID).emit('updatePassword',data);
  });
  
  socket.on( 'deleteAccount', function ( data ){
    io.to(raspID).emit('deleteAccount',data);
  });
  
  ////////////////////////////////////////////////////////////////////////////////////////
});