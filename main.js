let debounceTimeout;

// Icon Mapping
const iconMapping = {
    "Sunny": "wi wi-day-sunny",
    "Partly cloudy": "wi wi-day-cloudy",
    "Cloudy": "wi wi-cloudy",
    "Rain": "wi wi-rain",
    "Snow": "wi wi-snow",
    "Thunderstorm": "wi wi-thunderstorm",
    "Mist": "wi wi-fog",
    "Clear": "wi wi-day-sunny",
    "Overcast": "wi wi-cloudy",
    "Drizzle": "wi wi-showers",
    "Light rain": "wi wi-rain",
    "Heavy rain": "wi wi-rain-mix",
    "Patchy rain nearby": "wi wi-rain",
    "Patchy snow nearby": "wi wi-snow",
    "Patchy sleet nearby": "wi wi-sleet",
    "Blowing snow": "wi wi-snow-wind",
    "Fog": "wi wi-fog",
    "Hail": "wi wi-hail",
    "Hot": "wi wi-hot",
    "Muggy": "wi wi-humidity",
    "Windy": "wi wi-strong-wind",
    "Hurricane": "wi wi-hurricane",
    "Tornado": "wi wi-tornado",
};

function getWeatherIcon(condition) {
    return iconMapping[condition] || "wi wi-na"; // Default icon if no match
}

async function getWeather(location) {
    const apiKey = '622b3418f8b44818988172634252304'; // Replace with your API key

    try {
        const loader = document.getElementById('loader');
        loader.classList.remove('d-none');

        let cityName = location; // Default to the entered location

        // Check if location is coordinates (latitude,longitude)
        if (location.includes(',')) {
            // Fetch city name using current.json endpoint
            const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
            cityName = data.location.name; // Extract city name
        }

        updateTitle(cityName); // Update title with city name

        // Fetch forecast data
        const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=7`;
        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok) throw new Error('Network response was not ok.');
        const forecastData = await forecastResponse.json();

        display(forecastData.forecast.forecastday);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Failed to fetch weather data. Please check the location and try again.');
    } finally {
        document.getElementById('loader').classList.add('d-none');
    }
}

function display(forecastDays) {
    const container = document.getElementById('weather-container');
    container.innerHTML = '';

    forecastDays.forEach((day, index) => {
        const card = document.createElement('div');
        card.classList.add('card', 'col-md-4', 'fade-in');
        card.style.opacity = 0; // Initially hidden
        card.style.transform = 'translateY(100px)'; // Start below the viewport

        card.innerHTML = `
            <div class="card-body">
                <i class="${getWeatherIcon(day.day.condition.text)} display-1 text-primary"></i>
                <h5 class="card-title">${day.date}</h5>
                <p class="card-text">Avg Temp: ${day.day.avgtemp_c}°C</p>
                <p class="card-text">${day.day.condition.text}</p>
            </div>
        `;
        container.appendChild(card);

        // Trigger fade-in and slide-down effect after a short delay
        setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = 1;
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Automatically trigger search on typing
document.getElementById('location-input').addEventListener('input', (e) => {
    const location = e.target.value.trim();
    clearTimeout(debounceTimeout); // Clear previous timeout

    if (location) {
        debounceTimeout = setTimeout(() => {
            getWeather(location);
        }, 500); // Wait 500ms before triggering the API call
    } else {
        document.getElementById('weather-container').innerHTML = ''; // Clear results if input is empty
        updateTitle(''); // Reset title
    }
});

// Update the title dynamically
function updateTitle(location) {
    const titleElement = document.querySelector('.search-container h1');
    if (location) {
        titleElement.textContent = `Showing weather for "${location}"`;
    } else {
        titleElement.textContent = 'Check the Weather';
    }
}

// Search Button Event Listener (optional, kept for manual searches)
document.getElementById('search-btn').addEventListener('click', () => {
    const location = document.getElementById('location-input').value.trim();
    if (location) {
        getWeather(location);
    } else {
        alert('Please enter a location.');
    }
});

// Ask for Geolocation on Page Load
window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const location = `${latitude},${longitude}`;
                getWeather(location);
            },
            (error) => {
                console.error('Geolocation error:', error.message);
                alert('Unable to access your location. Please enter a location manually.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});

// Dark Mode Toggle
document.getElementById('darkModeToggle').addEventListener('change', (e) => {
    document.body.classList.toggle('dark-mode', e.target.checked);
});
