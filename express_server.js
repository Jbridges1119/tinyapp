const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require("morgan");
const bodyParser = require("body-parser");

//MIDDLEWARE BEING RUN
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//URL DATABASE
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

//SERVER RESPONSE WHEN STARTED
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//REQUEST CREATE TINYURL PAGE
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

//REQUEST MAIN PAGE
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
//Create new url page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//SUBMIT EDITED ULR
app.post('/urls/:shortURL', (req, res) => {
  console.log(req.params)
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect(`/urls`)
})

//DELETE URL
app.post("/urls/:shortURL/delete", (req,res) => {
   delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls`)
})


//GENERATE RANDOM SHORT URL KEY
function generateRandomString() {
  const character = 'AaBbCcDdEeFfGgHhIiJjKkLl0123456789MmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789';
  let key = "";
  while (key.length < 6) {
    key += character.charAt(Math.floor(Math.random() * 62));
  }
  return key;
}
