const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const axios = require('axios');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const characterRouter = require('./routes/characters');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', characterRouter);
app.use('/users', usersRouter);
app.use('/characters', characterRouter);

app.get('/', (req, res) => {
  res.render('search');
  res.redirect('/characters')

});

app.get('/search', (req, res) => {
  res.render('search');
});

app.get('/characters', async (req, res, next) => {
  try {
    if (!req.query.name) {
      return res.render('search', { message: 'Search for Character' });
    }

    const formattedName = req.query.name.replace(/ /g, '+');
    const response = await axios.get(`https://www.anapioficeandfire.com/api/characters?name=${formattedName}`);


    if (response.data && response.data.length > 0) {

      console.log(`Got a response for: ${response.data[0].name}`);


      res.render('characterDetails', { character: response.data[0] });
    } else {

      console.log('No characters found with the specified name');


      res.render('search', { message: 'Character not found.' });
    }
  } catch (error) {
    console.error('Error fetching character:', error);
    res.render('search', { message: 'Error fetching character data.' });
  }
});


app.post('/search', async (req, res, next) => {

  if (!req.session.characters) {
    req.session.characters = [];
  }

  try {
    const { name } = req.body;
    if (!name) {
      return res.render('search', { message: ' ' });
    }
    const formattedName = name.trim();
    const response = await axios.get(`https://www.anapioficeandfire.com/api/characters?name=${formattedName}`);

    if (response.data.length > 0) {
      const character = response.data[0];

      req.session.characters.push(character);

      res.render('characterDetails', { characters: req.session.characters });
    } else {
      res.render('characters', { message: 'Character not found.', characters: req.session.characters });
    }
  } catch (error) {
    console.error('Error fetching characters:', error);
    next(error);
  }
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
