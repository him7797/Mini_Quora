const winston=require('winston');
const express = require('express');
const app = express();


require('./startup/routes')(app);//routes handling
require('./startup/db')();













const port = process.env.PORT || 5000;
app.listen(port, () => winston.info(`Listening on port ${port}...`));