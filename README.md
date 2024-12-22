# RPS-Online

## Overview
Our project aims to bring the classic game of Rock, Paper, Scissors into the digital era by creating an online multiplayer game. Players will use hand gestures to represent their moves in 1v1 matches, competing for national rankings displayed on a dynamic leaderboard. The system integrates Teachable Machine for gesture recognition, Socket.IO for real-time communication, and a Firebase database for user accounts and statistics. The Raspberry Pi acts as the central hub for hardware integration, ensuring a seamless and immersive gaming experience for users.

RPS Online is a 1 v 1 online multiplayer game that detects a user's hand signals in the form of Rock, Paper, or Scissors. The user has 5 seconds to make their move and 7 seconds to confirm their move. On the results screen, both players' moves are shown with the current score. The user has the option to continue playing the same opponent or leave. Once a player has left, both users’ statistics and rankings will be updated on their respective dashboards.

## Demo Video
[![image](https://github.com/user-attachments/assets/a5ddf3c8-a2bd-495f-8747-d62bcc6258f9)](https://www.youtube.com/watch?v=6dW1NibxEao&t=30s)

## System Architecture
![image](https://github.com/user-attachments/assets/5f59d915-04b8-407d-b649-7e5131ee3d4b)
Our system architecture starts at the client, who uses an image sensor via the webcam on their laptop to forward hand signals made to the server. The server can then send any data received from the client to the Raspberry Pi 4 which will process the information. After this is done, the processed information is sent to our Firebase database where info can be retrieved upon approval. 

Firebase stores all user statistics including usernames and passwords. To combat security issues, our Raspberry Pi was given special admin rights to the Firebase database using a unique client ID that can only be accessed within the node.js file. 

### Selecting Move
![image](https://github.com/user-attachments/assets/f5433f7e-f839-4f05-a738-5a965f318b9a)
Upon making a move, the system will ask you to confirm or redo the pick. If the user fails to choose an option, the system will auto confirm the last pick made. If one user decides to redo their pick, the other opponent will be stuck in a wait screen until further notice from the other client.

### Results of the Game
![image](https://github.com/user-attachments/assets/87b11fa5-0a03-4436-b5ec-71549bb63293)
After entering the results screen, the users have a chance to continue playing with the same opponent or leave the game. If one user decides to leave, the other must disconnect. Upon disconnect, all user stats and rankings will be updated in real-time.

### Leaderboards & Statistics
![image](https://github.com/user-attachments/assets/69cb1245-9335-446d-9e5c-796311a5d80b)
The statistics stored in Firebase are used to dynamically display a list of the top players based on their game history on the Leaderboards & Statistics screen, as seen on the left. On the right, the full stats of the top 3 players are displayed in a scrollbox.

### User Dashboard
![image](https://github.com/user-attachments/assets/88c8abfb-8282-41a9-b23c-cbedd3aaa404)
The My Dashboard screen simply displays the logged in user's full stats such as wins, losses, number of games played, win rate, most used and least used choices, as well as their ranking on the leaderboard.
