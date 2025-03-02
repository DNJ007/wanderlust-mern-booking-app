document.addEventListener("DOMContentLoaded", function () {
    if (!listingData || !listingData.coordinates || listingData.coordinates.length !== 2) {
        console.error("Invalid coordinates:", listingData);
        return;
    }

    const [lat,lng] = listingData.coordinates;
    console.log("Longitude:", lng, "Latitude:", lat);

    if (isNaN(lng) || isNaN(lat)) {
        console.error("Coordinates are not valid numbers");
        return;
    }

    // Ensure lat and lng are within valid range
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.error("Coordinates out of range:", lng, lat);
        return;
    }

    const map = L.map('map').setView([lat, lng], 9);

    L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAP_TOKEN}`, {
        attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
    }).addTo(map);

    L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<h4><b>${listingData.title}</b></h4><br><p>Exact location will be provided after booking</p>`)
        .openPopup();
});
