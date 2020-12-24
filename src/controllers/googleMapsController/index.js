import _ from 'lodash';
import MongoUtil from 'util-mongodb';
import GoogleMapsUtil from '../../utils/googleMapsUtil';
import LogUtil from '../../utils/logUtil';
import 'babel-polyfill';

module.exports = class GoogleMapsController {

  constructor(config) {
    this.mongoUtil = new MongoUtil(config.dbUrl);
    this.googleMapsUtil = new GoogleMapsUtil(config.maps);
    this.secondsBeforeRequest = 2 * 1000;
    this.requestLimit = 10;
    this.keywords = config.maps.keywords;
    this.category = config.maps.category || config.maps.type;
  }

  async execute() {
    try {
      LogUtil.log('==== init google place search ====');

      // open DB connection
      await this.mongoUtil.openConnection();

      let token = null;
      const summary = {
        created: 0,
        updated: 0,
        errors: 0,
        requestMade: 0,
      };
      do {
        const mapsResult = await this.getPlaces(token);
        summary.requestMade ++;
        const results = mapsResult && mapsResult.json ? mapsResult.json.results : null;
        if (_.isArray(results) && results.length) {
          for (let i = 0, len = results.length; i < len; i++) {
            const place = results[i];
            LogUtil.log(`${i}. ${place.name}`);
            const placeResult = await this.googleMapsUtil.getPlaceDetails(place.place_id);
            const newPlace = placeResult && placeResult.json ? placeResult.json.result : null;
            if (newPlace) {
              newPlace.isOnrightLocation = this.isOnrightLocation(newPlace);
              newPlace.photos = await this.getPhotos(place.photos);
              newPlace.category = this.category;
              const dbResult = await this.savePlace(newPlace);
              _.assign(summary, this.updateSummary(summary, dbResult));
            }
          }
        }
        token = mapsResult && mapsResult.json ? mapsResult.json.next_page_token : null;
      } while (token && summary.requestMade < 10);

      this.printSummary(summary);

      // close db connection
      await this.mongoUtil.closeConnection();

      // end process
      LogUtil.log('==== end google place search ====');
    } catch (err) {
      LogUtil.log(err);
    }
  }

  /**
  * Calls a request to google maps, timeout helps to prevent maps from blocking us.
  *
  * @param {string} token gmaps uses to pull next page
  * @return {promise} Promise which is resolved once gmaps returns a response.
  */
  getPlaces(token) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.googleMapsUtil.searchPlaces(token));
      }, this.secondsBeforeRequest);
    });
  }

  getPhotos(photos) {
    return new Promise((resolve, reject) => {
      const promises = _.isArray(photos) && photos.length ? photos.map((photo) => {
        if (_.isString(photo.photo_reference) && photo.photo_reference.length) {
          return this.googleMapsUtil.getPlacePhotos(photo.photo_reference);
        }
        return null;
      }) : [];

      Promise.all(promises).then((results) => {
        /*eslint-disable */
        if (_.isArray(results) && results.length) {
          resolve(results.map(item => `https://${item.req._headers.host}${item.req.path}`));
        } else {
          resolve([])
        }
        /*eslint-enable */
      })
      .catch(error => reject(error));
    });
  }

  savePlace(place) {
    return new Promise((resolve, reject) => {
      const newPlace = _.assign({}, {
        placeId: place.place_id,
        google: place,
      });
      const filter = {
        placeId: place.place_id,
      };
      this.mongoUtil.find('places', filter).then((currentPlace) => {
        if (currentPlace.length) {
          newPlace.updated = new Date();
          resolve(this.mongoUtil.update('places', newPlace, filter));
        } else {
          newPlace.created = new Date();
          resolve(this.mongoUtil.insert('places', newPlace));
        }
      })
      .catch(error => reject(error));
    });
  }

  // /**
  // * Get total number of places modified and created in the DB.
  // *
  // * @param {array} placesSaved Array with DB results from places updated.
  // * @return {object} Object with created and updated result.
  // */
  updateSummary(summary, data) {
    const response = _.assign({}, summary);
    if (data.status) {
      if (data.data.nModified) {
        response.updated ++;
      } else {
        response.created ++;
      }
    } else {
      response.errors ++;
    }
    return response;
  }

  isOnrightLocation(place) {
    let isValid = false;
    if (_.isString(place.formatted_address) && place.formatted_address.length) {
      const bits = _.uniq(place.formatted_address.replace(/,/g, '')
        .split(' ')
        .map(bit => bit.toLowerCase()));
      const intersection = _.intersection(bits, this.keywords.map(item => item.toLowerCase()));
      isValid = intersection.length === this.keywords.length;
    }
    if (!isValid) {
      LogUtil.log(`${place.name} is not in ${this.keywords}. ${place.formatted_address}`);
    }
    return isValid;
  }

  printSummary(summary) {
    LogUtil.log(`
      \n=====\nSummary\n====
      \nPlaces created: ${summary.created}
      \nPlaces updated: ${summary.updated}
      \nErrors: ${summary.errors}
      \nRequest made: ${summary.requestMade}
    `);
  }
}
