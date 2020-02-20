const { assert } = require('chai');

const { urlChecker, emailChecker, generateRandomString, urlsForUser } = require('../helpers.js');

const testUsers = {
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

const testDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

describe('emailChecker', function() {
  it('should return a user with valid email', function() {
    const user = emailChecker(testUsers, "user@example.com")
    const expectedOutput = "userRandomID";

    assert.equal(user, expectedOutput);
  });

  it('should return undefined with an invalid email', function() {
    const user = emailChecker(testUsers, "user1@example.com")
    const expectedOutput = undefined;

    assert.equal(user, expectedOutput);
  });

});

describe('urlChecker', function() {
  it('should return a shortened url with a valid long url', function() {
    const shortURL = urlChecker(testDatabase, "https://www.tsn.ca")
    const expectedOutput = "b6UTxQ";

    assert.equal(shortURL, expectedOutput);
  });

  it('should return undefined with an invalid long url', function() {
    const shortURL = urlChecker(testDatabase, "https://www.google.com")
    const expectedOutput = undefined;

    assert.equal(shortURL, expectedOutput);
  });

});