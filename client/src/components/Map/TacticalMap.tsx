import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useEventStore } from '../../store/useEventStore';
import {
  Shield,
  Layers,
  Wind,
  AlertTriangle,
  Radio,
  X,
  Calculator,
  Zap,
  Info,
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
      center: [23.03, 72.57], // Focused on operational theatre
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
      minZoom: 7,
      maxZoom: 16
    });

    // Dark high-contrast tactical basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
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

    // 1. ZONES & SECTOR BOUNDARIES
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
          weight: 1.5,
          dashArray: '6, 6',
          fillColor: '#ef4444',
          fillOpacity: 0.05
        }
      ).bindTooltip('RESTRICTED SECTOR 7', {
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
        color: '#06b6d4',
        weight: 1,
        dashArray: '4, 8',
        fillColor: '#06b6d4',
        fillOpacity: 0.06
      }).bindTooltip('LIVE WEATHER OVERLAY: Wind 14kt NW, Visibility 10km', {
        direction: 'top',
        className: 'tactical-tooltip'
      });
      group.addLayer(weatherCircle);
    }

    // 3. FUSED CONTACTS & OBSERVATIONS
    events.forEach((evt) => {
      // Filter matching
      if (!filters.sourceTypes.includes(evt.sourceType)) return;
      if (!filters.severities.includes(evt.severity)) return;
      if (evt.confidence < filters.minConfidence) return;
      if (filters.showAnomaliesOnly && !evt.isAnomaly) return;

      const isSelected = evt.id === selectedEventId;
      const isCritical = evt.severity === 'critical';
      const isHigh = evt.severity === 'high';
      const color = isCritical ? '#ef4444' : isHigh ? '#f59e0b' : '#06b6d4';

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
            isSelected ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black' : ''
          }" style="background: rgba(15, 23, 42, 0.9); border: 2px solid ${color};">
            <div class="w-2 h-2 rounded-full" style="background: ${color}; ${
        isCritical ? 'animation: ping 1.5s infinite;' : ''
      }"></div>
          </div>
          <div class="absolute -bottom-4 text-[9px] font-mono font-bold px-1 rounded whitespace-nowrap bg-black/90 border border-slate-700" style="color: ${color};">
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
    <div className="relative flex-1 w-full h-full bg-[#03070d] border border-cyan-500/30 rounded-lg overflow-hidden flex flex-col">
      {/* Top Floating Controls Omnibar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        {/* Omnibar Natural Language & Keyword Search */}
        <div className="w-80 pointer-events-auto">
          <OmniSearchBar />
        </div>

        {/* Clean Layer Toggles */}
        <div className="pointer-events-auto flex items-center space-x-1.5 bg-[#060c14]/90 border border-cyan-500/40 backdrop-blur-md px-2.5 py-1.5 rounded-lg shadow-lg">
          <button
            onClick={() => toggleLayer('alerts')}
            className={`px-2 py-1 rounded text-xs font-sans font-semibold transition flex items-center space-x-1 ${
              layers.alerts
                ? 'bg-red-500/20 text-red-300 border border-red-500/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Alerts</span>
          </button>

          <button
            onClick={() => toggleLayer('weather')}
            className={`px-2 py-1 rounded text-xs font-sans font-semibold transition flex items-center space-x-1 ${
              layers.weather
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Weather</span>
          </button>

          <button
            onClick={() => toggleLayer('zones')}
            className={`px-2 py-1 rounded text-xs font-sans font-semibold transition flex items-center space-x-1 ${
              layers.zones
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60'
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

      {/* Selected Contact Inspector Drawer */}
      {selectedEvent && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-[#070e17]/95 border border-cyan-500/50 backdrop-blur-md rounded-lg p-3.5 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div
                className={`p-2 rounded-md ${
                  selectedEvent.severity === 'critical'
                    ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                    : selectedEvent.severity === 'high'
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                }`}
              >
                <Radio className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-sm text-white">
                    {selectedEvent.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      selectedEvent.severity === 'critical'
                        ? 'bg-red-950 text-red-400 border border-red-500/40'
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

                <h4 className="font-sans font-semibold text-sm text-slate-100 mt-1">
                  {selectedEvent.title}
                </h4>
                <p className="text-xs text-slate-300 font-sans mt-0.5 max-w-3xl leading-relaxed">
                  {selectedEvent.description}
                </p>

                {/* Corroboration Tags */}
                {selectedEvent.corroboratedBy && selectedEvent.corroboratedBy.length > 0 && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-[11px] text-slate-400 font-sans">Corroborated by:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedEvent.corroboratedBy.map((cid) => (
                        <button
                          key={cid}
                          onClick={() => selectEvent(cid)}
                          className="px-1.5 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 flex items-center space-x-1 transition"
                        >
                          <span>{cid}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Confidence Score & Explainability Button */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xs text-slate-400 font-mono">Confidence</div>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  {selectedEvent.confidence}%
                </div>
              </div>

              <button
                onClick={() => openExplainability(selectedEvent.id)}
                className="flex items-center space-x-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-sans font-bold text-xs rounded-md shadow-md transition"
                title="View mathematical confidence breakdown"
              >
                <Calculator className="w-4 h-4" />
                <span>Explain Math</span>
              </button>

              <button
                onClick={() => selectEvent(null)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
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
