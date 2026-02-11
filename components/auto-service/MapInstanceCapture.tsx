'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapInstanceCaptureProps {
  onMapCreated: (map: L.Map) => void;
  isInitialized: boolean;
}

export function MapInstanceCapture({ onMapCreated, isInitialized }: MapInstanceCaptureProps) {
  const map = useMap();

  useEffect(() => {
    if (map && !isInitialized) {
      onMapCreated(map);
    }
  }, [map, onMapCreated, isInitialized]);

  return null;
}
