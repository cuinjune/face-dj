const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const app = express();
const PORT = 3000;

// Handle data in a nice way
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const publicPath = path.resolve(`${__dirname}/public`);
const emscriptenPath = path.resolve(`${publicPath}/emscripten`);
const pdPath = path.resolve(`${emscriptenPath}/pd`);
const assetsPath = path.resolve(`${publicPath}/assets`);
const faviconPath = path.resolve(`${assetsPath}/favicon`);

// Set your static server
app.use(express.static(publicPath));
app.use(express.static(emscriptenPath));
app.use(express.static(pdPath));

// Set the favicon
app.use(favicon(path.join(faviconPath, 'favicon.ico')));

// Views
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

// Start listening
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
})