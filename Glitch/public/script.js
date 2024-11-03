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

socket.on( 'selectMoveScreen', function ( data )
{
  window.location.href="Game_SelectMove.html";
  console.log("Reached Change State");
});

socket.on( 'opponentPick', function ( data )
{
  console.log("Opponents Pick Received");
  var tempPick = data.pick;
  var opponentsPick = checkPick(tempPick);
  localStorage.setItem("opponentPick", opponentsPick);
});

socket.on( 'bothPicksHaveBeenMade', function ( data )
{
  window.location.href="Game_Result.html";
});

socket.on( 'bothStaysHaveBeenMade', function ( data )
{
  window.location.href="Game_SelectMove.html";
});

socket.on( 'statsPick', function ( data )
{
  //-----
  window.location.href="Game_SelectMove.html";
});

socket.on( 'opponentLeft', function ( data )
{
  //Oppenent left
  gameWaitingLeave();
  
});

socket.on( 'updateRank', function ( data )
{
  localStorage.setItem("rankNames", data.ranks);
  localStorage.setItem("numRanks", data.total);
  //console.log("USER RANKS");
  //console.log(data);
});

socket.on( 'updatePersonalRank', function ( data )
{
  localStorage.setItem("userRank", data.rank);
});

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

function checkOpponentPick() {
  const opponentPickInterval = setInterval(function () {
    if (localStorage.getItem("opponentPick") !== "0") {
      clearInterval(opponentPickInterval);
    }
  }, 2000);
}

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

function hideElement(elementToHide) {
  document.getElementById(elementToHide).style.display = 'none';
}

function showElement(elementToShow) {
  document.getElementById(elementToShow).style.display = 'block';
}

// function toWaiting() {
//   localStorage.setItem("numRedo", 0);
//   queueWaiting();
//   socket.emit('checkQueue1',{clientID : socket.id});
// }

function toLeaderboards() {
  localStorage.setItem("numRedo", 0);
  // localStorage.getItem("username");
  // localStorage.getItem("userWins");
  // localStorage.getItem("userLoss");
  // localStorage.getItem("userPlayed");
  // localStorage.getItem("userWinRate");
  // localStorage.getItem("mostUsed");
  // localStorage.getItem("leastUsed");
  // localStorage.getItem("userRank"); //Not needed
  // localStorage.getItem("numRock");
  // localStorage.getItem("numPaper");
  // localStorage.getItem("numScissors");
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

function toPlayNow() {
  window.location.href="Play.html";
}

function toH2P() {
  window.location.href="HowToPlay.html";
}

function to1v1() {
  localStorage.setItem("numRedo", 0);
  queueWaiting();
  console.log(localStorage.getItem("username"));
  socket.emit('checkQueue',{clientID : socket.id, username : localStorage.getItem("username")});
}

function toKOTH() {
  localStorage.setItem("numRedo", 0);
  queueWaiting();
}

function toSelectMove() {
  gameWaitingStay();
  localStorage.setItem("numRedo", 0);
  socket.emit('stayPressed',{clientID : socket.id, ID : localStorage.getItem("queueID")});
  //window.location.href="Game_SelectMove.html";//------------------
}

function toConfirmMove() {
  window.location.href="Game_ConfirmMove.html";
}

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

function confirmPick() {
  gameWaiting();
  var userPick = localStorage.getItem("userPick");
  updatePickCount(userPick);
  socket.emit('pickConfirmed',{clientID : socket.id, ID : localStorage.getItem("queueID"), pick : userPick});
  console.log("Out of confirm pick");
}

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

function randomPick() {
  var randomNumber = Math.floor(Math.random() * 3);
  var choices = ["https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Rock.png?v=1713559032231", "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Paper.png?v=1713559022200", "https://cdn.glitch.global/4da04694-6b54-466e-a058-2a6f0886da40/Scissors.png?v=1713559029171"];
  return choices[randomNumber];
}

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

function typeWriter(element, text, i=0) {
  element.textContent += text[i];
  if (i === text.length - 1) {
    return;
  }
  setTimeout(() => typeWriter(element, text, i + 1), 90);
}

function sendLogin() {
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  socket.emit( 'login', {username: username.value, password: password.value, clientID : socket.id});
}

function sendRegister() {
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  socket.emit( 'register', {username: username.value, password: password.value, clientID : socket.id});
}

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

function startDelete() {
  document.getElementById('deleteAccountButton').style.display = 'none';
  document.getElementById('cancelDeleteButton').style.display = 'inline-block';
  document.getElementById('confirmDeleteButton').style.display = 'inline-block';
}

function cancelDelete() {
  document.getElementById('deleteAccountButton').style.display = 'block';
  document.getElementById('cancelDeleteButton').style.display = 'none';
  document.getElementById('confirmDeleteButton').style.display = 'none';
}

function deleteAccount() {
  socket.emit('deleteAccount',{ID : localStorage.getItem("queueID"), username : localStorage.getItem("username"), rank : localStorage.getItem("userRank")});
  window.location.href="Login.html";
}

