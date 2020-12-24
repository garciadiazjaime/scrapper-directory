/* eslint max-len: [2, 500, 4] */
import _ from 'lodash';
import MongoUtil from 'util-mongodb';
import YelpUtil from '../../utils/yelpUtil';
import GoogleMapsUtil from '../../utils/googleMapsUtil';
import runGeneratorUtil from '../../utils/runGeneratorUtil';
import LogUtil from '../../utils/logUtil';
import 'babel-polyfill';

module.exports = class YelpController {

  constructor(config) {
    this.mongoUtil = new MongoUtil(config.dbUrl);
    this.yelpUtil = new YelpUtil(config.yelp);
    this.location = config.keywords.join(' ');
    this.radius = config.radius;
    this.resultsPerPlace = config.resultsPerPlace;
    this.sort = config.sort;
    this.distanceLimit = config.distanceLimit;
  }

  /**
  * Main orchestrator, in charge of make a yelp request per each place on the DB,
  * save to results to the DB and give a summary.
  */
  execute() {
    (runGeneratorUtil(function *() {
      try {
        LogUtil.log('==== init yelp search ====');

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
          place.yelp = [];

          const yelpSearchResults = yield this.yelpUtil.search(place, this.location, this.radius, this.resultsPerPlace, this.sort);
          summary.requestMade ++;
          if (yelpSearchResults.status && yelpSearchResults.data && _.isArray(yelpSearchResults.data.businesses) && yelpSearchResults.data.businesses.length) {
            place.yelp = this.setProximity(place, yelpSearchResults.data.businesses);
          }

          // in case of found data we save it in the db
          if (place.yelp.length) {
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
        LogUtil.log('==== end yelp search ====');
      } catch (exception) {
        LogUtil.log('exception', exception);
      }
    }.bind(this)))();
  }

  setProximity(place, yelpData) {
    return yelpData.map(item => {
      const newData = _.assign({}, item);
      const placePhone = place.google.international_phone_number ? place.google.international_phone_number.replace(/\D+/g, '') : null;
      const yelpPhone = item.phone ? item.phone.replace(/\D+/g, '') : null;
      if (placePhone && yelpPhone && placePhone === yelpPhone) {
        newData.isOnrightLocation = true;
      } else {
        const currentPlace = place.google.geometry.location;
        const newPlace = item.location.coordinate;
        newData.isOnrightLocation = this.arePlacesClose(currentPlace, newPlace);
      }
      return newData;
    });
  }

  arePlacesClose(placeA, placeB) {
    const distance = GoogleMapsUtil.getDistanceTwoPoints(placeA.lat, placeA.lng, placeB.latitude, placeB.longitude);
    return distance < this.distanceLimit;
  }

  printSummary(summary) {
    LogUtil.log(`\n=====\nSummary\n====\nPlaces created: ${summary.created}\nErrors: ${summary.errors}\nRequest made: ${summary.requestMade}`);
  }

}
