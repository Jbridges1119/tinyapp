const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');


//MIDDLEWARE BEING RUN
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

//Middleware to allow object/array deconstruction
app.use(express.urlencoded({ extended: true}));


//URL DATABASE
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//USER DATA STORAGE
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
}

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
    username: req.cookies["username"],
  };
  res.render(`register`, templateVars)
})

//REQUEST CREATE TINYURL PAGE
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render('urls_new', templateVars);
});

//REQUEST MAIN PAGE
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

//REQUEST CREATE NEW URL PAGE
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

//SUBMITTING NEW URL
app.post("/urls", (req, res) => {
  const key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls/${key}`);
});

//REQUEST SPECIFIC SHORT URL INFO / EDIT PAGE
app.get("/u/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//SUBMIT LOGIN
app.post('/login', (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect(`/urls`);
});

//SUBMIT LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect(`/urls`);
});

//SUBMIT EDITED ULR
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

//DELETE URL
app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});


//GENERATE RANDOM SHORT URL KEY
const generateRandomString = () => {
  const character = 'AaBbCcDdEeFfGgHhIiJjKkLl0123456789MmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789';
  let key = "";
  while (key.length < 6) {
    key += character.charAt(Math.floor(Math.random() * 62));
  }
  return key;
};
