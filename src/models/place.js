const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PlaceSchema = new Schema({
  id: String,
  name: String,
  gps: {
    type: { type: String },
    coordinates: { type: [] }
  },
  address: String,
  googleRating: String,
  type: String,
}, { timestamps: true });

PlaceSchema.index({ gps: "2dsphere" });

const Place = mongoose.model('place', PlaceSchema);

module.exports = {
  Place
}
