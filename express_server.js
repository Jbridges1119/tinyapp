const express = require("express");
const methodOverride = require('method-override');
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const helpers = require('./helpers');
const PORT = 8080; // default port 8080


//MIDDLEWARE BEING RUN
app.use(morgan('dev'));
app.use(methodOverride('_method'));
//Middleware to allow object/array deconstruction
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2", "key3"],

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
    email: "user@example.com",
    password: "$2a$10$Sv4wwVbpJ3egcln9gtMnU.weqV0/Yfrvgoh1GP3hTiY1c0fVEnuxm" //Password - "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$7T8hMUiuaWTqPt5IAQ1jRuoFsuD8.Zf8OvmNrSuH3vbUHho9Va0Li" //Password - "dishwasher-funk"
  }
};


//
//

//SERVER RESPONSE IN CONSOLE WHEN STARTED
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//ROUTING

//REQUEST FOR URLS IN JSON FORMAT
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//SEND TEXT SAYING HELLO WORLD
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


//HOMEPAGE
app.get("/", (req, res) => {
  //If not logged in - returns not_logded_in page
  if (!req.session.user_id) {
    const templateVars = { 
      username: undefined,
      error: false, 
      reason: ''
     };
    return res.render("not_logged_in", templateVars);
  }
  //Directs user to /urls
  res.redirect('/urls');
});


//REQUEST REGISTRATION PAGE
app.get(`/register`, (req, res) => {
  //If user is logged in - redirect to main page
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    username: users[req.session.user_id],
    error: false, 
    reason: ''
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
    username: users[req.session.user_id],
    error: false, 
    reason: ''
  };
  res.render(`login`, templateVars);
});


//REQUEST CREATE PAGE
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: users[req.session.user_id],
    error: false, 
    reason: ''
  };
  //If not logged in - render login page
  if (!templateVars.username) {
    return res.render('not_logged_in', templateVars);
  }
  //Renders the create page
  res.render('urls_new', templateVars);
});


//REQUEST LIST PAGE
app.get("/urls", (req, res) => {
//If not logged in - returns not_logded_in page
  if (!req.session.user_id) {
    const templateVars = {
      username: users[req.session.user_id],
      error: false, 
      reason: ''
    };
    return res.render("not_logged_in", templateVars);
  }
  //Renders main page url list
  const user = users[req.session.user_id];
  const userURL = helpers.urlsForUser(user.id, urlDatabase);
  const templateVars = {
    urls: userURL,
    username: user
  };
  res.render("urls_index", templateVars);
});


//REQUEST EDIT URL PAGE
app.get("/urls/:shortURL", (req, res) => {
//If not logged in - returns not_logded_in page
  if (!req.session.user_id) {
    const templateVars = {
      username: users[req.session.user_id],
      error: false, 
      reason: ''
    };
    return res.render("not_logged_in", templateVars);
  }
  //If short url isn't in database - returns an error
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(400).send('Short URL does not exist');
  }
  const user = users[req.session.user_id];
  const userURL = helpers.urlsForUser(user.id, urlDatabase);
  //If shortURL is insorrect - returns an error
  if (!userURL[req.params.shortURL]) {
    return res.status(400).send('Short URL not linked to this user');
  }
  //Renders the short URL page
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: userURL[req.params.shortURL].longURL,
    username: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});


//REQUEST LONG URL ROUTE (IS A GET BECAUSE THE SOURCE IS AN <A> LINK)
app.get("/u/:shortURL", (req, res) => {
  //If wrong URL is inputed - returns an error
  if (!helpers.urlIsPresent(req.params.shortURL, urlDatabase)) {
    return res.status(400).send('Incorrect Short URL');
  }
  //Directs user to long URL's website
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
  //Addes user created short URL with their id to `urlDatabase` and redirects user to the new URL's page
  const key = helpers.generateRandomString();
  urlDatabase[key] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${key}`);
});


//SUBMIT REGISTER
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  //If email or password are blank - returns an error
  if (email === "" || password === "") {
    const templateVars = {
      username: users[req.session.user_id],
      error: true, 
      reason:' Empty Email or Password'
    }
    return res.status(400).render(`register`, templateVars);
    // return res.status(400).send('Empty Email or Password');
  }
  //If email is taken - return an error
  if (!helpers.emailNotPresent(email, users)) {
    const templateVars = {
      username: users[req.session.user_id],
      error: true, 
      reason:' Email Unavailable'
    }
    return res.status(400).render(`register`, templateVars);
    // return res.status(400).send('Email Unavailable');
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
    const templateVars = {
      username: users[req.session.user_id],
      error: true, 
      reason:' Incorrect Email'
    }
    return res.status(400).render(`login`, templateVars);
    // return res.status(403).send('Incorrect Email');
  }
  //If email is located but password does not match - returns an error
  if (!bcrypt.compareSync(password, users[user].password)) {
    const templateVars = {
      username: users[req.session.user_id],
      error: true, 
      reason:' Incorrect Password'
    }
    return res.status(400).render(`login`, templateVars);
    // return res.status(403).send('Incorrect Password');
  }
  //Logs user in by giving encrypted cookie and directs user to /urls
  req.session.user_id = user;
  res.redirect(`/urls`);
});


//SUBMIT LOGOUT
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});


//SUBMIT EDITED ULR
app.put('/urls/:shortURL', (req, res) => {
  //If not logged in - returns an error
  if (!req.session.user_id) {
    return res.status(403).send('Not logged in');
  }
  //If url not linked to user - returns an error
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    return res.status(403).send('URL not linked to this user');
  }
  //Edits specific URL and directs user to /urls page
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});


//DELETE URL
app.delete("/urls/:shortURL", (req, res) => {
  //If not logged in - returns an error
  if (!req.session.user_id) {
    return res.status(403).send('Not logged in');
  }
  //If url not linked to user - returns an error
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    return res.status(403).send('URL not linked to this user');
  }
  //Delets specific URL and directs user to /urls page
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});




