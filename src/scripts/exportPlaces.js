import { openDatabase, closeDatabase } from '../utils/dbUtil'
import PlaceModel from '../model/placeModel'
import config from '../config'

async function main() {
  await openDatabase(config.get('db.url'))
  const places = await PlaceModel.find()
  const data = places.map(place => ({
    name: place.google.name,
    address: place.google.formatted_address,
    test: place.google.address_components,
    comments: place.google.reviews ? place.google.reviews.map(review => review.text) : null
  })
  console.log('data', data)
  closeDatabase()
}

main()
