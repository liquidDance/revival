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
        noPhotos: "No hay fotos para esta actividad",
        viewFullscreen: "Ver en pantalla completa"
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
        noPhotos: "No photos for this activity",
        viewFullscreen: "View fullscreen"
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
let fotosData = [];

// Inicialización del mapa con estilo minimalista
const map = L.map('map').setView([38.87222, 1.37306], 11); // Centrado en aeropuerto de Ibiza

// Añadir capa del mapa con estilo minimalista
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
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

// Cargar datos de fotos desde JSON
async function loadFotosData() {
    try {
        const response = await fetch('data/fotos.json');
        fotosData = await response.json();
        console.log('Datos de fotos cargados:', fotosData.length, 'fotos');
        createMarkers();
        generateFilters();
    } catch (error) {
        console.error('Error cargando datos de fotos:', error);
        fotosData = [];
    }
}

// Extraer información de keywords
function parseKeywords(keywords) {
    if (!keywords || keywords.length < 2) return { day: null, activityCode: null };
    
    const day = parseInt(keywords[0]);
    let activityCode = keywords[1].replace(/^\d+\s*/, ''); // Eliminar número inicial
    
    return { day, activityCode };
}

// Generar colores únicos para actividades
function generateActivityColors(activities) {
    const activityTypes = [...new Set(activities)];
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

// Función para obtener fotos de una ubicación
function getPhotosForLocation(lat, lng) {
    return fotosData.filter(foto => {
        if (!foto.location) return false;
        
        const [fotoLat, fotoLng] = foto.location.split(',').map(coord => parseFloat(coord.trim()));
        const distance = Math.sqrt(Math.pow(fotoLat - lat, 2) + Math.pow(fotoLng - lng, 2));
        
        return distance < 0.001;
    }).map(foto => {
        const { day, activityCode } = parseKeywords(foto.keywords);
        const fecha = foto.date ? formatDate(foto.date) : '';
        const activityName = getActivityName(activityCode, currentLanguage);
        
        return {
            src: foto.url,
            date: fecha,
            place: getLocationName(lat, lng),
            activity: activityName,
            people: [],
            fullscreen: foto.url,
            day: day
        };
    });
}

// Crear marcadores en el mapa
function createMarkers() {
    markersCluster.clearLayers();
    
    const locations = {};
    
    fotosData.forEach(foto => {
        if (!foto.location) return;
        
        const [lat, lng] = foto.location.split(',').map(coord => parseFloat(coord.trim()));
        const locationKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
        
        if (!locations[locationKey]) {
            locations[locationKey] = {
                lat: lat,
                lng: lng,
                photos: [],
                activities: new Set(),
                days: new Set()
            };
        }
        
        const { day, activityCode } = parseKeywords(foto.keywords);
        locations[locationKey].photos.push(foto);
        if (activityCode) locations[locationKey].activities.add(activityCode);
        if (day) locations[locationKey].days.add(day);
    });
    
    Object.values(locations).forEach(location => {
        const activityCodes = Array.from(location.activities);
        const activities = activityCodes.map(code => getActivityName(code, currentLanguage));
        const days = Array.from(location.days);
        const activityColors = generateActivityColors(activityCodes);
        
        const dayMatch = activeFilters.days.length === 0 || 
                         days.some(day => activeFilters.days.includes(day));
        const activityMatch = activeFilters.activities.length === 0 || 
                             activityCodes.some(code => activeFilters.activities.includes(code));
        
        if (dayMatch && activityMatch) {
            const firstActivity = activityCodes[0];
            const color = activityColors[firstActivity] || '#3498db';
            
            const marker = L.marker([location.lat, location.lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            });
            
            marker.bindPopup(`
                <strong>${activities.join(', ')}</strong><br>
                Días: ${days.join(', ')}<br>
                Fotos: ${location.photos.length}<br>
                <button onclick="showLocationPhotos(${location.lat}, ${location.lng})">Ver fotos</button>
            `);
            
            markersCluster.addLayer(marker);
        }
    });
}

// Función auxiliar para formatear fecha
function formatDate(dateString) {
    if (!dateString) return '';
    return dateString.split(' ')[0].replace(/:/g, '/');
}

// Función auxiliar para obtener nombre de ubicación
function getLocationName(lat, lng) {
    const places = {
        '38.99322,1.56329': 'Bosque Cala Pada',
        '38.99327,1.56183': 'Cala Pada',
        '39.10877,1.51521': 'Playa S\'Arenal Petit, Portinatx',
        '39.00181,1.54227': 'Willem',
        '39.08958,1.45463': 'Cala Benirràs',
        '38.83970,1.39704': 'ses Salines',
        '38.83574,1.40067': 'Cala Pluma',
        '38.87005,1.33973': 'sa Caleta',
        '38.87222,1.37306': 'Aeropuerto de Ibiza'
    };
    
    return places[`${lat.toFixed(5)},${lng.toFixed(5)}`] || '';
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
    const uniqueDays = [...new Set(fotosData.map(foto => {
        const { day } = parseKeywords(foto.keywords);
        return day;
    }).filter(day => day !== null))].sort();
    
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
        activitiesToShow = [...new Set(fotosData
            .filter(foto => {
                const { day } = parseKeywords(foto.keywords);
                return day && selectedDays.includes(day);
            })
            .map(foto => {
                const { activityCode } = parseKeywords(foto.keywords);
                return activityCode;
            })
            .filter(code => code !== null))].sort();
    } else {
        activitiesToShow = [...new Set(fotosData.map(foto => {
            const { activityCode } = parseKeywords(foto.keywords);
            return activityCode;
        }).filter(code => code !== null))].sort();
    }
    
    activityFilters.innerHTML = '';
    activitiesToShow.forEach(activityCode => {
        const div = document.createElement('div');
        div.className = 'filter-option';
        div.innerHTML = `
            <input type="checkbox" id="${slugify(activityCode)}" name="activity" value="${activityCode}">
            <label for="${slugify(activityCode)}">${getActivityName(activityCode, currentLanguage)}</label>
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
    document.getElementById('fullscreen-btn').textContent = translations[currentLanguage].viewFullscreen;
    
    document.querySelectorAll('.metadata-label').forEach((el, index) => {
        const labels = [translations[currentLanguage].date, translations[currentLanguage].place, 
                        translations[currentLanguage].activity, translations[currentLanguage].people];
        if (labels[index]) el.textContent = labels[index] + ':';
    });
    
    updateActivityFilters();
    updateLegend();
    createMarkers();
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
        
        const dayActivities = [...new Set(fotosData
            .filter(foto => {
                const { day: fotoDay } = parseKeywords(foto.keywords);
                return fotoDay === day;
            })
            .map(foto => {
                const { activityCode } = parseKeywords(foto.keywords);
                return activityCode;
            })
            .filter(code => code !== null))];
        
        const activityColors = generateActivityColors(dayActivities);
        
        dayActivities.forEach(activityCode => {
            const div = document.createElement('div');
            div.className = 'legend-item';
            div.innerHTML = `
                <div class="legend-color" style="background-color: ${activityColors[activityCode]};"></div>
                <span>${getActivityName(activityCode, currentLanguage)}</span>
            `;
            legendItems.appendChild(div);
        });
    } else {
        document.getElementById('legend-title').textContent = translations[currentLanguage].legendTitle;
    }
}

// Mostrar fotos de una ubicación
function showLocationPhotos(lat, lng) {
    currentPhotos = getPhotosForLocation(lat, lng);
    
    if (currentPhotos.length === 0) {
        alert(translations[currentLanguage].noPhotos);
        return;
    }
    
    const firstPhoto = currentPhotos[0];
    document.getElementById('modal-location-title').textContent = 
        `${firstPhoto.activity} - ${translations[currentLanguage].daysTitle.slice(0, -1)} ${firstPhoto.day}`;
    
    renderPhotoGrid();
    showPhotoViewer(0);
    document.getElementById('photo-modal').style.display = 'flex';
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
    
    const activeThumb = document.querySelectorAll('.photo-thumb')[photoIndex];
    if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

// Función para abrir imagen en pantalla completa
function openFullscreenImage(src) {
    window.open(src, '_blank');
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

document.getElementById('fullscreen-btn').addEventListener('click', function() {
    if (currentPhotos.length > 0) {
        openFullscreenImage(currentPhotos[currentPhotoIndex].fullscreen);
    }
});

document.getElementById('large-photo').addEventListener('click', function() {
    if (currentPhotos.length > 0) {
        openFullscreenImage(currentPhotos[currentPhotoIndex].fullscreen);
    }
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
    loadFotosData();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}