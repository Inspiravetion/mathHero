//MATH HERO CLIENTSIDE

/*
 * Structures:
 * webworker message: {cmd: someCommand, time: someTime}
 * problem: {arg1: number, arg2: number, level: currLevel, answer: usrAnswr}
 *
 */
window.onload = function(){
//SOCKET SETUP=================================================================
    var DOMAIN = 'localhost',
    socket     = io.connect('http://' + DOMAIN + ':8002');

    socket.on('correct', correct);
    socket.on('incorrect', incorrect);
    socket.on('highScores', highScores);
    socket.on('participants', participants);
    socket.on('signIn', signIn);

    function signIn () {
    	var username = prompt('Username:', 'John Doe');
    	if(username != null){
    		socket.emit('addToParticipants', username);
    	}
    }

    function correct () {
    	myScore += level;
        socket.emit('highscores', myScore);
        document.getElementById('gameContainer').style.webkitBoxShadow = '0 0 5px 5px #00ff00';
        setTimeout(function(){
            document.getElementById('gameContainer').style.webkitBoxShadow = '0 0 5px 5px #666666';
        }, 300);
    }

    function incorrect () {
    	myScore -= 1;
        socket.emit('highscores', myScore);
        document.getElementById('gameContainer').style.webkitBoxShadow = '0 0 5px 5px #ff0000';
        setTimeout(function(){
            document.getElementById('gameContainer').style.webkitBoxShadow = '0 0 5px 5px #666666';
        }, 300);
    }

    function highScores (highscores) {
        removeChildren(document.getElementById('highscores'));
        document.getElementById('highscores').innerHTML = '<h3>HighScores</h3>';
        for(h in highscores){
            var hsElem = document.createElement('div'),
            score      = document.createElement('p'),
            user       = document.createElement('p');
            score.innerHTML = highscores[h].score;
            user.innerHTML  = highscores[h].user;
            score.setAttribute('class', 'score');
            user.setAttribute('class', 'user');
            hsElem.setAttribute('class', 'highscoreElem')
            hsElem.appendChild(user);
            hsElem.appendChild(score)
            document.getElementById('highscores').appendChild(hsElem);
        }
    }

    function participants (users) {
        removeChildren(document.getElementById('participants'));
        document.getElementById('participants').innerHTML = '<h3>Current Players</h3>';
        for(u in users){
            var user       = document.createElement('p');
            user.innerHTML  = users[u];
            user.setAttribute('class', 'userElem');
            document.getElementById('participants').appendChild(user);
        }
    }

//GAME MECHANISM====================================================================
    var level  = 1,
    playing    = false,
    myProblems = [],
    myScore    = 0,
    timeWorker;

    function start () {
        //make the countdown timer green
        document.getElementById('countdown').style.webkitBoxShadow = '0 0 5px 5px #00ff00';
    	//instantiate webworker timer 
        timeWorker = new Worker('timeWorker.js');
        //set a function for its onmessage event
        timeWorker.onmessage = timeWorkerMessage;
        //start worker by posting the first message
        timeWorker.postMessage();
        document.getElementById('countdown').innerHTML = '00:30';
    	//Serve problems to solve until time is up
        generateProblem();
    }

    function timeWorkerMessage (event) {
        var countDown = document.getElementById('countdown');
        switch(event.data.cmd){
            case 'timecheck':
                countDown.innerHTML = event.data.time;
                break;
            case 'yellow'   :
                //countDown.style.backgroundColor = '#ffff00';
                countDown.style.webkitBoxShadow = '0 0 5px 5px #ffff00';
                countDown.innerHTML = event.data.time;
                break;
            case 'red'      :
               // countDown.style.backgroundColor = '#ff0000';
                countDown.style.webkitBoxShadow = '0 0 5px 5px #ff0000';
                countDown.innerHTML = event.data.time;
                break;
            case 'timesup'  : 
                countDown.innerHTML = event.data.time;
                timeWorker.terminate();
                timesUp();
                break;
        }
    }

    function timesUp () {
        if(level == 4){
            stop();
        }
        else{
            level++;
            alert('Hit okay to start level ' + level + '!');
            //setTimeout(function() {
                start();
            //}, 1000 * 5);
        }
    }

    function generateProblem () {
        var num1       = Math.floor((Math.random() * 20) + 1),
        num2           = Math.floor((Math.random() * 20) + 1),
        problemDisplay = document.getElementById('problemDisplay'),
        problemString;
        if (num1 == num2) {
            generateProblem();
        }
        else if(level != 4){
            problemString = num1 + getOpperation() + num2;
            problemDisplay.innerHTML = problemString;
            myProblems.push({'arg1': num1, 'arg2': num2, 'level': level});
        }
        else if(num1 > num2){
            problemString = num1 + getOpperation() + num2;
            problemDisplay.innerHTML = problemString;
            myProblems.push({'arg1': num1, 'arg2': num2, 'level': level});
        }
        else {
            problemString = num2 + getOpperation() + num1;
            problemDisplay.innerHTML = problemString;
            myProblems.push({'arg1': num2, 'arg2': num1, 'level': level});
        }
    }

    function getOpperation () {
        switch(level){
            case 1:
                return ' + ';
            case 2:
                return ' - ';
            case 3:
                return ' x ';
            case 4: 
                return ' % ';
        }
    }

    function stop () {
        //Reset the level
        level = 1;
        //Update The HighScores
        socket.emit('timesUp', myScore);
        myScore = 0;
        //Reset the clock color
        document.getElementById('countdown').backgroundColor = '#fff';
        //Terminate the timer
        timeWorker.terminate();
        toggleStartAnswer();
        document.getElementById('problemDisplay').innerHTML = '';
        document.getElementById('answerText').innerHTML = '';
        document.getElementById('countdown').style.webkitBoxShadow = '0 0 5px 5px #999999';
        
        //instantiate Worker
        statWorker = new Worker('statWorker.js');
        //set function for Worker's onmessage event
        statWorker.onmessage = showStats;
        //start worker by sending it a message with optional params
        statWorker.postMessage(myProblems);
        
    }

    function showStats (stats) {
        alert(stats.data);
    }

    function toggleStartAnswer (argument) {
        // switch between showing the start button and the answer button
        var parent = document.getElementById('gameContainer'),
        child,
        newButton;
        if(child = document.getElementById('start')){
            parent.removeChild(child);
            newButton = document.createElement('button');
            newButton.id = 'answer';
            newButton.onclick = answer;
            newButton.innerHTML = 'Final Answer';
            parent.appendChild(newButton);
            document.getElementById('answerText').onkeydown = function(event){
                if(event.keyCode == 13){
                    answer();
                }
            }
        }
        else{
            child = document.getElementById('answer');
            parent.removeChild(child);
            newButton = document.createElement('button');
            newButton.id = 'start';
            newButton.onclick = function(){
                toggleStartAnswer();
                start();
            }
            newButton.innerHTML = 'Start';
            parent.appendChild(newButton);
        }
    }

    function answerSubmitted(usrAnswer){
        var problem    = myProblems[myProblems.length -1];
        problem.answer = usrAnswer;
        console.log(problem);
        socket.emit('answer', problem);
    }
//VIEW SETUP=========================================================

    function answer(){
        var usrAnswer = document.getElementById('answerText').value;
        answerSubmitted(usrAnswer);
        document.getElementById('answerText').value = '';
        generateProblem();
    }

    document.getElementById('start').onclick = function(){
        toggleStartAnswer();
        start();
    }

    document.getElementById('countdown').innerHTML = '00:00';


//PROTOTYPAL HELPERS===========================================================
    function removeChildren(domNode){
        while(domNode.hasChildNodes()){
            domNode.removeChild(domNode.lastChild);
        }
    }



}