const express = require('express');
const app = express();
const admin = require("firebase-admin");
const serviceAccount = require("./serviceaccountkey.json");
const axios = require('axios');

app.use(express.urlencoded({ extended: true }));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

app.get('/ab', function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.get('/cd', function(req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.get('/movie', function(req, res) {
  res.sendFile(__dirname + "/movie.html");
});

app.post('/signupSubmit', function(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("Enter name, email, and password.");
  }

  const userData = {
    name: name,
    email: email,
    password: password
  };

  db.collection("capstone")
    .add(userData)
    .then(() => {
      res.redirect('/ab');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("cant add to database");
    });
});

app.post('/loginSubmit', function(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Provide email and password.");
  }

  db.collection("capstone")
    .where("email", "==", email)
    .where("password", "==", password)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        return res.send("Please sign up first.");
      } else {
        res.redirect('/movie');
      }
    })
    .catch((error) => {
      console.error("Error fetching user data: ", error);
      res.status(500).send("Failed to fetch user data from Firestore.");
    });
});

app.post('/movieSubmit', async function(req, res) {
  const { title } = req.body;

  try {
    const apiKey = '5a3e013d'; 
    const apiUrl = 'http://www.omdbapi.com/';
    const response = await axios.get(`${apiUrl}?i=tt3896198&apikey=${apiKey}&t=${encodeURIComponent(title)}`);

    const movieData = response.data;
    if (movieData.Response === 'True') {
      const title = movieData.Title;
      const releaseDate = movieData.Released;
      const actors = movieData.Actors;
      const rating = movieData.imdbRating;

      const movieDetails = {
        title: title,
        releaseDate: releaseDate,
        actors: actors,
        rating: rating
      };

      res.status(200).json(movieDetails);
    } else {
      res.status(404).send("Movie not found!");
    }
  } catch (error) {
    console.error("Error fetching movie data: ", error);
    res.status(500).send("Failed to fetch movie data from OMDB API.");
  }
});

app.listen(3000, function() {
  console.log("Server is running on port 3000");
});
