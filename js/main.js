// Generar array de actividades desde photoManifest
const actividades = [];
for (const dia in window.photoManifest) {
  const actividadesDia = window.photoManifest[dia];
  for (const codigoActividad in actividadesDia) {
    const fotosArray = actividadesDia[codigoActividad];
    const fotosRutas = fotosArray.map(f => `fotos/${dia}/${codigoActividad}/${f.original}`);
    actividades.push({
      dia,
      codigo: codigoActividad,
      fotos: fotosRutas,
      facilitador: "",
      lugar: "",
      lat: 0,
      lon: 0
    });
  }
}

// Función para llenar select de días
const filtroDia = document.getElementById("filtro-dia");
const diasUnicos = [...new Set(actividades.map(a => a.dia))];
diasUnicos.forEach(d => {
  const opt = document.createElement("option");
  opt.value = d;
  opt.textContent = d;
  filtroDia.appendChild(opt);
});

// Render de miniaturas
const galeria = document.getElementById("galeria");
function renderGaleria(actividadesFiltradas) {
  galeria.innerHTML = "";
  actividadesFiltradas.forEach(act => {
    act.fotos.forEach(foto => {
      const img = document.createElement("img");
      img.src = foto;
      img.alt = act.codigo;
      img.addEventListener("click", () => {
        mostrarPopupMapa(act, foto);
      });
      galeria.appendChild(img);
    });
  });
}

// Filtrado
function filtrar() {
  const diaSel = filtroDia.value;
  const fac = document.getElementById("filtro-facilitador").value.toLowerCase();
  const lugar = document.getElementById("filtro-lugar").value.toLowerCase();

  const filtradas = actividades.filter(a => {
    return (diaSel === "" || a.dia === diaSel) &&
           (fac === "" || a.facilitador.toLowerCase().includes(fac)) &&
           (lugar === "" || a.lugar.toLowerCase().includes(lugar));
  });

  renderGaleria(filtradas);
}

filtroDia.addEventListener("change", filtrar);
document.getElementById("filtro-facilitador").addEventListener("input", filtrar);
document.getElementById("filtro-lugar").addEventListener("input", filtrar);

// Inicial
renderGaleria(actividades);

// MAPA con cluster
const map = L.map("map").setView([39.95, 4.30], 10);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19
}).addTo(map);

const markers = L.markerClusterGroup();

function mostrarPopupMapa(act, fotoClick) {
  const popupContent = act.fotos.map(f => `<img src="${f}" style="width:100px; margin:2px; border-radius:4px;">`).join("");
  const marker = L.marker([act.lat, act.lon]);
  marker.bindPopup(popupContent).openPopup();
  markers.addLayer(marker);
}

actividades.forEach(act => {
  if(act.lat && act.lon) {
    const popupContent = act.fotos.map(f => `<img src="${f}" style="width:50px; margin:1px; border-radius:4px;">`).join("");
    const marker = L.marker([act.lat, act.lon]).bindPopup(popupContent);
    markers.addLayer(marker);
  }
});

map.addLayer(markers);
