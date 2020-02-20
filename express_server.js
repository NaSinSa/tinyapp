const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { urlChecker, emailChecker, generateRandomString, urlsForUser, loggedInOrNot } = require('./helpers');


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['lhltiny'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(methodOverride('_method'));


//////////////////////
//    Raw Data      //
//////////////////////
const urlDatabase = {
  // b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' },     //examples
  // i3BoGr: { longURL: 'https://www.google.ca', userID: 'aJ48lW' }
};

const urlTracker = {
  // b6UTxQ: { visits: 0, visitingMembers: [], anonymousVisitor: 0 }     //examples
};

const users = { 
  // 'aJ48lW': {                //an example
  //   id: 'aJ48lW', 
  //   email: 'user@example.com', 
  //   password: '1'
  // }
};

////////////////////////
//    app commands    //
////////////////////////

//////////////////////////////////////////
//    user status: logged in or not     //
//////////////////////////////////////////
app.get('/', (req, res) => {
  const user = users[req.session.user_id];     

  loggedInOrNot(user) ? res.redirect('/login') : res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const user = users[req.session.user_id];

  let templateVars = {
    user_id: req.session.user_id, 
    urls: urlDatabase,
    user: user
  };

  loggedInOrNot(user) ? res.send("<html><body>Please <a href='/login'>Login</a> first</body></html>") : res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = users[req.session.user_id];
  const urlData = urlDatabase[req.params.shortURL];

  let templateVars = {
    user_id: req.session.user_id, 
    urls: urlDatabase,
    user: user,
    urlData: urlData
  };

  loggedInOrNot(user) ? res.redirect('/login') : res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.session.user_id];
  const urlData = urlDatabase[req.params.shortURL];

  let templateVars = { 
    user_id: req.session.user_id, 
    shortURL: req.params.shortURL, 
    urlData: urlData,
    user: user,
    urlTracker: urlTracker
  };

  if (loggedInOrNot(user)) {           
    res.send('You should login first');
  } else if (!urlsForUser(templateVars['user_id'], urlDatabase).find(ele => ele === templateVars.shortURL)) {  //check if the requested url belongs
    res.send('The url you input does not exist or you don\'t have permission to access');                      // to the user
  } else {
    res.render('urls_show', templateVars);
  }
});

///////////////////////////////////////////
//    short url create, delete & edit    //
///////////////////////////////////////////
app.post('/urls', (req, res) => {
  let newShortURL = generateRandomString()              //assigning the newly created string to the variable so that I can use it to*
  urlDatabase[newShortURL] = {};
  const urlData = urlDatabase[newShortURL];

  if (urlChecker(urlDatabase, req.body.longURL)) {
    if (req.session.user_id === urlDatabase[urlChecker(urlDatabase, req.body.longURL)]['userID']) {
      delete urlDatabase[urlChecker(urlDatabase, req.body.longURL)];
    }     //if a requested url exists and only if it is requested by whoever created it, the url will be deleted.
  }

  urlData['userID'] = req.session.user_id;
  urlData['longURL'] = req.body.longURL;

  urlTracker[newShortURL] = {};
  urlTracker[newShortURL]['visits'] = 0;
  urlTracker[newShortURL]['visitingMembers'] = [];
  urlTracker[newShortURL]['anonymousVisitor'] = 0;

  res.redirect(`/urls/${newShortURL}`);                //*here.
  
});

app.delete('/urls/:shortURL', (req, res) => {      //This is to delete a chosen shortURL. The button is created in urls_index.ejs

  if (req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
    delete urlDatabase[req.params.shortURL];
  }
  
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {      //This is to edit a chosen shortURL. The button is created in urls_index.ejs
  res.redirect(`/urls/${req.params.shortURL}`);
});

///////////////////////////////////////////
//    url function check & analytics     //
///////////////////////////////////////////
app.get('/u/:shortURL', (req, res) => {                 //This will redirect a user to the website which the one wants to go.
  const urlData = urlDatabase[req.params.shortURL];
  const analytics = urlTracker[req.params.shortURL];
  analytics['visits'] += 1;

  if (req.session.user_id === undefined) {
    analytics['anonymousVisitor'] += 1;
  } else if (!analytics['visitingMembers'].find(ele => (ele === req.session.user_id))) {
    analytics['visitingMembers'].push(req.session.user_id);
  }
  urlData === undefined ? res.send('The url you input does not exist') : res.redirect(urlData.longURL);
  
});

////////////////////////////
//      login & out       //
////////////////////////////
app.get('/login', (req, res) => {      
  const user = users[req.session.user_id];

  let templateVars = { 
    user_id: req.session.user_id,
    user: user
  };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {      
  if (!emailChecker(users, req.body.email)) {     //check if a given email matches one of them in the database.
    return res.send(403);
  } else if (!bcrypt.compareSync(req.body.password, users[emailChecker(users, req.body.email)]['password'])) {
    return res.send(403);
  }

  req.session.user_id = emailChecker(users, req.body.email); 
  res.redirect(`/urls`);
});

app.post('/logout', (req, res) => {  
  req.session = null;         //kills session
  res.redirect(`/urls`);
});

////////////////////////
//    registration    //
////////////////////////
app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  
  let templateVars = { 
    user_id: req.session.user_id,
    email: users[req.session.user_id],
    user: user
  };
  res.render('urls_email', templateVars);
});

app.post('/register', (req, res) => {             //adding a new user to users, the object.
  let newUserId = generateRandomString();         
  users[newUserId] = {};                          
  let newUser = users[newUserId];
  newUser['id'] = newUserId;
  
  if (req.body.email === '' || emailChecker(users, req.body.email)) {     //check if a given email is empty or already exists.
    return res.send(400);
  }
  
  newUser.email = req.body.email;
  newUser.password = bcrypt.hashSync(req.body.password, 10);    //setting a hashed password
  req.session.user_id = newUserId;           //adding the new user id to session
  res.redirect(`/urls`);
});

//////////////////////
//  server status   //
//////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// const urlTracker = {
//   b6UTxQ: { visits: 0, visitingMembers: [], anonymousVisitor: 0 }   
// };