// Use Socket IO Client for Glitch
const io = require ('socket.io-client');

// Require Admin
var admin = require("firebase-admin");
// Require JSON for Admin Credentials
var serviceAccount = require("/home/pi/Desktop/finalProject/lab2-a3c4f-firebase-adminsdk-zo0gc-5a8d7388fb.json");

// Initilaization for Admin Credential Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lab2-a3c4f-default-rtdb.firebaseio.com"
});

// Database parameter
const db = admin.database();

// Database Reference
const database = db.ref();

// User COunt Initial
var totalCount = 3;

//Dictionary holding base values
const initialDict = {
    "PlayerCount": 3,
    "users": {
        "admin": {
            "password" : "Password!",
            "Win": 0,
            "Lost": 0,
            "Total": 0,
            "Ratio": 0,
            "Rock": 0,
            "Paper": 0,
            "Scissors": 0,
            "Most": "NA",
            "Least": "NA",
            "Rank": 0
        },
        "shiv": {
            "password" : "Password!",
            "Win": 0,
            "Lost": 0,
            "Total": 0,
            "Ratio": 0,
            "Rock": 0,
            "Paper": 0,
            "Scissors": 0,
            "Most": "NA",
            "Least": "NA",
            "Rank": 0
        },
        "seb": {
            "password" : "Password!",
            "Win": 0,
            "Lost": 0,
            "Total": 0,
            "Ratio": 0,
            "Rock": 0,
            "Paper": 0,
            "Scissors": 0,
            "Most": "NA",
            "Least": "NA",
            "Rank": 0
        }
    },
    "Ranks": {
        1: "admin",
        2: "shiv",
        3: "seb"
    },
    "Queue": {
        1: 'NA'
    },
    "confirmedQueue": {
        1: 'No'
    },
    "stayQueue": {
        1: 'No'
    }
}
// Set dictionary in Firebase
database.set(initialDict);

// Get Socket from Glitch Site
let socket = io('https://chivalrous-brass-gourd.glitch.me');

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: connect() (socket event handler) 
// Inputs: None
// Description: This function is triggered when the socket successfully connects. It emits a 'piID' event with the 
//              socket's unique ID (socket.id), which is used to identify the Raspberry Pi in the system.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
socket.on('connect', function() {
    socket.emit('piID', {ID: socket.id});
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: usernameID() (socket event handler) 
// Inputs: data (object containing the username and client ID)
// Description: This function updates the 'users' node in the database with the socket ID associated with a given username. 
//              If the username does not already exist in the database, a new entry is created. After updating the socket ID, 
//              it triggers the rankUpdate() function to refresh the rankings.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
socket.on('usernameID', function(data) {
    console.log(data.username);
    if (data.username == null) {
        database.child('users').update({
            [data.username]: {
                socketID: data.clientID
            }
        });
    }
    else {
        database.child('users').child(data.username).update({
            socketID: data.clientID
        });
    }
    rankUpdate();
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: updateQueue() (socket event handler) 
// Inputs: data (object containing the user's queue ID and username)
// Description: This function updates the 'Queue' in the database by setting the specified queue ID to the given username. 
//              It is triggered when a user joins or is placed in a specific queue, updating the queue with their username.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
socket.on("updateQueue", function(data){
    const ID = data.queueID;
    const username = data.username;
    database.child('Queue').update({
        [ID]: username
    })
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: updateConfirm() (socket event handler)
// Inputs: data (object containing the user's queue ID)
// Description: This function updates the 'confirmedQueue' in the database, setting the provided user's queue ID to "No" 
//              to indicate that they have not confirmed. It is triggered when a user opts out or changes their confirmation 
//              status, updating the queue status accordingly.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
socket.on("updateConfirm", function(data){
    const ID = data.queueID;
    database.child('confirmedQueue').update({
        [ID]: 'No'
    })
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: updateStay() (socket event handler)
// Inputs: data (object containing the user's queue ID)
// Description: This function updates the 'stayQueue' in the database, setting the provided user's queue ID to "No" 
//              to indicate that they no longer wish to stay. It is triggered when a user opts out or changes their stay 
//              status, updating the queue status accordingly.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
socket.on("updateStay", function(data){
    const ID = data.queueID;
    database.child('stayQueue').update({
        [ID]: 'No'
    })
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: pickConfirmed() (socket event handler)
// Inputs: data (object containing the user's ID and their pick choice)
// Description: This function updates the 'confirmedQueue' in the database to mark the current user's pick as confirmed 
//              by setting their corresponding queue ID to "Yes." It then calls the function 'checkOpponentConfirmed' 
//              to check if both users in the current pair have confirmed their choices. If both users have confirmed, 
//              the function will notify the clients of the confirmation and update their statuses accordingly.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
socket.on('pickConfirmed', function(data){
    const queueID = data.ID;
    const opponentPick = data.pick;
    database.child('confirmedQueue').update({
        [queueID]: 'Yes'
    })
    checkOpponentConfirmed(queueID, opponentPick);
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: checkOpponentConfirmed()
// Inputs: ID (integer representing the ID of the user in the confirmed queue), opponentPick (string representing the opponent's choice)
// Description: This function checks if both users in a pair of queue positions have confirmed their choices. It retrieves the 
//              'confirmedQueue' data from the database and checks the current user (with ID) and their opponent (ID +/- 1) 
//              to see if both have selected "Yes" to confirm their choices. If both have confirmed, it sends a "bothConfirmed" 
//              event to the client and updates the 'confirmedQueue' to set both users' statuses to "No" (indicating they no longer 
//              need to confirm). The function also sends the opponent's pick to the current user using the "opponentPick" event. 
//              It handles both even and odd numbered IDs to correctly check adjacent users.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function checkOpponentConfirmed(ID, opponentPick){
    const queue = database.child('confirmedQueue');
    queue.once('value', (snapshot) => {
        const queueIDs = snapshot.val();
        if (parseInt(ID) % 2 === 0) {
            socket.emit('opponentPick', {ID: parseInt(ID) - 1, pick: opponentPick});
            if (queueIDs[parseInt(ID) - 1] === 'Yes' && queueIDs[parseInt(ID)] === 'Yes') {
                socket.emit('bothConfirmed', {ID: parseInt(ID) - 1});
                database.child('confirmedQueue').update({
                    [parseInt(ID) - 1]: 'No',
                    [ID]: 'No'
                })
            }
        } else if (parseInt(ID) % 2 === 1) {
            socket.emit('opponentPick', {ID: parseInt(ID) + 1,  pick: opponentPick});
            if (queueIDs[parseInt(ID) + 1] === 'Yes' && queueIDs[parseInt(ID)] === 'Yes') {
                socket.emit('bothConfirmed', {ID: parseInt(ID)});
                database.child('confirmedQueue').update({
                    [parseInt(ID)]: 'No',
                    [parseInt(ID) + 1]: 'No'
                })
            }
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: stayPressed (socket event handler)
// Inputs: data (object containing the queueID of the user who pressed "stay")
// Description: This function listens for the "stayPressed" event from the client, which includes the queueID of the user who 
//              decided to stay in the game. It updates the 'stayQueue' in the database, setting the value for the user's queueID 
//              to 'Yes'. After updating the stayQueue, it calls the checkOpponentStay function to verify if the current user and 
//              their opponent both wish to stay. If both users have selected "Yes", it triggers further actions like sending 
//              relevant notifications to the client.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
socket.on('stayPressed', function(data){
    const queueID = data.ID;
    database.child('stayQueue').update({
        [queueID]: 'Yes'
    })
    checkOpponentStay(queueID);
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: checkOpponentStay()
// Inputs: ID (integer representing the ID of the user in the stay queue)
// Description: This function checks if both users in a pair of queue positions have selected "Yes" to stay in the game. 
//              It first retrieves the 'stayQueue' data from the database and checks the status of the current user (with ID)
//              and their opponent (ID +/- 1). If both users have selected "Yes" to stay, it sends a "bothStayed" event to the 
//              client, indicating that both players have agreed to stay. The function then updates the 'stayQueue' to mark 
//              both players as "No" (indicating that they no longer wish to stay in the game). It handles both even and odd 
//              numbered IDs to check adjacent users correctly.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkOpponentStay(ID) {
    const queue = database.child('stayQueue');
    queue.once('value', (snapshot) => {
        const queueIDs = snapshot.val();
        if (parseInt(ID) % 2 === 0) {
            if (queueIDs[parseInt(ID) - 1] === 'Yes' && queueIDs[parseInt(ID)] === 'Yes') {
                socket.emit('bothStayed', {ID: parseInt(ID) - 1});
                database.child('stayQueue').update({
                    [parseInt(ID) - 1]: 'No',
                    [parseInt(ID)]: 'No'
                })
            }
        } else if (parseInt(ID) % 2 === 1) {
            if (queueIDs[parseInt(ID) + 1] === 'Yes' && queueIDs[parseInt(ID)] === 'Yes') {
                socket.emit('bothStayed', {ID: parseInt(ID)});
                database.child('stayQueue').update({
                    [parseInt(ID)]: 'No',
                    [parseInt(ID) + 1]: 'No'
                })
            }
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: requestOpponent (socket event handler)
// Inputs: data (object containing the queueID of the user requesting an opponent)
// Description: This function listens for the "requestOpponent" event from the client, which contains the queueID of the 
//              user looking for an opponent. It checks the 'Queue' node in the database for both the current user's and 
//              the opponent's usernames by referencing the queueID and the secondID (previous queue). Once both usernames 
//              are retrieved, it queries the 'users' node for additional user data (most and least used choices). The function 
//              then sends a "sendRoomData" event to the client with the relevant user data for both players (most and least used 
//              choices), as well as their queueIDs.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
socket.on('requestOpponent', function(data) {
    const secondID = parseInt(data.queueID) - 1;
    const checkQueueOne = database.child('Queue').child(data.queueID);
    const checkQueueTwo = database.child('Queue').child(secondID);
    const users = [];
    checkQueueOne.once('value', (snapshot) => { 
        const usernameTwo = snapshot.val();
        users.push(usernameTwo);
        checkQueueTwo.once('value', (snapshot) => { 
            const usernameOne = snapshot.val();
            users.push(usernameOne);
            const userCheck = database.child('users');
            userCheck.once('value', (snapshot) => { 
                const userData = snapshot.val();
                socket.emit('sendRoomData',{ IDTwo: data.queueID,
                                            IDTwoMost: userData[users[0]].Most,
                                            IDTwoLeast: userData[users[0]].Least, 
                                            IDOne: secondID, 
                                            IDOneMost: userData[users[1]].Most, 
                                            IDOneLeast: userData[users[1]].Least,  
                                        });
            });
        });
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: login (socket event handler)
// Inputs: Data (object containing the username, password, and clientID of the user attempting to log in)
// Description: This function listens for the "login" event from the client, which includes the username and password. 
//              It first checks if the username exists in the 'users' node of the database. If the username doesn't exist, 
//              it sends a "registrationNeeded" event to the client. If the username exists, it compares the provided password 
//              with the stored password. If the passwords match, it sends a "loginSuccessful" event with the user's details, 
//              including their win, loss, total games, win rate, most and least used choices, and rank. It also triggers the 
//              rankUpdate function. If the passwords do not match, it sends an "incorrectUP" event to the client.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
socket.on('login', function(data) {
    const username = data.username;
    const password = data.password;
    database.child('users').child(username).once('value', (snapshot) => { 
        const userData = snapshot.val();
        if (!userData){
            socket.emit('registrationNeeded', {clientID: data.clientID});
        } else {
            if (userData.password === password){
                socket.emit('loginSuccessful', {clientID: data.clientID, username: username, win: userData.Win, loss: userData.Lost, played: userData.Total, winRate: userData.Ratio, mostUsed: userData.Most, leastUsed: userData.Least, rank: userData.Rank, numPaper: userData.Paper, numRock: userData.Rock, numScissors: userData.Scissors});
                rankUpdate();
            } else {
                socket.emit('incorrectUP', {clientID: data.clientID});
            }
        }
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: updatePassword (socket event handler)
// Inputs: data (object containing the username, new password, confirmed password, and clientID of the user)
// Description: This function listens for the "updatePassword" event from the client, which includes the username, 
//              new password, and confirmed password for updating. It first checks if the new password and confirmed password 
//              match. Then, it verifies that the new password meets the criteria (at least 7 characters, contains an uppercase 
//              letter, and contains a non-alphanumeric character). If all conditions are met, the password is updated in the 
//              database and a "passwordSuccess" event is sent to the client. If any condition is not met, the corresponding 
//              error event is emitted to the client (e.g., "passwordMatch", "passwordCharacters", or "passwordLength").
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
socket.on('updatePassword', function(data) {
    const username = data.username;
    const passwordNew = data.passwordNew;
    const passwordConfirmed = data.passwordConfirmed;
    if (passwordNew === passwordConfirmed) {
        if (passwordNew.length >= 7) {
            if (/[A-Z]/.test(passwordNew) && /[^a-zA-Z0-9\s]/.test(passwordNew)){
                database.child('users').child(username).update({
                    password: passwordNew
                });
                socket.emit('passwordSuccess', {clientID: data.clientID});
            } else {
                socket.emit('passwordCharacters', {clientID: data.clientID});
            }
        } else {
            socket.emit('passwordLength', {clientID: data.clientID});
        }
    } else {
        socket.emit('passwordMatch', {clientID: data.clientID});
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: register (socket event handler)
// Inputs: data (object containing the username, password, and clientID of the user attempting to register)
// Description: This function listens for the "register" event from the client, which contains the username and password 
//              for registration. It first checks if the username is already taken by querying the 'users' node in the 
//              database. If the username exists, it sends a "usernameTaken" event to the client. If the password meets 
//              the criteria (at least 7 characters, contains an uppercase letter, and contains a non-alphanumeric character), 
//              the new user is registered by adding their information to the 'users' node and updating the player count in the 
//              database. A "registerSuccessful" event is sent to the client with the user's details. If the password does 
//              not meet the criteria, the appropriate error event ("passwordCharacters" or "passwordLength") is emitted to the 
//              client.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


socket.on('register', function(data) {
    const username = data.username;
    const password = data.password;
    database.child('users').child(username).once('value', (snapshot) => {
        if (snapshot.exists()) {
            socket.emit('usernameTaken', {clientID: data.clientID});
        } else {
            if (password.length >= 7) {
                if (/[A-Z]/.test(password) && /[^a-zA-Z0-9\s]/.test(password)){
                    totalCount = totalCount + 1;
                    database.update({
                        'PlayerCount': totalCount
                    });
                    database.child('users').update({
                        [username]: {
                            "password" : password,
                            "Win": 0,
                            "Lost": 0,
                            "Total": 0,
                            "Ratio": 0,
                            "Rock": 0,
                            "Paper": 0,
                            "Scissors": 0,
                            "Most": "NA",
                            "Least": "NA",
                            "Rank": "NA"
                        }
                    });
                    socket.emit('registerSuccessful', {clientID: data.clientID, username: username, win: 0, loss: 0, played: 0, winRate: 0, mostUsed: 'NA', leastUsed: 'NA', rank: 0, numRock: 0, numPaper: 0, numScissors: 0});
                    rankUpdate();
                } else {
                    socket.emit('passwordCharacters', {clientID: data.clientID});
                }
            } else {
                socket.emit('passwordLength', {clientID: data.clientID});
            }
        }
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: deleteAccount (socket event handler)
// Inputs: data (object containing the username, queueID, and rank of the user to be deleted)
// Description: This function listens for the "deleteAccount" event from the client, which includes the username, 
//              queueID, and rank of the user requesting deletion. If the user is in a queue, their entry is removed 
//              from the 'Queue' node. If the user's rank is greater than 3, their data is removed from both the 'users' 
//              and 'Rank' nodes in the database. The total player count is then decreased by 1 and updated in the 'PlayerCount' 
//              node.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
socket.on('deleteAccount', function(data){
    const username = data.username;
    const queueID = data.ID;
    const rank = data.rank;
    if (queueID !== null){
        database.child('Queue').child(queueID).remove();
    }
    if (parseInt(rank) > 3) {
        database.child('users').child(username).remove();
        database.child('Rank').child(parseInt(rank)).remove();
    }
    totalCount = totalCount - 1;
    database.update({
        'PlayerCount': totalCount
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: updateDashboard (socket event handler)
// Inputs: data (object containing the user's updated statistics)
// Description: This function listens for the "updateDashboard" event from the client, which contains updated statistics 
//              for a specific user (such as wins, losses, total games, win rate, and usage of rock, paper, and scissors). 
//              It then updates the user's data in the 'users' node in the database with the new values. After updating the 
//              user data, it triggers the rankUpdate function to refresh the rankings and update the leaderboard.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
socket.on("updateDashboard", function(data){
    const username = data.username;
    const win = data.win;
    const loss = data.loss;
    const total = data.totalGames;
    const winRate = data.winRate;
    const rock = data.rock;
    const paper = data.paper;
    const scissors = data.scissors;
    const most = data.mostUsed;
    const least = data.leastUsed;
    database.child('users').child(username).update({
        "Win": win,
        "Lost": loss,
        "Total": total,
        "Rock": rock,
        "Ratio": winRate,
        "Paper": paper,
        "Scissors": scissors,
        "Most" : most,
        "Least": least
    });
    rankUpdate();
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: rankUpdate()
// Inputs: None
// Description: This function retrieves user data from the 'users' node in the database and processes the users' wins to 
//              create an array of rankings. The array is sorted by the number of wins in descending order. It then updates 
//              the 'Ranks' node with the sorted user rankings and updates each user's rank in the 'users' node. After updating 
//              the rankings, it triggers functions to send updated rankings to all clients ('sendRankForAll'), send 
//              individual user ranks ('sendRankPersonal'), and update the leaderboard ('sendLeaderboard').
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function rankUpdate(){
    database.child('users').once('value', (snapshot) => {
        const userData = snapshot.val();
        const userRanks = [];
        for (const username in userData) {
            if (username) {
                const wins = userData[username].Win;
                userRanks.push({ username: username, wins: [wins] });
            }
        }
        userRanks.sort((a, b) => b.wins - a.wins);
        userRanks.forEach((user, index) => {
            database.child('Ranks').update({
                [index + 1]: user.username,
            });
            database.child('users').child(user.username).update({
                "Rank" : index + 1
            });
        });
    });
    sendRankForAll();
    sendRankPersonal();
    sendLeaderboard();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: sendRankForAll()
// Inputs: None
// Description: This function retrieves the rankings from the 'Ranks' node in the database. It then emits an "updateRank" 
//              event to the client, sending the entire rankings data along with the total count of users. This allows the 
//              client to update and display the global rankings for all users.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function sendRankForAll(){
    database.child('Ranks').once('value', (snapshot) => {
        const rankings = snapshot.val();
        socket.emit('updateRank', {ranks: rankings, total: totalCount});
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: sendRankPersonal()
// Inputs: None
// Description: This function retrieves all user data from the 'users' node in the database. It then iterates through the 
//              data and for each user, it emits an "updatePersonalRank" event to the client, sending the user's socket ID 
//              and their rank to the client. This allows the client to update and display the individual user's rank.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function sendRankPersonal(){
    database.child('users').once('value', (snapshot) => {
        const userData = snapshot.val();
         for (usernames in userData) {
            socket.emit("updatePersonalRank", {clientID: userData[usernames].socketID, rank: userData[usernames].Rank});
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name: sendLeaderboard()
// Inputs: None
// Description: This function retrieves the top three players' rankings from the 'Ranks' node in the database.
//              It iterates through the rankings and adds the top three players to an array (`topThree`), skipping
//              any 'null' entries. After determining the top three players, it retrieves additional user statistics 
//              (like wins, total games, win rate, etc.) from the 'users' node in the database. It then sends this data 
//              to the client through a socket event "updateLeaderboardStats", which includes detailed statistics for 
//              the top three players (such as wins, total games played, and various other metrics).
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function sendLeaderboard() {
    database.child('Ranks').once('value', (snapshot) => {
        const topThree = [];
        count = 0;
        const rankings = snapshot.val();
        for (const placings in rankings) {
            if (count > 3) {

            }
            else if (rankings[placings] != 'null') {
                count++;
                topThree.push(rankings[placings]);
            }
        }
        console.log(topThree[0]);
        console.log(topThree[1]);
        console.log(topThree[2]);
        database.child('users').once('value', (snapshot) => {
            const userDict = snapshot.val();
            socket.emit("updateLeaderboardStats", {one: topThree[0], oneWins: userDict[topThree[0]].Win, oneTotal: userDict[topThree[0]].Total, oneWinRate: userDict[topThree[0]].Ratio, oneMost: userDict[topThree[0]].Most, oneLeast: userDict[topThree[0]].Least, oneRank: userDict[topThree[0]].Rank,
                         two: topThree[1], twoWins: userDict[topThree[1]].Win, twoTotal: userDict[topThree[1]].Total, twoWinRate: userDict[topThree[1]].Ratio, twoMost: userDict[topThree[1]].Most, twoLeast: userDict[topThree[1]].Least, twoRank: userDict[topThree[1]].Rank,
                         three: topThree[2], threeWins: userDict[topThree[2]].Win, threeTotal: userDict[topThree[2]].Total, threeWinRate: userDict[topThree[2]].Ratio, threeMost: userDict[topThree[2]].Most, threeLeast: userDict[topThree[2]].Least, threeRank: userDict[topThree[2]].Rank
                        });
        });
    });
}
