var map = L.map('map').setView([20.5937, 78.9629], 5); // Centered on India

        // Step 5: Load Map Tiles from MapTiler
        L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAP_TOKEN}`, {
            attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
        }).addTo(map);

        L.marker([20.5937, 78.9629]).addTo(map)
    .bindPopup('This is India!')
    .openPopup();
