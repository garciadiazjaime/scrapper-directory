import GoolgeAnalyticsController from '../../controllers/googleAnalyticsController';
import config from '../../config';
// import analyticsConfig from '../../../analyticsConfig.json';

function main() {
  const opts = {
    clientEmail: config.get('google.analyticsEmail'),
    // privateKey: analyticsConfig.private_key.replace(/\\n/g, '\n'),
    viewID: config.get('google.analyticsViewId'),
    dbUrl: config.get('db.url'),
  };
  const goolgeAnalyticsController = new GoolgeAnalyticsController(opts);
  goolgeAnalyticsController.execute();
}

main();
