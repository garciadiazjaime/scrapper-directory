const fetch = require('node-fetch');
const debug = require('debug')('app:etl-gmaps-photo')

const stub = require('../stubs/gmaps-photo')


const config = require('../config')

function extract(url) {
  debug('extract');

  if (config.get('env') !== 'production') {
    return stub
  }

  return fetch(url)
}


async function getPhotoURL(place) {
  if (!place || !place.photoRef) {
    return null
  }

  const url = `https://maps.googleapis.com/maps/api/place/photo?key=${config.get('google.apiKey')}&photoreference=${place.photoRef}&maxwidth=400`
  const response = await extract(url)

  return response.url
}

module.exports = {
  getPhotoURL
}
