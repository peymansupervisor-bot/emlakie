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
  clearSignal?: number;
  satellite?: boolean;
}

export default function MapView({ listings, activeId, onMarkerClick, drawMode = false, onPolygonChange, clearSignal, satellite = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const tileRef = useRef<any>(null);
  const drawRef = useRef<{
    points: [number, number][];
    polyline: any;
    polygon: any;
    dots: any[];
    closeCircle: any;
  }>({ points: [], polyline: null, polygon: null, dots: [], closeCircle: null });

  const mappable = listings.filter((l) => l.lat != null && l.lng != null);
  const mappableRef = useRef(mappable);
  mappableRef.current = mappable;

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

  const syncMarkers = useCallback((map: any, L: any) => {
    const current = mappableRef.current;
    const currentIds = new Set(current.map((l) => l.id));
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) { marker.remove(); markersRef.current.delete(id); }
    });
    current.forEach((listing) => {
      if (!markersRef.current.has(listing.id)) {
        const marker = L.marker([listing.lat!, listing.lng!], { icon: buildIcon(listing.price, false, L) }).addTo(map);
        marker.on('click', () => onMarkerClick(listing.id));
        markersRef.current.set(listing.id, marker);
      }
    });
    if (current.length > 1) {
      const bounds = L.latLngBounds(current.map((l) => [l.lat!, l.lng!]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearDraw = useCallback(() => {
    const d = drawRef.current;
    d.polyline?.remove();
    d.polygon?.remove();
    d.dots.forEach((dot) => dot.remove());
    drawRef.current = { points: [], polyline: null, polygon: null, dots: [], closeCircle: null };
  }, []);

  // Swap tile layer when satellite toggle changes
  useEffect(() => {
    if (!mapRef.current) return;
    const { map, L } = mapRef.current;
    if (tileRef.current) tileRef.current.remove();
    if (satellite) {
      tileRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles &copy; Esri', maxZoom: 19 }
      ).addTo(map);
    } else {
      tileRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: 'abcd', maxZoom: 19,
        }
      ).addTo(map);
    }
  }, [satellite]);

  // Clear polygon when user clicks "Clear area"
  useEffect(() => {
    if (clearSignal === undefined || clearSignal === 0) return;
    clearDraw();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearSignal]);

  // Freehand draw — mousedown+drag+mouseup like Redfin
  useEffect(() => {
    if (!mapRef.current) return;
    const { map, L } = mapRef.current;
    const container = map.getContainer() as HTMLElement;

    if (!drawMode) {
      container.style.cursor = '';
      // Only clear if no completed polygon exists yet
      if (!drawRef.current.polygon) {
        clearDraw();
        onPolygonChange?.(null);
      }
      return;
    }

    container.style.cursor = 'crosshair';
    // Only clear previous drawing if starting fresh (no polygon set from outside)
    if (!drawRef.current.polygon) {
      clearDraw();
      onPolygonChange?.(null);
    }

    let drawing = false;

    const toLatLng = (e: MouseEvent): [number, number] => {
      const rect = container.getBoundingClientRect();
      const point = L.point(e.clientX - rect.left, e.clientY - rect.top);
      const ll = map.containerPointToLatLng(point);
      return [ll.lat, ll.lng];
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      drawing = true;
      map.dragging.disable();
      clearDraw();
      const pt = toLatLng(e);
      drawRef.current.points = [pt];
      drawRef.current.polyline = L.polyline([pt], {
        color: '#16a34a', weight: 2.5, dashArray: '6 3',
      }).addTo(map);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!drawing) return;
      const pt = toLatLng(e);
      drawRef.current.points.push(pt);
      drawRef.current.polyline?.addLatLng(pt);
    };

    const onMouseUp = () => {
      if (!drawing) return;
      drawing = false;
      map.dragging.enable();
      const pts = drawRef.current.points;
      if (pts.length < 3) { clearDraw(); return; }
      // Simplify: keep every Nth point to avoid too many vertices
      const step = Math.max(1, Math.floor(pts.length / 80));
      const simplified = pts.filter((_, i) => i % step === 0);
      drawRef.current.polyline?.remove();
      drawRef.current.polygon = L.polygon(simplified, {
        color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.12, weight: 2.5,
      }).addTo(map);
      onPolygonChange?.(simplified);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.style.cursor = '';
      map.dragging.enable();
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
      tileRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = { map, L };

      syncMarkers(map, L);
    });

    return () => {
      mapRef.current?.map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync markers whenever mappable listings change after map is ready
  useEffect(() => {
    if (!mapRef.current) return;
    const { map, L } = mapRef.current;
    syncMarkers(map, L);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappable.length]);

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
    return <div className="flex h-full items-center justify-center bg-gray-50 text-sm text-gray-500">No listings with location data to display</div>;
  }

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      {drawMode && (
        <div className="absolute left-1/2 top-3 z-[1000] -translate-x-1/2 rounded-full bg-green-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg pointer-events-none">
          Hold & drag to draw your search area
        </div>
      )}
      <div ref={containerRef} className="relative h-full w-full" />
    </>
  );
}
