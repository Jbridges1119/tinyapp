const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require("morgan");
const bodyParser = require("body-parser");

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
    // Log the POST request body to the console

  urlDatabase[generateRandomString()] = req.body.longURL
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});


function generateRandomString() {
    const character = '0123456789AaBbCcDdEeFfGgHhIiJjKkLl0123456789MmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789';
    let key = "";
    while (key.length < 6){
    key += character.charAt(Math.floor(Math.random() * 62));
    }
    return key;
};
