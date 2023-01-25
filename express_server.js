const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

const {emailHasUser, userIdFromEmail, urlsForUser, cookieHasUser } = require("./helpers");

//set cookie
app.use(cookieSession({
  name: 'session',
  keys: ['CAITLIN'],
  maxAge: 24 * 60 * 60 * 1000,
}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/hello", (req, res) => {
//   const templateVars = { greeting: "Hello World!" };
//   res.render("hello_world", templateVars);
// });

//----------Add a route for /urls----------
//connect to urls_index HTML
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//----------Adding a Second Route----------
// app.get("/urls/:id", (req, res) => {
//   const templateVars = { id: req.params.id, longURL: 'http://localhost:8080/urls/b2xVn2' };
//   res.render("urls_show", templateVars);
// });

//URL Shortening (Part 1)
//and new url
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

app.use(express.urlencoded({ extended: true }));

// part 1 and not need for part 2
// app.post("/urls", (req, res) => {
//   console.log(req.body); // Log the POST request body to the console
//   res.send("Ok"); // Respond with 'Ok' (we will replace this)
// });

//random number for 6
const generateRandomString = function () {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//URL Shortening (Part 2)

// -1- the id-longURL key-value pair are saved to the urlDatabase when it receives a POST request to /urls
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  console.log(req.body.longURL);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL
  };
  res.redirect('http://localhost:8080/urls/' + String(shortURL));
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

// -2- Redirect Short URLs
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//week3 day3 delete button
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.render("urls_index");
});

//edit url
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.newURL;
  res.redirect('/urls');
});

//post to login
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

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!emailHasUser(email, users)) {
    res.status(403).send("There is no account match with this email address");
  } else {
    const userID = userIdFromEmail(email, users);
    if (!bcrypt.compareSync(password, users[userID].password)) {
      res.status(403).send("The password you entered does not match with the email address");
    } else {
      req.session.user_id = userID;
      res.redirect("/urls");
    }
  }
});