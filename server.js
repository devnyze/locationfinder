const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json());

const facilities = [
    { name: 'Facility A', lat: 34.0522, lng: -118.2437 },
    { name: 'Facility B', lat: 36.1699, lng: -115.1398 },
    // Add more facilities with their lat and lng
];

app.post('/nearest-facility', async (req, res) => {
    const { zipcode } = req.body;

    // Geocode the user's zip code to get latitude and longitude
    const geocodeResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
    const geocodeData = await geocodeResponse.json();
    const userLocation = geocodeData.results[0].geometry.location;
    
    const destinations = facilities.map(facility => `${facility.lat},${facility.lng}`).join('|');

    // Use Distance Matrix API to calculate distances
    const distanceMatrixResponse = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${userLocation.lat},${userLocation.lng}&destinations=${destinations}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
    const distanceMatrixData = await distanceMatrixResponse.json();
    
    let nearestFacility = null;
    let shortestDistance = Infinity;

    distanceMatrixData.rows[0].elements.forEach((element, index) => {
        if (element.status === 'OK' && element.distance.value < shortestDistance) {
            shortestDistance = element.distance.value;
            nearestFacility = facilities[index].name;
        }
    });

    const distanceInMiles = (shortestDistance / 1609.34).toFixed(2); // Convert meters to miles

    res.json({ facility: nearestFacility, distance: distanceInMiles });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
