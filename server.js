
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const facilities = [
    { name: 'Facility A', lat: 34.0522, lng: -118.2437 },
    { name: 'Facility B', lat: 36.1699, lng: -115.1398 },
    // Add more facilities with their lat and lng
];

app.post('/nearest-facility', async (req, res) => {
    const { zipcode } = req.body;
    const geocodeResponse = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}&key=${process.env.GOOGLE_API_KEY}`);
    const userLocation = geocodeResponse.data.results[0].geometry.location;

    let nearestFacility = null;
    let shortestDistance = Infinity;

    for (const facility of facilities) {
        const distanceResponse = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${userLocation.lat},${userLocation.lng}&destinations=${facility.lat},${facility.lng}&key=${process.env.GOOGLE_API_KEY}`);
        const distance = distanceResponse.data.rows[0].elements[0].distance.value; // distance in meters

        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestFacility = facility.name;
        }
    }

    const distanceInMiles = (shortestDistance / 1609.34).toFixed(2); // convert meters to miles
    res.json({ facility: nearestFacility, distance: distanceInMiles });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
