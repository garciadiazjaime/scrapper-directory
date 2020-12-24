import FacebookController from '../../controllers/facebookController';
import config from '../../config';

function main() {
  const opts = {
    dbUrl: config.get('db.url'),
    keywords: ['playas', 'tijuana'],
  };
  const facebookController = new FacebookController(opts);
  facebookController.execute();
}

main();
