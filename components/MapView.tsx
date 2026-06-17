'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Listing } from '@/lib/types';
import { formatPrice } from '@/lib/format';

interface Props {
  listings: Listing[];
  activeId: string | null;
  onMarkerClick: (id: string) => void;
  drawMode?: boolean;
  onPolygonChange?: (points: [number, number][] | null) => void;
}

export default function MapView({ listings, activeId, onMarkerClick, drawMode = false, onPolygonChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const drawRef = useRef<{
    points: [number, number][];
    polyline: any;
    polygon: any;
    dots: any[];
    closeCircle: any;
  }>({ points: [], polyline: null, polygon: null, dots: [], closeCircle: null });

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
      html: `<div style="background:${bg};color:${color};border:1.5px solid ${border};border-radius:20px;padding:5px 10px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:${shadow};transform:${scale};transition:all 0.15s ease;cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${label}</div>`,
    });
  }, []);

  const clearDraw = useCallback((L: any, map: any) => {
    const d = drawRef.current;
    d.polyline?.remove();
    d.polygon?.remove();
    d.closeCircle?.remove();
    d.dots.forEach((dot) => dot.remove());
    drawRef.current = { points: [], polyline: null, polygon: null, dots: [], closeCircle: null };
  }, []);

  // Handle draw mode clicks
  useEffect(() => {
    if (!mapRef.current) return;
    const { map, L } = mapRef.current;

    if (!drawMode) {
      map.getContainer().style.cursor = '';
      clearDraw(L, map);
      onPolygonChange?.(null);
      return;
    }

    map.getContainer().style.cursor = 'crosshair';
    clearDraw(L, map);
    onPolygonChange?.(null);

    const onClick = (e: any) => {
      const d = drawRef.current;
      const pt: [number, number] = [e.latlng.lat, e.latlng.lng];

      // Check if clicking near start point to close polygon (≥3 points)
      if (d.points.length >= 3) {
        const start = d.points[0];
        const dist = map.distance([start[0], start[1]], [pt[0], pt[1]]);
        if (dist < 30) {
          // Close polygon
          d.polyline?.remove();
          d.closeCircle?.remove();
          const poly = L.polygon(d.points, {
            color: '#16a34a',
            fillColor: '#16a34a',
            fillOpacity: 0.1,
            weight: 2,
          }).addTo(map);
          drawRef.current.polygon = poly;
          onPolygonChange?.([...d.points]);
          map.off('click', onClick);
          map.getContainer().style.cursor = '';
          return;
        }
      }

      d.points.push(pt);

      // Draw dot at each point
      const dot = L.circleMarker(pt, {
        radius: 4,
        color: '#16a34a',
        fillColor: '#16a34a',
        fillOpacity: 1,
        weight: 2,
      }).addTo(map);
      d.dots.push(dot);

      // Update polyline
      d.polyline?.remove();
      if (d.points.length > 1) {
        d.polyline = L.polyline(d.points, { color: '#16a34a', weight: 2, dashArray: '6 4' }).addTo(map);
        drawRef.current.polyline = d.polyline;
      }

      // Show close-circle near start when ≥3 points
      d.closeCircle?.remove();
      if (d.points.length >= 3) {
        d.closeCircle = L.circleMarker(d.points[0], {
          radius: 8,
          color: '#16a34a',
          fillColor: '#fff',
          fillOpacity: 1,
          weight: 2,
        }).addTo(map);
        drawRef.current.closeCircle = d.closeCircle;
      }
    };

    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
      map.getContainer().style.cursor = '';
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawMode]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const center: [number, number] =
        mappable.length > 0 ? [mappable[0].lat!, mappable[0].lng!] : [37.0902, -95.7129];

      const map = L.map(containerRef.current!, { zoomControl: false }).setView(center, mappable.length > 0 ? 11 : 4);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = { map, L };

      mappable.forEach((listing) => {
        const marker = L.marker([listing.lat!, listing.lng!], { icon: buildIcon(listing.price, false, L) }).addTo(map);
        marker.on('click', () => onMarkerClick(listing.id));
        markersRef.current.set(listing.id, marker);
      });

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

  useEffect(() => {
    if (!mapRef.current) return;
    const { L } = mapRef.current;
    markersRef.current.forEach((marker, id) => {
      const listing = listings.find((l) => l.id === id);
      if (!listing) return;
      marker.setIcon(buildIcon(listing.price, id === activeId, L));
    });
    if (activeId) {
      const listing = listings.find((l) => l.id === activeId);
      if (listing?.lat && listing?.lng) {
        mapRef.current.map.panTo([listing.lat, listing.lng], { animate: true, duration: 0.4 });
      }
    }
  }, [activeId, listings, buildIcon]);

  if (mappable.length === 0) {
    return <div className="flex h-full items-center justify-center bg-gray-50 text-sm text-gray-400">No listings with location data to display</div>;
  }

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      {drawMode && (
        <div className="absolute left-1/2 top-3 z-[1000] -translate-x-1/2 rounded-full bg-green-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg pointer-events-none">
          Click to draw · Click start point to finish
        </div>
      )}
      <div ref={containerRef} className="relative h-full w-full" />
    </>
  );
}
