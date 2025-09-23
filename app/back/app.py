from flask import Flask, render_template, request, redirect, url_for, session

app = Flask(__name__, static_folder="static")
app.secret_key = "supersecretkey"  # needed for session

# ---------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------
@app.route("/")
def home():
    return render_template("home.html")

@app.route("/track")
def track():
    return render_template("track.html")

@app.route("/exercise")
def exercise():
    return render_template("page.html")

@app.route("/gyminfo")
def gyminfo():
    return render_template("gym.html")

@app.route("/dietplans")
def dietplans():
    return render_template("diet.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

# -------------------- Login + Signup --------------------
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        # TODO: validate from DB
        if username == "admin" and password == "123":
            session["user"] = username   # save login in session
            return redirect(url_for("home"))
        else:
            return "Invalid credentials. <a href='/login'>Try again</a>"

    return render_template("login.html")

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        # TODO: save to DB
        return f"Account created for {username}! <a href='/login'>Login Now</a>"

    return render_template("signup.html")

@app.route("/logout")
def logout():
    session.pop("user", None)   # clear login
    return redirect(url_for("home"))

# ---------------------------------------------------------------------
# Error page
# ---------------------------------------------------------------------
@app.errorhandler(404)
def not_found(_):
    return "<h1>404 – Page not found</h1><p><a href='/'>Back to Home</a></p>", 404

# ---------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
