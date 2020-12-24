const express = require('express');
const cors = require('cors')

/*eslint-disable */
const router = express.Router();
/*eslint-enable */
const PlaceController = require('../../controllers/placeController');

const { Place } = require('../../models/place')


router.get('/', async (req, res) => {
  // placeController.getPlacesFilter()
  const places = await Place.find()
  
  res.send(places)
});

router.get('/:category',  cors(), async (req, res) => {
  // placeController.getPlacesFilter(req.params.category)
  const { category } = req.params

  const places = await Place.find({
    type: category
  })

  res.send(places)
});

router.get('/full', (req, res) => {
  const placeController = new PlaceController();
  placeController.getPlaces()
    .then(results => res.send(results), err => res.send(err));
});

module.exports = router;
