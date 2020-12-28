const { openDB } = require('./utils/db')
const { handler } = require('./etl/gmaps')

async function startRequest(type) {
  await openDB()

  await handler(type)
}

function main() {
  // const types = [
  //   'bakery',
  //   'bar',
  //   'cafe',
  //   'grocery_or_supermarket',
  //   'liquor_store',
  //   'meal_delivery',
  //   'meal_takeaway',
  //   'restaurant',
  // ];
  // const type = 'restaurant';
  // const type = 'bar';
  const type = 'cafe';
  startRequest(type).then(() => {
    process.exit(1)
  });
}

main();
