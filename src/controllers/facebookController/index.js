/* eslint max-len: [2, 500, 4] */
import _ from 'lodash';
import MongoUtil from 'util-mongodb';
import FacebookUtil from '../../utils/facebookUtil';
import runGeneratorUtil from '../../utils/runGeneratorUtil';
import LogUtil from '../../utils/logUtil';
import 'babel-polyfill';

module.exports = class FacebookController {

  constructor(config) {
    this.mongoUtil = new MongoUtil(config.dbUrl);
    this.facebookUtil = new FacebookUtil();
    this.keywords = config.keywords.join(' ');
  }

  /**
  * Main orchestrator, in charge of make a google request per each place on the DB,
  * clean google results, save to the DB and give a summary.
  */
  execute() {
    (runGeneratorUtil(function *() {
      try {
        LogUtil.log('==== init facebook search ====');

        // open DB connection
        yield this.mongoUtil.openConnection();

        const summary = {
          created: 0,
          errors: 0,
          searchRequestMade: 0,
          pageRequestMade: 0,
        };
        // get places from DB
        const places = yield this.mongoUtil.find('places');

        // get facebook token, needed to make calls to facebook api
        yield this.facebookUtil.getToken();

        for (let i = 0, len = places.length; i < len; i++) {
          const place = places[i];
          place.facebook = [];

          // query facebook with place name + keywords, this get page ids
          const pageIds = yield this.getPageIds(place, this.keywords);
          summary.searchRequestMade ++;
          if (_.isArray(pageIds) && pageIds.length) {
            for (let j = 0, len2 = pageIds.length; j < len2; j++) {
              // query facebook for each page id found to get facebook page details
              const pageData = yield this.getPageData(pageIds[j]);
              summary.pageRequestMade ++;
              place.facebook.push(pageData);
            }
          }

          // in case of found data we save it to the db
          if (place.facebook.length) {
            const filter = {
              placeId: place.placeId,
            };
            const dbResult = yield this.mongoUtil.update('places', place, filter);
            if (dbResult.status) {
              summary.created += place.facebook.length;
            } else {
              summary.errors ++;
            }
          }
        }

        this.printSummary(summary);

        // close db connection
        yield this.mongoUtil.closeConnection();

        // end process
        LogUtil.log('==== end facebook search ====');
      } catch (exception) {
        LogUtil.log('exception', exception);
      }
    }.bind(this)))();
  }

  /**
  * Search on facebook for an specific query 'place name + keywords' and type = place.
  *
  * @param {object} place Place object from the DB.
  * @param {string} keywords eg. Playas Tijuana
  * @return {promise} Fulfill when facebook returns a response either success or error.
  */
  getPageIds(place, keywords) {
    return new Promise((resolve, reject) => {
      const query = `${place.google.name} ${keywords}`;
      const type = 'page';
      this.facebookUtil.search(query, type)
        .then((results) => {
          if (results.status) {
            resolve(results.data.map(item => item.id));
          } else {
            reject(results);
          }
        })
        .catch(error => reject(error));
    });
  }

  getPageData(pageId) {
    return new Promise((resolve, reject) => {
      const fields = 'about,category_list,category,checkins,country_page_likes,cover,current_location,description,display_subtext,fan_count,food_styles,general_info,is_permanently_closed,is_published,is_verified,is_unclaimed,link,location,new_like_count,parent_page,place_type,phone,rating_count,talking_about_count,website,were_here_count,engagement';
      this.facebookUtil.getPage(pageId, fields)
        .then((results) => {
          if (results.status) {
            resolve(results.data);
          } else {
            reject(results);
          }
        })
        .catch(error => reject(error));
    });
  }

  printSummary(summary) {
    LogUtil.log(`\n=====\nSummary\n====\nPlaces created: ${summary.created}\nErrors: ${summary.errors}\nSearch request made: ${summary.searchRequestMade}\nPlace request made: ${summary.pageRequestMade}`);
  }

}
