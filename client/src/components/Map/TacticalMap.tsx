import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useEventStore } from '../../store/useEventStore';
import {
  Shield,
  Layers,
  Wind,
  Radio,
  X,
  Calculator,
  ExternalLink
} from 'lucide-react';
import { OmniSearchBar } from '../Header/OmniSearchBar';

export const TacticalMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const events = useEventStore((s) => s.events);
  const selectedEventId = useEventStore((s) => s.selectedEventId);
  const selectEvent = useEventStore((s) => s.selectEvent);
  const openExplainability = useEventStore((s) => s.openExplainability);
  const layers = useEventStore((s) => s.layers);
  const toggleLayer = useEventStore((s) => s.toggleLayer);
  const filters = useEventStore((s) => s.filters);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [23.03, 72.57],
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
      minZoom: 7,
      maxZoom: 16
    });

    // High-contrast defense basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Elements on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    group.clearLayers();

    // 1. ZONES & SECTOR BOUNDARIES (Tactical Red & Cyan lines)
    if (layers.zones) {
      const restrictedZone = L.polygon(
        [
          [23.18, 72.48],
          [23.22, 72.65],
          [23.12, 72.72],
          [23.02, 72.58],
          [23.08, 72.45]
        ],
        {
          color: '#ef4444',
          weight: 1.8,
          dashArray: '6, 6',
          fillColor: '#ef4444',
          fillOpacity: 0.08
        }
      ).bindTooltip('RESTRICTED AIRSPACE SECTOR 7', {
        permanent: true,
        direction: 'center',
        className: 'tactical-tooltip'
      });
      group.addLayer(restrictedZone);
    }

    // 2. WEATHER LAYER
    if (layers.weather) {
      const weatherCircle = L.circle([23.15, 72.55], {
        radius: 12000,
        color: '#38bdf8',
        weight: 1.2,
        dashArray: '4, 8',
        fillColor: '#0284c7',
        fillOpacity: 0.1
      }).bindTooltip('LIVE WEATHER OVERLAY: Wind 14kt NW, Visibility 10km', {
        direction: 'top',
        className: 'tactical-tooltip'
      });
      group.addLayer(weatherCircle);
    }

    // 3. FUSED CONTACTS & OBSERVATIONS
    events.forEach((evt) => {
      if (!filters.sourceTypes.includes(evt.sourceType)) return;
      if (!filters.severities.includes(evt.severity)) return;
      if (evt.confidence < filters.minConfidence) return;
      if (filters.showAnomaliesOnly && !evt.isAnomaly) return;

      const isSelected = evt.id === selectedEventId;
      const isCritical = evt.severity === 'critical';
      const isHigh = evt.severity === 'high';
      const color = isCritical ? '#ef4444' : isHigh ? '#f59e0b' : '#38bdf8';

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
            isSelected ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#070a0e]' : ''
          }" style="background: rgba(12, 18, 27, 0.95); border: 2px solid ${color}; box-shadow: 0 0 12px ${color}80;">
            <div class="w-2 h-2 rounded-full" style="background: ${color}; ${
        isCritical ? 'animation: ping 1.5s infinite;' : ''
      }"></div>
          </div>
          <div class="absolute -bottom-4 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md whitespace-nowrap bg-[#0b1017]/95 border border-slate-700/80" style="color: ${color}; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
            ${evt.id} (${evt.confidence}%)
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-contact-marker',
        html: markerHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([evt.location.lat, evt.location.lng], { icon });

      marker.on('click', () => {
        selectEvent(evt.id);
      });

      group.addLayer(marker);
    });
  }, [events, layers, selectedEventId, filters]);

  // Pan to selected event smoothly
  useEffect(() => {
    if (selectedEvent && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([selectedEvent.location.lat, selectedEvent.location.lng], {
        animate: true,
        duration: 0.5
      });
    }
  }, [selectedEventId]);

  return (
    <div className="relative flex-1 w-full h-full bg-[#0b1017]/90 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
      {/* Top Floating Controls Omnibar (Spacious layout with rounded pills) */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between pointer-events-none">
        {/* Omnibar Natural Language & Keyword Search */}
        <div className="w-84 pointer-events-auto">
          <OmniSearchBar />
        </div>

        {/* Clean Layer Toggles in Rounded Defense Glass */}
        <div className="pointer-events-auto flex items-center space-x-2 bg-[#0c131c]/92 border border-slate-700/70 backdrop-blur-xl px-3 py-1.5 rounded-xl shadow-lg">
          <button
            onClick={() => toggleLayer('alerts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
              layers.alerts
                ? 'bg-red-500/20 text-red-300 border border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Alerts</span>
          </button>

          <button
            onClick={() => toggleLayer('weather')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
              layers.weather
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Weather</span>
          </button>

          <button
            onClick={() => toggleLayer('zones')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
              layers.zones
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Zones</span>
          </button>
        </div>
      </div>

      {/* Map Surface */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full z-0" />

      {/* Selected Contact Inspector Drawer (Rounded-2xl with Ample Breathing Room) */}
      {selectedEvent && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-[#0c131c]/96 border border-slate-700/80 backdrop-blur-2xl rounded-2xl p-5 shadow-[0_16px_50px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-xl ${
                  selectedEvent.severity === 'critical'
                    ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                    : selectedEvent.severity === 'high'
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                }`}
              >
                <Radio className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono font-bold text-sm text-white">
                    {selectedEvent.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      selectedEvent.severity === 'critical'
                        ? 'bg-red-950 text-red-300 border border-red-500/40'
                        : selectedEvent.severity === 'high'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    {selectedEvent.severity}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Source: <strong className="text-cyan-300 uppercase">{selectedEvent.sourceType}</strong>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Coords: {selectedEvent.location.lat.toFixed(3)}°N, {selectedEvent.location.lng.toFixed(3)}°E
                  </span>
                </div>

                <h4 className="font-sans font-semibold text-base text-white">
                  {selectedEvent.title}
                </h4>
                <p className="text-xs text-slate-300 font-sans max-w-3xl leading-relaxed">
                  {selectedEvent.description}
                </p>

                {/* Corroboration Tags */}
                {selectedEvent.corroboratedBy && selectedEvent.corroboratedBy.length > 0 && (
                  <div className="flex items-center space-x-2 pt-1">
                    <span className="text-[11px] text-slate-400 font-sans">Corroborated by:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEvent.corroboratedBy.map((cid) => (
                        <button
                          key={cid}
                          onClick={() => selectEvent(cid)}
                          className="px-2 py-0.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[10px] font-mono text-cyan-300 flex items-center space-x-1.5 transition cursor-pointer"
                        >
                          <span>{cid}</span>
                          <ExternalLink className="w-3 h-3 text-cyan-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Confidence Score & Explainability Button */}
            <div className="flex items-center space-x-4 shrink-0">
              <div className="text-right">
                <div className="text-xs text-slate-400 font-mono">Confidence</div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {selectedEvent.confidence}%
                </div>
              </div>

              <button
                onClick={() => openExplainability(selectedEvent.id)}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-sans font-bold text-xs rounded-xl shadow-[0_0_14px_rgba(0,240,255,0.3)] transition cursor-pointer"
                title="View mathematical confidence breakdown"
              >
                <Calculator className="w-4 h-4" />
                <span>Explain Math</span>
              </button>

              <button
                onClick={() => selectEvent(null)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
