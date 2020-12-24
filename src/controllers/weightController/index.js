/* eslint max-len: [2, 500, 4] */
import _ from 'lodash';
import MongoUtil from 'util-mongodb';
import LogUtil from '../../utils/logUtil';
import WeightUtil from '../../utils/weightUtil';
import SummaryUtil from '../../utils/summaryUtil';
import runGeneratorUtil from '../../utils/runGeneratorUtil';
import 'babel-polyfill';

module.exports = class WeightController {

  constructor(config) {
    this.mongoUtil = new MongoUtil(config.dbUrl);
    this.summaryUtil = new SummaryUtil();
  }

  /**
  * Main orchestrator, in charge of set new Weights on the DB
  */
  execute() {
    (runGeneratorUtil(function *() {
      try {
        LogUtil.log('==== init weight ====');

        // open DB connection
        yield this.mongoUtil.openConnection();

        // get places from DB
        const places = yield this.mongoUtil.find('places');
        for (let i = 0, len = places.length; i < len; i += 1) {
          const place = places[i];
          place.internalWeight = WeightUtil.getWeight(place);
          place.weight = WeightUtil.setWeight(place.internalWeight, place.analyticsWeight);
          const filter = {
            placeId: place.placeId,
          };
          const dbResult = yield this.mongoUtil.update('places', place, filter);
          this.summaryUtil.update(dbResult.status);
        }

        this.summaryUtil.print();

        // close db connection
        yield this.mongoUtil.closeConnection();

        // end process
        LogUtil.log('==== end weight search ====');
      } catch (exception) {
        LogUtil.log('exception', exception);
      }
    }.bind(this)))();
  }

  resetWeightFromAnalytics() {
    const data = { analyticsWeight: 0 };
    const filter = {};
    const opts = { multi: true };
    return this.mongoUtil.update('places', data, filter, opts);
  }

  saveWeightFromAnalytics(data) {
    return new Promise((resolve, reject) => {
      (runGeneratorUtil(function *() {
        try {
          if (_.isArray(data) && data.length) {
            // open DB connection
            yield this.mongoUtil.openConnection();

            yield this.resetWeightFromAnalytics();

            for (let i = 0, len = data.length; i < len; i += 1) {
              const item = data[i];
              const filter = {
                placeId: item.placeId,
              };
              // get place from DB
              const results = yield this.mongoUtil.find('places', filter);
              const place = results.pop();
              place.analyticsWeight = item.value;
              place.weight = WeightUtil.setWeight(place.internalWeight, place.analyticsWeight);
              const dbResult = yield this.mongoUtil.update('places', place, filter);
              this.summaryUtil.update(dbResult.status);
            }

            this.summaryUtil.print();

            // close db connection
            yield this.mongoUtil.closeConnection();
          }

          resolve();
        } catch (exception) {
          LogUtil.log('exception', exception);
          reject();
        }
      }.bind(this)))();
    });
  }
}
