const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));


let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = {
  'favour' : {
    username: 'favour',
    email: 'fogboruche@yahoo.com',
    password: 'none'
  },
};

const cookieParser = require('cookie-parser');
const { request } = require("express");
app.use(cookieParser());
// app.use(cookieSession({
//   name: 'session',
//   keys: ['no idea what this is'],
// }));
function authorisedUsers(username) {
  let authorisedUserUrls = {};
  for(let url in urlDatabase) {
    if (urlDatabase[url][username] === username) {
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
  const user = users[req.session.username];
  if (user) {
    res.redirect('/urls');
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const username = req.session.username
  let templateVars = {urlDatabase: authorisedUserUrls(username), user: users[username]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.session.username]};
  if (templateVars[user]) {
    res.render("urls_new", templateVars);
  } else {
  res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const {username} = req.session;
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    if (urlDatabase[shortURL].username === username) {
      let {longURL, visits, visited, uVisitors} = urlDatabase[req.params.shortURL]; // verify
      let templateVars = {shortURL, longURL, visits, visited, uVisitors, user: users[username]};
      res.render("urls_show", templateVars);
      return;
    } else if (username) {
        let templateVars = {user: users[req.session.username], message: 'You can only view your shortened URLs'};
        res.render("Error", templateVars);
        return;
    } else {
      let templateVars = {user: users[req.session.username], message: 'Please login in to view your shortened URLs'};
      res.render("Error", templateVars);
    }
  } else {
    let templateVars = {user: users[req.session.username], message: `Couldn't fing your URLs`};
    res.render("Error", templateVars);
    return;
  }
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




app.get('/register', (req, res) => {
  let templateVars = {
    user: users[req.session.username],
  };
  if (templateVars.user) {
    res.redirect('/urls');
  } else {
    res.render('register', templateVars);
  }
});

app.get('/login', (req, res) => {
  let templateVars = {
    user: users[request.session.username],
  };
  if (templateVars.user) {
    res.redirect('/urls');
  } else {
    res.render('login', templateVars);
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    for (let key in users) {
      if (users[key].email === email) {
        let templateVars = {
          user: users[req.session.username],
          message: 'Email Exists!, Sign in Instead'};
        res.render('Error', templateVars);
        return;
      }
    }
    const randomId = generateRandomString(8);
    const newUser = {
      username,
      email,
      password: bcrypt.hashSync(password, 8),
    };
    users[username] = newUser;
    req.session.username = username;
    res.redirect('/urls');
    return;
  } else {
    let templateVars = {
      user: users[req.session.username],
      message: 'Please put a valid email adress and password',
    };
    res.render('Error', templateVars);
    return;
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    let templateVars = {
      user: users[req.session.username],
      message: 'Email or password not found',
    };
    res.render('error', templateVars);
    return;
  } else {
    let Found = false;
    for (let user in users) {
      if (users[user].email === email) {
        Found = true;
        if (bcrypt.compareSync(password, users[user].password)) {
          req.session.username = users[user].username;
          res.redirect('/urls');
        } else {
          let templateVars = {
            user: users[req.session.username],
            message: 'Wrong password',
          };
          res.render('Error', templateVars);
          return;
        }
      }
    }
    if (!Found) {
      let templateVars = {
        user: users[request.session.username],
        message: 'Email not found',
      };
      res.render('Error', templateVars);
      return;
    }
  }
});

app.post('/urls', (req, res) => {
  if (!req.session.username) {
    let templateVars = {
      user: users[req.session.username],
      message: 'Please log in to submit a URL',
    };
    res.render('Error', templateVars);
  } else {
    let shortURL = generateRandomString(6);
    let longURL = req.body.longURL;
    if (longURL.length >= 6) {
      const newUrl = {
        visits: [],
        shortURL,
        longURL,
        usernmae: req.session.username,
        visited: 0,
        uVisitors: 0}
      urlDatabase[shortURL] = newUrl;
      res.redirect(`/urls/${shortURL}`);
    } else {
      res.redirect('/urls');
    }
  }
});

app.delete('/urls/:id/delete', (req, res) => {
  const shortUrl = req.params.shortURL;
  const username = req.session.username;
  if (!username) {
    let templateVars = {
      user: users[req.session.username],
      message: 'Please log in to delete your URL',
    };
    res.render('error', templateVars);
  } else if (urlDatabase[shortUrl].username === username) {
      if (!urlDatabase[shortUrl]) {
        let templateVars = {
          user: users[req.session.username],
          message: 'You may only delete your own URLs'}
          res.render('Error', templateVars);
      } 
    delete urlDatabase[shortUrl];
    }
    res.redirect('/urls');
});



app.get('/urls/new', (request, response) => {
  let templateVars = {
    user: users[request.session.user_id],
  };
  if (templateVars.user) {
    response.render('urls_new', templateVars);
  } else {
    response.redirect('/login');
  }
});



// app.post('/logout', (req, res) => {
//   res.clearCookie('username');
//   res.redirect('/urls');
// });

// app.post("/urls", (req, res) => {
//   let shortURL = generateRandomString();
//   let longURL = req.body.longURL;
//   urlDatabase[shortURL] = longURL
//   // console.log(req.body);  // Log the POST request body to the console
//   res.redirect(`/urls/:${shortURL}`);         // Respond with 'Ok' (we will replace this)
// });









// app.post("/urls/:shortURL/update", (req, res) => {
//   const shortURL = req.params.shortURL
//   urlDatabase[shortURL] = req.body.longURL
//   let templateVars = {urls: urlDatabase}
//   res.render("urls_index", templateVars);
// });

// app.post("/urls/:shortURL/delete", (req, res) => {
//   const shortURL = req.params.shortURL
//   if (urlDatabase[shortUrl]) {
//     delete urlDatabase[shortURL];
//   }
//   res.redirect(`/urls`);
// });

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});