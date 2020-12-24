import YelpController from '../../controllers/yelpController';
import config from '../../config';

function main() {
  const opts = {
    dbUrl: config.get('db.url'),
    keywords: ['playas', 'tijuana', 'mexico'],
    yelp: {
      consumerKey: config.get('yelp.consumerKey'),
      consumerSecret: config.get('yelp.consumerSecret'),
      token: config.get('yelp.token'),
      tokenSecret: config.get('yelp.tokenSecret'),
    },
    radius: 3000,
    resultsPerPlace: 3,
    sort: 1,
    distanceLimit: 500,
  };
  const yelpController = new YelpController(opts);
  yelpController.execute();
}

main();
