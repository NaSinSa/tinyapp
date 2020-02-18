const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Generating a 6-character string randomly. Instead of using charCode, created an array with lowercase and uppercase alphabets + 10 numbers. This is for shortURL.
function generateRandomString() {
  const alphanumeric = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',0,1,2,3,4,5,6,7,8,9];
  let random6 = "";
  for (let i = 0; i < 6; i++) {
    random6 += alphanumeric[Math.floor(Math.random() * 62)];
  }
  return random6;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"], 
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"], 
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"],                //Using cookies to save and to call usernames
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString()              //assigning the newly created string to the variable so that I can use it to*
  for (let key in urlDatabase) {
  //it is removing an old one if the submit is for the same longURL,**
  if (urlDatabase[key] === req.body.longURL) {        
    delete urlDatabase[key];
  }
} //**and reassign the new short url.
urlDatabase[newShortURL] = req.body.longURL;
res.redirect(`/urls/${newShortURL}`);                //*here.
});

app.get("/u/:shortURL", (req, res) => {                 //This will redirect a user to the website which the one wants to go.
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {      //This is to delete a chosen shortURL. The button is created in urls_index.ejs
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {      //This is to edit a chosen shortURL. The button is created in urls_index.ejs
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/login", (req, res) => {      
  res.cookie('username',`${req.body.username}`);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {      
  res.clearCookie('username');
  res.redirect(`/urls`);
});

app.get("/register", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_email", templateVars);
});

app.post("/register", (req, res) => {             //adding a new user to users, the object.
  let newUserId = generateRandomString();         
  users[newUserId] = {};                          
  let newUser = users[newUserId];
  newUser['id'] = newUserId;
  newUser.email = req.body.email;
  newUser.password = req.body.password;
  res.cookie('user_id',`${newUserId}`);           //adding the new user id to cookies
  res.redirect(`/urls`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
