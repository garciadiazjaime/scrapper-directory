import FoursquareController from '../../controllers/foursquareController';
import config from '../../config';

function main() {
  const opts = {
    dbUrl: config.get('db.url'),
    token: {
      clientId: config.get('foursquare.clientId'),
      consumerSecret: config.get('foursquare.consumerSecret'),
    },
    radius: 3000,
    resultsPerPlace: 3,
    searchType: 'match',
    distanceLimit: 500,
  };
  const foursquareController = new FoursquareController(opts);
  foursquareController.execute();
}

main();
