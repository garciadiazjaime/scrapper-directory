import WeightController from '../../controllers/weightController';
import config from '../../config';

function main() {
  const opts = {
    dbUrl: config.get('db.url'),
  };
  const weightController = new WeightController(opts);
  weightController.execute();
}

main();
