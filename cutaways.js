
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