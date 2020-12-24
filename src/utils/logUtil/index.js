// import loggly from 'loggly';
const config = require('../../config');


// const logglyClient = loggly.createClient({
//   token: config.get('loggly.token'),
//   subdomain: config.get('loggly.subdomain'),
//   auth: {
//     username: config.get('loggly.username'),
//     password: config.get('loggly.password'),
//   },
//   tags: ['scrapper-gcenter'],
// });
//
const  GuidUtil = require('../guidUtil');
const guid = GuidUtil.generate();

module.exports = class LogUtil {
  static log(message) {
    // const date = new Date().toJSON();
    // const message = `${date} :: ${guid} :: ${data}`;
    // logglyClient.log(message);
    console.log(message);
  }
}
