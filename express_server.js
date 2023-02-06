const express = require("express");
const bodyParser = require("body-parser");
//Use bcrypt When Storing Passwords - W3D4
const bcrypt = require("bcrypt");
//Update to Encrypted Cookie W3D4
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080;

//linten to print the PORT in terminal whenn the server shart
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const { generateRandomString, emailHasUser, getUserByEmail, urlsForUser, cookieHasUser } = require("./helpers");

const urlDatabase = {};

const users = {};

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

//Update to Encrypted Cookie W3D4
app.use(cookieSession({
  name: 'session',
  keys: ['CAITLIN'],
  maxAge: 24 * 60 * 60 * 1000,
}));

app.get("/", (req, res) => {
  if (cookieHasUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//Add route for /urls in expressserver.js and render using accompanying template
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!cookieHasUser(req.session.user_id, users)) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  }
});

//Add a GET route for /register which renders the registration template
app.get("/register", (req, res) => {
  if (cookieHasUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_registration", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (cookieHasUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_login", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  //check use same user to login
  if (!users[req.session.user_id]) {
    return res.status(404).send("You have to login.");
  } else if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(404).send("Your need to login the same email.");
  }

  if (urlDatabase[req.params.shortURL]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlUserID: urlDatabase[req.params.shortURL].userID,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("The short URL you entered does not correspond with a long URL at this time.");
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("The short URL you are trying to access does not correspond with a long URL at this time.");
  }
});

//In urls_index.ejs template, add a form element for each shortURL which uses a POST method
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("You must be logged in to a valid account to create short URLs.");
  }
});

// Add a POST route for /register which will:
// Add new user object to global users object
// Set userid cookie
// Redirect user to /urls page
app.post("/register", (req, res) => {
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;

  if (!submittedEmail || !submittedPassword) {
    res.status(400).send("Please include both a valid email and password");
  } else if (emailHasUser(submittedEmail, users)) {
    res.status(400).send("An account already exists for this email address");
  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: submittedEmail,
      //Use bcrypt When Checking Passwords - W3D4
      password: bcrypt.hashSync(submittedPassword, 10),
    };
    req.session.user_id = newUserID;
    res.redirect("/urls");
  }
});

//Add POST route for /login to expressserver.js
//Redirect browser back to /urls page after successful login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!emailHasUser(email, users)) {
    res.status(403).send("There is no account associated with this email address");
  } else {
    const userID = getUserByEmail(email, users);
    //Use bcrypt When Checking Passwords - W3D4
    if (!bcrypt.compareSync(password, users[userID].password)) {
      res.status(403).send("The password you entered does not match the one associated with the provided email address");
    } else {
      req.session.user_id = userID;
      res.redirect("/urls");
    }
  }
});

//Add a POST route for /logout which clears the cookie and redirects user to /urls page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//Add POST route for /urls/:id/delete to remove URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(401).send("You do not have authorization to delete this short URL.");
  }
});

//Add POST route for /urls/:id to update a resource
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.status(401).send("You do not have authorization to edit this short URL.");
  }
});