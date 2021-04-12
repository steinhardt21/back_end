require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const errorHandler = require('_helpers/error-handler');
const connectDB = require('./config/db')

const path = require('path')

connectDB();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())

// app.get('/', (req, res) => res.send('API running'))

// Define Routes
app.use('/users', require('./routes/api/users'))
app.use('/auth', require('./routes/api/auth'))
app.use('/profile', require('./routes/api/profile'))
app.use('/projects', require('./routes/api/projects'))
app.use('/candidacy', require('./routes/api/candidacy'))

app.use('/admin', require('./routes/api/admin'))

app.use(errorHandler);

// Serve static assets in production
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});
