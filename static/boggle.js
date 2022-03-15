

class Game {
    /* make a new game at this DOM id */

    constructor(boardId, secs = 60) {
        this.secs = secs; // game length
        this.score = 0;
        this.words = new Set();
        this.board = $("#" + boardId); //#boggle
        this.showTimer();
        $('.play-again').hide()
        // every 1000 msec,call tick
        this.timer = setInterval(this.tick.bind(this), 1000);
        $('.playAgainBtn').hide()
        $(".guessForm", this.board).on("submit", this.handleGuess.bind(this));
    }

    /* show word in list of words */
    showWord(word) {
        $(".words", this.board).append($("<li>", { text: word }));
    }
    /* show score front-end */
    showScore() {
        $(".score", this.board).text(this.score);
    }

    /* display status message and adds appropiate class*/
    showMessage(msg, cls) {
        $(".msg", this.board)
            .text(msg)
            .removeClass()
            .addClass(`msg ${cls}`);
    }

    /* handle submission of word: if unique and valid, score & show */
    async handleGuess(evt) {

        /*without refreshing page after submission*/
        evt.preventDefault();

        /*selecting value from form*/
        const $guessInput = $(".guessInput", this.board);
        let word = $guessInput.val();

        if (!word) return;

        /*Make sure if you submit the same word, it does not count twice*/
        if (this.words.has(word)) {
            this.showMessage(`Already guessed "${word}"`, "error");
            $guessInput.val("")
            return;
        }

        // console.log(this)
        /*Using axios, make an AJAX request to send it to the server*/
        const res = await axios.get("/check-word", { params: { word: word } });

        /*
       front-end, display the response from the backend to notify the user 
       if the word is valid and exists on the board, if the word is invalid, 
       or if the word does not exist at all.
        */

        if (res.data.result === "not-word") {
            this.showMessage(`${word} is not a valid word`, "error");
        } else if (res.data.result === "not-on-board") {
            this.showMessage(`${word} is not a valid word on this board`, "error");
        } else {
            this.showWord(word);
            /*the score for a word is equal to its length*/
            this.score += word.length;
            /*You can store the score on the front-end for now*/
            this.showScore();
            /*add word to Set, so that we do not guess same word again*/
            this.words.add(word);
            this.showMessage(`Added to our guess: ${word}`, "ok");
        }

        $guessInput.val("")
    }

    /* Update timer in DOM */

    showTimer() {
        /*selects timer class in DOM & change text */
        $(".timer", this.board).text(this.secs);
    }

    /*Step Five: Adding a timer */
    /* Tick: handle a second passing in game */

    async tick() {
        this.secs -= 1;
        this.showTimer();

        if (this.secs === 0) {
            clearInterval(this.timer);
            await this.scoreGame();
        }
    }

    /* Step Six: More statistics!*/

    async scoreGame() {
        $(".guessForm", this.board).hide();
        /*send an AJAX request to the server with the score you have stored 
        on the front-end and increment the number of times you have played on the backend*/
        const resp = await axios.post("/post-score", { score: this.score });
        console.log(resp.data.brokeRecord)
        if (resp.data.brokeRecord) {
            this.showMessage(`New record: ${this.score}`, "ok");
        } else {
            this.showMessage(`Final score: ${this.score}`, "ok");
        }
        $('.play-again').show()
    }

}

let game = new Game("boggle", 20);

