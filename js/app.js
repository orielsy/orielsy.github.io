(function(){
/* ES6 will be used but do note that normally I'd transpile it to ES5 for greater compatibility  */

const game = {   
   board: document.querySelector('.board'),
   boxes: document.querySelectorAll('.board li'),
   speakBtn: document.querySelector('.speak'),
   resetBtn: document.querySelector('.reset'),
   helpBtn: document.querySelector('.help'),
   closeBtn: document.querySelector('.close'),
   currentPlayer: 'x',
   moves: 1,
   voiceActivated: false,
   gameOver: false
};
//called when a player selects a cell
function makePlay(e){
   const coordinate = this.getAttribute('data-name');
   const message =`${coordinate}, claimed by player ${game.currentPlayer}`;
   this.classList.add(game.currentPlayer, 'suspend');//add class to selected box
   this.innerHTML = game.currentPlayer;
   this.setAttribute('aria-label', message);
   togglePlayer();
   trackMoveCount();
}
//switches the player based on turn
function togglePlayer(){   
   game.currentPlayer = game.currentPlayer === 'x' ? 'o' : 'x'; //toggle next player  
}

function trackMoveCount(){
   if (game.moves >= 9){
      game.gameOver = true;
      gameOver();
   } else {
      game.moves += 1;
   }
}

function gameOver(){      
   const dialog = document.querySelector('.gameOver');
   game.gameOver = true;
   dialog.classList.remove('hide');   
   dialog.querySelector('.message').focus();
}

function showVoiceHelp(){
   const voiceHelp = document.querySelector('.voiceHelp');
   voiceHelp.classList.remove('hide'); // show voice help popup
   voiceHelp.querySelector('.message').focus();
   document.querySelector('.paper').classList.add('suspend'); //disable clicking in game
}

function closeVoiceHelp(e){
   hideDialogs();
   document.querySelector('.paper').classList.remove('suspend'); //enable clicking in game
   document.querySelector('.table h1').focus();
}
//track keyboard events of interest to us
function keyboard(e){
   const active = document.activeElement;
   const code = (e.keyCode ? e.keyCode : e.which);
   console.log(code);
   if(code === 13){
      active.click();       
   } else if (code === 104){
      showVoiceHelp();
   } else if(code === 115 || code === 32){
      captureVoice();
   } else if (code === 114){
      reset();
   } 
}
//reset the field
function reset(){         
   game.currentPlayer = 'x';
   game.moves = 1;
   game.gameOver = false;
   hideDialogs();
   for(node of game.boxes){
      const name = node.getAttribute('data-name');
      const message = `${name}, press enter to make a play`;
      node.innerHTML = '';
      node.className = '';
      node.setAttribute('aria-label', message);
   }
}

function hideDialogs(){
   const dialogs = document.querySelectorAll('[role="dialog"');
   for(let dialog of dialogs){
      dialog.classList.contains('hide') ? true: dialog.classList.add('hide');
   }
}
function captureVoice(){   
   if(game.voiceActivated === false){
      game.voiceActivated = true;

      var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
         
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      const commands = document.querySelector('.commands');    
      commands.classList.remove('hide');
      game.speakBtn.classList.add('active');

      //take captured voice and turn it to one string
      //recognition.addEventListener('result', e => {         
      recognition.onresult = (e) => {
         const transcript = Array.from(e.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('')      
            .toLowerCase();
         commands.querySelector('span').innerHTML = transcript;
         
         if (e.results[0].isFinal) {
            voiceCommand(transcript);   
         }         
      };         
      recognition.addEventListener('end', recognition.start);   //if voice capture has ended start it again to catch the next command
      recognition.start();
   }   
}
//translates voice commands to game moves using key phrases
function voiceCommand(transcript){   
   if ( transcript.match(/first.*left/g) || transcript.match(/1st.*left/g) ){
      selectCell(0);
   } else if ( transcript.match(/first.*center/g) || transcript.match(/1st.*center/g) ){
      selectCell(1);
   } else if ( transcript.match(/first.*right/g) || transcript.match(/1st.*right/g) ){
      selectCell(2);
   } else if ( transcript.match(/second.*left/g) || transcript.match(/2nd.*left/g) ){
      selectCell(3);
   } else if ( transcript.match(/second.*center/g) || transcript.match(/2nd.*center/g) ){
      selectCell(4);
   } else if ( transcript.match(/second.*right/g) || transcript.match(/2nd.*right/g) ){
      selectCell(5);
   } else if( transcript.match(/third.*left/g) || transcript.match(/3rd.*left/g) ){
      selectCell(6);
   } else if ( transcript.match(/third.*center/g) || transcript.match(/3rd.*center/g) ){
      selectCell(7);
   } else if ( transcript.match(/third.*right/g) || transcript.match(/3rd.*right/g) ){
      selectCell(8);
   }
   return false;
}
//executes game move based on voice commands
function selectCell(cell){
   game.boxes[cell].click();
}

function init(){
   game.boxes.forEach( (box) => box.addEventListener('click', makePlay));
   game.closeBtn.addEventListener('click', closeVoiceHelp);
   game.helpBtn.addEventListener('click', showVoiceHelp);
   game.speakBtn.addEventListener('click', captureVoice);   
   game.resetBtn.addEventListener('click', reset);
   document.addEventListener('keypress', keyboard);  
}
init();
}());