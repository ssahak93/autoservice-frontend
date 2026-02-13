'use client';

import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useRef, useCallback } from 'react';

import { locationsService } from '@/lib/services/locations.service';

// DistrictWithBounds type definition (if not exported from locations.service)
type DistrictWithBounds = {
  id: string;
  name: string;
  code: string;
  bounds?: unknown;
  centerLat?: number;
  centerLng?: number;
};

// Dynamically import Yandex Maps components to avoid SSR issues
const YMaps = dynamic(() => import('@pbe/react-yandex-maps').then((mod) => mod.YMaps), {
  ssr: false,
});
const YMap = dynamic(() => import('@pbe/react-yandex-maps').then((mod) => mod.Map), {
  ssr: false,
});
const Placemark = dynamic(() => import('@pbe/react-yandex-maps').then((mod) => mod.Placemark), {
  ssr: false,
});

interface DistrictMapProps {
  cityCode?: string; // Default: 'yerevan'
  selectedDistrictCode?: string;
  onDistrictSelect?: (districtCode: string, districtName: string) => void;
  services?: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    districtCode?: string;
  }>;
  height?: string; // CSS height value, default: '600px'
}

/**
 * DistrictMap Component
 *
 * Interactive map showing Yerevan districts with boundaries
 * Allows district selection by clicking on polygons
 * Visualizes services as markers
 * Uses Yandex Maps instead of Leaflet
 */
export function DistrictMap({
  cityCode = 'yerevan',
  selectedDistrictCode,
  onDistrictSelect,
  services = [],
  height = '600px',
}: DistrictMapProps) {
  const t = useTranslations('services');
  const [mounted, setMounted] = useState(false);
  const [districts, setDistricts] = useState<DistrictWithBounds[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(
    selectedDistrictCode || null
  );
  const mapRef = useRef<ymaps.Map | undefined>(undefined);
  const geoObjectsRef = useRef<ymaps.GeoObjectCollection | null>(null);

  // Yandex Maps API Key
  const YANDEX_MAPS_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || '';

  // Generate unique map key that persists across re-renders (prevents double initialization in Strict Mode)
  const mapKeyRef = useRef(`district-map-${Date.now()}-${Math.random()}`);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load districts with bounds
  useEffect(() => {
    if (!mounted) return;

    const loadDistricts = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use getCommunities with type='district' filter
        const data = await locationsService.getCommunities(undefined, 'district');
        setDistricts(data);
      } catch (err) {
        console.error('Failed to load districts:', err);
        setError('Failed to load districts');
      } finally {
        setLoading(false);
      }
    };

    loadDistricts();
  }, [mounted, cityCode]);

  // Handle district polygon click
  const handleDistrictClick = useCallback(
    (district: DistrictWithBounds) => {
      setSelectedDistrict(district.code);
      if (onDistrictSelect) {
        onDistrictSelect(district.code, district.name);
      }
    },
    [onDistrictSelect]
  );

  // Render districts on map
  useEffect(() => {
    if (
      !mapRef.current ||
      !districts.length ||
      !YANDEX_MAPS_API_KEY ||
      typeof window === 'undefined'
    )
      return;

    // Wait for YMaps to be ready
    const initGeoObjects = () => {
      if (!mapRef.current || !window.ymaps) return;

      try {
        // Remove existing geo objects
        if (geoObjectsRef.current) {
          mapRef.current.geoObjects.remove(geoObjectsRef.current);
        }

        // Create new collection
        const collection = new window.ymaps.GeoObjectCollection();

        districts.forEach((district) => {
          if (!district.bounds) return;

          try {
            // Convert GeoJSON to Yandex Maps format
            const geoJsonBounds = district.bounds as GeoJSON.Polygon;
            const coordinates = geoJsonBounds.coordinates[0].map((coord: number[]) => [
              coord[1],
              coord[0],
            ]); // Swap lat/lng

            // Create polygon
            const geoObject = new window.ymaps.GeoObject(
              {
                geometry: {
                  type: 'Polygon',
                  coordinates: [coordinates],
                },
                properties: {
                  hintContent: district.name,
                  balloonContent: district.name,
                  districtCode: district.code,
                  districtName: district.name,
                },
              },
              {
                fillColor: selectedDistrict === district.code ? '#3b82f6' : '#60a5fa',
                fillOpacity: selectedDistrict === district.code ? 0.4 : 0.2,
                strokeColor: selectedDistrict === district.code ? '#2563eb' : '#3b82f6',
                strokeWidth: selectedDistrict === district.code ? 3 : 2,
                strokeOpacity: selectedDistrict === district.code ? 0.8 : 0.5,
              }
            );

            // Add click handler
            geoObject.events.add('click', () => handleDistrictClick(district));

            // Add hover handlers
            geoObject.events.add('mouseenter', () => {
              geoObject.options.set({
                fillOpacity: 0.5,
                strokeWidth: 3,
              });
            });

            geoObject.events.add('mouseleave', () => {
              geoObject.options.set({
                fillOpacity: selectedDistrict === district.code ? 0.4 : 0.2,
                strokeWidth: selectedDistrict === district.code ? 3 : 2,
              });
            });

            collection.add(geoObject);
          } catch (err) {
            console.warn(`Failed to create geo object for district ${district.code}:`, err);
          }
        });

        mapRef.current.geoObjects.add(collection);
        geoObjectsRef.current = collection;

        // Fit bounds to show all districts
        if (collection.getLength() > 0) {
          const bounds = collection.getBounds();
          if (bounds) {
            mapRef.current.setBounds(bounds, { duration: 300, checkZoomRange: true });
          }
        }
      } catch (err) {
        console.error('Error initializing geo objects:', err);
      }
    };

    // Wait for YMaps to be loaded
    if (window.ymaps && window.ymaps.ready) {
      window.ymaps.ready(initGeoObjects);
    } else {
      // Wait a bit for map to be fully ready
      const timer = setTimeout(initGeoObjects, 1000);
      return () => clearTimeout(timer);
    }
  }, [districts, selectedDistrict, YANDEX_MAPS_API_KEY, handleDistrictClick]);

  // Calculate map center
  const getMapCenter = (): [number, number] => {
    if (districts.length === 0) {
      return [40.1811, 44.5136]; // Yerevan center
    }

    const districtsWithCoords = districts.filter((d) => d.centerLat && d.centerLng);
    if (districtsWithCoords.length === 0) {
      return [40.1811, 44.5136]; // Yerevan default
    }
    const centerLat =
      districtsWithCoords.reduce((sum, d) => sum + (d.centerLat || 0), 0) /
      districtsWithCoords.length;
    const centerLng =
      districtsWithCoords.reduce((sum, d) => sum + (d.centerLng || 0), 0) /
      districtsWithCoords.length;
    return [centerLat, centerLng];
  };

  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50"
        style={{ height }}
      >
        <div className="text-sm text-neutral-500">
          {t('loading', { defaultValue: 'Loading...' })}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50"
        style={{ height }}
      >
        <div className="text-sm text-neutral-500">
          {t('loading', { defaultValue: 'Loading...' })}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50"
        style={{ height }}
      >
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  if (!YANDEX_MAPS_API_KEY) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50"
        style={{ height }}
      >
        <div className="p-4 text-center">
          <MapPin className="mx-auto mb-2 h-12 w-12 text-neutral-400" />
          <p className="text-sm text-neutral-600">
            {t('mapApiKeyRequired', { defaultValue: 'Yandex Maps API key is required' })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary-600" />
        <h3 className="font-display text-lg font-semibold">
          {t('districtsMap', { defaultValue: 'Districts Map' })}
        </h3>
      </div>

      <div className="overflow-hidden rounded-lg border-2 border-neutral-200" style={{ height }}>
        {mounted && (
          <YMaps query={{ apikey: YANDEX_MAPS_API_KEY, lang: 'en_US' }}>
            <YMap
              key={mapKeyRef.current}
              defaultState={{
                center: getMapCenter(),
                zoom: 12,
              }}
              width="100%"
              height="100%"
              instanceRef={mapRef}
              modules={['control.ZoomControl', 'geoObject.addon.balloon']}
              options={{
                suppressMapOpenBlock: true,
              }}
            >
              {/* Render service markers */}
              {services.map((service) => (
                <Placemark
                  key={service.id}
                  geometry={[service.latitude, service.longitude]}
                  properties={{
                    hintContent: service.name,
                    balloonContent: service.name,
                  }}
                  options={{
                    preset: 'islands#blueIcon',
                    iconColor: '#3b82f6',
                  }}
                />
              ))}
            </YMap>
          </YMaps>
        )}
      </div>

      {/* District legend */}
      {districts.length > 0 && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <p className="mb-2 text-sm font-medium text-neutral-700">
            {t('clickDistrict', { defaultValue: 'Click on a district to select it' })}
          </p>
          <div className="flex flex-wrap gap-2">
            {districts.map((district) => (
              <button
                key={district.id}
                onClick={() => handleDistrictClick(district)}
                className={`rounded-md px-3 py-1 text-sm transition-colors ${
                  selectedDistrict === district.code
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {district.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
