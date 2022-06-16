const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080


//MIDDLEWARE BEING RUN
app.use(morgan('dev'));
//Middleware to allow object/array deconstruction
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());


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
    password: "purple"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "u2@a.com",
    password: "funk"
  }
};


//
//

//FUNCTIONS

//GENERATES RANDOM SHORTURL KEY
const generateRandomString = () => {
  const character = 'AaBbCcDdEeFfGgHhIiJjKkLl0123456789MmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789';
  let key = "";
  while (key.length < 6) {
    key += character.charAt(Math.floor(Math.random() * 62));
  }
  return key;
};

//CHECKS EMAIL AVAILABILITY
const emailNotPresent = (newEmail, users) => {
  for (let key in users) {
    if (newEmail === users[key]["email"]) {
      return false;
    }
  } return true;
};

//LOCATES ID BY EMAIL
const locateUserIdByEmail = (emailSubmitted, users) => {
  for (let key in users) {
    if (emailSubmitted === users[key]["email"]) {
      return key;
    }
  }
};

//CHECKS FOR URL IN DATABASE
const urlIsPresent = (shortURL, data) => {
  for (let key in data) {
    if (key === shortURL) {
      return true;
    }
  } return false;
};

//CREATES LIST OF USERS URL
const urlForUser = (id) => {
  let result = {};
  for (let key in urlDatabase) {
    if (id === urlDatabase[key].userID)
      result[key] = urlDatabase[key];
  }
  return result;
};


//
//

//ROUTES

//SEND TEXT SAYING HELLO
app.get("/", (req, res) => {
  res.send("Hello!");
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
  const templateVars = {
    username: users[req.cookies["user_id"]]
  };
  res.render(`register`, templateVars);
});


//REQUEST LOGIN PAGE
app.get('/login', (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]]
  };
  res.render(`login`, templateVars);
});


//REQUEST CREATE PAGE
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]]
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
  if (!req.cookies["user_id"]) {
    const templateVars = { username: undefined };
    return res.render("not_logged_in", templateVars);
  }
  const user = users[req.cookies["user_id"]];
  const userURL = urlForUser(user.id);
  const templateVars = {
    urls: userURL,
    username: user
  };
  res.render("urls_index", templateVars);
});


//REQUEST EDIT URL PAGE
app.get("/urls/:shortURL", (req, res) => {
  //If not logged in - returns error login page
  if (!req.cookies["user_id"]) {
    const templateVars = { username: undefined };
    return res.render("not_logged_in", templateVars);
  }
  const user = users[req.cookies["user_id"]];
  const userURL = urlForUser(user.id);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: userURL[req.params.shortURL]["longURL"],
    username: users[req.cookies["user_id"]]
  };
  //If shortURL is insorrect - returns an error
  if (!userURL[req.params.shortURL]) {
    return res.status(400).send('URL not linked to this user');
  }
  res.render("urls_show", templateVars);
});


//REQUEST LONG URL ROUTE (IS A GET BECAUSE THE SOURCE IS AN <A> LINK - TREAT LIKE A POST WITH THE REDIRECT)
app.get("/u/:shortURL", (req, res) => {
  //If wrong URL is inputed - returns an error
  if (!urlIsPresent(req.params.shortURL, urlDatabase)) {
    return res.status(400).send('Incorrect Short URL');
  }
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

//
//

//SUBMITTING NEW URL
app.post("/urls/new", (req, res) => {
  //If not logged in on submit new - returns an error
  if (!users[req.cookies["user_id"]]) {
    return res.status(403).send('Not logged In');
  }
  const key = generateRandomString();
  urlDatabase[key] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
  res.redirect(`/urls/${key}`);
});


//SUBMIT REGISTER
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  //If email or password are blank - returns an error
  if (email === "" || password === "") {
    return res.status(400).send('Empty Email or Password');
  }
  //If email is taken - return an error
  if (!emailNotPresent(email, users)) {
    return res.status(400).send('Email Unavailable');
  }
  users[id] = {
    "id": id,
    "email": email,
    "password": password
  };
  res.cookie("user_id", id);
  res.redirect('/urls');
});


//SUBMIT LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = locateUserIdByEmail(email, users);
  //If email isn't in database - returns an error
  if (emailNotPresent(email, users)) {
    return res.status(403).send('Incorrect Email');
  }
  //If email is located but password does not match - returns an error
  if (password !== users[user]["password"]) {
    return res.status(403).send('Incorrect Password');
  }
  res.cookie("user_id", user);
  res.redirect(`/urls`);
});


//SUBMIT LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});


//SUBMIT EDITED ULR
app.post('/urls/:shortURL', (req, res) => {
  //If not logged in - returns an error
  if (!req.cookies["user_id"]) {
    return res.status(403).send('Not logged in');
  }
  //If url not linked to user - returns an error
  if (req.cookies["user_id"] !== urlDatabase[req.params.shortURL]["userID"]) {
    return res.status(403).send('URL not linked to this user');
  }
  urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
  res.redirect(`/urls`);
});


//DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  //If not logged in - returns an error
  if (!req.cookies["user_id"]) {
    return res.status(403).send('Not logged in');
  }
  //If url not linked to user - returns an error
  if (req.cookies["user_id"] !== urlDatabase[req.params.shortURL]["userID"]) {
    return res.status(403).send('URL not linked to this user');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});