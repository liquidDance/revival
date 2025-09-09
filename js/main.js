// Variables
let map, markers, currentPhotos = [], currentIndex = 0;
const gallery = document.getElementById('gallery');
const modal = document.getElementById('photo-modal');
const modalContent = document.getElementById('modal-content');
const closeModal = document.getElementById('close-modal');
const prevBtn = document.getElementById('prev-photo');
const nextBtn = document.getElementById('next-photo');

const filterDay = document.getElementById('filter-day');
const filterPlace = document.getElementById('filter-place');
const filterActivity = document.getElementById('filter-activity');

// Inicializar mapa
map = L.map('map').setView([39.0, 1.5], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Cluster
markers = L.markerClusterGroup();
map.addLayer(markers);

// Cargar CSV de actividades
const activitiesData = [
  // Aquí se pueden convertir los datos del CSV a objeto JS
  {day:"1", cod:"0", activity:"Arrival on the island", place:"Airport", lat:38.87732, lng:1.37058},
  {day:"1", cod:"101", activity:"Opening circle", place:"Bosque Cala Pada", lat:38.99322, lng:1.56329},
  {day:"1", cod:"102", activity:"Journey into the flow", place:"Cala Pada", lat:38.99327, lng:1.56183},
  {day:"1", cod:"103", activity:"Picnic", place:"Bosque Cala Pada", lat:38.99322, lng:1.56329},
  {day:"1", cod:"104", activity:"Sunset & chill, connect & dance", place:"Bosque Cala Pada", lat:38.99322, lng:1.56329},
  // ... resto del CSV
];

// Función para llenar filtros
function populateFilters() {
    const days = new Set();
    const places = new Set();
    const activities = new Set();
    activitiesData.forEach(a=>{
        days.add(a.day);
        places.add(a.place);
        activities.add(a.activity);
    });
    days.forEach(d=>{
        let opt = document.createElement('option');
        opt.value=d; opt.text="Día "+d; filterDay.appendChild(opt);
    });
    places.forEach(p=>{
        let opt = document.createElement('option');
        opt.value=p; opt.text=p; filterPlace.appendChild(opt);
    });
    activities.forEach(a=>{
        let opt = document.createElement('option');
        opt.value=a; opt.text=a; filterActivity.appendChild(opt);
    });
}

// Mostrar marcadores y miniaturas según filtros
function updateGalleryAndMap() {
    gallery.innerHTML = "";
    markers.clearLayers();
    let filtered = activitiesData.filter(a=>{
        return (!filterDay.value || a.day==filterDay.value)
            && (!filterPlace.value || a.place==filterPlace.value)
            && (!filterActivity.value || a.activity==filterActivity.value);
    });

    filtered.forEach(a=>{
        const photos = (window.photoManifest['dia'+a.day] && window.photoManifest['dia'+a.day][a.cod]) || [];
        photos.forEach(p=>{
            const img = document.createElement('img');
            img.src="fotos/dia"+a.day+"/"+a.cod+"/"+p.original;
            img.alt=a.activity;
            img.addEventListener('click', ()=>openModal(photos, 0));
            gallery.appendChild(img);
        });

        const marker = L.marker([a.lat, a.lng]);
        let popupHtml = `<strong>${a.activity}</strong><br>`;
        photos.forEach(p=>{
            popupHtml+=`<img src="fotos/dia${a.day}/${a.cod}/${p.original}" style="width:50px;margin:2px;">`;
        });
        marker.bindPopup(popupHtml);
        markers.addLayer(marker);
    });
}

// Modal
function openModal(photos, index) {
    currentPhotos = photos;
    currentIndex = index;
    renderModal();
    modal.classList.remove('hidden');
}
function renderModal() {
    modalContent.innerHTML = `<img src="fotos/dia${currentPhotos[0].original.slice(0,4)}/${currentPhotos[0].original.slice(0,4)}/${currentPhotos[currentIndex].original}">`;
}
closeModal.addEventListener('click', ()=>modal.classList.add('hidden'));
prevBtn.addEventListener('click', ()=>{currentIndex=(currentIndex-1+currentPhotos.length)%currentPhotos.length; renderModal();});
nextBtn.addEventListener('click', ()=>{currentIndex=(currentIndex+1)%currentPhotos.length; renderModal();});

// Filtros
filterDay.addEventListener('change', updateGalleryAndMap);
filterPlace.addEventListener('change', updateGalleryAndMap);
filterActivity.addEventListener('change', updateGalleryAndMap);

// Inicialización
populateFilters();
updateGalleryAndMap();
