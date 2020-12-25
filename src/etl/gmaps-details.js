const fetch = require('node-fetch');
const debug = require('debug')('app:etl-gmaps-details')

const stub = require('../stubs/gmaps-details')


const config = require('../config')

async function extract(url) {
  debug('extract');

  if (config.get('env') !== 'production') {
    return stub
  }

  debug(url)
  const response = await fetch(url)

  return response.json()
}


async function getPlaceDetails(place) {
  if (!place || !place.place_id) {
    return null
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?key=${config.get('google.apiKey')}&place_id=${place.place_id}`
  const response = await extract(url)

  return response.result
}

module.exports = {
  getPlaceDetails
}
