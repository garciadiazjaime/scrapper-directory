/* eslint max-len: [2, 500, 4] */
import _ from 'lodash';
import MongoUtil from 'util-mongodb';
import FoursquareUtil from '../../utils/foursquareUtil';
import GoogleMapsUtil from '../../utils/googleMapsUtil';
import LogUtil from '../../utils/logUtil';
import runGeneratorUtil from '../../utils/runGeneratorUtil';
import 'babel-polyfill';

module.exports = class FoursquareController {

  constructor(config) {
    this.mongoUtil = new MongoUtil(config.dbUrl);
    this.foursquareUtil = new FoursquareUtil(config.token);
    this.radius = config.radius;
    this.resultsPerPlace = config.resultsPerPlace;
    this.searchType = config.searchType;
    this.distanceLimit = config.distanceLimit;
  }

  /**
  * Main orchestrator, in charge of make a yelp request per each place on the DB,
  * save to results to the DB and give a summary.
  */
  execute() {
    (runGeneratorUtil(function *() {
      try {
        LogUtil.log('==== init foursquare search ====');

        // open DB connection
        yield this.mongoUtil.openConnection();

        const summary = {
          created: 0,
          errors: 0,
          requestMade: 0,
        };

        // get places from DB
        const places = yield this.mongoUtil.find('places');

        for (let i = 0, len = places.length; i < len; i++) {
          const place = places[i];
          place.foursquare = [];

          const searchResults = yield this.foursquareUtil.search(place, this.radius, this.resultsPerPlace, this.searchType);
          summary.requestMade ++;
          if (searchResults.data && searchResults.data.response && _.isArray(searchResults.data.response.venues) && searchResults.data.response.venues.length) {
            for (let j = 0, len2 = searchResults.data.response.venues.length; j < len2; j ++) {
              const venueId = searchResults.data.response.venues[j].id;
              const entityResult = yield this.foursquareUtil.getVenue(venueId);
              if (entityResult.data.response && entityResult.data.response.venue) {
                const venue = entityResult.data.response.venue;
                place.foursquare.push(this.setProximity(place, venue));
              }
            }
          }

          // in case of found data we save it in the db
          if (place.foursquare.length) {
            const filter = {
              placeId: place.placeId,
            };
            const dbResult = yield this.mongoUtil.update('places', place, filter);
            if (dbResult.status) {
              summary.created += 1;
            } else {
              summary.errors ++;
            }
          }
        }

        this.printSummary(summary);

        // close db connection
        yield this.mongoUtil.closeConnection();

        // end process
        LogUtil.log('==== end foursquare search ====');
      } catch (exception) {
        LogUtil.log('exception', exception);
      }
    }.bind(this)))();
  }

  setProximity(place, data) {
    const newData = _.assign({}, data);
    const placePhone = place.google.international_phone_number ? place.google.international_phone_number.replace(/\D+/g, '') : null;
    const newPhone = data.contact && data.contact.phone ? data.contact.phone.replace(/\D+/g, '') : null;
    if (placePhone && newPhone && placePhone === newPhone) {
      newData.isOnrightLocation = true;
    } else {
      const { location } = place.google.geometry;
      const newLocation = data.location;
      newData.isOnrightLocation = this.arePlacesClose(location, newLocation);
    }
    return newData;
  }

  arePlacesClose(placeA, placeB) {
    const distance = GoogleMapsUtil.getDistanceTwoPoints(placeA.lat, placeA.lng, placeB.lat, placeB.lng);
    return distance < this.distanceLimit;
  }

  printSummary(summary) {
    LogUtil.log(`\n=====\nSummary\n====\nPlaces created: ${summary.created}\nErrors: ${summary.errors}\nRequest made: ${summary.requestMade}`);
  }

}
