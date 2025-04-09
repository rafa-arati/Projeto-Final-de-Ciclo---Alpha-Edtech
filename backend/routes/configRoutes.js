const express = require('express');
const router = express.Router();
const mapConfig = require('../config/mapConfig');

router.get('/', (req, res) => {
  res.json({
    apiKey: mapConfig.googleMaps.apiKey,
    defaultCenter: mapConfig.googleMaps.defaultCenter,
    defaultZoom: mapConfig.googleMaps.defaultZoom
  });
});

module.exports = router;