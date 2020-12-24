const fetch = require('node-fetch');
const debug = require('debug')('app:etl-gmaps')

const { Place } = require('../models/place');
const config = require('../config')

const stub = require('../stubs/gmaps')

const keyApi = config.get('google.apiKey')
const location = '32.520716,-117.116169';
const radius = 2000;
const rankby = 'prominence';
const counterLimit = 10;
const secondsToWait = 5000;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function extract(url) {
  debug('extract');

  if (config.get('env') !== 'production') {
    return stub
  }

  const response = await fetch(url)

  return response.json()
}

function transform(data, type) {
  if (!Array.isArray(data) || !data.length) {
    return null
  }

  return data.map(item => ({
    id: item.place_id,
    name: item.name,
    gps: {
      type : 'Point',
      coordinates: [item.geometry.location.lng, item.geometry.location.lat]
    },
    address: item.vicinity,
    googleRating: item.rating || 0,
    type,
  }));
}

function load(places) {
  const promises = places.map(place => {
    const filter = {
      id: place.id,
    };

    return Place.findOneAndUpdate(filter, place, {
      new: true,
      upsert: true,
    })
  });

  return Promise.all(promises)
}

async function etl(type, token) {
  const params = `key=${keyApi}&location=${location}&radius=${radius}&rankby=${rankby}&type=${type}`;
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}${token ? `&pagetoken=${token}` : ''}`

  const response = await extract(url)

  const places = await transform(response.results, type)

  const results = await load(places)
  debug(`saved: ${results.length}`)

  return response.next_page_token
}

async function handler(type, token, counter = 0) {
  const nextToken = await etl(type, token)
  if (!nextToken || counter > counterLimit) {
    return null
  }

  await sleep(secondsToWait)

  return handler(type, nextToken, counter + 1)
}

module.exports = {
  handler
}
