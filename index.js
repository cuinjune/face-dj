const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Handle data in a nice way
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const publicURL = path.resolve(`${__dirname}/public`);
const emscriptenURL = path.resolve(`${publicURL}/emscripten`);
const pdURL = path.resolve(`${emscriptenURL}/pd`);

// Set your static server
app.use(express.static(publicURL));
app.use(express.static(emscriptenURL));
app.use(express.static(pdURL));

// Views
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

// Start listening
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
})