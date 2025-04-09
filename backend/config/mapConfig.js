require('dotenv').config();

module.exports = {
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
    defaultCenter: {
      lat: -15.77972, // Centro do Brasil (aproximadamente)
      lng: -47.92972
    },
    defaultZoom: 13,
    placesLibrary: true
  }
};