import { checkForSigns } from './signChecker';
import { useCallback }  from 'react'; 

export const useAnimateCar = (carMarker, mapRef, segmentDistance, speed, passedSignsRef, setPassedSigns, logAction, roundCoordinate, interpolate, model, metaData, coordinates, setCurrentSignImage, updateScores) => {
  const animateCar = useCallback((routeCoordinates) => {
    console.log('Animating car...');

    let i = 0;
    const stepCount = 100;
    let paused = false;

    const pauseCar = (duration) => {
      paused = true;
      setTimeout(() => {
        paused = false;
        moveCar();
      }, duration);
    };

    const moveCar = () => {
      console.log('Moving car...')
      if (paused) return;

      if (i < routeCoordinates.length - 1) {
        const currentCoords = routeCoordinates[i];
        const nextCoords    = routeCoordinates[i + 1];
        const duration      = segmentDistance / speed;
        let t               = 0;

        const step = () => {
          if (paused) return;

          if (t < stepCount) {
            const factor = t / stepCount;

            const newLat = roundCoordinate(interpolate(currentCoords.lat, nextCoords.lat, factor));
            const newLng = roundCoordinate(interpolate(currentCoords.lng, nextCoords.lng, factor));

            if (carMarker.getLatLng().lat !== newLat || carMarker.getLatLng().lng !== newLng) {
              carMarker.setLatLng([newLat, newLng]);
              mapRef.current.panTo([newLat, newLng]);
              checkForSigns(newLat, newLng, segmentDistance, passedSignsRef, setPassedSigns, logAction, pauseCar, model, metaData, coordinates, setCurrentSignImage, updateScores);
            }

            t++;
            setTimeout(step, duration / stepCount);
          } else {
            i++;
            moveCar();
          }
        };

        step();
      }
    };

    moveCar();
  }, [carMarker, mapRef, segmentDistance, speed, passedSignsRef, setPassedSigns, logAction]);

  return animateCar;
};

export default useAnimateCar;
