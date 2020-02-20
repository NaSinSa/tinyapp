
//A func below is used to relace an existing shortURL to a new one when a user wants to edit.

const urlChecker = function (obj, WhatYouWannaCheck) {
  for (const key in obj) {
    if (obj[key]['longURL'] === WhatYouWannaCheck) {
      return key;                                       //if return obj[key], it cannot be used for url edit. 
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

// Generating a 6-character string randomly. Instead of using charCode, created an array with lowercase and uppercase alphabets + 10 numbers. This is for shortURL.
const generateRandomString = function () {
  const alphanumeric = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',0,1,2,3,4,5,6,7,8,9];
  let random6 = "";
  for (let i = 0; i < 6; i++) {
    random6 += alphanumeric[Math.floor(Math.random() * 62)];
  }
  return random6;
};

//to create an array with urls created by a given user
const urlsForUser = function (id, obj) {
  const listShortURL = Object.keys(obj);
  const userListOfShortURL = [];
  for (let shortURL of listShortURL) {
    if (id === obj[shortURL]['userID']) {
      userListOfShortURL.push(shortURL);
    }
  }
  return userListOfShortURL;
};

module.exports = { urlChecker, emailChecker, generateRandomString, urlsForUser }