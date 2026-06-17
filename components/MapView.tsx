'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Listing } from '@/lib/types';
import { formatPrice } from '@/lib/format';

interface Props {
  listings: Listing[];
  activeId: string | null;
  onMarkerClick: (id: string) => void;
}

export default function MapView({ listings, activeId, onMarkerClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  const mappable = listings.filter((l) => l.lat != null && l.lng != null);

  const buildIcon = useCallback((price: number, active: boolean, L: any) => {
    const label = formatPrice(price);
    const bg = active ? '#16a34a' : '#fff';
    const color = active ? '#fff' : '#111827';
    const border = active ? '#16a34a' : '#d1d5db';
    const shadow = active ? '0 2px 8px rgba(22,163,74,0.45)' : '0 1px 4px rgba(0,0,0,0.18)';
    const scale = active ? 'scale(1.12)' : 'scale(1)';

    return L.divIcon({
      className: '',
      iconAnchor: [28, 18],
      html: `<div style="
        background:${bg};
        color:${color};
        border:1.5px solid ${border};
        border-radius:20px;
        padding:5px 10px;
        font-size:12px;
        font-weight:700;
        white-space:nowrap;
        box-shadow:${shadow};
        transform:${scale};
        transition:all 0.15s ease;
        cursor:pointer;
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      ">${label}</div>`,
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamically import leaflet (client-only)
    import('leaflet').then((L) => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const center: [number, number] =
        mappable.length > 0
          ? [mappable[0].lat!, mappable[0].lng!]
          : [37.0902, -95.7129]; // US center

      const map = L.map(containerRef.current!, {
        zoomControl: false,
        attributionControl: true,
      }).setView(center, mappable.length > 0 ? 11 : 4);

      // Custom zoom control position
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean Carto Positron tiles — minimal, white, distinct from Zillow/Redfin
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      mapRef.current = { map, L };

      // Add markers
      mappable.forEach((listing) => {
        const marker = L.marker([listing.lat!, listing.lng!], {
          icon: buildIcon(listing.price, false, L),
        }).addTo(map);

        marker.on('click', () => onMarkerClick(listing.id));
        markersRef.current.set(listing.id, marker);
      });

      // Fit bounds if multiple listings
      if (mappable.length > 1) {
        const bounds = L.latLngBounds(mappable.map((l) => [l.lat!, l.lng!]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      mapRef.current?.map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker styles when activeId changes
  useEffect(() => {
    if (!mapRef.current) return;
    const { L } = mapRef.current;

    markersRef.current.forEach((marker, id) => {
      const listing = listings.find((l) => l.id === id);
      if (!listing) return;
      marker.setIcon(buildIcon(listing.price, id === activeId, L));
    });

    // Pan to active marker
    if (activeId) {
      const listing = listings.find((l) => l.id === activeId);
      if (listing?.lat && listing?.lng) {
        mapRef.current.map.panTo([listing.lat, listing.lng], { animate: true, duration: 0.4 });
      }
    }
  }, [activeId, listings, buildIcon]);

  if (mappable.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 text-sm text-gray-400">
        No listings with location data to display
      </div>
    );
  }

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={containerRef} className="h-full w-full" />
    </>
  );
}
