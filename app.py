from flask import Flask, request, render_template, jsonify, session,redirect
from boggle import Boggle

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret"

boggle_game = Boggle()



#Step Two: Displaying the Board
@app.route("/")
def homepage():
    """Show board."""

    #call make_board() on boggle_game instance -- which returns board
    game_board = boggle_game.make_board()
    #using this board in other routes, place in session
    session['game_board'] = game_board
    highscore = session.get("highscore", 0)
    nplays = session.get("nplays", 0)

    return render_template("index.html", game_board=game_board, highscore=highscore,nplays=nplays)

#Step Three: Checking for a Valid Word
@app.route("/check-word")
def check_word():
    """Check if word is in dictionary.
    On the server, take the form value and check if it is a valid word 
    in the dictionary using the words variable in your app.py
    """
    #select word pass from request
    word = request.args.get("word")
    game_board = session["game_board"]
    #Make sure word is valid on the board using the check_valid_word function from the boggle.py file.
    response = boggle_game.check_valid_word(game_board, word)
    #Since AJAX request was made to server, respond w/ JSON using jsonify function from Flask.
    return jsonify({'result': response})


@app.route("/post-score", methods=["POST"])
def post_score():
    """Receive score, update nplays, update high score if appropriate."""

    #get score send from the AJAX request
    score = request.json["score"]
    highscore = session.get("highscore", 0)
    nplays = session.get("nplays", 0)

    session['nplays'] = nplays + 1
    #selects highest btwn current score & highscore
    session['highscore'] = max(score, highscore)
    #return true or false (if current score is greater than highscore)
    return jsonify(brokeRecord=score > highscore)

@app.route("/new-game")
def new_game():

    session['nplays'] = 0
    session['highscore'] = 0
    return redirect("/")

@app.route("/play-again")
def play_again():
    return redirect('/')