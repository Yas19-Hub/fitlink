let map;
let service;
let infoWindow;
let markers = [];
let currentLocation = null;

// Initialize map
function initMap() {
    // Default location (you can change this)
    const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York City
    
    // Check if API key is provided
    if (typeof google === 'undefined') {
        console.log('Google Maps API not loaded - using placeholder');
        return;
    }

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 13,
        center: defaultLocation,
        styles: [
            {
                featureType: "poi",
                elementType: "geometry",
                stylers: [{ color: "#eeeeee" }]
            },
            {
                featureType: "poi",
                elementType: "labels.text",
                stylers: [{ visibility: "off" }]
            },
            {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }]
            }
        ]
    });

    infoWindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);

    // Try to get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(currentLocation);
                searchNearbyGyms(currentLocation);
            },
            () => {
                console.log("Geolocation failed, using default location");
                searchNearbyGyms(defaultLocation);
            }
        );
    } else {
        searchNearbyGyms(defaultLocation);
    }
}

// Search for nearby gyms
function searchNearbyGyms(location) {
    clearMarkers();
    showLoading(true);

    const request = {
        location: location,
        radius: parseInt(document.getElementById('radius-select').value),
        types: ['gym', 'health', 'physiotherapist'],
        keyword: 'gym fitness center'
    };

    service.nearbySearch(request, (results, status) => {
        showLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            displayGyms(results);
            createMarkers(results, location);
        } else {
            console.error('Places service failed:', status);
            showNoResults();
        }
    });
}

// Display gym results in sidebar
function displayGyms(gyms) {
    const gymList = document.getElementById('gym-list');
    
    if (gyms.length === 0) {
        gymList.innerHTML = '<p class="no-results">No gyms found in this area. Try expanding your search radius.</p>';
        return;
    }

    gymList.innerHTML = gyms.slice(0, 10).map((gym, index) => {
        const rating = gym.rating ? `⭐ ${gym.rating}` : '⭐ N/A';
        const distance = currentLocation ? 
            calculateDistance(currentLocation.lat, currentLocation.lng, gym.geometry.location.lat(), gym.geometry.location.lng()) : 
            'N/A';
        
        const offers = [
            '20% off first month',
            'Free trial class',
            'Bring a friend, get 50% off!',
            'Student discount available',
            'No joining fee this month'
        ];
        
        const randomOffer = offers[Math.floor(Math.random() * offers.length)];

        return `
            <div class="gym-card" onclick="selectGym(${index})">
                <h4>${gym.name}</h4>
                <p class="gym-address">${gym.vicinity || gym.formatted_address || 'Address not available'}</p>
                <div class="gym-details">
                    <span class="gym-rating">${rating}</span>
                    <span class="gym-distance">${distance}</span>
                </div>
                <div class="gym-offer">
                    <span class="offer-badge">${randomOffer}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Create markers on map
function createMarkers(gyms, centerLocation) {
    // Add center marker
    if (centerLocation) {
        const centerMarker = new google.maps.Marker({
            position: centerLocation,
            map: map,
            title: "Your Location",
            icon: {
                url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNmNTllMGIiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0iI2ZmZmZmZiIvPgo8L3N2Zz4K',
                scaledSize: new google.maps.Size(30, 30),
                anchor: new google.maps.Point(15, 15)
            }
        });
        markers.push(centerMarker);
    }

    // Add gym markers
    gyms.forEach((gym, index) => {
        const marker = new google.maps.Marker({
            position: gym.geometry.location,
            map: map,
            title: gym.name,
            icon: {
                url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDljMCA1LjI1IDcgMTMgNyAxM3M3LTcuNzUgNy0xM2MwLTMuODctMy4xMy03LTctN3ptMCA5LjVjLTEuMzggMC0yLjUtMS4xMi0yLjUtMi41czEuMTItMi41IDIuNS0yLjUgMi41IDEuMTIgMi41IDIuNS0xLjEyIDIuNS0yLjUgMi41eiIgZmlsbD0iIzEwYjk4MSIvPgo8L3N2Zz4K',
                scaledSize: new google.maps.Size(35, 35),
                anchor: new google.maps.Point(17.5, 35)
            }
        });

        marker.addListener('click', () => {
            selectGym(index);
            
            const content = `
                <div style="padding: 10px;">
                    <h3>${gym.name}</h3>
                    <p><strong>Address:</strong> ${gym.vicinity || gym.formatted_address || 'Address not available'}</p>
                    <p><strong>Rating:</strong> ${gym.rating ? `⭐ ${gym.rating}` : 'Not rated'}</p>
                    ${gym.price_level ? `<p><strong>Price Level:</strong> ${'$'.repeat(gym.price_level)}</p>` : ''}
                </div>
            `;
            
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
        });

        markers.push(marker);
    });

    // Adjust map bounds to show all markers
    if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(marker => bounds.extend(marker.getPosition()));
        map.fitBounds(bounds);
    }
}

// Select gym from list
function selectGym(index) {
    const marker = markers[index + 1]; // +1 because first marker is user location
    if (marker) {
        map.setCenter(marker.getPosition());
        map.setZoom(16);
        google.maps.event.trigger(marker, 'click');
    }
}

// Clear all markers
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Show/hide loading state
function showLoading(show) {
    const loading = document.getElementById('loading');
    const gymList = document.getElementById('gym-list');
    
    if (show) {
        loading.style.display = 'block';
        gymList.style.display = 'none';
    } else {
        loading.style.display = 'none';
        gymList.style.display = 'block';
    }
}

// Show no results message
function showNoResults() {
    const gymList = document.getElementById('gym-list');
    gymList.innerHTML = '<p class="no-results">No gyms found. Please try a different location or increase the search radius.</p>';
}

// Calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)} km`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('search-btn');
    const locationBtn = document.getElementById('current-location-btn');
    const locationInput = document.getElementById('location-input');
    const radiusSelect = document.getElementById('radius-select');

    searchBtn.addEventListener('click', performSearch);
    locationBtn.addEventListener('click', useCurrentLocation);
    locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });
    radiusSelect.addEventListener('change', function() {
        if (currentLocation) searchNearbyGyms(currentLocation);
    });
});

// Perform search based on input
function performSearch() {
    const locationInput = document.getElementById('location-input').value.trim();
    
    if (!locationInput) {
        alert('Please enter a location');
        return;
    }

    if (typeof google === 'undefined') {
        alert('Google Maps API is not loaded. Please check your API key.');
        return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: locationInput }, (results, status) => {
        if (status === 'OK') {
            const location = results[0].geometry.location;
            const locationObj = {
                lat: location.lat(),
                lng: location.lng()
            };
            
            currentLocation = locationObj;
            map.setCenter(locationObj);
            searchNearbyGyms(locationObj);
        } else {
            alert('Location not found. Please try a different search term.');
        }
    });
}

// Use current location
function useCurrentLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser');
        return;
    }

    showLoading(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            if (typeof google !== 'undefined') {
                map.setCenter(currentLocation);
                searchNearbyGyms(currentLocation);
            } else {
                showLoading(false);
                alert('Google Maps API is not loaded. Please check your API key.');
            }
        },
        (error) => {
            showLoading(false);
            alert('Unable to retrieve your location. Please enter a location manually.');
        },
        { timeout: 10000 }
    );
}

// Initialize when page loads
if (typeof google === 'undefined') {
    console.log('Google Maps API not loaded - check your API key');
}
