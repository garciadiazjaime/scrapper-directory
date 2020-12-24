/* eslint max-len: [2, 500, 4] */
import Yelp from 'yelp';
import LogUtil from '../../utils/logUtil';

/*
  Class to interact with graph facebook api
*/
module.exports = class YelpUtil {

  constructor(config) {
    this.yelpClient = new Yelp({
      consumer_key: config.consumerKey,
      consumer_secret: config.consumerSecret,
      token: config.token,
      token_secret: config.tokenSecret,
    });
  }

  search(place, location, radius, limit) {
    return new Promise((resolve, reject) => {
      const params = {
        term: place.google.name,
        location,
        cll: `${place.google.geometry.location.lat},${place.google.geometry.location.lng}`,
        radius_filter: radius,
        limit,
      };
      LogUtil.log(`yelp api place: ${JSON.stringify(params)}`);
      this.yelpClient.search(params).then(data => resolve({
        status: true,
        data: data,
      })).catch(err => {
        LogUtil.log(err);
        reject({
          status: false,
          message: err,
        });
      });
    });
  }
}
