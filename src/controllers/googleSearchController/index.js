/* eslint max-len: [2, 500, 4] */

import MongoUtil from 'util-mongodb';
import GoogleSearch from '../../utils/googleSearchUtil';
import runGeneratorUtil from '../../utils/runGeneratorUtil';
import { cleanString } from '../../utils/stringUtil';
import config from '../../config';
import 'babel-polyfill';

module.exports = class GoogleSearchController {

  constructor() {
    this.mongoUtil = new MongoUtil(config.get('db.url'));
    this.googleSearch = new GoogleSearch();
    this.secondsBeforeRequest = 2000;
  }

  /**
  * Main orchestrator, in charge of make a google request per each place on the DB,
  * clean google results, save to the DB and give a summary.
  *
  * @param {integer} placeStart Helper to set on which place start the process
  * @param {integer} placeEnd Helper to set on which place ends the process
  */
  askGoogle(placeStart, placeEnd) {
    (runGeneratorUtil(function *() {
      try {
        console.log('==== init google search ====');
        // open DB connection
        yield this.mongoUtil.openConnection();

        // get places from DB
        const places = yield this.mongoUtil.find('places', {}, {}, placeStart, placeEnd);

        // make a request to google search for each place
        const queryPlaces = this.requestPlacesImages(places);
        const googleResults = yield Promise.all(queryPlaces);

        // format google results and return data ready to be saved into the DB [ [], [], ...]
        const cleanData = this.cleanGoogleResults(googleResults, places);

        // save into the DB
        const savePlaces = this.saveCleanResults(cleanData, places);
        const placesSaved = yield Promise.all(savePlaces);

        // get number of places updated
        const placesUpdated = this.updateSummary(placesSaved);
        console.log(`Places Updated: ${placesUpdated} of ${placesSaved.length}`);

        // close db connection
        yield this.mongoUtil.closeConnection();

        // end process
        console.log('==== end google search ====');
      } catch (exception) {
        console.log('exception', exception);
      }
    }.bind(this)))();
  }

  /**
  * Calls googleImageSearch.search utility to make a query on google for the places images.
  *
  * @param {array} places Array of places from the DB.
  * @return {array} Array of promises for each google request.
  */
  requestPlacesImages(places) {
    return places.map((place) => new Promise((resolve) => {
      setTimeout(() => {
        const query = cleanString(`${place.name} tijuana`);
        console.log('query:', query);
        resolve(this.googleSearch.search(query));
      }, this.secondsBeforeRequest);
    }));
  }

  /**
  * Extract from google results the properties we want
  *
  * @param {array} googleResults Is an array of places which each item is an array of the place google results.
  * @param {array} places Array with the places from the DB.
  * @return {array} Array of places where each item is an array of the google results cleaned.
  */
  cleanGoogleResults(googleResults, places) {
    return googleResults.map((placeRestuls, index) => {
      const place = places[index];
      console.log(`\n==== place: ${place.name} `);
      return placeRestuls.map((item, index2) => {
        console.log(`\nresult: ${index2 + 1}`);
        const filterData = {
          id: index2,
          link: item.link,
          description: item.snippet,
        };
        console.log(filterData);
        return filterData;
      });
    });
  }

  /**
  * Save clean google results into the DB.
  *
  * @param {array} cleanData Array of places where each item is the google place results cleaned
  * @param {places} places Array with the places from the DB.
  * @return {array} Array of promises, once per place updated.
  */
  saveCleanResults(cleanData, places) {
    return cleanData.map((item, index) => {
      const place = places[index];
      place.metaDescriptions = item;
      return this.mongoUtil.update('places', place, {
        googleId: place.googleId,
      });
    });
  }

  /**
  * Get total number of places modified in the DB.
  *
  * @param {array} placesSaved Array with places updated DB results.
  * @return {integer} Number of places modified.
  */
  updateSummary(placesSaved) {
    return placesSaved.reduce((total, currentValue) => total + currentValue.data.nModified, 0);
  }

}
