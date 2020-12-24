const GoogleSearch = require('google-search');
import config from '../../config';
// const stubResponse = require('../../../resources/stubs/googleSearch.json');

module.exports = class GoogleSearchUtil {

  constructor() {
    this.client = new GoogleSearch({
      key: config.get('google.apiKey'),
      cx: config.get('google.searchCx'),
    });
    this.location = 'mx';
    this.language = 'lang_es';
    this.numberResults = 10;
  }

  search(query) {
    return new Promise((resolve, reject) => {
      this.client.build({
        q: query,
        gl: this.location,
        lr: this.language,
        num: this.numberResults,
      }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.items);
        }
      });

      // if (true) {
      //   resolve(stubResponse);
      // } else {
      //   reject();
      // }
    });
  }
}
