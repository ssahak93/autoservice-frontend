'use client';

import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { locationsService, DistrictWithBounds } from '@/lib/services/locations.service';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
});
const GeoJSON = dynamic(() => import('react-leaflet').then((mod) => mod.GeoJSON), {
  ssr: false,
});
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), {
  ssr: false,
});
const ZoomControl = dynamic(() => import('react-leaflet').then((mod) => mod.ZoomControl), {
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

  // Fix for default marker icons (must be done on client side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Dynamically import Leaflet only on client side
      import('leaflet').then((L) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, import/no-named-as-default-member
        delete (L.default.Icon.Default.prototype as any)._getIconUrl;
        // eslint-disable-next-line import/no-named-as-default-member
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
      });
    }
  }, []);

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
        const data = await locationsService.getDistrictsWithBounds(cityCode);
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
  const handleDistrictClick = (district: DistrictWithBounds) => {
    setSelectedDistrict(district.code);
    if (onDistrictSelect) {
      onDistrictSelect(district.code, district.name);
    }
  };

  // Style for district polygons
  const getDistrictStyle = (district: DistrictWithBounds) => {
    const isSelected = selectedDistrict === district.code;
    return {
      fillColor: isSelected ? '#3b82f6' : '#60a5fa',
      fillOpacity: isSelected ? 0.4 : 0.2,
      color: isSelected ? '#2563eb' : '#3b82f6',
      weight: isSelected ? 3 : 2,
      opacity: isSelected ? 0.8 : 0.5,
    };
  };

  // Event handlers for GeoJSON
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEachDistrict = (district: DistrictWithBounds, layer: any) => {
    layer.on({
      click: () => handleDistrictClick(district),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mouseover: (e: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const target = e.target as any;
        target.setStyle({
          fillOpacity: 0.5,
          weight: 3,
        });
        target.bindPopup(district.name).openPopup();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mouseout: (e: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const target = e.target as any;
        const style = getDistrictStyle(district);
        target.setStyle(style);
        target.closePopup();
      },
    });
  };

  // Calculate map bounds to fit all districts
  const getMapBounds = (): [number, number] => {
    if (districts.length === 0) {
      return [40.1811, 44.5136]; // Yerevan center
    }

    const centerLat = districts.reduce((sum, d) => sum + d.centerLat, 0) / districts.length;
    const centerLng = districts.reduce((sum, d) => sum + d.centerLng, 0) / districts.length;
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary-600" />
        <h3 className="font-display text-lg font-semibold">
          {t('districtsMap', { defaultValue: 'Districts Map' })}
        </h3>
      </div>

      <div className="overflow-hidden rounded-lg border-2 border-neutral-200" style={{ height }}>
        <MapContainer
          center={getMapBounds()}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomright" />

          {/* Render district polygons */}
          {districts.map((district) => {
            if (!district.bounds) return null;

            return (
              <GeoJSON
                key={district.id}
                data={district.bounds}
                style={() => getDistrictStyle(district)}
                onEachFeature={(feature, layer) => onEachDistrict(district, layer)}
              />
            );
          })}

          {/* Render service markers */}
          {services.map((service) => (
            <Marker key={service.id} position={[service.latitude, service.longitude]}>
              {/* You can add a custom popup here */}
            </Marker>
          ))}
        </MapContainer>
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
