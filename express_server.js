const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Generating a 6-character string randomly. Instead of using charCode, created an array with lowercase and uppercase alphabets + 10 numbers. This is for shortURL.
const generateRandomString = function () {
  const alphanumeric = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',0,1,2,3,4,5,6,7,8,9];
  let random6 = "";
  for (let i = 0; i < 6; i++) {
    random6 += alphanumeric[Math.floor(Math.random() * 62)];
  }
  return random6;
}

//A func below is used to relace an exist shortURL to a new one when a user wants to edit.

const urlChecker = function (obj, WhatYouWannaCheck) {
  for (const key in obj) {
    if (obj[key]['longURL'] === WhatYouWannaCheck) {
      return key;                                       //if return obj[key], I cannot use this for url edit. 
    }
  }
};

//This func is to check if a given email by a user exists in our database.
const emailChecker = function (obj, WhatYouWannaCheck) {
  for (const key in obj) {
    if (obj[key].email === WhatYouWannaCheck) {
      return key;                                       
    }
  }
};

const urlsForUser = function (id) {
  for (let shortURL in urlDatabase) {

  }
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "1"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];

  let templateVars = {
    user_id: req.cookies["user_id"], 
    urls: urlDatabase,
    user: user
  };

  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const urlData = urlDatabase[req.params.shortURL];

  let templateVars = {
    user_id: req.cookies["user_id"], 
    urls: urlDatabase,
    user: user,
    urlData: urlData
  };
  if (user === undefined) {               //if not logged in, kick back to login page
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const urlData = urlDatabase[req.params.shortURL];

  let templateVars = { 
    user_id: req.cookies["user_id"], 
    shortURL: req.params.shortURL, 
    urlData: urlData,
    user: user
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString()              //assigning the newly created string to the variable so that I can use it to
  urlDatabase[newShortURL] = {};
  const urlData = urlDatabase[newShortURL];

  if (urlChecker(urlDatabase, req.body.longURL)) {
    if (req.cookies['user_id'] === urlDatabase[urlChecker(urlDatabase, req.body.longURL)]['userID']) {
      delete urlDatabase[urlChecker(urlDatabase, req.body.longURL)];
    }
  }

  urlData['userID'] = req.cookies["user_id"];
  urlData['longURL'] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);                //here.
  
});

app.get("/u/:shortURL", (req, res) => {                 //This will redirect a user to the website which the one wants to go.
  const urlData = urlDatabase[req.params.shortURL];
  res.redirect(urlData.longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {      //This is to delete a chosen shortURL. The button is created in urls_index.ejs

  console.log(urlDatabase[req.params.shortURL]['userID'], req.cookies['user_id'])

  if (req.cookies['user_id'] === urlDatabase[req.params.shortURL]['userID']) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {      //This is to edit a chosen shortURL. The button is created in urls_index.ejs
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.get("/login", (req, res) => {      
  const user = users[req.cookies["user_id"]];

  let templateVars = { 
    user_id: req.cookies["user_id"],
    user: user
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {      
  // res.cookie('user_id',`${req.body.user_id}`);
  if (!emailChecker(users, req.body.email)) {     //check if a given email matches one of them in the database.
    console.log(!emailChecker(users, req.body.email))
    return res.send(403);
  } else if (users[emailChecker(users, req.body.email)]['password'] !== req.body.password) {
    console.log(!emailChecker(users, req.body.email))
    return res.send(403);
  }
  res.cookie('user_id', emailChecker(users,req.body.email));
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {  
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];

  let templateVars = { 
    user_id: req.cookies["user_id"],
    email: users[req.cookies["user_id"]],
    user: user
  };
  res.render("urls_email", templateVars);
});

app.post("/register", (req, res) => {             //adding a new user to users, the object.
  let newUserId = generateRandomString();         
  users[newUserId] = {};                          
  let newUser = users[newUserId];
  newUser['id'] = newUserId;

  if (req.body.email === "" || emailChecker(users, req.body.email)) {     //check if a given email is empty or already exists.
    return res.send(400);
  }
  
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
