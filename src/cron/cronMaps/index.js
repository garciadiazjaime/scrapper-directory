/* eslint max-len: [2, 500, 4] */
import program from 'commander';
import GoogleMapsController from '../../controllers/googleMapsController';
import LogUtil from '../../utils/logUtil';
import config from '../../config';

program
  .version('0.0.1')
  .option('-t, --type [type]', 'Restaurant Type [restaurant, bar, cafe]', /^(restaurant|bar|cafe)$/i)
  .option('-s, --search [search]', 'Search Type [nearby, places]', /^(nearby|places)$/i)
  .option('-c --category [category]', 'Category [pizza, tacos, burger, sushi, mariscos]')
  .parse(process.argv);

function main() {
  const validTypes = ['restaurant', 'bar', 'cafe'];
  const validSearch = ['nearby', 'places'];
  const { type, search, category } = program;
  if (validTypes.indexOf(type) !== -1 && validSearch.indexOf(search) !== -1) {
    const opts = {
      dbUrl: config.get('db.url'),
      maps: {
        keyApi: config.get('google.apiKey'),
        location: '32.520716,-117.116169',
        radius: 2000,
        type,
        maxImagewidth: 400,
        keywords: ['playas', 'tijuana'],
        searchType: search,
        category,
      },
    };
    LogUtil.log(`==== go for ${opts.maps.type}`);
    const googleMapsController = new GoogleMapsController(opts);
    googleMapsController.execute();
  } else {
    LogUtil.log(`==== invalid type: ${type} and searchType: ${search}`);
  }
}

main();
