


mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: trail.geometry.coordinates,
    zoom: 9
});
map.addControl(new mapboxgl.NavigationControl());
const marker = new mapboxgl.Marker()
    .setLngLat(trail.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 40 })
            .setHTML(
                `<h3 class="text-xl font-semibold">${trail.title}</h3>`
            )
    )
    .addTo(map)

