async function loadPhotos() {
  const response = await fetch('photos.json');
  const photos = await response.json();

  const map = L.map('map').setView([38.99, 1.56], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);

  photos.forEach(photo => {
    const marker = L.marker([photo.lat, photo.lng]).addTo(map);
    marker.bindPopup(`
      <h3>${photo.activity}</h3>
      <p><b>Lugar:</b> ${photo.place}</p>
      <p><b>Personas:</b> ${photo.people.join(', ')}</p>
      <img src="${photo.url}" alt="foto">
    `);
  });

  const searchBox = document.getElementById('search');
  searchBox.addEventListener('input', () => {
    const query = searchBox.value.toLowerCase();
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        const content = layer.getPopup().getContent().toLowerCase();
        if (content.includes(query)) {
          layer.addTo(map);
        } else {
          map.removeLayer(layer);
        }
      }
    });
  });
}
loadPhotos();
