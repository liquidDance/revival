let map = L.map('map').setView([39.9, 4.1], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let data = [];
fetch('photos.json')
  .then(res => res.json())
  .then(json => {
    data = json;
    populateFilters();
    render();
  });

function populateFilters() {
  let days = new Set(), activities = new Set(), persons = new Set();
  data.forEach(item => {
    days.add(item.day);
    activities.add(item.activity);
    item.persons.forEach(p => persons.add(p));
  });
  let dayFilter = document.getElementById('dayFilter');
  days.forEach(d => {
    let opt = document.createElement('option');
    opt.value = d; opt.textContent = "Día " + d;
    dayFilter.appendChild(opt);
  });
  let activityFilter = document.getElementById('activityFilter');
  activities.forEach(a => {
    let opt = document.createElement('option');
    opt.value = a; opt.textContent = a;
    activityFilter.appendChild(opt);
  });
  let personFilter = document.getElementById('personFilter');
  persons.forEach(p => {
    let opt = document.createElement('option');
    opt.value = p; opt.textContent = p;
    personFilter.appendChild(opt);
  });
  document.querySelectorAll('#filters select').forEach(sel => sel.addEventListener('change', render));
}

function render() {
  let dayVal = document.getElementById('dayFilter').value;
  let actVal = document.getElementById('activityFilter').value;
  let perVal = document.getElementById('personFilter').value;
  document.getElementById('gallery').innerHTML = "";
  map.eachLayer(l => { if (l instanceof L.Marker) map.removeLayer(l); });
  data.forEach(item => {
    if ((dayVal && item.day != dayVal) ||
        (actVal && item.activity != actVal) ||
        (perVal && !item.persons.includes(perVal))) return;
    let img = document.createElement('img');
    img.src = item.url;
    img.alt = item.activity;
    document.getElementById('gallery').appendChild(img);
    let marker = L.marker(item.gps).addTo(map).bindPopup(item.activity);
  });
}
