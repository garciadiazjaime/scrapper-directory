// import _ from 'lodash';
import GoolgeAnalyticsUtil from '../../utils/goolgeAnalyticsUtil';
import LogUtil from '../../utils/logUtil';
import WeightController from '../weightController';
import runGeneratorUtil from '../../utils/runGeneratorUtil';
import WeightUtil from '../../utils/weightUtil';


import 'babel-polyfill';

module.exports = class GoolgeAnalyticsController {

  constructor(config) {
    this.goolgeAnalyticsUtil = new GoolgeAnalyticsUtil(config);
    this.weightController = new WeightController(config);
  }

  execute() {
    (runGeneratorUtil(function *() {
      try {
        LogUtil.log('==== init googleAnalytics search ====');

        const events = yield this.goolgeAnalyticsUtil.getEvents('7daysAgo', 'yesterday', 100);

        const weight = WeightUtil.getWeightFromAnalytics(events);

        yield this.weightController.saveWeightFromAnalytics(weight);

        // end process
        LogUtil.log('==== end googleAnalytics search ====');
      } catch (exception) {
        LogUtil.log('exception', exception);
      }
    }.bind(this)))();
  }

}
