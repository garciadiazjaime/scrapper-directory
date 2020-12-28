const fetch = require('node-fetch');
const mapSeries = require('async/mapSeries');
const debug = require('debug')('app:etl-gmaps')

const { getPlaceDetails } = require('./gmaps-details')
const { getPhotoURL } = require('./gmaps-photo')
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

function getPhotoRef(photos) {
  if (!Array.isArray(photos) || !photos.length) {
    return ''
  }

  return photos[0].photo_reference
}

function getReviews(reviews) {
  if (!Array.isArray(reviews) || !reviews.length) {
    return []
  }

  return reviews.map(review => ({
    rating: review.rating,
    text: review.text,
  }))
}

function transform(place, type) {
  if (!place) {
    return null
  }

  return {
    id: place.place_id,
    name: place.name,
    gps: {
      type : 'Point',
      coordinates: [place.geometry.location.lng, place.geometry.location.lat]
    },
    address: place.vicinity,
    phone: place.formatted_phone_number,
    price: place.price_level,
    rating: place.rating,
    url: place.url,
    userRatings: place.user_ratings_total,
    website: place.website,
    photoRef: getPhotoRef(place.photos),
    reviews: getReviews(place.reviews),
    type,
  };
}

function load(place) {
  const filter = {
    id: place.id,
  };

  return Place.findOneAndUpdate(filter, place, {
    new: true,
    upsert: true,
  })
}

async function etl(type, token) {
  const params = `key=${keyApi}&location=${location}&radius=${radius}&rankby=${rankby}&type=${type}`;
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}${token ? `&pagetoken=${token}` : ''}`

  const response = await extract(url)

  if (!Array.isArray(response.results) || !response.results.length) {
    return null
  }

  const results = await mapSeries(response.results, async (item) => {
    await sleep(secondsToWait)

    const details = await getPlaceDetails(item)

    const place = transform(details, type)

    const photoURL = await getPhotoURL(place)

    return load({
      ...place,
      photoURL
    })
  })

  debug(`saved: ${results.length}`)

  return response.next_page_token
}

async function handler(type, token, counter = 0) {
  debug(`handler:${type}:${counter}:${!!token}`)
  const nextToken = await etl(type, token)
  if (!nextToken || counter > counterLimit) {
    return null
  }

  return handler(type, nextToken, counter + 1)
}

module.exports = {
  handler
}
