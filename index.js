import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); 

let length;
let attempt;

let secretCode = generateCode(length);
let currentAttempt = 0;
let gameOver = false;
let win = false;

function generateCode(length) {
  let code = [];
  for (let i = 0; i < length; i++) {
    code.push(Math.floor(Math.random() * 9)+1);
  }
  return code;
}

function countBulls(code, guess, usedCode, usedGuess) { // numbers in the correct position
  let bulls = 0;

  for (let i = 0; i < code.length; i++) {
    if (guess[i] === code[i]) {
      bulls++;
      usedCode[i] = true;
      usedGuess[i] = true;
    }
  }
  return bulls;
}

function countCows(code, guess, usedCode, usedGuess) { // correct numbers in the wrong position
  let cows = 0;

  for (let i = 0; i < guess.length; i++) {
    if (!usedGuess[i]) {
      for (let j = 0; j < code.length; j++) {
        if (!usedCode[j] && (guess[i] === code[j])) {
          cows++;
          usedCode[j] = true;
          break;
        }
      }
    }
  }
  return cows;
}

function evaluateGuess(code, guess) {
  const usedCode = new Array(code.length).fill(false);
  const usedGuess = new Array(guess.length).fill(false);

  const bulls = countBulls(code, guess, usedCode, usedGuess);
  const cows = countCows(code, guess, usedCode, usedGuess);

  currentAttempt++;

  if (bulls === length) {
    gameOver = true;
    win = true;
  } else if (currentAttempt >= attempt) {
    gameOver = true;
  }
  
  return { bulls, cows, gameOver, win };
}


app.get("/", (req,res) => {
  res.render("home.ejs");
});

app.get("/game", (req,res)=>{
  currentAttempt = 0;
  gameOver = false;
  win = false;
  
  secretCode = generateCode(length);
  let secret = secretCode.reduce((accum, digit) => (accum * 10) + digit, 0);
  console.log(secretCode);

  res.render("game.ejs",{ length:length, attempt:attempt, secretCode: secret});
});


app.post("/game", (req, res) => {
  const { guess } = req.body;

  const result = evaluateGuess(secretCode, guess.map(Number));
  
  res.json(result);
});

app.post("/setup", (req, res) => {
  length = Number(req.body.length);
  attempt = Number(req.body.attempt);
  res.redirect("/game");
});

app.listen(port, () => {
  console.log(`Successfully started server on port ${port}.`);
});