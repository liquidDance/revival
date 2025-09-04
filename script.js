// Variables globales
let allActivities = [];
let allParticipants = [];
let currentLocationId = null;
let currentPhotos = [];
let currentPhotoIndex = 0;
let activeFilters = {
    days: [],
    activities: [],
    participants: []
};

// Inicialización del mapa
const map = L.map('map').setView([38.98, 1.30], 10);

// Añadir capa del mapa
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Añadir imagen de satélite
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);

// Capa para los marcadores
const markersLayer = L.layerGroup().addTo(map);

// Parsear datos CSV
function parseCSVData() {
    // Convertir el CSV a objetos JavaScript
    const csvData = `Date/fecha,Day/Día,#,Activity,Actividad,Place/Lugar,Lat (5),Long (5),gps
,,,,,Airport/Aeropuerto,38.87732,1.37058,"38.87732,1.37058"
06/08/25,1,0100,Arrive to the accomondations,Llegada al alojamiento,,,,
,,0101,Opening Circle ,Círculo de apertura,Bosque Cala Pada,38.99322,1.56329,"38.99322,1.56329"
,,0102,Journey into the flow (Martin/ Tanja),Viaje hacia la fluidez (Martin/Tanja),Cala Pada,38.99327,1.56183,"38.99327,1.56183"
,,0103,Picnic,Picnic,,,,
,,0104,"Sunset & Chill, Connect & Dance","Atardecer y relax, Conexión y baile",,,,
07/08/25,2,0201,Awaken Flow - Yoga & playful connection with Zara,Despertar del flujo - Yoga y conexión lúdica con Zara,"Playa S'Arenal Petit, Portinatx",39.10877,1.51521,"39.10877,1.51521"
,,0202,Water-Rebozo with Anuja,Rebozo de agua con Anuja,,,,
,,0203,"Picnic, Sharing, Siesta, Connection, Play","Picnic, Compartir, Siesta, Conexión, Juego",,,,
,,0204,Contact Improv in Water with Tanja,Contact Improvisación en el agua con Tanja,,,,
,,0205,Picnic,Picnic,,,,
,,0206,Introduction Soma-Water Dance in Pool with Martin,Introducción a la danza Soma-Agua en la piscina con Martin,Willem,39.00181,1.54227,"39.00181,1.54227"
,,0207,Ecstatic Dance with Willem,Danza extática con Willem,,,,
08/08/25,3,0301,Morning Practice with Anuja,Práctica matutina con Anuja,Cala Benirràs,39.08958,1.45463,"39.08958,1.45463"
,,0302,Somatic Journey with Tanja / Martin,Viaje somático con Tanja/Martin,,,,
,,0303,"Picnic, Sharing, Siesta, Connection, Play","Picnic, Compartir, Siesta, Conexión, Juego",,,,
,,0304,"Deep Dance ""Swarm among the sea weed"" with Alex","Danza profunda ""Enjambre entre las algas"" con Alex",,,,
,,0305,Picnic,Picnic,,,,
,,0306,"Sunset & Chill, Connect & Dance","Atardecer y relax, Conexión y baile",,,,
09/08/25,4,0401,Morning Practice with Rikki - Soma & Voice),Práctica matutina con Rikki - Soma y voz),ses Salines,38.83970,1.39704,"38.83970,1.39704"
,,0402,Partner-Water-Dance with Alex,Danza en pareja en el agua con Alex,Cala Pluma,38.83574,1.40067,"38.83574,1.40067"
,,0403,"Picnic, Sharing, Siesta, Connection, Play","Picnic, Compartir, Siesta, Conexión, Juego",,,,
,,0404,Contact Improv and Water Rebozo with Anuja,Contact Improvisación y Rebozo de agua con Anuja,,,,
,,0405,Water Blessing Ceremony & Sunset Jam with Nati,Ceremonia de bendición del agua y jam al atardecer con Nati,,,,
,,0406,Picnic,Picnic,,,,
10/08/25,5,0501,"Moving, Sharing, Caring, Dancing, Flowing &Closing","Moviéndose, compartiendo, cuidando, bailando, fluyendo y cerrando",sa Caleta,38.87005,1.33973,"38.87005,1.33973"
,,0502,Picnic,Picnic,,,,
`;

    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    const activities = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        const values = line.split(',').map(v => v.trim());
        if (values.length < 9) continue;
        
        // Solo procesar actividades con ubicación
        if (values[5] && values[6] && values[7]) {
            activities.push({
                id: values[2] || `act-${i}`,
                date: values[0],
                day: parseInt(values[1]),
                activity: values[3],
                activity_es: values[4],
                place: values[5],
                lat: parseFloat(values[6]),
                lng: parseFloat(values[7]),
                participants: extractParticipants(values[3] + ' ' + values[4])
            });
        }
    }
    
    return activities;
}

// Extraer participantes del texto de la actividad
function extractParticipants(activityText) {
    const participantNames = [];
    const lowerText = activityText.toLowerCase();
    
    allParticipants.forEach(participant => {
        if (lowerText.includes(participant.toLowerCase())) {
            participantNames.push(participant);
        }
    });
    
    return participantNames;
}

// Generar colores únicos para cada tipo de actividad
function generateActivityColors(activities) {
    const activityTypes = [...new Set(activities.map(a => a.activity))];
    const colors = [
        '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
        '#1abc9c', '#34495e', '#e67e22', '#27ae60', '#8e44ad',
        '#d35400', '#16a085', '#c0392b', '#2980b9', '#f1c40f'
    ];
    
    const colorMap = {};
    activityTypes.forEach((type, i) => {
        colorMap[type] = colors[i % colors.length];
    });
    
    return colorMap;
}

// Generar filtros
function generateFilters() {
    generateDayFilters();
    generateActivityFilters();
    generateParticipantFilters();
}

// Generar filtros por día
function generateDayFilters() {
    const dayFilters = document.getElementById('day-filters');
    const uniqueDays = [...new Set(allActivities.map(a => a.day))].sort();
    
    dayFilters.innerHTML = '';
    uniqueDays.forEach(day => {
        const div = document.createElement('div');
        div.className = 'filter-option';
        div.innerHTML = `
            <input type="checkbox" id="day-${day}" name="day" value="${day}" checked>
            <label for="day-${day}">Día ${day}</label>
        `;
        dayFilters.appendChild(div);
    });
    
    // Añadir event listeners
    document.querySelectorAll('input[name="day"]').forEach(input => {
        input.addEventListener('change', updateActiveFilters);
    });
}

// Generar filtros por actividad
function generateActivityFilters() {
    const activityFilters = document.getElementById('activity-filters');
    const uniqueActivities = [...new Set(allActivities.map(a => a.activity))].sort();
    
    activityFilters.innerHTML = '';
    uniqueActivities.forEach(activity => {
        const div = document.createElement('div');
        div.className = 'filter-option';
        div.innerHTML = `
            <input type="checkbox" id="${slugify(activity)}" name="activity" value="${activity}" checked>
            <label for="${slugify(activity)}">${activity}</label>
        `;
        activityFilters.appendChild(div);
    });
    
    // Añadir event listeners
    document.querySelectorAll('input[name="activity"]').forEach(input => {
        input.addEventListener('change', updateActiveFilters);
    });
}

// Generar filtros por participante
function generateParticipantFilters() {
    const participantFilters = document.getElementById('participant-filters');
    const searchInput = document.getElementById('participant-search');
    
    // Función de búsqueda
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        renderParticipantFilters(searchTerm);
    });
    
    // Renderizar inicialmente
    renderParticipantFilters();
}

// Renderizar filtros de participantes
function renderParticipantFilters(searchTerm = '') {
    const participantFilters = document.getElementById('participant-filters');
    participantFilters.innerHTML = '';
    
    const filteredParticipants = allParticipants.filter(p => 
        p.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    filteredParticipants.forEach(participant => {
        const div = document.createElement('div');
        div.className = 'filter-option';
        div.innerHTML = `
            <input type="checkbox" id="${slugify(participant)}" name="participant" value="${participant}">
            <label for="${slugify(participant)}">${participant}</label>
        `;
        participantFilters.appendChild(div);
    });
    
    // Añadir event listeners
    document.querySelectorAll('input[name="participant"]').forEach(input => {
        input.addEventListener('change', updateActiveFilters);
    });
}

// Actualizar filtros activos
function updateActiveFilters() {
    activeFilters = {
        days: Array.from(document.querySelectorAll('input[name="day"]:checked')).map(input => parseInt(input.value)),
        activities: Array.from(document.querySelectorAll('input[name="activity"]:checked')).map(input => input.value),
        participants: Array.from(document.querySelectorAll('input[name="participant"]:checked')).map(input => input.value)
    };
    
    createMarkers();
    updateModalFilters();
}

// Actualizar filtros en el modal
function updateModalFilters() {
    const filterTags = document.getElementById('modal-filter-tags');
    filterTags.innerHTML = '';
    
    // Añadir etiquetas para filtros activos
    activeFilters.days.forEach(day => {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.innerHTML = `Día ${day} <span class="remove" onclick="removeFilter('day', ${day})">×</span>`;
        filterTags.appendChild(tag);
    });
    
    activeFilters.activities.forEach(activity => {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.innerHTML = `${activity} <span class="remove" onclick="removeFilter('activity', '${activity}')">×</span>`;
        filterTags.appendChild(tag);
    });
    
    activeFilters.participants.forEach(participant => {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.innerHTML = `${participant} <span class="remove" onclick="removeFilter('participant', '${participant}')">×</span>`;
        filterTags.appendChild(tag);
    });
}

// Remover filtro
function removeFilter(type, value) {
    const selector = type === 'day' ? 
        `input[name="${type}"][value="${value}"]` :
        `input[name="${type}"][value="${value}"]`;
    
    const input = document.querySelector(selector);
    if (input) {
        input.checked = false;
        updateActiveFilters();
    }
}

// Crear marcadores para cada ubicación
function createMarkers() {
    markersLayer.clearLayers();
    const activityColors = generateActivityColors(allActivities);
    
    allActivities.forEach(activity => {
        // Filtrar por días, actividades y participantes seleccionados
        const dayMatch = activeFilters.days.length === 0 || activeFilters.days.includes(activity.day);
        const activityMatch = activeFilters.activities.length === 0 || activeFilters.activities.includes(activity.activity);
        
        let participantMatch = activeFilters.participants.length === 0;
        if (!participantMatch) {
            participantMatch = activeFilters.participants.some(participant => 
                activity.participants.includes(participant)
            );
        }
        
        if (dayMatch && activityMatch && participantMatch) {
            // Crear marcadores personalizados
            const marker = L.marker([activity.lat, activity.lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: ${activityColors[activity.activity]}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            });
            
            // Añadir popup con información básica
            marker.bindPopup(`
                <strong>${activity.place}</strong><br>
                <em>${activity.activity}</em><br>
                Día: ${activity.day}<br>
                ${activity.participants.length > 0 ? 'Participantes: ' + activity.participants.join(', ') + '<br>' : ''}
                <button onclick="showLocationPhotos('${activity.id}')">Ver fotos</button>
            `);
            
            marker.addTo(markersLayer);
        }
    });
}

// Simular datos de fotos (debes reemplazar esto con tus datos reales)
function getPhotosForActivity(activityId) {
    // Esta función simula la carga de fotos
    // En la implementación real, deberías tener un mapeo entre actividades y fotos
    const activity = allActivities.find(a => a.id === activityId);
    if (!activity) return [];
    
    // Simular 3-8 fotos por actividad
    const photoCount = Math.floor(Math.random() * 6) + 3;
    const photos = [];
    
    for (let i = 1; i <= photoCount; i++) {
        photos.push({
            src: `fotos/dia${activity.day}/${slugify(activity.activity)}/foto${i}.jpg`,
            date: activity.date,
            place: activity.place,
            activity: activity.activity,
            people: activity.participants.concat([randomParticipant()]).filter((v, i, a) => a.indexOf(v) === i)
        });
    }
    
    return photos;
}

// Helper para obtener un participante aleatorio
function randomParticipant() {
    return allParticipants[Math.floor(Math.random() * allParticipants.length)];
}

// Mostrar fotos de una ubicación en el modal
function showLocationPhotos(activityId) {
    const activity = allActivities.find(a => a.id === activityId);
    if (!activity) return;
    
    document.getElementById('modal-location-title').textContent = `${activity.place} - ${activity.activity}`;
    
    // Obtener fotos para esta actividad
    currentPhotos = getPhotosForActivity(activityId);
    currentLocationId = activityId;
    
    renderPhotoGrid();
    
    // Mostrar modal
    document.getElementById('photo-modal').style.display = 'flex';
    document.getElementById('photo-viewer').style.display = 'none';
}

// Renderizar grid de miniaturas
function renderPhotoGrid() {
    const photosGrid = document.getElementById('photos-grid');
    photosGrid.innerHTML = '';
    
    if (currentPhotos.length === 0) {
        photosGrid.innerHTML = '<p>No hay fotos para esta actividad</p>';
        return;
    }
    
    // Crear miniaturas de fotos
    currentPhotos.forEach((photo, index) => {
        const thumbContainer = document.createElement('div');
        thumbContainer.className = 'photo-thumb-container';
        
        const thumb = document.createElement('img');
        thumb.src = photo.src;
        thumb.alt = `Foto ${index + 1}`;
        thumb.className = 'photo-thumb';
        thumb.onclick = () => showPhotoViewer(index);
        
        thumbContainer.appendChild(thumb);
        photosGrid.appendChild(thumbContainer);
    });
}

// Mostrar foto en tamaño grande
function showPhotoViewer(photoIndex) {
    if (photoIndex < 0 || photoIndex >= currentPhotos.length) return;
    
    currentPhotoIndex = photoIndex;
    const photo = currentPhotos[photoIndex];
    
    // Actualizar visor de foto
    document.getElementById('large-photo').src = photo.src;
    document.getElementById('photo-counter').textContent = `${photoIndex + 1} / ${currentPhotos.length}`;
    
    // Actualizar metadatos
    document.getElementById('metadata-date').textContent = photo.date;
    document.getElementById('metadata-place').textContent = photo.place;
    document.getElementById('metadata-activity').textContent = photo.activity;
    document.getElementById('metadata-people').textContent = photo.people.join(', ');
    
    // Resaltar miniatura activa
    document.querySelectorAll('.photo-thumb').forEach((thumb, idx) => {
        thumb.classList.toggle('active', idx === photoIndex);
    });
    
    // Mostrar visor
    document.getElementById('photo-viewer').style.display = 'flex';
    
    // Desplazar a la miniatura activa
    const activeThumb = document.querySelectorAll('.photo-thumb')[photoIndex];
    if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Navegar a foto anterior
document.getElementById('prev-photo').addEventListener('click', () => {
    let newIndex = currentPhotoIndex - 1;
    if (newIndex < 0) newIndex = currentPhotos.length - 1;
    showPhotoViewer(newIndex);
});

// Navegar a foto siguiente
document.getElementById('next-photo').addEventListener('click', () => {
    let newIndex = currentPhotoIndex + 1;
    if (newIndex >= currentPhotos.length) newIndex = 0;
    showPhotoViewer(newIndex);
});

// Alternar metadatos
document.getElementById('toggle-metadata').addEventListener('click', function() {
    const metadata = document.getElementById('photo-metadata');
    const isVisible = metadata.style.display !== 'none';
    metadata.style.display = isVisible ? 'none' : 'block';
    this.textContent = isVisible ? 'Mostrar info' : 'Ocultar info';
});

// Cerrar modal
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('photo-modal').style.display = 'none';
});

// Cerrar modal al hacer clic fuera del contenido
window.addEventListener('click', (event) => {
    const modal = document.getElementById('photo-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Helper para crear slugs
function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

// Inicializar la aplicación
function initApp() {
    allActivities = parseCSVData();
    generateFilters();
    createMarkers();
    
    // Inicializar leyenda
    const activityColors = generateActivityColors(allActivities);
    const legendItems = document.getElementById('legend-items');
    legendItems.innerHTML = '';
    
    Object.entries(activityColors).forEach(([activity, color]) => {
        const div = document.createElement('div');
        div.className = 'legend-item';
        div.innerHTML = `
            <div class="legend-color" style="background-color: ${color};"></div>
            <span>${activity}</span>
        `;
        legendItems.appendChild(div);
    });
}

// Iniciar cuando el DOM esté cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}