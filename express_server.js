const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
// const { request } = require("express");
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['no-idea-what'],
  }));

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = {
  'favour' : {
    email: 'favour',
    email: 'fogboruche@yahoo.com',
    password: 'none'
  },
};

function authorisedUsers(email) {
  let authorisedUserUrls = {};
  for(let url in urlDatabase) {
    if (urlDatabase[url][email] === email) {
      authorisedUserUrls[url] = urlDatabase[url];
    }
  }
  return authorisedUserUrls
}


function generateRandomString(num) {
  let alphaNumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomGen = ''
  for (let i = 0; i < num; i++) {
    randomGen += alphaNumeric.charAt(Math.floor(Math.random() * alphaNumeric.length));
  }
  return randomGen;
}

app.get("/urls.json", (req, res) => {
  res.json("urlDatabase");
});

app.get("/", (req, res) => {
  const user = users[req.session.email];
  if (user) {
    res.redirect('/urls');
  } else {
    res.redirect("/login");
  }
});

app.get('/login', (req, res) => {
  let templateVars = {
    user: users[req.session.email],
  };
  if (templateVars.user) {
    res.redirect('/urls');
  } else {
    res.render('login', templateVars);
  }
});

app.get('/register', (req, res) => {
  let templateVars = {
    user: users[req.session.email],
  };
  if (templateVars.user) {
    res.redirect('/urls');
  } else {
    res.render('register', templateVars);
  }
});

app.get("/urls", (req, res) => {
  const email = req.session.email
  let templateVars = {user: users[email], urls: urlDatabase}
  // let templateVars = {urlDatabase: authorisedUserUrls(email), user: users[email]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.session.email]};
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
  res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const {email} = req.session;
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    // if (urlDatabase[shortURL].email === email) {
      let {longURL, visits, visited, uVisitors} = urlDatabase[req.params.shortURL]; // verify
      let templateVars = {shortURL, longURL, visits, visited, uVisitors, user: users[email]};
      res.render("urls_show", templateVars);
      return;
    } else if (email) {
        let templateVars = {user: users[req.session.email], message: 'You can only view your shortened URLs'};
        res.render("error", templateVars);
        return;
    } else {
      let templateVars = {user: users[req.session.email], message: 'Please login in to view your shortened URLs'};
      res.render("error", templateVars);
    }
  // } else {
  //   let templateVars = {user: users[req.session.email], message: `Couldn't fing your URLs`};
  //   res.render("error", templateVars);
  //   return;
  // }
}); 

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL)
  } else {
  res.redirect('/urls');
  }
});
//yet to finish




app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


app.post('/register', (req, res) => {
  const { email, password } = req.body;
  console.log(email, password)
  if (email && password) {
    for (let key in users) {
      if (users[key].email === email) {
        console.log(users[key].email)
        let templateVars = {
          user: undefined,
          message: 'Email Exists!, Sign in Instead'};
        res.render('error', templateVars);
        return;
      }
    }
    // const randomId = generateRandomString(8);
    const newUser = {
      email,
      password: bcrypt.hashSync(password, 8),
    };
    users[email] = newUser;
    req.session.email = email;
    res.redirect('/urls');
    return;
  } else {
    let templateVars = {
      user: undefined,
      message: 'Please put a valid email adress and password',
    };
    res.render('error', templateVars);
    return;
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    let templateVars = {
      user: users[req.session.email],
      message: 'Email or password not found',
    };
    res.render('error', templateVars);
    return;
  } else {
    let found = false;
    for (let user in users) {
      if (users[user].email === email) {
        found = true;
        if (bcrypt.compareSync(password, users[user].password)) {
          req.session.email = users[user].email;
          res.redirect('/urls');
        } else {
          let templateVars = {
            user: users[req.session.email],
            message: 'Wrong password',
          };
          res.render('error', templateVars);
          return;
        }
      }
    }
    if (!found) {
      let templateVars = {
        user: users[req.session.email],
        message: 'Email not found',
      };
      res.render('error', templateVars);
      return;
    }
  }
});

app.post('/urls', (req, res) => {
  if (!req.session.email) {
    let templateVars = {
      user: undefined,
      message: 'Please log in to submit a URL',
    };
    res.render('error', templateVars);
  } else {
    let shortURL = generateRandomString(6);
    let longURL = req.body.longURL;
    if (longURL.length >= 6) {
      const newUrl = {
        visits: [],
        shortURL,
        longURL,
        usernmae: req.session.email,
        visited: 0,
        uVisitors: 0}
      urlDatabase[shortURL] = newUrl;
      res.redirect(`/urls/${shortURL}`);
    } else {
      res.redirect('/urls');
    }
  }
});

app.post('/urls/:id/delete', (req, res) => {
  const shortUrl = req.params.id;
  const email = req.session.email;
  if (!email) {
    let templateVars = {
      user: undefined,
      message: 'Please log in to delete your URL',
    };
    res.render('error', templateVars);
  } else if (urlDatabase[shortUrl].email !== email) {
      let templateVars = {
      user: users[req.session.email],
      message: 'You may only delete your own URLs'}
      res.render('error', templateVars);
  } else {
    delete urlDatabase[shortUrl];
  }
  res.redirect('/urls');
});




app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});