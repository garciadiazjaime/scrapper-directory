/* eslint max-len: [2, 500, 4] */
import _ from 'lodash';


module.exports = class WeightUtil {

  static setWeight(internalWeight, analyticsWeight) {
    return (internalWeight || 0) + (analyticsWeight || 0);
  }

  static getWeight(place) {
    let weight = 0;
    const hasImage = WeightUtil.hasImage(place);
    const hasFacebook = !!place.facebook;
    const hasFoursqure = !!place.foursquare;
    const hasComments = WeightUtil.hasComments(place);
    const hasYelp = !!place.yelp;
    weight += WeightUtil.getRatingsWeight(place);

    if (hasImage) {
      weight += 20;
    }
    if (hasFacebook) {
      weight += 10;
    }
    if (hasYelp) {
      weight += 10;
    }
    if (hasFoursqure) {
      weight += 10;
    }
    if (hasComments) {
      weight += 5;
    }
    return weight;
  }

  static hasImage(place) {
    if (_.isArray(place.google.photos) && place.google.photos.length) {
      return true;
    } else if (_.isArray(place.facebook) && place.facebook.length && place.facebook[0].cover) {
      return true;
    } else if (_.isArray(place.foursquare) && place.foursquare.length && place.foursquare[0].bestPhoto) {
      return true;
    } else if (_.isArray(place.yelp) && place.yelp.length && place.yelp[0].image_url) {
      return true;
    }
    return false;
  }

  static hasComments(place) {
    const { google, foursquare } = place;
    if (_.isArray(google.reviews) && google.reviews.length) {
      return true;
    } else if (_.isArray(foursquare) && foursquare.length) {
      const { tips } = foursquare[0];
      if (_.isArray(tips.groups) && tips.groups.length) {
        const { items } = tips.groups[0];
        if (_.isArray(items) && items.length) {
          return true;
        }
      }
    }
    return false;
  }

  static getRatingsWeight(place) {
    const { google, facebook, foursquare } = place;
    let weight = 0;
    if (google.rating) {
      weight += parseInt(google.rating, 10);
    }
    if (_.isArray(facebook) && facebook.length) {
      if (facebook[0].fan_count > 10000) {
        weight += 5;
      } else if (facebook[0].fan_count > 1000) {
        weight += 3;
      } else if (facebook[0].fan_count) {
        weight += 2;
      }

      if (facebook[0].checkins > 10000) {
        weight += 5;
      } else if (facebook[0].checkins > 1000) {
        weight += 3;
      } else if (facebook[0].checkins) {
        weight += 2;
      }
    }

    if (_.isArray(foursquare) && foursquare.length && foursquare[0].stats) {
      if (foursquare[0].stats.checkinsCount > 10000) {
        weight += 5;
      } else if (foursquare[0].stats.checkinsCount > 1000) {
        weight += 3;
      } else if (foursquare[0].stats.checkinsCount) {
        weight += 2;
      }
    }

    return weight;
  }

  static getWeightFromAnalytics(data) {
    if (_.isArray(data) && data.length) {
      return data.map(item => ({
        placeId: item.placeId,
        value: item.value * 3,
      }));
    }
  }
}
