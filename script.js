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
        noPhotos: "No hay fotos para esta actividad",
        welcome: "Bienvenido al Liquid Dance Revival 2025"
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
        noPhotos: "No photos for this activity",
        welcome: "Welcome to Liquid Dance Revival 2025"
    }
};

// Variables globales
let currentLanguage = 'es';
let currentActivity = null;
let currentPhotos = [];
let currentPhotoIndex = 0;
let map;
let markers = [];
let markerGroups = {}; // Para agrupar marcadores en la misma ubicación

// Colores para cada día
const dayColors = {
    1: '#ffa0da',
    2: '#e7b0e9', 
    3: '#cbbcf3',
    4: '#bcd7f4',
    5: '#cae8e8'
};

// Inicialización del mapa
function initMap() {
    // Usar el mapa CartoDB Positron como solicitado
    var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });
    
    map = L.map('map', {
        layers: [CartoDB_Positron]
    }).setView([38.87732, 1.37058], 11); // Centrado en el aeropuerto
    
    createMarkers();
    
    // Mostrar popup de bienvenida en el aeropuerto después de un breve retraso
    setTimeout(showWelcomePopup, 1000);
}

// Mostrar popup de bienvenida en el aeropuerto
function showWelcomePopup() {
    const airportActivity = getActivityByCod("0000");
    if (airportActivity) {
        showActivityPhotos("0000");
        
        // También abrir el popup en el mapa
        markers.forEach(marker => {
            const activity = marker.activity;
            if (activity && activity.cod === "0000") {
                marker.openPopup();
            }
        });
    }
}

// Crear marcadores en el mapa
function createMarkers() {
    // Limpiar marcadores existentes
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    markerGroups = {};
    
    activitiesData.forEach(activity => {
        if (activity.lat && activity.lng) {
            // Determinar color según el día
            let color = dayColors[activity.day] || '#3498db';
            
            // Para el aeropuerto usar color especial
            if (activity.cod === "0000") color = '#e74c3c';
            
            // Para agrupar marcadores en la misma ubicación
            const locationKey = `${activity.lat.toFixed(5)}_${activity.lng.toFixed(5)}`;
            
            if (!markerGroups[locationKey]) {
                markerGroups[locationKey] = [];
            }
            
            // Añadir pequeño desplazamiento para marcadores en la misma ubicación
            const offset = markerGroups[locationKey].length * 0.0005;
            const lat = activity.lat + offset;
            const lng = activity.lng + offset;
            
            // Crear marcadores personalizados
            const marker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            });
            
            // Guardar referencia a la actividad en el marcador
            marker.activity = activity;
            
            // Contenido del popup
            const activityName = currentLanguage === 'es' ? activity.activity_es : activity.activity_en;
            const placeName = currentLanguage === 'es' ? activity.place_es : activity.place_en;
            
            let popupContent = `<strong>${activityName}</strong><br>${placeName}`;
            
            if (activity.hasFacilitator) {
                const facilitator = currentLanguage === 'es' ? activity.facilitator_es : activity.facilitator_en;
                popupContent += `<br>${currentLanguage === 'es' ? 'Facilitador: ' : 'Facilitator: '}${facilitator}`;
            }
            
            popupContent += `<br><button onclick="showActivityPhotos('${activity.cod}')" class="popup-btn">${currentLanguage === 'es' ? 'Ver fotos' : 'View photos'}</button>`;
            
            marker.bindPopup(popupContent);
            marker.addTo(map);
            markers.push(marker);
            markerGroups[locationKey].push(marker);
            
            // Establecer opacidad inicial según el día seleccionado
            updateMarkerVisibility();
        }
    });
    
    // Actualizar leyenda
    updateLegend();
}

// Actualizar visibilidad de marcadores según día seleccionado
function updateMarkerVisibility() {
    const selectedDay = document.querySelector('input[name="day"]:checked');
    const day = selectedDay ? parseInt(selectedDay.value) : 1;
    
    markers.forEach(marker => {
        if (marker.activity) {
            if (marker.activity.day === day || marker.activity.cod === "0000") {
                marker.setOpacity(1);
                marker.setZIndexOffset(1000);
            } else {
                marker.setOpacity(0.5);
                marker.setZIndexOffset(0);
            }
        }
    });
}

// Actualizar leyenda
function updateLegend() {
    const legendItems = document.getElementById('legend-items');
    legendItems.innerHTML = '';
    
    // Aeropuerto
    const airportDiv = document.createElement('div');
    airportDiv.className = 'legend-item';
    airportDiv.innerHTML = `
        <div class="legend-color" style="background-color: #e74c3c;"></div>
        <span>${currentLanguage === 'es' ? 'Aeropuerto' : 'Airport'}</span>
    `;
    legendItems.appendChild(airportDiv);
    
    // Días
    for (let day = 1; day <= 5; day++) {
        const div = document.createElement('div');
        div.className = 'legend-item';
        div.innerHTML = `
            <div class="legend-color" style="background-color: ${dayColors[day]};"></div>
            <span>${currentLanguage === 'es' ? 'Día' : 'Day'} ${day}</span>
        `;
        legendItems.appendChild(div);
    }
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
    
    // Si hay múltiples actividades en la misma ubicación, mostrar selector
    showActivitySelectorIfNeeded();
}

// Mostrar selector de actividades si hay múltiples en la misma ubicación
function showActivitySelectorIfNeeded() {
    const locationKey = `${currentActivity.lat.toFixed(5)}_${currentActivity.lng.toFixed(5)}`;
    const activitiesInLocation = markerGroups[locationKey];
    
    if (activitiesInLocation && activitiesInLocation.length > 1) {
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'activity-selector';
        selectorContainer.innerHTML = `<h3>${currentLanguage === 'es' ? 'Actividades en esta ubicación:' : 'Activities at this location:'}</h3>`;
        
        const selector = document.createElement('select');
        selector.id = 'location-activities-selector';
        selector.onchange = function() {
            showActivityPhotos(this.value);
        };
        
        activitiesInLocation.forEach(marker => {
            const activity = marker.activity;
            const option = document.createElement('option');
            option.value = activity.cod;
            option.textContent = currentLanguage === 'es' ? activity.activity_es : activity.activity_en;
            option.selected = activity.cod === currentActivity.cod;
            selector.appendChild(option);
        });
        
        selectorContainer.appendChild(selector);
        
        // Insertar después del título
        const modalTitle = document.getElementById('modal-title');
        modalTitle.parentNode.insertBefore(selectorContainer, modalTitle.nextSibling);
    }
}

// Renderizar grid de miniaturas
function renderPhotoGrid() {
    const photosGrid = document.getElementById('photos-grid');
    photosGrid.innerHTML = '';
    
    currentPhotos.forEach((photoInfo, index) => {
        const thumbContainer = document.createElement('div');
        thumbContainer.className = 'thumb-container';
        
        const thumb = document.createElement('img');
        thumb.src = photoInfo.path;
        thumb.alt = `Foto ${photoInfo.sequential}`;
        thumb.className = 'photo-thumb';
        if (index === currentPhotoIndex) thumb.classList.add('active');
        thumb.onclick = () => showPhoto(index);
        
        // Botón de like
        const likeBtn = document.createElement('div');
        likeBtn.className = 'like-btn';
        likeBtn.innerHTML = '❤️';
        likeBtn.onclick = (e) => {
            e.stopPropagation();
            toggleLike(photoInfo.path);
            likeBtn.classList.toggle('liked');
        };
        
        thumbContainer.appendChild(thumb);
        thumbContainer.appendChild(likeBtn);
        photosGrid.appendChild(thumbContainer);
    });
}

// Alternar like en una foto
function toggleLike(photoPath) {
    // Implementar lógica de likes (podría usar localStorage)
    let likedPhotos = JSON.parse(localStorage.getItem('likedPhotos') || '{}');
    likedPhotos[photoPath] = !likedPhotos[photoPath];
    localStorage.setItem('likedPhotos', JSON.stringify(likedPhotos));
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
    
    // Actualizar botones de like
    updateLikeButtons();
}

// Actualizar botones de like
function updateLikeButtons() {
    const likedPhotos = JSON.parse(localStorage.getItem('likedPhotos') || '{}');
    document.querySelectorAll('.thumb-container').forEach((container, i) => {
        const likeBtn = container.querySelector('.like-btn');
        const photoInfo = currentPhotos[i];
        
        if (likedPhotos[photoInfo.path]) {
            likeBtn.classList.add('liked');
        } else {
            likeBtn.classList.remove('liked');
        }
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
    
    // Actualizar filtros
    updateActivityFilters(document.querySelector('input[name="day"]:checked').value);
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
            <label for="day-${day}">${currentLanguage === 'es' ? 'Día' : 'Day'} ${day}</label>
        `;
        dayFilters.appendChild(div);
    });
    
    // Event listener para filtros de día
    document.querySelectorAll('input[name="day"]').forEach(input => {
        input.addEventListener('change', function() {
            const selectedDay = parseInt(this.value);
            updateActivityFilters(selectedDay);
            updateMarkerVisibility();
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
        
        // Event listener para este filtro específico
        const input = div.querySelector('input');
        input.addEventListener('change', function() {
            const activityCod = this.value;
            const activity = getActivityByCod(activityCod);
            if (activity && activity.lat && activity.lng) {
                map.setView([activity.lat, activity.lng], 15);
                
                // Abrir el popup del marcador
                markers.forEach(marker => {
                    if (marker.activity && marker.activity.cod === activityCod) {
                        marker.openPopup();
                    }
                });
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
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    
    // Toggle info
    document.getElementById('toggle-info').addEventListener('click', function() {
        const info = document.getElementById('photo-info');
        const isVisible = info.style.display !== 'none';
        info.style.display = isVisible ? 'none' : 'block';
        this.textContent = isVisible ? translations[currentLanguage].showInfo : translations[currentLanguage].hideInfo;
    });
    
    // Navegación con teclado
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('photo-modal');
        if (modal.style.display === 'flex') {
            if (e.key === 'ArrowLeft') {
                prevPhoto();
            } else if (e.key === 'ArrowRight') {
                nextPhoto();
            } else if (e.key === 'Escape') {
                closeModal();
            }
        }
    });
}

// Cerrar modal
function closeModal() {
    document.getElementById('photo-modal').style.display = 'none';
}

// Iniciar cuando el DOM esté cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}