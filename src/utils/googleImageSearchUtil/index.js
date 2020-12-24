import _ from 'lodash';
import ImagesClient from 'google-images';
import config from '../../config';
// const stubImageResponse = require('../../../resources/stubs/googleImageSearch');

module.exports = class GoogleImageSearchUtil {

  constructor() {
    this.client = new ImagesClient(config.get('google.imageCx'), config.get('google.apiKey'));
  }

  search(query, options) {
    return new Promise((resolve, reject) => {
      this.client.search(query, options)
        .then((images) => {
          if (_.isArray(images)) {
            resolve(images);
          } else {
            reject();
          }
        })
        .catch(err => reject(err));
      // if (true) {
      //   resolve(stubImageResponse);
      // } else {
      //   reject();
      // }
    });
  }
}
