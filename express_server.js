const express = require("express");
const app = express();
const PORT = 8080; // default port 8080



app.set('view engine', 'ejs');


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let alphaNumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomGen = ''
  for (let i = 0; i < 6; i++) {
    randomGen += alphaNumeric.charAt(Math.floor(Math.random() * alphaNumeric.length));
  }
  return randomGen;
}


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
// const id = {
// // Route path: /users/:userId/books/:bookId
// // Request URL: http://localhost:3000/users/34/books/8989
// reqParam: { urlDatabase: "34", "bookId": "8989" }
// };

app.get("/urls.json", (req, res) => {
  res.json("urlDatabase");
});

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL
  console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/:${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  let templateVars = { shortURL: /*req.params.*/shortURL, longURL: urlDatabase[shortURL] }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});



app.post("/urls/:shortURL?/update", (req, res) => {
  const shortURL = req.params.shortURL
  console.log(`longurl: ${JSON.stringify(req.body)}`)
  urlDatabase[shortURL] = req.body.longURL
  let templateVars = {urls: urlDatabase}
  res.render("urls_index", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect(`/urls`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});



app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});