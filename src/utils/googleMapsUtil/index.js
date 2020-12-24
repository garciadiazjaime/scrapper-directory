/* eslint max-len: [2, 500, 4] */
import _ from 'lodash';
import config from '../../config';
import googleMapsClient from '@google/maps';


module.exports = class GoogleMapsUtil {

  static getDistanceTwoPoints(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = GoogleMapsUtil.deg2rad(lat2 - lat1);  // deg2rad below
    const dLon = GoogleMapsUtil.deg2rad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(GoogleMapsUtil.deg2rad(lat1)) * Math.cos(GoogleMapsUtil.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c * 1000; // Distance in km (m)
    return d;
  }

  static deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  constructor(config) {
    this.location = config.location,
    this.radius = config.radius,
    this.gmapsClient = googleMapsClient.createClient({
      key: config.keyApi,
      Promise,
    });
    this.type = config.type;
    this.maxImagewidth = config.maxImagewidth;
    this.searchType = config.searchType;
    this.category = config.category;
  }

  searchPlaces(token) {
    const ops = {
      location: this.location,
      radius: this.radius,
      type: this.type,
      pagetoken: token,
    }
    if (this.category) {
      if (this.type === 'restaurant') {
        ops.keyword = this.category;
      } else {
        ops.query = this.category;
      }
    }
    return this.searchType === 'nearby' ?
      this.gmapsClient.placesNearby(ops).asPromise() :
      this.gmapsClient.places(ops).asPromise();
  }

  getPlacePhotos(reference) {
    return this.gmapsClient.placesPhoto({
      photoreference: reference,
      maxwidth: this.maxImagewidth,
    }).asPromise();
  }

  getPlaceDetails(placeId) {
    return this.gmapsClient.place({
      placeid: placeId,
    }).asPromise();
  }
}
