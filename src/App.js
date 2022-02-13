import "./App.css";
import React, { useEffect, useState } from "react";
import randomItem from 'random-item';
import randomWords from 'random-words';

const wordAPI = "https://api.dictionaryapi.dev/api/v2/entries/en/";

function App() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [solutionWord, setSolutionWord] = useState("");
  const [guessedWord, setGuessedWord] = useState("");
  const [numberGuesses, setNumberGuesses] = useState(0);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [randomWord, setRandomword] = useState("word");
  const [seconds, setSeconds] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [isGameOver, setGameOver] = useState(true);
  const [wordFound, setWordFound] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  function toggleAnalytics() {
    setAnalyticsOpen(!analyticsOpen);
  }

  function openPopup() {
    setIsOpen(true);
    setIsActive(false);
  }

  function resetGame() {
    setGameOver(true);
    setIsOpen(false);
    setNumberGuesses(0);
    setGuessedWord("");
    setIsCorrectAnswer(false);
    setSeconds(30);
    setWordFound(false);

    // Clear buttons
    const allButtons = document.getElementsByTagName('button');
    for (var i = 0, n = allButtons.length; i < n; i++) {
      allButtons[i].classList.remove("in-word");
      allButtons[i].classList.remove("not-in-word");
    }
  }

  function typeLetter(letter) {
    if (letter) setGuessedWord(guessedWord + letter);
  }

  function backspaceLetter() {
    setGuessedWord(guessedWord.slice(0, -1));
  }

  function guessWord() {
    const currentGuesses = numberGuesses + 1;
    setNumberGuesses(currentGuesses);

    if (guessedWord === solutionWord) {
      setIsCorrectAnswer(true);
      openPopup();
      setStreak(streak + 1);
      setGamesPlayed(gamesPlayed + 1);
    } else if (currentGuesses >= 5) {
      openPopup();
      setGamesPlayed(gamesPlayed + 1);
    }
  }

  function checkLetterInWord(event, letter) {
    if (solutionWord.includes(letter)) {
      event.target.className = 'in-word';
    } else {
      event.target.className = 'not-in-word';
    }
  }

  useEffect(() => {
    function setSolution(items) {
      const synList = [];
      items.map(item => (
        item.meanings.map(list => (
          list.definitions.map(defs => (
            defs.synonyms.map((syns) => (
              syns.length === 5 && syns.match(/[a-z]/i) ? synList.push(syns) : synList
            ))
          ))
        ))
      ));
      if (synList.length > 0) {
        setSolutionWord(randomItem(synList));
        setIsLoaded(true);
        setWordFound(true);
        setGameOver(false);
      } else {
        const newWord = randomWords();
        getWord(wordAPI + newWord);
        setRandomword(newWord);
        setWordFound(false);
      }
    }

    function getWord(wordLink) {
      fetch(wordLink)
        .then(res => res.json())
        .then(
          (result) => {
            setSolution(result);
          },
          (error) => {
            setIsLoaded(true);
            setError(error);
          }
        )
    }

    var promptWord = randomWords();

    if (isGameOver) {
      setWordFound(false);
      promptWord = randomWords();
      setRandomword(promptWord);
      getWord(wordAPI + promptWord);
    }

  }, [isGameOver])

  useEffect(() => {
    let interval = null;
    setIsActive(true);
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds - 1);
      }, 1000);
    }

    if (seconds <= 0) {
      setIsActive(false);
      setGamesPlayed(gamesPlayed + 1);
      openPopup();
    }

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>
        {error && <div>Error: {error.message}</div>}
        {!isLoaded && <div>Loading...</div>}
        {!error && isLoaded &&
          <div className="App">
            <header className="App-header">
              <div className="header-section-title">
                <h1 className="app-header">Guessary.</h1>
              </div>
              <div className="header-section-button">
                <button onClick={toggleAnalytics} className="analytics-button">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-5h2v5zm4 0h-2v-3h2v3zm0-5h-2v-2h2v2zm4 5h-2V7h2v10z" /></svg>
                </button>
              </div>
            </header>

            {isOpen &&
              <div className='popup'>
                <div className='popup_open'>
                  {isCorrectAnswer &&
                    <div>
                      <h1>Correct!</h1>
                      <p>You guessed the word <b>{solutionWord}</b>.</p>
                      <button className="close" onClick={resetGame}>X</button>
                    </div>}
                  {!isCorrectAnswer &&
                    <div>
                      <h1>You lost.</h1>
                      <p>The correct answer was <b>{solutionWord}</b>.</p>
                      <button className="close" onClick={resetGame}>X</button>
                    </div>}
                </div>
              </div>
            }
            <div className="game-info">
              <div className="time-left">{seconds}s</div>
            </div>
            {analyticsOpen &&
              <div className='popup'>
                <div className='popup_open'>
                  <h1>ANALYTICS</h1>
                  <div className="analytics-column">
                    <p className="number-statistic"> {streak}</p>
                    <p><b>GAMES WON</b></p>
                  </div>
                  <div className="analytics-column">
                    <p className="number-statistic"> {gamesPlayed}</p>
                    <p><b>GAMES PLAYED</b></p>
                  </div>
                  <button className="close" onClick={toggleAnalytics}>X</button>
                </div>
              </div>
            }
            <div>
              <div>
                <p className="guess">
                  {wordFound && guessedWord}
                </p>
                <p className="prompt">
                  {randomWord}
                </p>
              </div>
              <div id="keyboard">
                <div className="row">
                  <button data-key="q" onClick={() => typeLetter("q")} onMouseOver={(e) => checkLetterInWord(e, "q")}>q</button>
                  <button data-key="w" onClick={() => typeLetter("w")} onMouseOver={(e) => checkLetterInWord(e, "w")}>w</button>
                  <button data-key="e" onClick={() => typeLetter("e")} onMouseOver={(e) => checkLetterInWord(e, "e")}>e</button>
                  <button data-key="r" onClick={() => typeLetter("r")} onMouseOver={(e) => checkLetterInWord(e, "r")}>r</button>
                  <button data-key="t" onClick={() => typeLetter("t")} onMouseOver={(e) => checkLetterInWord(e, "t")}>t</button>
                  <button data-key="y" onClick={() => typeLetter("y")} onMouseOver={(e) => checkLetterInWord(e, "y")}>y</button>
                  <button data-key="u" onClick={() => typeLetter("u")} onMouseOver={(e) => checkLetterInWord(e, "u")}>u</button>
                  <button data-key="i" onClick={() => typeLetter("i")} onMouseOver={(e) => checkLetterInWord(e, "i")}>i</button>
                  <button data-key="o" onClick={() => typeLetter("o")} onMouseOver={(e) => checkLetterInWord(e, "o")}>o</button>
                  <button data-key="p" onClick={() => typeLetter("p")} onMouseOver={(e) => checkLetterInWord(e, "p")}>p</button>
                </div>
                <div className="row">
                  <div className="spacer half"></div>
                  <button data-key="a" onClick={() => typeLetter("a")} onMouseOver={(e) => checkLetterInWord(e, "a")}>a</button>
                  <button data-key="s" onClick={() => typeLetter("s")} onMouseOver={(e) => checkLetterInWord(e, "s")}>s</button>
                  <button data-key="d" onClick={() => typeLetter("d")} onMouseOver={(e) => checkLetterInWord(e, "d")}>d</button>
                  <button data-key="f" onClick={() => typeLetter("f")} onMouseOver={(e) => checkLetterInWord(e, "f")}>f</button>
                  <button data-key="g" onClick={() => typeLetter("g")} onMouseOver={(e) => checkLetterInWord(e, "g")}>g</button>
                  <button data-key="h" onClick={() => typeLetter("h")} onMouseOver={(e) => checkLetterInWord(e, "h")}>h</button>
                  <button data-key="j" onClick={() => typeLetter("j")} onMouseOver={(e) => checkLetterInWord(e, "j")}>j</button>
                  <button data-key="k" onClick={() => typeLetter("k")} onMouseOver={(e) => checkLetterInWord(e, "k")}>k</button>
                  <button data-key="l" onClick={() => typeLetter("l")} onMouseOver={(e) => checkLetterInWord(e, "l")}>l</button>
                  <div className="spacer half"></div>
                </div>
                <div className="row">
                  <button data-key="↵" className="one-and-a-half" onClick={() => guessWord()}>
                    enter
                  </button>
                  <button data-key="z" onClick={() => typeLetter("z")} onMouseOver={(e) => checkLetterInWord(e, "z")}>z</button>
                  <button data-key="x" onClick={() => typeLetter("x")} onMouseOver={(e) => checkLetterInWord(e, "x")}>x</button>
                  <button data-key="c" onClick={() => typeLetter("c")} onMouseOver={(e) => checkLetterInWord(e, "c")}>c</button>
                  <button data-key="v" onClick={() => typeLetter("v")} onMouseOver={(e) => checkLetterInWord(e, "v")}>v</button>
                  <button data-key="b" onClick={() => typeLetter("b")} onMouseOver={(e) => checkLetterInWord(e, "b")}>b</button>
                  <button data-key="n" onClick={() => typeLetter("n")} onMouseOver={(e) => checkLetterInWord(e, "n")}>n</button>
                  <button data-key="m" onClick={() => typeLetter("m")} onMouseOver={(e) => checkLetterInWord(e, "m")}>m</button>
                  <button data-key="←" className="one-and-a-half" onClick={() => backspaceLetter()}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default App;
