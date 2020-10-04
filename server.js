const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const employeesRouter = require('./api/employees.js');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());
app.use(errorHandler());
app.use('/api/employees', employeesRouter);

app.listen(PORT, () => {
    console.log('Listening on port 4000...');
})

module.exports = app;