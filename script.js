// Textos en diferentes idiomas
const translations = {
    es: {
        subtitle: "Festival de Danza en el Agua - Ibiza 2025",
        daysTitle: "Días del Festival",
        activitiesTitle: "Actividades",
        participantsTitle: "Participantes",
        legendTitle: "Leyenda - Día ",
        clearAll: "Deseleccionar",
        searchPlaceholder: "Buscar participante...",
        showInfo: "Mostrar info",
        hideInfo: "Ocultar info",
        previous: "← Anterior",
        next: "Siguiente →",
        date: "Fecha",
        place: "Lugar",
        activity: "Actividad",
        people: "Personas",
        noPhotos: "No hay fotos para esta actividad"
    },
    en: {
        subtitle: "Water Dance Festival - Ibiza 2025",
        daysTitle: "Festival Days",
        activitiesTitle: "Activities",
        participantsTitle: "Participants",
        legendTitle: "Legend - Day ",
        clearAll: "Deselect all",
        searchPlaceholder: "Search participant...",
        showInfo: "Show info",
        hideInfo: "Hide info",
        previous: "← Previous",
        next: "Next →",
        date: "Date",
        place: "Place",
        activity: "Activity",
        people: "People",
        noPhotos: "No photos for this activity"
    }
};

// Variables globales
let currentLanguage = 'es';
let currentLocationId = null;
let currentPhotos = [];
let currentPhotoIndex = 0;
let activeFilters = {
    days: [],
    activities: [],
    participants: []
};
let markersCluster = null;

// Inicialización del mapa
const map = L.map('map').setView([38.98, 1.30], 10);

// Añadir capa del mapa
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Capa para los marcadores (usando clustering)
markersCluster = L.markerClusterGroup({
    maxClusterRadius: 40,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
});
map.addLayer(markersCluster);

// ===== FUNCIONES PRINCIPALES =====

// Generar colores únicos para actividades
function generateActivityColors(activities) {
    const activityTypes = [...new Set(activities.map(a => a.activity))];
    const colors = [
        '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
        '#1abc9c', '#34495e', '#e67e22', '#27ae60', '#8e44ad'
    ];
    
    const colorMap = {};
    activityTypes.forEach((type, i) => {
        colorMap[type] = colors[i % colors.length];
    });
    
    return colorMap;
}

// Generar todos los filtros
function generateFilters() {
    generateDayFilters();
    generateActivityFilters();
    generateParticipantFilters();
    setupClearButtons();
    setupLanguageToggle();
}

// Generar filtros por día
function generateDayFilters() {
    const dayFilters = document.getElementById('day-filters');
    const uniqueDays = [...new Set(activitiesWithLocation.map(a => a.day))].sort();
    
    dayFilters.innerHTML = '';
    uniqueDays.forEach(day => {
        const div = document.createElement('div');
        div.className = 'filter-option';
        div.innerHTML = `
            <input type="checkbox" id="day-${day}" name="day" value="${day}">
            <label for="day-${day}">Día ${day}</label>
        `;
        dayFilters.appendChild(div);
    });
    
    document.querySelectorAll('input[name="day"]').forEach(input => {
        input.addEventListener('change', function() {
            updateActiveFilters();
            updateActivityFilters();
        });
    });
}

// Actualizar filtros de actividades según día seleccionado
function updateActivityFilters() {
    const selectedDays = Array.from(document.querySelectorAll('input[name="day"]:checked')).map(input => parseInt(input.value));
    const activityFilters = document.getElementById('activity-filters');
    
    let activitiesToShow = [];
    if (selectedDays.length > 0) {
        activitiesToShow = [...new Set(activitiesWithLocation
            .filter(a => selectedDays.includes(a.day))
            .map(a => a.activity))].sort();
    } else {
        activitiesToShow = [...new Set(activitiesWithLocation.map(a => a.activity))].sort();
    }
    
    activityFilters.innerHTML = '';
    activitiesToShow.forEach(activity => {
        const div = document.createElement('div');
        div.className = 'filter-option';
        div.innerHTML = `
            <input type="checkbox" id="${slugify(activity)}" name="activity" value="${activity}">
            <label for="${slugify(activity)}">${currentLanguage === 'es' ? 
                activitiesWithLocation.find(a => a.activity === activity)?.activity_es || activity : 
                activity}</label>
        `;
        activityFilters.appendChild(div);
    });
    
    document.querySelectorAll('input[name="activity"]').forEach(input => {
        input.addEventListener('change', updateActiveFilters);
    });
}

// Generar filtros por participante
function generateParticipantFilters() {
    const participantFilters = document.getElementById('participant-filters');
    const searchInput = document.getElementById('participant-search');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        renderParticipantFilters(searchTerm);
    });
    
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
    
    document.querySelectorAll('input[name="participant"]').forEach(input => {
        input.addEventListener('change', updateActiveFilters);
    });
}

// Configurar botones de deseleccionar
function setupClearButtons() {
    document.getElementById('clear-days').addEventListener('click', () => {
        document.querySelectorAll('input[name="day"]:checked').forEach(checkbox => {
            checkbox.checked = false;
        });
        updateActiveFilters();
        updateActivityFilters();
    });
    
    document.getElementById('clear-activities').addEventListener('click', () => {
        document.querySelectorAll('input[name="activity"]:checked').forEach(checkbox => {
            checkbox.checked = false;
        });
        updateActiveFilters();
    });
    
    document.getElementById('clear-participants').addEventListener('click', () => {
        document.querySelectorAll('input[name="participant"]:checked').forEach(checkbox => {
            checkbox.checked = false;
        });
        updateActiveFilters();
    });
}

// Configurar toggle de idioma
function setupLanguageToggle() {
    document.getElementById('lang-es').addEventListener('click', () => {
        if (currentLanguage !== 'es') {
            currentLanguage = 'es';
            document.getElementById('lang-es').classList.add('active');
            document.getElementById('lang-en').classList.remove('active');
            updateLanguage();
        }
    });
    
    document.getElementById('lang-en').addEventListener('click', () => {
        if (currentLanguage !== 'en') {
            currentLanguage = 'en';
            document.getElementById('lang-en').classList.add('active');
            document.getElementById('lang-es').classList.remove('active');
            updateLanguage();
        }
    });
}

// Actualizar idioma de la interfaz
function updateLanguage() {
    document.getElementById('subtitle').textContent = translations[currentLanguage].subtitle;
    document.getElementById('days-title').textContent = translations[currentLanguage].daysTitle;
    document.getElementById('activities-title').textContent = translations[currentLanguage].activitiesTitle;
    document.getElementById('participants-title').textContent = translations[currentLanguage].participantsTitle;
    document.getElementById('participant-search').placeholder = translations[currentLanguage].searchPlaceholder;
    document.getElementById('toggle-metadata').textContent = translations[currentLanguage].showInfo;
    document.getElementById('prev-photo').textContent = translations[currentLanguage].previous;
    document.getElementById('next-photo').textContent = translations[currentLanguage].next;
    
    document.querySelectorAll('.metadata-label').forEach((el, index) => {
        const labels = [translations[currentLanguage].date, translations[currentLanguage].place, 
                        translations[currentLanguage].activity, translations[currentLanguage].people];
        if (labels[index]) el.textContent = labels[index] + ':';
    });
    
    updateActivityFilters();
    updateLegend();
}

// Actualizar filtros activos
function updateActiveFilters() {
    activeFilters = {
        days: Array.from(document.querySelectorAll('input[name="day"]:checked')).map(input => parseInt(input.value)),
        activities: Array.from(document.querySelectorAll('input[name="activity"]:checked')).map(input => input.value),
        participants: Array.from(document.querySelectorAll('input[name="participant"]:checked')).map(input => input.value)
    };
    
    document.getElementById('clear-days').style.display = activeFilters.days.length > 0 ? 'block' : 'none';
    document.getElementById('clear-activities').style.display = activeFilters.activities.length > 0 ? 'block' : 'none';
    document.getElementById('clear-participants').style.display = activeFilters.participants.length > 0 ? 'block' : 'none';
    
    createMarkers();
    updateLegend();
}

// Actualizar leyenda
function updateLegend() {
    const legendItems = document.getElementById('legend-items');
    legendItems.innerHTML = '';
    
    if (activeFilters.days.length === 1) {
        const day = activeFilters.days[0];
        document.getElementById('legend-title').textContent = translations[currentLanguage].legendTitle + day;
        
        const dayActivities = activitiesWithLocation.filter(a => a.day === day);
        const activityColors = generateActivityColors(dayActivities);
        
        Object.entries(activityColors).forEach(([activity, color]) => {
            const div = document.createElement('div');
            div.className = 'legend-item';
            div.innerHTML = `
                <div class="legend-color" style="background-color: ${color};"></div>
                <span>${currentLanguage === 'es' ? 
                    dayActivities.find(a => a.activity === activity)?.activity_es || activity : 
                    activity}</span>
            `;
            legendItems.appendChild(div);
        });
    } else {
        document.getElementById('legend-title').textContent = translations[currentLanguage].legendTitle;
    }
}

// Crear marcadores en el mapa
function createMarkers() {
    markersCluster.clearLayers();
    const activityColors = generateActivityColors(activitiesWithLocation);
    
    activitiesWithLocation.forEach(activity => {
        const dayMatch = activeFilters.days.length === 0 || activeFilters.days.includes(activity.day);
        const activityMatch = activeFilters.activities.length === 0 || activeFilters.activities.includes(activity.activity);
        
        let participantMatch = activeFilters.participants.length === 0;
        if (!participantMatch && activity.participants.length > 0) {
            participantMatch = activeFilters.participants.some(participant => 
                activity.participants.includes(participant)
            );
        }
        
        if (dayMatch && activityMatch && participantMatch) {
            const marker = L.marker([activity.lat, activity.lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: ${activityColors[activity.activity]}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            });
            
            const activityName = currentLanguage === 'es' ? activity.activity_es : activity.activity;
            marker.bindPopup(`
                <strong>${activity.place}</strong><br>
                <em>${activityName}</em><br>
                ${translations[currentLanguage].daysTitle.slice(0, -1)}: ${activity.day}<br>
                ${activity.participants.length > 0 ? translations[currentLanguage].people + ': ' + activity.participants.join(', ') + '<br>' : ''}
                <button onclick="showLocationPhotos('${activity.id}')">Ver fotos</button>
            `);
            
            markersCluster.addLayer(marker);
        }
    });
}

// Función para obtener fotos de una actividad
function getPhotosForActivity(activityId) {
    const activity = allActivities.find(a => a.id === activityId);
    if (!activity) return [];
    
    // Esta función debe ser adaptada a tu estructura real de archivos
    // Aquí se simula la obtención de fotos
    
    // EJEMPLO: Para la actividad "Opening Circle" del día 1
    if (activityId === "0101") {
        return [
            {
                src: "fotos/dia1/opening-circle/foto1.jpg",
                date: activity.date,
                place: activity.place,
                activity: currentLanguage === 'es' ? activity.activity_es : activity.activity,
                people: ["Ana", "Carlos", "María"] // Personas que aparecen en la foto
            },
            {
                src: "fotos/dia1/opening-circle/foto2.jpg",
                date: activity.date,
                place: activity.place,
                activity: currentLanguage === 'es' ? activity.activity_es : activity.activity,
                people: ["Juan", "Laura", "Sofía"]
            }
        ];
    }
    
    // EJEMPLO: Para la actividad "Journey into the flow" del día 1
    if (activityId === "0102") {
        return [
            {
                src: "fotos/dia1/journey-into-the-flow/foto1.jpg",
                date: activity.date,
                place: activity.place,
                activity: currentLanguage === 'es' ? activity.activity_es : activity.activity,
                people: ["Martin", "Tanja", "Aitor"]
            }
        ];
    }
    
    // Añadir más casos para cada actividad...
    
    // Por defecto, devolver array vacío si no hay fotos
    return [];
}

// Mostrar fotos de una actividad
function showLocationPhotos(activityId) {
    const activity = allActivities.find(a => a.id === activityId);
    if (!activity) return;
    
    const activityName = currentLanguage === 'es' ? activity.activity_es : activity.activity;
    document.getElementById('modal-location-title').textContent = `${activity.place} - ${activityName}`;
    
    currentPhotos = getPhotosForActivity(activityId);
    currentLocationId = activityId;
    
    renderPhotoGrid();
    document.getElementById('photo-modal').style.display = 'flex';
    document.getElementById('photo-viewer').style.display = 'none';
}

// Renderizar grid de miniaturas
function renderPhotoGrid() {
    const photosGrid = document.getElementById('photos-grid');
    photosGrid.innerHTML = '';
    
    if (currentPhotos.length === 0) {
        photosGrid.innerHTML = `<p>${translations[currentLanguage].noPhotos}</p>`;
        return;
    }
    
    currentPhotos.forEach((photo, index) => {
        const thumbContainer = document.createElement('div');
        const thumb = document.createElement('img');
        thumb.src = photo.src;
        thumb.alt = `Foto ${index + 1}`;
        thumb.className = 'photo-thumb';
        thumb.onclick = () => showPhotoViewer(index);
        thumbContainer.appendChild(thumb);
        photosGrid.appendChild(thumbContainer);
    });
}

// Mostrar foto en visor
function showPhotoViewer(photoIndex) {
    if (photoIndex < 0 || photoIndex >= currentPhotos.length) return;
    
    currentPhotoIndex = photoIndex;
    const photo = currentPhotos[photoIndex];
    
    document.getElementById('large-photo').src = photo.src;
    document.getElementById('photo-counter').textContent = `${photoIndex + 1} / ${currentPhotos.length}`;
    document.getElementById('metadata-date').textContent = photo.date;
    document.getElementById('metadata-place').textContent = photo.place;
    document.getElementById('metadata-activity').textContent = photo.activity;
    document.getElementById('metadata-people').textContent = photo.people.join(', ');
    
    document.querySelectorAll('.photo-thumb').forEach((thumb, idx) => {
        thumb.classList.toggle('active', idx === photoIndex);
    });
    
    document.getElementById('photo-viewer').style.display = 'flex';
}

// Helper para crear slugs
function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

// ===== CONFIGURACIÓN DE EVENTOS =====
document.getElementById('prev-photo').addEventListener('click', () => {
    let newIndex = currentPhotoIndex - 1;
    if (newIndex < 0) newIndex = currentPhotos.length - 1;
    showPhotoViewer(newIndex);
});

document.getElementById('next-photo').addEventListener('click', () => {
    let newIndex = currentPhotoIndex + 1;
    if (newIndex >= currentPhotos.length) newIndex = 0;
    showPhotoViewer(newIndex);
});

document.getElementById('toggle-metadata').addEventListener('click', function() {
    const metadata = document.getElementById('photo-metadata');
    const isVisible = metadata.style.display !== 'none';
    metadata.style.display = isVisible ? 'none' : 'block';
    this.textContent = isVisible ? translations[currentLanguage].showInfo : translations[currentLanguage].hideInfo;
});

document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('photo-modal').style.display = 'none';
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('photo-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// ===== INICIALIZACIÓN =====
function initApp() {
    generateFilters();
    updateActivityFilters();
    createMarkers();
    updateLegend();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}