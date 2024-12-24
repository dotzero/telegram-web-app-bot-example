// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand(); // Растягивает приложение на весь экран

// Инициализация карты
let map;
let userLocation;

function initMap() {
    // Получение текущего местоположения пользователя
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // Создание карты
            map = L.map('map').setView([userLocation.lat, userLocation.lng], 15);

            // Добавление слоя карты от OSM
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Добавление маркера местоположения
            L.marker([userLocation.lat, userLocation.lng])
                .addTo(map)
                .bindPopup("Вы здесь")
                .openPopup();

            findNearestToilets();
        });
    } else {
        alert("Ваш браузер не поддерживает геолокацию.");
    }
}

// Поиск ближайших туалетов с использованием Overpass API
function findNearestToilets() {
    const overpassUrl = `https://overpass-api.de/api/interpreter`;
    const query = `
        [out:json];
        node
          [amenity=toilets]
          (around:1000,${userLocation.lat},${userLocation.lng});
        out body;
    `;

    fetch(overpassUrl, {
        method: 'POST',
        body: query,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => response.json())
    .then(data => {
        const elements = data.elements;
        if (elements.length > 0) {
            elements.forEach(toilet => {
                const lat = toilet.lat;
                const lon = toilet.lon;
                const name = toilet.tags && toilet.tags.name ? toilet.tags.name : "Туалет";

                // Добавление маркеров на карту
                L.marker([lat, lon])
                    .addTo(map)
                    .bindPopup(`<b>${name}</b><br>Координаты: ${lat.toFixed(6)}, ${lon.toFixed(6)}`);
            });
        } else {
            alert("Рядом не найдено туалетов.");
        }
    })
    .catch(error => {
        console.error("Ошибка при запросе Overpass API:", error);
        alert("Произошла ошибка при поиске туалетов.");
    });
}

// Инициализация карты
initMap();
