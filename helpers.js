//GENERATES RANDOM SHORTURL KEY
const generateRandomString = () => {
  const character = 'AaBbCcDdEeFfGgHhIiJjKkLl0123456789MmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789';
  let key = "";
  while (key.length < 6) {
    key += character.charAt(Math.floor(Math.random() * 62));
  }
  return key;
};

//CHECKS EMAIL AVAILABILITY
const emailNotPresent = (newEmail, users) => {
  for (let key in users) {
    if (newEmail === users[key]["email"]) {
      return false;
    }
  } return true;
};

//LOCATES ID BY EMAIL
const getUserByEmail = (emailSubmitted, users) => {
  for (let key in users) {
    if (emailSubmitted === users[key]["email"]) {
      return key;
    }
  }
};

//CHECKS FOR URL IN DATABASE
const urlIsPresent = (shortURL, data) => {
  for (let key in data) {
    if (key === shortURL) {
      return true;
    }
  } return false;
};

//CREATES LIST OF USER SPECIFIC URLS
const urlsForUser = (id, data) => {
  let result = {};
  for (let key in data) {
    if (id === data[key].userID)
      result[key] = data[key];
  }
  return result;
};

module.exports =  {generateRandomString, emailNotPresent, getUserByEmail, urlIsPresent, urlsForUser};