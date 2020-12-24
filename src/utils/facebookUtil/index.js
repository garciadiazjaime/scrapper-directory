import { Facebook } from 'fb';
import RequestUtil from '../requestUtil';
import LogUtil from '../../utils/logUtil';
import config from '../../config';
import 'babel-polyfill';

/*
  Class to interact with graph facebook api
*/
module.exports = class FacebookUtil {

  constructor() {
    this.facebookClient = new Facebook();
  }

  getToken(shortToken) {
    return new Promise((resolve, reject) => {
      this.facebookClient.api('oauth/access_token', {
        client_id: config.get('facebook.appId'),
        client_secret: config.get('facebook.appSecret'),
        grant_type: 'client_credentials'
      }, (res) => {
        if (!res || res.error) {
          reject({
            status: false,
            message: res.error
          });
        } else {
          config.set('facebook.shortToken', res.access_token);
          this.facebookClient.setAccessToken(res.access_token);
          resolve({
            status: true,
            data: res.access_token
          });
        }
      });
    });
  }

  search(query, type) {
    return new Promise((resolve, reject) => {
      LogUtil.log(`facebook api query: ${query}, type: ${type}`);
      this.facebookClient.api('search', {
        q: query,
        type,
        center: '32.520716,-117.116169',
        distance: 2000,
      }, (res) => {
        if (!res || res.error) {
          reject({
            status: false,
            message: res.error
          });
        } else {
          resolve({
            status: true,
            data: res.data
          });
        }
      });
    });
  }

  getPage(pageId, fields) {
    return new Promise((resolve, reject) => {
      LogUtil.log(`look up for pageId ${pageId}`);
      this.facebookClient.api(pageId, {
        fields,
      }, (res) => {
        if (!res || res.error) {
          reject({
            status: false,
            message: res.error
          });
        } else {
          resolve({
            status: true,
            data: res
          });
        }
      });
    });
  }

  /*
    Post content to facebook page
    @param {string} data
    @returns {object} results
  */
  post(data) {
    return asyncLib(function*() {
      const message = {
        access_token: config.get('facebook.longToken'),
        message: data,
      };
      const url = `${config.get('facebook.apiUrl')}me/feed`;
      const results = yield RequestLib.post(url, message);
      return results;
    })();
  }
}
