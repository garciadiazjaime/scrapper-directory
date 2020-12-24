import mongoose from 'mongoose';

const PlaceSchema = new mongoose.Schema({
  placeId: String,
  google: mongoose.Schema.Types.Mixed,
  created: { type: Date, default: Date.now }
});

const PlaceModel = mongoose.model('place', PlaceSchema);

module.exports = PlaceModel;
