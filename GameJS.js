/*
  My operating system: Windows
  Browser used: Chrome

  note:   I have referenced the MDN web docs and W3 schools websites
          for learning about setting/clearing timeouts & intervals
          and also for learning about using async, await.. promises

*/

//timeout variable used for calling gameOver method if player takes
//more than 5 seconds to make a guess
let timer; // = setTimeout(()=>{}, 0);

let level = 1;
let score = 0;
let maxScore = 0;
let speed = 1000;

const colors = ['green', 'red', 'gold', 'blue'];
const colorsWhenLit = ['lightgreen', 'pink', 'yellow', 'lightblue'];

let gameSequence = [];  //tracks random light sequence
let gamelights = [];    // another array used to track the the colors used for "light-up" effect
let playerSequence = [];  //tracks player guesses
let waitingPeriod = 2000; //used in resolveAfterTime function below

function resetGame() {
  document.getElementById("instruction").innerHTML = "CLICK START TO BEGIN AGAIN";

  //reset variables to initial values
  gameSequence = [];
  gamelights = [];
  playerSequence = [];
  clearTimeout(timer);
  level = 1;
  speed = 1000;
  document.getElementById("currentScore").innerHTML = "00";
}

//function used to light all buttons simultaneously when the game is lost
function lightAllButtons() {
  for (let num1 = 0; num1 < colors.length; num1++) {
    document.getElementById(colors[num1]).style.backgroundColor = colorsWhenLit[num1];
  }
  //light buttons for 400ms and then revert back to usual background color
  setTimeout(function() {
    for (let num2 = 0; num2 < colors.length; num2++) {
      document.getElementById(colors[num2]).style.backgroundColor = colors[num2];
    }
  }, 400);
}

function gameOver() {
  // just changing instruction at top of webpage so what's happening is clear
  document.getElementById("instruction").innerHTML = "GAME OVER";
  // console.log('in: gameOver() function');

  gameSequence = [];
  playerSequence = [];
  //Flash 5 times:
  let i = 0;
  let gameOverLights = setInterval(function() {
    lightAllButtons();
    i++;

    if (i >= 5) {     //if i=5 the lights have flashed 5 times so clear interval and reset game
      clearInterval(gameOverLights);
      //console.log statements used for testing..
      //console.log('game over lights interval cleared');

      //reset light under start button to red
      document.getElementById("light").style.backgroundColor = "red";
      resetGame();
    }
  }, 600);
}

//using an async function here so that I can use the variable x below
// x = await resolveAfterTime() so that there is some time between rounds
async function playNextRound() {
  document.getElementById('instruction').innerHTML = "FOLLOW THE SEQUENCE!";
  if(level<10)
    score = "0" + level;
  else
    score = level;

  document.getElementById('currentScore').innerHTML = score;

  // update highscore when new highscore reached
  if(score>maxScore) {
    maxScore = score;
    document.getElementById('highScore').innerHTML = score;
  }

  level++;
  if(level===6 || level===10 || level===14)
  {
    speed = speed - 100;  //reduce speed after 5th, 9th and 13th signals
    document.getElementById('instruction').innerHTML = "GETTING FASTER NOW...";
  }

  waitingPeriod = 1000;   //reducing waiting time before showing next level sequence
  let x = await resolveAfterTime();
  gameSequence.push(colors[x]);
  //console.log(gameSequence);
  gamelights.push(colorsWhenLit[x]);
  showGameSequence();
}

function addToPlayerSequence(id, index) {
  clearTimeout(timer); //player has clicked a button within 5 seconds so clear timeout
  //console.log('timer cleared'); //testing

  // just lighting a button when the player clicks it to make the click more visable
  document.getElementById(id).style.backgroundColor = colorsWhenLit[index];

  // reset color after click to original color after 100ms - so it just looks like a flash
  let colorChangeTimer = setTimeout(function() {
    document.getElementById(id).style.backgroundColor = id;
  }, 100);

  let x = playerSequence.length;
  if (x < gameSequence.length) {  //only add clicks to playerSequence if player has not yet made enough guesses
    playerSequence.push(id);
    x++;
    if (playerSequence[x - 1] !== gameSequence[x - 1])  //if player guesses incorrectly => game over!
      gameOver();
    if (x === gameSequence.length)
      playNextRound();    //if all guesses made correctly, on to the next round (to add another color to sequence)
    else {
      // if the player still has more sequence guesses to input,
      // I start the 5 seconds to gameover timer again after each click
      startTimer();
    }
  }
}

function startTimer() {
  // console.log statement just used for testing
  // console.log('in startTimer function');

  // time variable declared at start of file (for 5 seconds to game over)
  timer = setTimeout(()=> {
      gameOver();
  }, 5000);
}

function beginPlayerTurn() {

  //console.log('in: beginPlayerTurn()')
  playerSequence = [];
  document.getElementById('instruction').innerHTML = 'ENTER THE SEQUENCE';
  document.getElementsByClassName('button')[0].style.cursor = 'pointer';
  document.getElementsByClassName('button')[1].style.cursor = 'pointer';
  document.getElementsByClassName('button')[2].style.cursor = 'pointer';
  document.getElementsByClassName('button')[3].style.cursor = 'pointer';

  //player has 5 seconds to start their sequence
  startTimer();
}

function lightAButton(item, lightItem) {
  //console.log('in: lightAButton function')

  //arguments passed in will be the original button color and the color to change to when lit
  document.getElementById(item).style.backgroundColor = lightItem;
  setTimeout(function() {
    document.getElementById(item).style.backgroundColor = item;
  }, 500); // after 500ms, reset button to original color
}

function showGameSequence() {
  let i = 0;
  let lightUpSequence = setInterval(function() {
    lightAButton(gameSequence[i], gamelights[i]);
    i++;
    if (i >= gameSequence.length) {
      clearInterval(lightUpSequence);
      beginPlayerTurn();
    }
  }, speed);  //speed variable starts out to be 1000ms, ie. 1 second
}             // this value is decreased later in the game as specified

// function used when game is started and also when starting each new round
// (causes a 2 second delay) to there is time for the player to see what's happening
function resolveAfterTime() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(Math.floor(Math.random() * 4))
    }, waitingPeriod);
  });
}

async function startGame() {
  document.getElementById("instruction").innerHTML = "WATCH FOR SEQUENCE";
  document.getElementById("light").style.backgroundColor = "green";

  // waiting for x to be returned causes a 2 second delay
  let x = await resolveAfterTime();

  gameSequence.push(colors[x]);
  gamelights.push(colorsWhenLit[x]);

  // the showGameSequence function executes after a timeout of 1 second (speed variable)
  // this in combination with the 2-second delay above means there is a waiting
  // period of 3 seconds before the first button is lit
  showGameSequence();
};
