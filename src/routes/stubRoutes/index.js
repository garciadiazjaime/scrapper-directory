const fs = require('fs');
const express = require('express');
/*eslint-disable */
const router = express.Router();
/*eslint-enable */


router.get('/', (req, res) => {
  fs.readFile('resources/stubs/restaurant.json', (err, data) => {
    if (!err) {
      res.writeHead(200, { 'Content-Type': 'text/json', 'Content-Length': data.length });
      res.write(data);
    } else {
      res.writeHead(404);
    }
    res.end();
  });
});

module.exports = router;
