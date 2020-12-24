const express = require('express');
/*eslint-disable */
const router = express.Router();
/*eslint-enable */
import PlaceController from '../../controllers/placeController';


router.get('/', (req, res) => {
  const placeController = new PlaceController();
  placeController.getPlaces()
    .then((results) => {
      res.render('sections/places/index.jade', { places: results });
    }, (error) => {
      res.send(error);
    });
});

router.get('/places/:placeId/edit', (req, res) => {
  const placeId = req.params.placeId;
  const placeController = new PlaceController();
  placeController.getPlace(placeId)
    .then((results) => {
      res.render('sections/places/edit.jade', { place: results });
    }, (error) => {
      res.send(error);
    });
});

// for now post is used when editing a place (put)
router.post('/places/:placeId/edit', (req, res) => {
  const placeId = req.params.placeId;
  const placeController = new PlaceController();
  const { body } = req;
  const links = body['links[]'];
  delete body['links[]'];
  body.modified = true;
  body.links = links || [];
  placeController.updatePlace(body, placeId)
    .then(() => res.redirect(`/admin/places/${placeId}/edit`), error => res.send(error));
});

module.exports = router;
