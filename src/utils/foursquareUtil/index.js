/* eslint max-len: [2, 500, 4] */
import foursquare from 'foursquarevenues';
import LogUtil from '../../utils/logUtil';

/*
  Class to interact with graph facebook api
*/
module.exports = class FoursquareUtil {

  constructor(config) {
    this.client = new foursquare(config.clientId, config.consumerSecret);
  }

  search(place, radius, limit, searchType) {
    return new Promise((resolve, reject) => {
      const gps = `${place.google.geometry.location.lat},${place.google.geometry.location.lng}`;
      const params = {
         ll: gps,
         radius,
         limit,
         query: place.google.name,
         intent: searchType,
      };
      LogUtil.log(`foursquare api place: ${JSON.stringify(params)}`);
      this.client.getVenues(params , (error, venues) => {
        if (error) {
          reject({ status: false, message: error });
        } else {
          resolve({ status: true, data: venues });
        }
      });
    });
  }

  getVenue(id) {
    return new Promise((resolve, reject) => {
      const params = {
         venue_id: id,
      };
      LogUtil.log(`foursquare getVenue: ${JSON.stringify(params)}`);
      this.client.getVenue(params , (error, venues) => {
        if (error) {
          reject({ status: false, message: error });
        } else {
          resolve({ status: true, data: venues });
        }
      });
    });
  }
}
