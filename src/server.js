const express = require('express');

const bodyParser = require('body-parser');

const stubRoutes = require('./routes/stubRoutes');
const placesRoutes = require('./routes/placesRoutes');
// import adminRoutes from './routes/adminRoutes';
const config = require('./config');

const { openDB } = require('./utils/db')

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));

app.set('views', './src/views');
app.set('view engine', 'jade');

app.use('/places', placesRoutes);
// app.use('/admin', adminRoutes);
app.use('/stub', stubRoutes);

app.get('/health', (req, res) => {
  res.writeHead(200);
  res.end();
});

app.get('*', (req, res) => {
  res.send('*');
});

app.set('ipaddress', config.get('ipaddress'));
app.set('port', config.get('port'));

openDB()
  .then(() => {
    const server = app.listen(app.get('port'), app.get('ipaddress'), (err) => {
      if (err) {
        console.log(err);
      }
      const host = server.address().address;
      const port = server.address().port;
      console.log('Example app listening at http://%s:%s', host, port);
    });
  })
  .catch(error => console.log(error));
