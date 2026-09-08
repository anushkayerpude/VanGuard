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
import { PlanetDoodle, ShootingStarDoodle, GalaxySpiralDoodle } from '../Galaxy/GalaxyDoodles';

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

    // Dark twilight basemap
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

    // 1. ZONES & SECTOR BOUNDARIES (#806874 & Crimson Accents)
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
          color: '#c25975',
          weight: 1.5,
          dashArray: '6, 6',
          fillColor: '#c25975',
          fillOpacity: 0.08
        }
      ).bindTooltip('✦ RESTRICTED SECTOR 7', {
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
        color: '#b39ba8',
        weight: 1.2,
        dashArray: '4, 8',
        fillColor: '#806874',
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
      const color = isCritical ? '#c25975' : isHigh ? '#cfa07e' : '#b39ba8';

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
            isSelected ? 'scale-125 ring-2 ring-[#e5dce1] ring-offset-2 ring-offset-[#0c090b]' : ''
          }" style="background: rgba(24, 19, 22, 0.95); border: 2px solid ${color}; box-shadow: 0 0 12px ${color}80;">
            <div class="w-2 h-2 rounded-full" style="background: ${color}; ${
        isCritical ? 'animation: ping 1.5s infinite;' : ''
      }"></div>
          </div>
          <div class="absolute -bottom-4 text-[9px] font-mono font-bold px-1 rounded whitespace-nowrap bg-[#1a1317]/95 border border-[#806874]/60" style="color: ${color}; box-shadow: 0 0 8px rgba(128,104,116,0.3);">
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
    <div className="relative flex-1 w-full h-full bg-[#140f12]/88 border border-[#806874]/35 rounded-xl overflow-hidden flex flex-col shadow-[0_8px_32px_rgba(12,9,11,0.5)]">
      {/* Background Planet Doodle Watermark */}
      <div className="absolute top-14 right-4 pointer-events-none z-10 opacity-30">
        <PlanetDoodle size={56} />
      </div>

      {/* Top Floating Controls Omnibar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        {/* Omnibar Natural Language & Keyword Search with Shooting Star Doodle */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <div className="w-80">
            <OmniSearchBar />
          </div>
          <ShootingStarDoodle size={36} className="hidden sm:inline-block opacity-80" />
        </div>

        {/* Clean Layer Toggles (#806874 Mauve Glass) */}
        <div className="pointer-events-auto flex items-center space-x-1.5 bg-[#1a1317]/92 border border-[#806874]/40 backdrop-blur-xl px-2.5 py-1.5 rounded-lg shadow-lg">
          <button
            onClick={() => toggleLayer('alerts')}
            className={`px-2 py-1 rounded-md text-xs font-sans font-semibold transition flex items-center space-x-1 cursor-pointer ${
              layers.alerts
                ? 'bg-[#4a212b]/80 text-[#f5d0d8] border border-[#c25975]/60 shadow-[0_0_8px_rgba(194,89,117,0.3)]'
                : 'text-[#cfc0c8] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Alerts</span>
          </button>

          <button
            onClick={() => toggleLayer('weather')}
            className={`px-2 py-1 rounded-md text-xs font-sans font-semibold transition flex items-center space-x-1 cursor-pointer ${
              layers.weather
                ? 'bg-[#3b2a33]/80 text-[#e5dce1] border border-[#806874]/70 shadow-[0_0_8px_rgba(128,104,116,0.35)]'
                : 'text-[#cfc0c8] hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Weather</span>
          </button>

          <button
            onClick={() => toggleLayer('zones')}
            className={`px-2 py-1 rounded-md text-xs font-sans font-semibold transition flex items-center space-x-1 cursor-pointer ${
              layers.zones
                ? 'bg-[#2e231b]/80 text-[#faede3] border border-[#cfa07e]/60 shadow-[0_0_8px_rgba(207,160,126,0.3)]'
                : 'text-[#cfc0c8] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Zones</span>
          </button>
        </div>
      </div>

      {/* Map Surface */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full z-0" />

      {/* Selected Contact Inspector Drawer with Galaxy Spiral Doodle */}
      {selectedEvent && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-[#1a1317]/96 border border-[#806874]/55 backdrop-blur-xl rounded-xl p-3.5 shadow-[0_12px_40px_rgba(12,9,11,0.7)] animate-in fade-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between relative overflow-hidden">
            {/* Watermark Galaxy Spiral */}
            <div className="absolute right-40 -bottom-4 pointer-events-none opacity-20">
              <GalaxySpiralDoodle size={75} />
            </div>

            <div className="flex items-start space-x-3 z-10">
              <div
                className={`p-2 rounded-lg ${
                  selectedEvent.severity === 'critical'
                    ? 'bg-[#4a212b]/70 border border-[#c25975]/50 text-[#f5d0d8]'
                    : selectedEvent.severity === 'high'
                    ? 'bg-[#3b2a33]/70 border border-[#cfa07e]/50 text-[#faede3]'
                    : 'bg-[#2b2027]/70 border border-[#806874]/50 text-[#e5dce1]'
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
                        ? 'bg-[#3d1a24] text-[#f5d0d8] border border-[#c25975]/50'
                        : selectedEvent.severity === 'high'
                        ? 'bg-[#3b2a33] text-[#faede3] border border-[#cfa07e]/50'
                        : 'bg-[#2b2027] text-[#e5dce1] border border-[#806874]/50'
                    }`}
                  >
                    {selectedEvent.severity}
                  </span>
                  <span className="text-xs text-[#cfc0c8] font-mono">
                    Source: <strong className="text-[#e5dce1] uppercase">{selectedEvent.sourceType}</strong>
                  </span>
                  <span className="text-xs text-[#cfc0c8] font-mono">
                    Coords: {selectedEvent.location.lat.toFixed(3)}°N, {selectedEvent.location.lng.toFixed(3)}°E
                  </span>
                </div>

                <h4 className="font-sans font-semibold text-sm text-white mt-1">
                  {selectedEvent.title}
                </h4>
                <p className="text-xs text-[#cfc0c8] font-sans mt-0.5 max-w-3xl leading-relaxed">
                  {selectedEvent.description}
                </p>

                {/* Corroboration Tags */}
                {selectedEvent.corroboratedBy && selectedEvent.corroboratedBy.length > 0 && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-[11px] text-[#b39ba8] font-sans">Corroborated by:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedEvent.corroboratedBy.map((cid) => (
                        <button
                          key={cid}
                          onClick={() => selectEvent(cid)}
                          className="px-1.5 py-0.5 rounded bg-[#2c2228] hover:bg-[#3d2f37] border border-[#806874]/50 text-[10px] font-mono text-[#e5dce1] flex items-center space-x-1 transition cursor-pointer"
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
            <div className="flex items-center space-x-3 z-10">
              <div className="text-right">
                <div className="text-xs text-[#b39ba8] font-mono">Confidence</div>
                <div className="text-xl font-bold font-mono text-[#e5dce1] mauve-glow">
                  {selectedEvent.confidence}%
                </div>
              </div>

              <button
                onClick={() => openExplainability(selectedEvent.id)}
                className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-[#806874] to-[#5e4b55] hover:from-[#957b88] hover:to-[#6d5863] text-white font-sans font-bold text-xs rounded-lg shadow-[0_0_12px_rgba(128,104,116,0.4)] transition cursor-pointer"
                title="View mathematical confidence breakdown"
              >
                <Calculator className="w-4 h-4" />
                <span>Explain Math</span>
              </button>

              <button
                onClick={() => selectEvent(null)}
                className="p-1 hover:bg-[#2f242b] text-[#cfc0c8] hover:text-white rounded cursor-pointer"
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
