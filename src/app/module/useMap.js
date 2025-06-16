import { useEffect, useRef, useState } from 'react';

export const useMap = (coordinates, selectedLayerName) => { // Add selectedLayerName as a parameter
  const mapRef = useRef(null);
  const [carMarker, setCarMarker] = useState(null);

  useEffect(() => {
    let L;
    (async () => {
      L = await import('leaflet');
      await import('leaflet-routing-machine');
      await import('leaflet/dist/leaflet.css');
      await import('leaflet-routing-machine/dist/leaflet-routing-machine.css');

      if (mapRef.current === null) {
        const { startCoordinates, zoom, trafficSigns } = coordinates;

        const initialMap = L.map('map', { 
            center: [startCoordinates.lat, startCoordinates.lng],
            zoom: zoom,
            zoomControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            touchZoom: false
        });

        const createTileLayer = (url) => {
          return L.tileLayer(url, { maxZoom: coordinates.zoom });
        };

        const selectedLayerUrl = coordinates.mapBaseUrls[selectedLayerName];
        const initialLayer = selectedLayerUrl ? createTileLayer(selectedLayerUrl) : createTileLayer(Object.values(coordinates.mapBaseUrls)[0]);

        initialLayer.addTo(initialMap);

        const carIcon = L.icon({
          iconUrl: coordinates.car.carIconUrl,
          iconSize: coordinates.car.carIconSize,
          iconAnchor: coordinates.car.carIconAnchor,
        });

        const initialMarker = L.marker([startCoordinates.lat, startCoordinates.lng], { icon: carIcon }).addTo(initialMap);
        setCarMarker(initialMarker);
        mapRef.current = initialMap;

        trafficSigns.forEach(sign => {
          const signIcon = L.icon({
            iconUrl: sign.iconUrl,
            iconSize: sign.iconSize,
            iconAnchor: sign.iconAnchor,
          });
          L.marker([sign.lat, sign.lng], { icon: signIcon }).addTo(initialMap);
        });
      }
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [coordinates, selectedLayerName]);

  return { mapRef, carMarker };
};


export const routeBuilder = (mapRef, setRoute, coordinates) => {

  const segmentDistance = coordinates.car.segment;
  const speed = coordinates.car.speed;

  const createRoute = (startCoordinates, endCoordinates) => {
    const control = L.Routing.control({
      waypoints: [
        L.latLng(startCoordinates.lat, startCoordinates.lng),
        L.latLng(endCoordinates.lat, endCoordinates.lng),
      ],
      createMarker: () => null,
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false, // Hide the direction window
    }).addTo(mapRef.current);

    control.on('routesfound', (e) => {
      const route = e.routes[0];
      const routeCoordinates = route.coordinates;
      const interpolatedRoute = interpolateRoute(routeCoordinates, segmentDistance);
      // console.log(`Route list: ${JSON.stringify(interpolatedRoute)}`);
      
      setRoute(interpolatedRoute);
      
    });
  };

  const interpolate = (start, end, factor) => start + (end - start) * factor;

  const roundCoordinate = (coord) => parseFloat(coord.toFixed(6));

  const interpolateRoute = (routeCoordinates, segmentDistance) => {
    const interpolatedRoute = [];
    let accumulatedDistance = 0;

    for (let i = 0; i < routeCoordinates.length - 1; i++) {
      const currentCoords = routeCoordinates[i];
      const nextCoords = routeCoordinates[i + 1];
      const distance = Math.hypot(nextCoords.lat - currentCoords.lat, nextCoords.lng - currentCoords.lng);
      let remainingDistance = distance;

      // console.log(`Distance: ${distance}, Remaining distance: ${remainingDistance}, Accumulated distance: ${accumulatedDistance}`)

      while (remainingDistance > segmentDistance) {
        const factor = accumulatedDistance / distance;
        const newLat = roundCoordinate(interpolate(currentCoords.lat, nextCoords.lat, factor));
        const newLng = roundCoordinate(interpolate(currentCoords.lng, nextCoords.lng, factor));

        // Add only unique points
        if (interpolatedRoute.length === 0 || (interpolatedRoute[interpolatedRoute.length - 1].lat !== newLat || interpolatedRoute[interpolatedRoute.length - 1].lng !== newLng)) {
          interpolatedRoute.push({ lat: newLat, lng: newLng });
        }

        accumulatedDistance += segmentDistance;
        remainingDistance -= segmentDistance;
      }
      accumulatedDistance = remainingDistance;
    }

    // Add the last point
    const lastPoint = routeCoordinates[routeCoordinates.length - 1];
    interpolatedRoute.push({ lat: roundCoordinate(lastPoint.lat), lng: roundCoordinate(lastPoint.lng) });

    return interpolatedRoute;
  };


  return { createRoute, roundCoordinate, interpolate, segmentDistance, speed};

}
