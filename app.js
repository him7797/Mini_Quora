const winston=require('winston');
const express = require('express');
const app = express();
const path = require('path');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');








require('./startup/logging');
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();













const port = process.env.PORT || 5000;
app.listen(port, () => winston.info(`Listening on port ${port}...`));


