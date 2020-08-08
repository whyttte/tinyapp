
<% if (user) { %>

  <li><span><%= user.email %></span></li>
<%} else {%>
  <a href="/register">Register</a>
  <a href="/login">Login</a>

// const id = {
// // Route path: /users/:userId/books/:bookId
// // Request URL: http://localhost:3000/users/34/books/8989
// reqParam: { urlDatabase: "34", "bookId": "8989" }
// };







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
        email: req.session.email,
        visited: 0,
        uVisitors: 0}
      urlDatabase[shortURL] = newUrl;
      console.log("urlDatabase is :", longURL)
      res.redirect(`/urls`);
    } else {
      res.redirect('/urls');
    }
  }
});

as

// PLEASE DON'T CHANGE


app.get("/urls/:shortURL", (req, res) => {
  const {email} = req.session;
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    if (!email) {
      res.redirect('/register')
    } else {
      if (urlDatabase[shortURL].email === email) {
        let longURL = urlDatabase[shortURL]["longURL"]
        // let {longURL/* visits, visited, uVisitors*/} = urlDatabase[req.params.shortURL]; //
        console.log(longURL + "to verify")
        let templateVars = {user: users[email], longURL: longURL, shortURL: shortURL};
        res.render("urls_show", templateVars);
      } else {
        // if user is logged in but don't own the url
        let templateVars = {user: users[req.session.email], message: 'You can only view your shortened URLs'};
        // console.log(email, urlDatabase[shortURL].email ) 
        // console.log(urlDatabase)
        res.render("error", templateVars); //checking!
        return;
      }
    }
  //     let {longURL, visits, visited, uVisitors} = urlDatabase[req.params.shortURL]; // verify
  //     let templateVars = {shortURL, longURL, visits, visited, uVisitors, user: users[email]};
  //     res.render("urls_show", templateVars);
  //     return;
  //   } else if (email) {
  //       let templateVars = {user: users[req.session.email], message: 'You can only view your shortened URLs'};
  //       res.render("error", templateVars);
  //       return;
  //   } else {
  //     let templateVars = {user: users[req.session.email], message: 'Please login in to view your shortened URLs'};
  //     res.render("error", templateVars);
  //   }
  // // } else {
  // //   let templateVars = {user: users[req.session.email], message: `Couldn't fing your URLs`};
  // //   res.render("error", templateVars);
  // //   return;
  }
}); 