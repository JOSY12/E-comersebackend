const { Router } = require('express');
const { getCountries, addCountry } = require('../controllers/countryController');


const countryRoute = Router();

countryRoute.get('/', getCountries);
countryRoute.post('/', addCountry);

module.exports = countryRoute;