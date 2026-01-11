'use client';

import { useMapEvents } from 'react-leaflet';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

/**
 * Component that handles map click events to select location
 * Similar to admin project's LocationPicker
 */
export function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}
