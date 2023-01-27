//Generates a random string for short URLs and userIDs
const generateRandomString = function () {
  let randomString = '';
  const characterList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i += 1) {
    randomString += characterList.charAt(Math.floor(Math.random() * characterList.length));
  }
  return randomString;
};

//Compare given email with user in a given database
const emailHasUser = function (email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return true;
    }
  }
  return false;
};

//Print email and userDatabase and returns the user ID for the user with the given email address
const getUserByEmail = function (email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].id;
    }
  }
};

//Returns an object of short URLs specific to the passed in userID
const urlsForUser = function (id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

//Checks if current cookie corresponds with a user in the userDatabase
const cookieHasUser = function (cookie, userDatabase) {
  for (const user in userDatabase) {
    if (cookie === user) {
      return true;
    }
  } return false;
};

//return all function for other js file to use
module.exports = {
  generateRandomString,
  emailHasUser,
  getUserByEmail,
  urlsForUser,
  cookieHasUser
};