//var firebase = require( 'firebase/app' );
const io = require ('socket.io-client');
//const { getDatabase, ref, onValue, set, update, get, push, remove} = require('firebase/database');
// const firebaseConfig = {
//     apiKey: "AIzaSyBA9EKtuzzt8emK25-v3qwNld1xZ99LnfI",
//     authDomain: "lab2-a3c4f.firebaseapp.com",
//     databaseURL: "https://lab2-a3c4f-default-rtdb.firebaseio.com",
//     projectId: "lab2-a3c4f",
//     storageBucket: "lab2-a3c4f.appspot.com",
//     messagingSenderId: "901080186511",
//     appId: "1:901080186511:web:3ab394dd8d27faa353fafa",
//     measurementId: "G-WLFNCW56LX"
//   };
// firebase.initializeApp( firebaseConfig );

var admin = require("firebase-admin");
var serviceAccount = require("/home/pi/Desktop/finalProject/lab2-a3c4f-firebase-adminsdk-zo0gc-5a8d7388fb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lab2-a3c4f-default-rtdb.firebaseio.com"
});

const db = admin.database(); // Database parameter
const database = db.ref();

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
  
//set(ref(database), initialDict);
database.set(initialDict);

let socket = io('https://chivalrous-brass-gourd.glitch.me');

socket.on('connect', function() {
    socket.emit('piID', {ID: socket.id});
});
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

socket.on("updateQueue", function(data){
    const ID = data.queueID;
    const username = data.username;
    database.child('Queue').update({
        [ID]: username
    })
});

socket.on("updateConfirm", function(data){
    const ID = data.queueID;
    database.child('confirmedQueue').update({
        [ID]: 'No'
    })
});

socket.on("updateStay", function(data){
    const ID = data.queueID;
    database.child('stayQueue').update({
        [ID]: 'No'
    })
});

socket.on('pickConfirmed', function(data){
    const queueID = data.ID;
    const opponentPick = data.pick;
    database.child('confirmedQueue').update({
        [queueID]: 'Yes'
    })
    checkOpponentConfirmed(queueID, opponentPick);
});

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

socket.on('stayPressed', function(data){
    const queueID = data.ID;
    database.child('stayQueue').update({
        [queueID]: 'Yes'
    })
    checkOpponentStay(queueID);
});

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

function sendRankForAll(){
    database.child('Ranks').once('value', (snapshot) => {
        const rankings = snapshot.val();
        socket.emit('updateRank', {ranks: rankings, total: totalCount});
    });
}

function sendRankPersonal(){
    database.child('users').once('value', (snapshot) => {
        const userData = snapshot.val();
         for (usernames in userData) {
            socket.emit("updatePersonalRank", {clientID: userData[usernames].socketID, rank: userData[usernames].Rank});
        }
    });
}

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