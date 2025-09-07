// Textos en diferentes idiomas
const translations = {
    es: {
        subtitle: "Festival de Danza en el Agua - Ibiza 2025",
        daysTitle: "Días del Festival",
        activitiesTitle: "Actividades",
        legendTitle: "Leyenda",
        showInfo: "Mostrar información",
        hideInfo: "Ocultar información",
        viewFullscreen: "Ver pantalla completa",
        previous: "← Anterior",
        next: "Siguiente →",
        date: "Fecha:",
        place: "Lugar:",
        activity: "Actividad:",
        facilitator: "Facilitador:",
        noPhotos: "No hay fotos para esta actividad"
    },
    en: {
        subtitle: "Water Dance Festival - Ibiza 2025",
        daysTitle: "Festival Days",
        activitiesTitle: "Activities",
        legendTitle: "Legend",
        showInfo: "Show information",
        hideInfo: "Hide information",
        viewFullscreen: "View fullscreen",
        previous: "← Previous",
        next: "Next →",
        date: "Date:",
        place: "Place:",
        activity: "Activity:",
        facilitator: "Facilitator:",
        noPhotos: "No photos for this activity"
    }
};

// Variables globales
let currentLanguage = 'es';
let currentActivity = null;
let currentPhotos = [];
let currentPhotoIndex = 0;
let map;
let markers = [];

// Inicialización del mapa
function initMap() {
    map = L.map('map').setView([38.87222, 1.37306], 11);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    createMarkers();
}

// Crear marcadores en el mapa
function createMarkers() {
    // Limpiar marcadores existentes
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Colores para diferentes tipos de actividades
    const colors = {
        airport: '#e74c3c',
        normal: '#3498db',
        withFacilitator: '#2ecc71'
    };
    
    activitiesData.forEach(activity => {
        if (activity.lat && activity.lng) {
            // Determinar color según tipo de actividad
            let color = colors.normal;
            if (activity.cod === "0000") color = colors.airport;
            else if (activity.hasFacilitator) color = colors.withFacilitator;
            
            // Crear marcadores personalizados
            const marker = L.marker([activity.lat, activity.lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            });
            
            // Contenido del popup
            const activityName = currentLanguage === 'es' ? activity.activity_es : activity.activity_en;
            const placeName = currentLanguage === 'es' ? activity.place_es : activity.place_en;
            
            let popupContent = `<strong>${activityName}</strong><br>${placeName}`;
            
            if (activity.hasFacilitator) {
                const facilitator = currentLanguage === 'es' ? activity.facilitator_es : activity.facilitator_en;
                popupContent += `<br>${currentLanguage === 'es' ? 'Facilitador: ' : 'Facilitator: '}${facilitator}`;
            }
            
            popupContent += `<br><button onclick="showActivityPhotos('${activity.cod}')">${currentLanguage === 'es' ? 'Ver fotos' : 'View photos'}</button>`;
            
            marker.bindPopup(popupContent);
            marker.addTo(map);
            markers.push(marker);
        }
    });
    
    // Actualizar leyenda
    updateLegend();
}

// Actualizar leyenda
function updateLegend() {
    const legendItems = document.getElementById('legend-items');
    legendItems.innerHTML = '';
    
    const items = [
        { color: '#e74c3c', label: currentLanguage === 'es' ? 'Aeropuerto' : 'Airport' },
        { color: '#3498db', label: currentLanguage === 'es' ? 'Actividad' : 'Activity' },
        { color: '#2ecc71', label: currentLanguage === 'es' ? 'Con facilitador' : 'With facilitator' }
    ];
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'legend-item';
        div.innerHTML = `
            <div class="legend-color" style="background-color: ${item.color};"></div>
            <span>${item.label}</span>
        `;
        legendItems.appendChild(div);
    });
}

// Obtener fotos de una actividad desde el manifest
function getActivityPhotos(day, activityCode) {
    const dayFolder = `dia${day}`;
    
    if (window.photoManifest && window.photoManifest[dayFolder] && window.photoManifest[dayFolder][activityCode]) {
        return window.photoManifest[dayFolder][activityCode].map(photo => ({
            original: photo.original,
            sequential: photo.sequential,
            path: `fotos/${dayFolder}/${activityCode}/${photo.original}`
        }));
    }
    
    return [];
}

// Mostrar fotos de una actividad
function showActivityPhotos(activityCod) {
    currentActivity = getActivityByCod(activityCod);
    if (!currentActivity) return;
    
    currentPhotos = getActivityPhotos(currentActivity.day, currentActivity.cod);
    currentPhotoIndex = 0;
    
    // Actualizar título del modal
    const activityName = currentLanguage === 'es' ? currentActivity.activity_es : currentActivity.activity_en;
    document.getElementById('modal-title').textContent = activityName;
    
    // Renderizar miniaturas
    renderPhotoGrid();
    
    // Mostrar primera foto
    if (currentPhotos.length > 0) {
        showPhoto(0);
        document.getElementById('photo-viewer').style.display = 'flex';
    } else {
        document.getElementById('photo-viewer').style.display = 'none';
        document.getElementById('photos-grid').innerHTML = `<p>${translations[currentLanguage].noPhotos}</p>`;
    }
    
    // Mostrar modal
    document.getElementById('photo-modal').style.display = 'flex';
}

// Renderizar grid de miniaturas
function renderPhotoGrid() {
    const photosGrid = document.getElementById('photos-grid');
    photosGrid.innerHTML = '';
    
    currentPhotos.forEach((photoInfo, index) => {
        const thumb = document.createElement('img');
        thumb.src = photoInfo.path;
        thumb.alt = `Foto ${photoInfo.sequential}`;
        thumb.className = 'photo-thumb';
        if (index === currentPhotoIndex) thumb.classList.add('active');
        thumb.onclick = () => showPhoto(index);
        photosGrid.appendChild(thumb);
    });
}

// Mostrar foto específica
function showPhoto(index) {
    if (index < 0 || index >= currentPhotos.length) return;
    
    currentPhotoIndex = index;
    const photoInfo = currentPhotos[index];
    
    // Actualizar imagen principal
    document.getElementById('main-photo').src = photoInfo.path;
    
    // Actualizar contador
    document.getElementById('photo-counter').textContent = `${index + 1} / ${currentPhotos.length}`;
    
    // Actualizar información
    document.getElementById('info-date').textContent = currentActivity.date;
    document.getElementById('info-place').textContent = currentLanguage === 'es' ? currentActivity.place_es : currentActivity.place_en;
    document.getElementById('info-activity').textContent = currentLanguage === 'es' ? currentActivity.activity_es : currentActivity.activity_en;
    document.getElementById('info-facilitator').textContent = currentLanguage === 'es' ? currentActivity.facilitator_es : currentActivity.facilitator_en;
    
    // Actualizar miniaturas activas
    document.querySelectorAll('.photo-thumb').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

// Navegación de fotos
function nextPhoto() {
    let newIndex = currentPhotoIndex + 1;
    if (newIndex >= currentPhotos.length) newIndex = 0;
    showPhoto(newIndex);
}

function prevPhoto() {
    let newIndex = currentPhotoIndex - 1;
    if (newIndex < 0) newIndex = currentPhotos.length - 1;
    showPhoto(newIndex);
}

// Abrir imagen en pantalla completa
function openFullscreen() {
    if (currentPhotos.length > 0) {
        const imageUrl = currentPhotos[currentPhotoIndex].path;
        window.open(imageUrl, '_blank');
    }
}

// Cambiar idioma
function setLanguage(lang) {
    currentLanguage = lang;
    
    // Actualizar botones de idioma
    document.getElementById('lang-es').classList.toggle('active', lang === 'es');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    
    // Actualizar interfaz
    updateUI();
    
    // Recrear marcadores con nuevos textos
    createMarkers();
}

// Actualizar textos de la interfaz
function updateUI() {
    document.getElementById('subtitle').textContent = translations[currentLanguage].subtitle;
    document.getElementById('days-title').textContent = translations[currentLanguage].daysTitle;
    document.getElementById('activities-title').textContent = translations[currentLanguage].activitiesTitle;
    document.getElementById('legend-title').textContent = translations[currentLanguage].legendTitle;
    document.getElementById('toggle-info').textContent = translations[currentLanguage].showInfo;
    document.getElementById('fullscreen-btn').textContent = translations[currentLanguage].viewFullscreen;
    document.getElementById('prev-photo').textContent = translations[currentLanguage].previous;
    document.getElementById('next-photo').textContent = translations[currentLanguage].next;
    
    // Actualizar labels de información
    document.querySelectorAll('.info-label').forEach((label, index) => {
        const labels = [
            translations[currentLanguage].date,
            translations[currentLanguage].place,
            translations[currentLanguage].activity,
            translations[currentLanguage].facilitator
        ];
        if (labels[index]) label.textContent = labels[index];
    });
}

// Generar filtros
function generateFilters() {
    generateDayFilters();
    generateActivityFilters();
}

// Generar filtros por día
function generateDayFilters() {
    const dayFilters = document.getElementById('day-filters');
    const uniqueDays = [...new Set(activitiesData.map(activity => activity.day))].sort();
    
    dayFilters.innerHTML = '';
    uniqueDays.forEach(day => {
        const div = document.createElement('div');
        div.className = 'filter-option';
        div.innerHTML = `
            <input type="radio" id="day-${day}" name="day" value="${day}" ${day === 1 ? 'checked' : ''}>
            <label for="day-${day}">Día ${day}</label>
        `;
        dayFilters.appendChild(div);
    });
    
    // Event listener para filtros de día
    document.querySelectorAll('input[name="day"]').forEach(input => {
        input.addEventListener('change', function() {
            const selectedDay = parseInt(this.value);
            updateActivityFilters(selectedDay);
        });
    });
}

// Actualizar filtros de actividad según día seleccionado
function updateActivityFilters(day) {
    const activityFilters = document.getElementById('activity-filters');
    const activities = getActivitiesByDay(day);
    
    activityFilters.innerHTML = '';
    activities.forEach(activity => {
        const div = document.createElement('div');
        div.className = 'filter-option';
        div.innerHTML = `
            <input type="radio" id="activity-${activity.cod}" name="activity" value="${activity.cod}">
            <label for="activity-${activity.cod}">${currentLanguage === 'es' ? activity.activity_es : activity.activity_en}</label>
        `;
        activityFilters.appendChild(div);
    });
    
    // Event listener para filtros de actividad
    document.querySelectorAll('input[name="activity"]').forEach(input => {
        input.addEventListener('change', function() {
            const activityCod = this.value;
            const activity = getActivityByCod(activityCod);
            if (activity && activity.lat && activity.lng) {
                map.setView([activity.lat, activity.lng], 15);
            }
        });
    });
}

// Inicializar aplicación
function initApp() {
    initMap();
    generateFilters();
    updateActivityFilters(1);
    updateUI();
    
    // Event listeners
    document.getElementById('lang-es').addEventListener('click', () => setLanguage('es'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('prev-photo').addEventListener('click', prevPhoto);
    document.getElementById('next-photo').addEventListener('click', nextPhoto);
    document.getElementById('fullscreen-btn').addEventListener('click', openFullscreen);
    document.getElementById('main-photo').addEventListener('click', openFullscreen);
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('photo-modal').style.display = 'none';
    });
    
    // Toggle info
    document.getElementById('toggle-info').addEventListener('click', function() {
        const info = document.getElementById('photo-info');
        const isVisible = info.style.display !== 'none';
        info.style.display = isVisible ? 'none' : 'block';
        this.textContent = isVisible ? translations[currentLanguage].showInfo : translations[currentLanguage].hideInfo;
    });
}

// Iniciar cuando el DOM esté cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}