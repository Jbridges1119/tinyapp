const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const helpers = require('./helpers');
const PORT = 8080; // default port 8080


//MIDDLEWARE BEING RUN
app.use(morgan('dev'));
//Middleware to allow object/array deconstruction
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["key1"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


///
//

//DATA

//URL DATABASE
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "sgq3y6"
  }
};

//USER DATABASE
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "u@a.com",
    password: bcrypt.hashSync("purple", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "u2@a.com",
    password: bcrypt.hashSync("funk", 10)
  }
};

//
//

//ROUTING

//HOMEPAGE
app.get("/", (req, res) => {
  //If not logged in - returns error login page
  if (!req.session.user_id) {
    const templateVars = { username: undefined };
    return res.render("not_logged_in", templateVars);
  }
  res.redirect('/urls');
});

//REQUEST FOR URLS IN JSON FORMAT
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//SEND TEXT SAYING HELLO WORLD
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//SERVER RESPONSE IN CONSOLE WHEN STARTED
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//REQUEST REGISTRATION PAGE
app.get(`/register`, (req, res) => {
  //If user is logged in - redirect to main page
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    username: users[req.session.user_id]
  };
  res.render(`register`, templateVars);
});


//REQUEST LOGIN PAGE
app.get('/login', (req, res) => {
  //If user is logged in - redirect to main page
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    username: users[req.session.user_id]
  };
  res.render(`login`, templateVars);
});


//REQUEST CREATE PAGE
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: users[req.session.user_id]
  };
  //If not logged in - render login page
  if (!templateVars.username) {
    return res.render('not_logged_in', templateVars);
  }
  res.render('urls_new', templateVars);
});


//REQUEST MAIN PAGE
app.get("/urls", (req, res) => {
  //If not logged in - returns error login page
  if (!req.session.user_id) {
    const templateVars = { username: undefined };
    return res.render("not_logged_in", templateVars);
  }
  const user = users[req.session.user_id];
  const userURL = helpers.urlForUser(user.id, urlDatabase);
  const templateVars = {
    urls: userURL,
    username: user
  };
  res.render("urls_index", templateVars);
});


//REQUEST EDIT URL PAGE
app.get("/urls/:shortURL", (req, res) => {
  //If not logged in - returns error login page
  if (!req.session.user_id) {
    const templateVars = { username: undefined };
    return res.render("not_logged_in", templateVars);
  }
  //If short url isn't in database - returns an error
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(400).send('Short URL does not exist');
  }
  const user = users[req.session.user_id];
  const userURL = helpers.urlForUser(user.id, urlDatabase);
  //If shortURL is insorrect - returns an error
  if (!userURL[req.params.shortURL]) {
    return res.status(400).send('Short URL not linked to this user');
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: userURL[req.params.shortURL].longURL,
    username: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});


//REQUEST LONG URL ROUTE (IS A GET BECAUSE THE SOURCE IS AN <A> LINK - TREAT LIKE A POST WITH THE REDIRECT)
app.get("/u/:shortURL", (req, res) => {
  //If wrong URL is inputed - returns an error
  if (!helpers.urlIsPresent(req.params.shortURL, urlDatabase)) {
    return res.status(400).send('Incorrect Short URL');
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//
//

//SUBMITTING NEW URL
app.post("/urls/new", (req, res) => {
  //If not logged in on submit new - returns an error
  if (!users[req.session.user_id]) {
    return res.status(403).send('Not logged In');
  }
  const key = helpers.generateRandomString();
  urlDatabase[key] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${key}`);
});


//SUBMIT REGISTER
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  //If email or password are blank - returns an error
  if (email === "" || password === "") {
    return res.status(400).send('Empty Email or Password');
  }
  //If email is taken - return an error
  if (!helpers.emailNotPresent(email, users)) {
    return res.status(400).send('Email Unavailable');
  }
  const id = helpers.generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = {
    "id": id,
    "email": email,
    "password": hashedPassword
  };
  req.session.user_id = id;
  res.redirect('/urls');
});


//SUBMIT LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = helpers.getUserByEmail(email, users);
  //If email isn't in database - returns an error
  if (helpers.emailNotPresent(email, users)) {
    return res.status(403).send('Incorrect Email');
  }
  //If email is located but password does not match - returns an error
  if (!bcrypt.compareSync(password, users[user].password)) {
    return res.status(403).send('Incorrect Password');
  }
  req.session.user_id = user;
  res.redirect(`/urls`);
});


//SUBMIT LOGOUT
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});


//SUBMIT EDITED ULR
app.post('/urls/:shortURL', (req, res) => {
  //If not logged in - returns an error
  if (!req.session.user_id) {
    return res.status(403).send('Not logged in');
  }
  //If url not linked to user - returns an error
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    return res.status(403).send('URL not linked to this user');
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});


//DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  //If not logged in - returns an error
  if (!req.session.user_id) {
    return res.status(403).send('Not logged in');
  }
  //If url not linked to user - returns an error
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    return res.status(403).send('URL not linked to this user');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});