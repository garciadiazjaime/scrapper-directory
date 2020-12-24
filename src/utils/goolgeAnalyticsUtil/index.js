import _ from 'lodash';
import google from 'googleapis';
const analytics = google.analytics('v3');
const mockData = require('./mockGaResponse.json');

module.exports = class goolgeAnalyticsUtil {

  constructor(config) {
    this.jwtClient = new google.auth.JWT(config.clientEmail, null, config.privateKey, ['https://www.googleapis.com/auth/analytics.readonly'], null);
    this.viewID = config.viewID;
  }

  login() {
    return new Promise((resolve, reject) => {
      // resolve();
      this.jwtClient.authorize((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        };
      });
    });
  }

  getEvents(startDate, endDate, maxResults) {
    return new Promise((resolve, reject) => {
      this.login().then(() => {
        const params = {
          auth: this.jwtClient,
          ids: this.viewID,
          'start-date': startDate,
          'end-date': endDate,
          metrics: 'ga:users',
          dimensions: 'ga:eventLabel',
          sort: '-ga:users',
          'max-results': maxResults,
        };
        // resolve(this.extractEvents(mockData.rows));
        analytics.data.ga.get(params, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(this.extractEvents(response.rows))
          }
        });
      }, error => reject(error));
    });
  }

  extractEvents(data) {
    if (_.isArray(data) && data.length) {
      const whiteList = ['click_gmaps', 'click_facebook', 'click_foursquare', 'click_yelp', 'show_comments', 'click_telephone', 'click_website', 'click_address'];
      return data.map(item => {
        const label = item[0];
        const value = item[1];
        const bits = item[0].split('::');
        if (whiteList.indexOf(bits[0]) !== -1) {
          return {
            action: bits[0],
            placeId: bits[1],
            value: parseInt(value, 10),
          }
        }
        return null;
      }).filter(item => item);
    }
  }
}
