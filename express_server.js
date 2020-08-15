const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['no-idea-what'],
  }));

  const urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", email: "aJ48lW" },
    i3BoGr: { longURL: "https://www.google.ca", email: "aJ48lW" }
  };

let users = {
  'favour' : {
    email: 'fogboruche@yahoo.com',
    password: 'none'
  },
};

function urlsForUser(email) {
  const userUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].email === email) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
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
  let templateVars = {user: users[email], urlDatabase: urlsForUser(email)}
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
    if (!email) {
      res.redirect('/register')
    } else {
      if (urlDatabase[shortURL].email === email) {
        let longURL = urlDatabase[shortURL]["longURL"]
        console.log(longURL + "to verify")
        let templateVars = {user: users[email], longURL: longURL, shortURL: shortURL};
        res.render("urls_show", templateVars);
      } else {
        // if user is logged in but don't own the url
        let templateVars = {user: users[req.session.email], message: 'You can only view your shortened URLs'};

        res.render("error", templateVars); //checking!
        return;
      }
    }
  
  }
}); 

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let shortURLs = Object.keys(urlDatabase);
  if (shortURLs.includes(shortURL)) {
    const longURL = urlDatabase[shortURL]["longURL"]
    if (longURL.indexOf("http://") === 0 ) {
      res.redirect(longURL);
    } else {
      res.redirect("http://" + longURL);
    }
  } else {
    res.redirect('/urls');
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
          user: undefined,
          message: 'Email Exists!, Sign in Instead'};
        res.render("error", templateVars);
        return;
      }
    }
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
      message: 'Please put a valid email address and password',
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
        user: null,
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
      user: null,
      message: 'Please log in to submit a URL',
    };
    res.render('error', templateVars);
  } else {
    let shortURL = generateRandomString(6);
    let longURL = req.body.longURL;
    if (longURL.length >= 6) {
      const newUrl = {
        shortURL: shortURL,
        longURL: longURL,
        email: req.session.email,}
        urlDatabase[shortURL] = newUrl;
      console.log("urlDatabase is :", longURL)
      res.redirect(`/urls`);
    } else {
      res.redirect('/urls');
    }
  }
});

app.post('/urls/:shortURL', (req, res) => {
  // const email = req.session.email;
  const shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  if (urlDatabase[shortURL]) { //to fix
    urlDatabase[shortURL].longURL = longURL;
      res.redirect('/urls');
    } else {
      let templateVars = {
        user: null,
        message: 'No url found',
      };
      res.render('error', templateVars);
      return;
    }
});

app.post('/urls/:id/delete', (req, res) => {
  const shortUrl = req.params.id;
  const email = req.session.email;
  if (!email) {
    let templateVars = {
      user: null,
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