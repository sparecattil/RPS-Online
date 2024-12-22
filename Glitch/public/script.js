var socket = io.connect('https://chivalrous-brass-gourd.glitch.me');
//var socket = io.connect('/');
//var queueID = "NA";

/*
window.addEventListener('beforeunload', function (e) {
  socket.emit('outOfQueue');
});
*/

window.addEventListener('beforeunload', function(event) {
    // Inform the server that the tab is about to be closed
    var data = { ID: localStorage.getItem("queueID") };
    var jsonData = JSON.stringify(data);
    var blob = new Blob([jsonData], { type: 'application/json' });
    navigator.sendBeacon('/close-tab', blob);
});

window.addEventListener('unload', function(event) {
    // Inform the server that the tab has been closed
    var data = { ID: localStorage.getItem("queueID") };
    var jsonData = JSON.stringify(data);
    var blob = new Blob([jsonData], { type: 'application/json' });
    navigator.sendBeacon('/tab-closed', blob);
});

socket.on( 'playerLeftGame', function ( data )
{
  console.log("Player left game");
  window.location.href="Play.html";
  showElement('sectionPopUp');
});

socket.on( 'connect', function ( data )
{
  socket.emit('checkQueueID',{ID : localStorage.getItem("queueID"), clientID : socket.id, username : localStorage.getItem("username")});
});

socket.on( 'roomData', function ( data )
{
  localStorage.setItem("opponentMost", data.opponentMost);
  localStorage.setItem("opponentLeast", data.opponentLeast);
});

socket.on( 'setQueueID', function ( data )
{
  console.log("Reached setQueueID");
  var tempQueueID = data.number;
  localStorage.setItem("queueID", tempQueueID);
});

// Listens for 'selectMoveScreen' from the server, switches page to the select move screen
socket.on( 'selectMoveScreen', function ( data )
{
  window.location.href="Game_SelectMove.html";
  console.log("Reached Change State");
});

/*
  Listens for 'opponentPick' from the server, saves the pick
  in local storage to be checked against and displayed
  later on the results screen
*/
socket.on( 'opponentPick', function ( data )
{
  console.log("Opponents Pick Received");
  var tempPick = data.pick;
  var opponentsPick = checkPick(tempPick);
  localStorage.setItem("opponentPick", opponentsPick);
});

// Listens for 'bothPicksHaveBeenMade' from the server, switches page to the result screen
socket.on( 'bothPicksHaveBeenMade', function ( data )
{
  window.location.href="Game_Result.html";
});

// Listens for 'bothStaysHaveBeenMade' from the server, both users chose to rematch, switches page to the select move screen
socket.on( 'bothStaysHaveBeenMade', function ( data )
{
  window.location.href="Game_SelectMove.html";
});

socket.on( 'statsPick', function ( data )
{
  //-----
  window.location.href="Game_SelectMove.html";
});

// Listens for 'opponentLeft' from the server, tells the user to leave
socket.on( 'opponentLeft', function ( data )
{
  //Oppenent left
  gameWaitingLeave();
  
});

socket.on( 'updateRank', function ( data )
{
  localStorage.setItem("rankNames", data.ranks);
  localStorage.setItem("numRanks", data.total);
  /*
  console.log("USER RANKS");
  console.log(data);
  */
});

// Listens for 'updatePersonalRank' from the server, saves the user's updated rank in local storage
socket.on( 'updatePersonalRank', function ( data )
{
  localStorage.setItem("userRank", data.rank);
});

/*
  Listens for the server to emit 'updateLeaderboardStats', this dynamically updates the stats
  for the top 3 players on the leaderboard by saving each stat for each user in local storage
*/
socket.on( 'updateLeaderboardStats', function ( data )
{
  localStorage.setItem("oneUser", data.one);
  localStorage.setItem("oneWins", data.oneWins);
  localStorage.setItem("oneTotal", data.oneTotal);
  localStorage.setItem("oneWinRate", data.oneWinRate);
  localStorage.setItem("oneMost", data.oneMost);
  localStorage.setItem("oneLeast", data.oneLeast);
  localStorage.setItem("oneRank", data.oneRank);
  localStorage.setItem("twoUser", data.two);
  localStorage.setItem("twoWins", data.twoWins);
  localStorage.setItem("twoTotal", data.twoTotal);
  localStorage.setItem("twoWinRate", data.twoWinRate);
  localStorage.setItem("twoMost", data.twoMost);
  localStorage.setItem("twoLeast", data.twoLeast);
  localStorage.setItem("twoRank", data.twoRank);
  localStorage.setItem("threeUser", data.three);
  localStorage.setItem("threeWins", data.threeWins);
  localStorage.setItem("threeTotal", data.threeTotal);
  localStorage.setItem("threeWinRate", data.threeWinRate);
  localStorage.setItem("threeMost", data.threeMost);
  localStorage.setItem("threeLeast", data.threeLeast);
  localStorage.setItem("threeRank", data.threeRank);
  //console.log("LeaderBoard Stats");
  //console.log(data);
});


///////////////////////////////////////////////////////////////

/*
Listens for the server to emit 'loginSuccessful', once a user logs in, the server emits
this and the user is sent theirstats from the database and they are saved in local storage,
the window is then switched to the logged-in state
*/
socket.on( 'loginSuccessful', function ( data )
{
  console.log("Login Successful");
  localStorage.setItem("username", data.username);
  localStorage.setItem("userWins", data.win);
  localStorage.setItem("userLoss", data.loss);
  localStorage.setItem("userPlayed", data.played);
  localStorage.setItem("userWinRate", data.winRate);
  localStorage.setItem("mostUsed", data.mostUsed);
  localStorage.setItem("leastUsed", data.leastUsed);
  localStorage.setItem("userRank", data.rank);
  localStorage.setItem("numRock", data.numRock);
  localStorage.setItem("numPaper", data.numPaper);
  localStorage.setItem("numScissors", data.numScissors);
  window.location.href="LoggedIn.html";
});

socket.on( 'incorrectUP', function ( data )
{
  console.log("incorrectUP");
  document.getElementById('failText').style.display = 'block';
  document.getElementById('failTextUser').style.display = 'none';
  document.getElementById('failTextTaken').style.display = 'none';
  document.getElementById('failTextLength').style.display = 'none';
  document.getElementById('failTextMatch').style.display = 'none';
  document.getElementById('failTextCharacters').style.display = 'none';
  document.getElementById('failTextMatch').style.display = 'none';
  document.getElementById('failTextSuccess').style.display = 'none';
});

socket.on( 'registrationNeeded', function ( data )
{
  console.log("registrationNeeded");
  document.getElementById('failTextUser').style.display = 'block';
  document.getElementById('failText').style.display = 'none';
  document.getElementById('failTextTaken').style.display = 'none';
  document.getElementById('failTextLength').style.display = 'none';
  document.getElementById('failTextMatch').style.display = 'none';
  document.getElementById('failTextCharacters').style.display = 'none';
  document.getElementById('failTextMatch').style.display = 'none';
  document.getElementById('failTextSuccess').style.display = 'none';
});

/*
  Listens for the server to emit 'registerSuccessful', server emits once a user has registered,
  get the initial values for a new account that is sent from the server, save them to local storage,
  switch window to logged in state
*/
socket.on( 'registerSuccessful', function ( data )
{
  document.getElementById('failTextTaken').style.opacity = 0;
  console.log("registerSuccessful");
  var username = data.username;
  localStorage.setItem("username", data.username);
  localStorage.setItem("userWins", data.win);
  localStorage.setItem("userLoss", data.loss);
  localStorage.setItem("userPlayed", data.played);
  localStorage.setItem("userWinRate", data.winRate);
  localStorage.setItem("mostUsed", data.mostUsed);
  localStorage.setItem("leastUsed", data.leastUsed);
  localStorage.setItem("userRank", data.rank);
  localStorage.setItem("numRock", data.numRock);
  localStorage.setItem("numPaper", data.numPaper);
  localStorage.setItem("numScissors", data.numScissors);
  window.location.href="LoggedIn.html";
  
});

socket.on( 'usernameTaken', function ( data )
{
  console.log("usernameTaken");
  document.getElementById('failTextTaken').style.display = 'block';
  document.getElementById('failText').style.display = 'none';
  document.getElementById('failTextUser').style.display = 'none';
  document.getElementById('failTextLength').style.display = 'none';
  document.getElementById('failTextCharacters').style.display = 'none';
  document.getElementById('failTextMatch').style.display = 'none';
  document.getElementById('failTextMatch').style.display = 'none';
  document.getElementById('failTextSuccess').style.display = 'none';
});

socket.on( 'passwordLength', function ( data )
{
  console.log("passwordLength");
  document.getElementById('failTextLength').style.display = 'block';
  document.getElementById('failText').style.display = 'none';
  document.getElementById('failTextUser').style.display = 'none';
  document.getElementById('failTextTaken').style.display = 'none';
  document.getElementById('failTextMatch').style.display = 'none';
  document.getElementById('failTextCharacters').style.display = 'none';
  document.getElementById('failTextMatch').style.display = 'none';
  document.getElementById('failTextSuccess').style.display = 'none';
});

socket.on( 'passwordCharacters', function ( data )
{
  console.log("passwordCharacters");
  document.getElementById('failTextTaken').style.display = 'none';
  document.getElementById('failText').style.display = 'none';
  document.getElementById('failTextUser').style.display = 'none';
  document.getElementById('failTextLength').style.display = 'none';
  document.getElementById('failTextCharacters').style.display = 'block';
  document.getElementById('failTextMatch').style.display = 'none';
  document.getElementById('failTextSuccess').style.display = 'none';
});

socket.on( 'passwordMatch', function ( data )
{
  console.log("passwordMatch");
  document.getElementById('failTextTaken').style.display = 'none';
  document.getElementById('failText').style.display = 'none';
  document.getElementById('failTextUser').style.display = 'none';
  document.getElementById('failTextLength').style.display = 'none';
  document.getElementById('failTextCharacters').style.display = 'none';
  document.getElementById('failTextMatch').style.display = 'block';
  document.getElementById('failTextSuccess').style.display = 'none';
});

socket.on( 'passwordSuccess', function ( data )
{
  console.log("passwordSuccess");
  document.getElementById('failTextTaken').style.display = 'none';
  document.getElementById('failText').style.display = 'none';
  document.getElementById('failTextUser').style.display = 'none';
  document.getElementById('failTextLength').style.display = 'none';
  document.getElementById('failTextCharacters').style.display = 'none';
  document.getElementById('failTextMatch').style.display = 'none';
  document.getElementById('failTextSuccess').style.display = 'block';
});
///////////////////////////////////////////////////////////////

/*
  Starts a timer for the user's inital RPS pick that counts down to 0, based on the passed in
  duration, then checks if the opponent has made a pick yet
*/
function startTimer(duration) {
  let timer = duration;
  const timerElement = document.getElementById("timer");
  const countdown = setInterval(function () {
   timerElement.textContent = `Time To Confirm: ${timer}`;
    if (--timer < 0) {
      clearInterval(countdown);
      timerElement.textContent = "Time's up!";
      checkOpponentPick();
    }
  }, 1000);
}

// Starts a timer for the pick confirmation that counts down to 0, based on the passed in duration, then locks in the pick for the user
function startTimerConfirm(duration) {
  let timer = duration;
  const timerElement = document.getElementById("timer");
  const countdown = setInterval(function () {
   timerElement.textContent = `Time To Confirm: ${timer}`;
    if (--timer < 0) {
      clearInterval(countdown);
      timerElement.textContent = "Time's up!";
      confirmPick();
    }
  }, 1000);
}

// Checks every 2 seconds if the opponent has a pick, if so, then stop the interval loop
function checkOpponentPick() {
  const opponentPickInterval = setInterval(function () {
    if (localStorage.getItem("opponentPick") !== "0") {
      clearInterval(opponentPickInterval);
    }
  }, 2000);
}

/*
  The function for the queue that prints "Waiting For Opponent..." character by character to show
  the user that the website isn't frozen and that they are still in the queue
*/
function queueWaiting() {
  const div = document.getElementById("waitingText");
  document.getElementById("1v1Button").style.display = 'none';
  div.style.display = 'block';
  const text = "Waiting For Opponent...";
  
  function typeWriter(element, text) {
    let intervalId;
    let counter = 0;

    function updateText() {
      element.textContent = text.substring(0, counter);
      counter++;

      if (counter > text.length) {
        clearInterval(intervalId);
        counter = 0;
        setTimeout(() => {
          intervalId = setInterval(updateText, 150);
        }, 3000);
      }
    }
    intervalId = setInterval(updateText, 150);
  }
  typeWriter(div, text);
}

/*
  The function for after a user selects and confirms a pick that prints "Waiting For Opponent..."character by
  character to show the user that the website isn't frozen and that they are waiting for the opponent to select or confirm their move
*/
function gameWaiting() {
  const div = document.getElementById("waitingText");
  document.getElementById("timer").style.display = 'none';
  document.getElementById("confirmButton").style.display = 'none';
  document.getElementById("redoButton").style.display = 'none';
  div.style.display = 'block';
  const text = "Waiting For Opponent...";
  
  function typeWriter(element, text) {
    let intervalId;
    let counter = 0;

    function updateText() {
      element.textContent = text.substring(0, counter);
      counter++;

      if (counter > text.length) {
        clearInterval(intervalId);
        counter = 0;
        setTimeout(() => {
          intervalId = setInterval(updateText, 150);
        }, 3000);
      }
    }
    intervalId = setInterval(updateText, 150);
  }
  typeWriter(div, text);
}

/*
  The function for after a game is completed and the user chooses to rematch the opponent that prints
  "Waiting For Opponent..." character by character to show the user that the website isn't frozen and
  that they are waiting for the opponent to leave or rematch
*/
function gameWaitingStay() {
  const div = document.getElementById("waitingText");
  document.getElementById("stayButton").style.display = 'none';
  div.style.display = 'block';
  const text = "Waiting For Opponent...";
  
  function typeWriter(element, text) {
    let intervalId;
    let counter = 0;

    function updateText() {
      element.textContent = text.substring(0, counter);
      counter++;

      if (counter > text.length) {
        clearInterval(intervalId);
        counter = 0;
        setTimeout(() => {
          intervalId = setInterval(updateText, 150);
        }, 3000);
      }
    }
    intervalId = setInterval(updateText, 150);
  }
  typeWriter(div, text);
}

/*
  The function for after a game is completed and the opponent chooses to leave and not rematch that prints
  "Opponent Has Left - Please Leave Game" character by character to show the user that the website isn't frozen and
  that they should leave the game
*/
function gameWaitingLeave() {
  const div = document.getElementById("waitingLeave");
  document.getElementById("stayButton").style.display = 'none';
  document.getElementById("waitingText").style.display = 'none';
  div.style.display = 'block';
  const text = "Opponenet Has Left - Please Leave Game";
  
  function typeWriter(element, text) {
    let intervalId;
    let counter = 0;

    function updateText() {
      element.textContent = text.substring(0, counter);
      counter++;

      if (counter > text.length) {
        clearInterval(intervalId);
        counter = 0;
        setTimeout(() => {
          intervalId = setInterval(updateText, 150);
        }, 3000);
      }
    }
    intervalId = setInterval(updateText, 150);
  }
  typeWriter(div, text);
}

// Hides an element
function hideElement(elementToHide) {
  document.getElementById(elementToHide).style.display = 'none';
}

// Displays an element
function showElement(elementToShow) {
  document.getElementById(elementToShow).style.display = 'block';
}

/*
function toWaiting() {
  localStorage.setItem("numRedo", 0);
  queueWaiting();
  socket.emit('checkQueue1',{clientID : socket.id});
}
*/

/*
  The function for after a game is completed and the user's stats need to be updated so they are emitted to the server to
  be saved in the database, the numRedo variable is also set to 0 so that they are allowed their 3 redo
  picks in their next game again, it then sends the user to the leaderboard page
*/
function toLeaderboards() {
  localStorage.setItem("numRedo", 0);
  /*
  localStorage.getItem("username");
  localStorage.getItem("userWins");
  localStorage.getItem("userLoss");
  localStorage.getItem("userPlayed");
  localStorage.getItem("userWinRate");
  localStorage.getItem("mostUsed");
  localStorage.getItem("leastUsed");
  localStorage.getItem("userRank"); // Not needed
  localStorage.getItem("numRock");
  localStorage.getItem("numPaper");
  localStorage.getItem("numScissors");
  */
  socket.emit('leavingGame', {
    ID : localStorage.getItem("queueID"),
    clientID : socket.id,
    username : localStorage.getItem("username"),
    win : localStorage.getItem("userWins"),
    loss : localStorage.getItem("userLoss"),
    totalGames : localStorage.getItem("userPlayed"),
    winRate : localStorage.getItem("userWinRate"),
    mostUsed : localStorage.getItem("mostUsed"),
    leastUsed : localStorage.getItem("leastUsed"),
    rock : localStorage.getItem("numRock"),
    paper : localStorage.getItem("numPaper"),
    scissors : localStorage.getItem("numScissors")
  });
  
  window.location.href="Leaderboard.html";
}

// Sends the user to the Play Now page, where you can choose your game type and queue into a game
function toPlayNow() {
  window.location.href="Play.html";
}

// Sends the user to the How to Play page, where the rules and instructions are for both game types
function toH2P() {
  window.location.href="HowToPlay.html";
}

/*
  The function for after a user chooses to queue into a 1v1 game that sends them into the queue by emitting their
  username to the server with their clientID which is use to keep players connected to each other through the switching
  of pages during a game
*/
function to1v1() {
  localStorage.setItem("numRedo", 0);
  queueWaiting();
  console.log(localStorage.getItem("username"));
  socket.emit('checkQueue',{clientID : socket.id, username : localStorage.getItem("username")});
}

/*
  The function that pretends to send a user to the King of the Hill queue but it doesn't because
  we didn't have enough time to make that functionality :)
*/
function toKOTH() {
  localStorage.setItem("numRedo", 0);
  queueWaiting();
}

/*
  The function for after two users get matched up and they are being sent to the game to play each other,
  redos are set to 0 so that they can use their full 3 again, and the user's clientID is emitted to the server to keep the
  connection through window switching
*/
function toSelectMove() {
  gameWaitingStay();
  localStorage.setItem("numRedo", 0);
  socket.emit('stayPressed',{clientID : socket.id, ID : localStorage.getItem("queueID")});
  // window.location.href="Game_SelectMove.html"; //------------------
}

// Sends the user to the Confirm Move page, where during a game the user has already chosen a move but needs to confirm it or redo their pick
function toConfirmMove() {
  window.location.href="Game_ConfirmMove.html";
}

// Checks the user's pick, based on their pick, the user gets the corresponding image sent to them to display in the results screen
function checkPick(userPick) {
  if (userPick == "Rock") {
    return "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Rock.png?v=1713559032231";
  }
  else if (userPick == "Paper") {
    return "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Paper.png?v=1713559022200";
  }
  else if (userPick == "Scissors") {
    return "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Scissors.png?v=1713559029171";
  }
  else if (userPick == "None") {
    return "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/noneGuess.png?v=1713652458770";
  }
}

/*
  Checks the user's pick, based on their pick, the number of that pick is increased by 1 for their stats to later be
  sent to the server to be saved in the database for that user's stats
*/
function updatePickCount(userPick) {
  if (userPick == "Rock") {
    var numRock = parseInt(localStorage.getItem("numRock")) + 1;
    localStorage.setItem("numRock", numRock);
  }
  else if (userPick == "Paper") {
    var numPaper = parseInt(localStorage.getItem("numPaper")) + 1;
    localStorage.setItem("numPaper", numPaper);
  }
  else if (userPick == "Scissors") {
    var numScissors = parseInt(localStorage.getItem("numScissors")) + 1;
    localStorage.setItem("numScissors", numScissors);
  }
}

/*
  User has confirmed their pick, update their pick count for their stats, emit to the server that the user has
  confirmed their pick and send their updated pick stats to be saved
*/
function confirmPick() {
  gameWaiting();
  var userPick = localStorage.getItem("userPick");
  updatePickCount(userPick);
  socket.emit('pickConfirmed',{clientID : socket.id, ID : localStorage.getItem("queueID"), pick : userPick});
  console.log("Out of confirm pick");
}

/*
  A simple check for the user's number of redos in a single game, if they have already selecte to redo twice, then don't let the
  user redo, instead confirm the pick, if less the the max picks allowed, send the user back to the select move screen
*/
function checkRedo() {
  var numRedo = parseInt(localStorage.getItem("numRedo") + 1);
  localStorage.setItem("numRedo", numRedo);
  if (numRedo >= 2) {
    confirmPick();
  }
  else if (numRedo < 2) {
    window.location.href="Game_SelectMove.html";
  }
}

// Selects a random pick for the opponent, inplace for testing, may eventually be used as a bot to play against
function randomPick() {
  var randomNumber = Math.floor(Math.random() * 3);
  var choices = ["https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Rock.png?v=1713559032231", "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Paper.png?v=1713559022200", "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Scissors.png?v=1713559029171"];
  return choices[randomNumber];
}

// The logic of RPS to check who wins or if it is a tie, used for scoreString()
function checkWinner(userPick, opponentPick) {
  if (userPick == opponentPick) {
    // Tie
    return 0;
  }
  if (userPick == "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/noneGuess.png?v=1713652458770") {
    // No Pick = Lose
    return -1;
  }
  else if (userPick == "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Rock.png?v=1713559032231") {
    if (opponentPick == "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Paper.png?v=1713559022200") {
      // Rock vs Paper = Lose
      return -1;
    }
    else if (opponentPick == "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Scissors.png?v=1713559029171") {
      // Rock vs Scissors = Win
      return 1;
    }
  }
  else if (userPick == "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Paper.png?v=1713559022200") {
    if (opponentPick == "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Rock.png?v=1713559032231") {
      // Paper vs Rock = Win
      return 1;
    }
    else if (opponentPick == "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Scissors.png?v=1713559029171") {
      // Paper vs Scissors = Lose
      return -1;
    }
  }
  else if (userPick == "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Scissors.png?v=1713559029171") {
    if (opponentPick == "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Rock.png?v=1713559032231") {
      // Scissors vs Rock = Lose
      return -1;
    }
    else if (opponentPick == "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Paper.png?v=1713559022200") {
      // Scissors vs Paper = Win
      return 1;
    }
  }
}

/*
  Builds a string for the current score between two users, calculates the user's new win rate
  and saves it, saves the number of times a specific pick has been played by the user, also displays the most
  and least used pick by the opponent for mind games
*/
function scoreString(winner) {
  if (winner == 0) {
    var gameString = localStorage.getItem("gameScoreUser") + " - " + localStorage.getItem("gameScoreOpponent");
    console.log("gameString = " + gameString);
    
    var userPlayed = parseInt(localStorage.getItem("userPlayed")) + 1;
    localStorage.setItem("userPlayed", userPlayed);
    var userWins = parseInt(localStorage.getItem("userWins"));
    var userWinRate = parseInt((userWins / userPlayed) * 100);
    localStorage.setItem("userWinRate", userWinRate);
    
    checkMostUsed();
    checkLeastUsed();
    
    return gameString;
  }
  else if (winner == 1) {
    var userWins = parseInt(localStorage.getItem("userWins")) + 1;
    localStorage.setItem("userWins", userWins);
    var userPlayed = parseInt(localStorage.getItem("userPlayed")) + 1;
    localStorage.setItem("userPlayed", userPlayed);
    var userWinRate = parseInt((userWins / userPlayed) * 100) //.toFixed(2);
    localStorage.setItem("userWinRate", userWinRate);
    
    checkMostUsed();
    checkLeastUsed();
    
    var userScore = parseInt(localStorage.getItem("gameScoreUser")) + 1;
    localStorage.setItem("gameScoreUser", userScore);
    console.log("userScore = " + userScore);
    var opponentScore = localStorage.getItem("gameScoreOpponent");
    console.log("opponentScore = " + opponentScore);
    var gameString = userScore + " - " + opponentScore;
    console.log("gameString = " + gameString);
    return gameString;
  }
  else if (winner == -1) {
    var userLoss = parseInt(localStorage.getItem("userLoss")) + 1;
    localStorage.setItem("userLoss", userLoss);
    var userPlayed = parseInt(localStorage.getItem("userPlayed")) + 1;
    localStorage.setItem("userPlayed", userPlayed);
    var userWins = parseInt(localStorage.getItem("userWins"));
    var userWinRate = parseInt((userWins / userPlayed) * 100);
    localStorage.setItem("userWinRate", userWinRate);
    
    checkMostUsed();
    checkLeastUsed();
    
    var userScore = localStorage.getItem("gameScoreUser");
    console.log("userScore = " + userScore);
    var opponentScore = parseInt(localStorage.getItem("gameScoreOpponent")) + 1;
    localStorage.setItem("gameScoreOpponent", opponentScore);
    console.log("opponentScore = " + opponentScore);
    var gameString = userScore + " - " + opponentScore;
    console.log("gameString = " + gameString);
    return gameString;
  }
}

// Gets the opponent's most used pick
function checkMostUsed() {
  var numRock = parseInt(localStorage.getItem("numRock"));
  var numPaper = parseInt(localStorage.getItem("numPaper"));
  var numScissors = parseInt(localStorage.getItem("numScissors"));
    
  if (numRock >= numPaper && numRock >= numScissors) {
    console.log("numRock = " + numRock + " numPaper = " + numPaper + " numScissors = " + numScissors);
    localStorage.setItem("mostUsed", "R");
  }
  else if (numPaper >= numRock && numPaper >= numScissors) {
    localStorage.setItem("mostUsed", "P");
  }
  else {
    localStorage.setItem("mostUsed", "S");
  }
}

// Gets the opponent's least used pick
function checkLeastUsed() {
  var numRock = parseInt(localStorage.getItem("numRock"));
  var numPaper = parseInt(localStorage.getItem("numPaper"));
  var numScissors = parseInt(localStorage.getItem("numScissors"));
  console.log("numRock = " + numRock + " numPaper = " + numPaper + " numScissors = " + numScissors);
  
  if (numRock <= numPaper && numRock <= numScissors) {
    localStorage.setItem("leastUsed", "R");
  }
  else if (numPaper <= numRock && numPaper <= numScissors) {
    localStorage.setItem("leastUsed", "P");
  }
  else {
    localStorage.setItem("leastUsed", "S");
  }
}

// Prints text character by character
function typeWriter(element, text, i=0) {
  element.textContent += text[i];
  if (i === text.length - 1) {
    return;
  }
  setTimeout(() => typeWriter(element, text, i + 1), 90);
}

/*
  Gets the user's inputted username and password and emits it to the server to be checked with the database, if valid,
  log in the user
*/
function sendLogin() {
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  socket.emit( 'login', {username: username.value, password: password.value, clientID : socket.id});
}

/*
  Gets the user's inputted username and password and emits it to the server to be checked with the database, if valid,
  create the account
*/
function sendRegister() {
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  socket.emit( 'register', {username: username.value, password: password.value, clientID : socket.id});
}

// Updates the user's password
function sendPassword() {
  console.log("HERE");
  const passwordNew = document.getElementById("passLabelNew");
  var passwordConfirm = document.getElementById("passLabelConfirm");
  socket.emit( 'password', {username: localStorage.getItem("username"), clientID : socket.id, passwordNew: passwordNew.value, passwordConfirmed: passwordConfirm.value });
  console.log(passwordNew.value);
  console.log(passwordConfirm.value);
  document.getElementById("passLabelNew").value = "";
  document.getElementById("passLabelConfirm").value = "";
}

function togglePopup() {
  document.getElementById('sectionPopUp').style.display = 'none';
}


// When a user chooses to delete their account, add confirmation buttons, remove the delete account button
function startDelete() {
  document.getElementById('deleteAccountButton').style.display = 'none';
  document.getElementById('cancelDeleteButton').style.display = 'inline-block';
  document.getElementById('confirmDeleteButton').style.display = 'inline-block';
}

/*
  When a user chooses to cancel on the account confirmation, remove the confirmation buttons
  and add the initial delete account button back
*/
function cancelDelete() {
  document.getElementById('deleteAccountButton').style.display = 'block';
  document.getElementById('cancelDeleteButton').style.display = 'none';
  document.getElementById('confirmDeleteButton').style.display = 'none';
}

/*
  User confirmed account deletion, emit to the server their username and rank on the laderboard to delete the account
  associated with the username and remove the user's leaderboard entry, send the user back to the log in screen
*/
function deleteAccount() {
  socket.emit('deleteAccount',{ID : localStorage.getItem("queueID"), username : localStorage.getItem("username"), rank : localStorage.getItem("userRank")});
  window.location.href="Login.html";
}

