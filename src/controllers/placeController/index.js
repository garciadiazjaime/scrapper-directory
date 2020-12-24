/* eslint max-len: [2, 500, 4] */
const _ = require('lodash');

const { Place } = require('../../models/place')

module.exports = class PlaceController {

  constructor() {
  }

  getPlaces() {
    const options = {
      sort: [
        ['weight', 'desc'],
      ],
    };
    return Place.find({}, options)
      .then(results => resolve(results))
      .catch(err => reject(err));
  }

  getPlacesFilter(category) {
    return new Promise((resolve, reject) => {
      const options = {
        sort: [
          ['weight', 'desc'],
        ],
      };
      const query = category ? {
        'type': category,
      } : {};
      Place.find(query, options)
        .then(results => {
          const response = results.map(item => {
            const newItem = {
              placeId: item.placeId,
              weight: item.weight,
              analyticsWeight: item.analyticsWeight,
              internalWeight: item.internalWeight,
            };

            // google
            if (item.google) {
              const google = {};
              google.formatted_address = item.google.formatted_address;
              google.international_phone_number = item.google.international_phone_number;
              google.name = item.google.name;
              google.rating = item.google.rating;
              google.url = item.google.url;

              if (google.geometry) {
                google.geometry = {
                  location: item.google.geometry.location,
                };
              }
              if (_.isArray(item.google.photos) && item.google.photos) {
                google.photos = item.google.photos;
              }
              if (_.isArray(item.google.reviews) && item.google.reviews.length) {
                google.reviews = item.google.reviews.slice(0, 5).map((review) => ({
                  text: review.text,
                }));
              }

              newItem.google = google;
            }

            // facebook
            if (_.isArray(item.facebook) && item.facebook.length) {
              const facebook = {};
              if (item.facebook[0].cover) {
                facebook.cover = {
                  source: item.facebook[0].cover.source,
                };
              }
              facebook.fan_count = item.facebook[0].fan_count;
              facebook.checkins = item.facebook[0].checkins;
              facebook.link = item.facebook[0].link;

              newItem.facebook = [facebook];
            }

            // foursqure
            if (_.isArray(item.foursquare) && item.foursquare.length) {
              const foursquare = {};
              foursquare.canonicalUrl = item.foursquare[0].canonicalUrl;
              if (item.foursquare[0].stats) {
                foursquare.stats = {
                  checkinsCount: item.foursquare[0].stats.checkinsCount,
                };
              }
              if (item.foursquare[0].bestPhoto) {
                foursquare.bestPhoto = {
                  prefix: item.foursquare[0].bestPhoto.prefix,
                  suffix: item.foursquare[0].bestPhoto.suffix,
                };
              }

              if (item.foursquare[0].tips) {
                const groups = item.foursquare[0].tips.groups;
                if (_.isArray(groups) && groups.length) {
                  const items = groups[0].items;
                  if (_.isArray(items) && items.length) {
                    foursquare.tips = {
                      groups: [{
                        items: items.slice(0, 5).map(tip => ({
                          text: tip.text,
                        })),
                      }],
                    };
                  }
                }
              }

              newItem.foursquare = [foursquare];
            }

            // yelp
            if (_.isArray(item.yelp) && item.yelp.length) {
              const yelp = {};
              yelp.url = item.yelp[0].url;
              yelp.image_url = item.yelp[0].image_url;

              newItem.yelp = [yelp];
            }

            // set type
            if (item.google.types) {
              const types = [];
              if (item.google.types.indexOf('restaurant') !== -1) {
                types.push('Restaurante');
              }
              if (item.google.types.indexOf('bar') !== -1) {
                types.push('Bar');
              }
              if (item.google.types.indexOf('cafe') !== -1) {
                types.push('Café');
              }
              if (types.length) {
                newItem.types = types;
              }
            }

            // set category
            if (item.google.category) {
              newItem.category = item.google.category;
            }

            return newItem;
          });
          resolve(response);
        })
        .catch(err => reject(err));
    });
  }

}
