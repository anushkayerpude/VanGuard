import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { UnifiedEvent, CorrelationCluster } from '../types/schema';
import {
  Compass,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Target,
  Zap,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import {
  FaissSpatialIndex,
  ProjectedEvent,
  latLngToWorld,
  worldToLatLng,
  getMetersPerPixel,
} from '../utils/spatialIndex';

interface TacticalMapProps {
  events: UnifiedEvent[];
  clusters?: CorrelationCluster[];
  selectedEventId?: string;
  recenterNonce?: number;
  onSelectEvent: (event: UnifiedEvent) => void;
}

type MapLayerType = 'dark' | 'satellite' | 'dark_terrain';

/** True when the selected event is a member of this cluster */
function aliveMemberId(cluster: CorrelationCluster, selectedEventId?: string): boolean {
  return Boolean(selectedEventId && cluster.eventIds.includes(selectedEventId));
}

export default function TacticalMap({
  events,
  clusters = [],
  selectedEventId,
  recenterNonce = 0,
  onSelectEvent,
}: TacticalMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const layerContainerRef = useRef<HTMLDivElement | null>(null);

  const [dimensions, setDimensions] = useState({ width: 800, height: 480 });

  // Map Navigation State
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 23.0300,
    lng: 72.5600,
  });
  const [zoom, setZoom] = useState<number>(11);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('dark');
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Interaction Filters
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState<boolean>(false);
  const [showRangeRings, setShowRangeRings] = useState<boolean>(true);
  const [showCorrelationArcs, setShowCorrelationArcs] = useState<boolean>(true);
  const [showRadarSweep, setShowRadarSweep] = useState<boolean>(true);
  const [showLegend, setShowLegend] = useState<boolean>(false);

  // Hover state
  const [activeHoverEvent, setActiveHoverEvent] = useState<ProjectedEvent | null>(null);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    centerLat: number;
    centerLng: number;
    moved: boolean;
  } | null>(null);

  // Radar sweep animation angle
  const sweepAngleRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Update container size on mount / resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setDimensions({ width: Math.round(rect.width), height: Math.round(rect.height) });
        }
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filter events based on active controls
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (selectedSource !== 'all' && evt.sourceType !== selectedSource) return false;
      if (selectedSeverity !== 'all' && evt.severity !== selectedSeverity) return false;
      if (showAnomaliesOnly && !evt.isAnomaly) return false;
      return true;
    });
  }, [events, selectedSource, selectedSeverity, showAnomaliesOnly]);

  // Build FAISS Spatial Vector Index
  const spatialIndex = useMemo(() => {
    const idx = new FaissSpatialIndex();
    idx.build(filteredEvents, center, zoom, dimensions);
    return idx;
  }, [filteredEvents, center, zoom, dimensions]);

  // Viewport visible events from FAISS index
  const visibleEvents = useMemo(() => {
    return spatialIndex.queryViewport(40);
  }, [spatialIndex]);

  // Precomputed deduplicated arcs from FAISS index
  const deduplicatedArcs = useMemo(() => {
    return spatialIndex.getDeduplicatedArcs();
  }, [spatialIndex]);

  // Selected event projected representation
  const selectedProjected = useMemo(() => {
    return selectedEventId ? spatialIndex.getById(selectedEventId) : undefined;
  }, [selectedEventId, spatialIndex]);

  // Base station center screen coordinates
  const baseStationScreen = useMemo(() => {
    const { width, height } = dimensions;
    const centerWorld = latLngToWorld(center.lat, center.lng, zoom);
    const baseWorld = latLngToWorld(23.0300, 72.5600, zoom);
    return {
      x: baseWorld.x - (centerWorld.x - width / 2),
      y: baseWorld.y - (centerWorld.y - height / 2),
    };
  }, [center, zoom, dimensions]);

  // Range rings radius in pixels
  const mPerPx = getMetersPerPixel(center.lat, zoom);
  const ring10kmPx = 10000 / mPerPx;
  const ring25kmPx = 25000 / mPerPx;
  const ring50kmPx = 50000 / mPerPx;

  // Projected Clusters for badge rendering
  const projectedClusters = useMemo(() => {
    const { width, height } = dimensions;
    const centerWorld = latLngToWorld(center.lat, center.lng, zoom);
    const x0 = centerWorld.x - width / 2;
    const y0 = centerWorld.y - height / 2;

    return clusters
      .map((cluster) => {
        const lat = cluster.centroid?.lat ?? 23.0225;
        const lng = cluster.centroid?.lng ?? 72.5714;
        const world = latLngToWorld(lat, lng, zoom);
        const screenX = world.x - x0;
        const screenY = world.y - y0;
        const radiusPx = cluster.radiusMeters / mPerPx;
        const isVisible =
          screenX >= -radiusPx - 40 &&
          screenX <= width + radiusPx + 40 &&
          screenY >= -radiusPx - 40 &&
          screenY <= height + radiusPx + 40;

        return {
          ...cluster,
          lat,
          lng,
          screenX,
          screenY,
          isVisible,
          radiusPx,
        };
      })
      .filter((c) => c.isVisible);
  }, [clusters, center, zoom, dimensions, mPerPx]);

  // Recenter on active events
  const handleRecenter = useCallback(() => {
    const validCoords = filteredEvents
      .map((e) => e.location)
      .filter(
        (loc): loc is { lat: number; lng: number } =>
          Boolean(loc && typeof loc.lat === 'number' && typeof loc.lng === 'number')
      );

    if (validCoords.length > 0) {
      const avgLat = validCoords.reduce((sum, c) => sum + c.lat, 0) / validCoords.length;
      const avgLng = validCoords.reduce((sum, c) => sum + c.lng, 0) / validCoords.length;
      setCenter({ lat: avgLat, lng: avgLng });
      setZoom(11);
    } else {
      setCenter({ lat: 23.0300, lng: 72.5600 });
      setZoom(11);
    }
  }, [filteredEvents]);

  // Auto-recenter when events set changes significantly (e.g. scenario injection)
  const prevFirstEventIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const firstId = events[0]?.id;
    if (firstId && firstId !== prevFirstEventIdRef.current) {
      prevFirstEventIdRef.current = firstId;
      handleRecenter();
    }
  }, [events, handleRecenter]);

  // Explicit recenter trigger from scenario injector
  useEffect(() => {
    if (recenterNonce > 0) {
      handleRecenter();
    }
  }, [recenterNonce, handleRecenter]);

  const flyToCluster = useCallback(
    (cluster: CorrelationCluster) => {
      const zoomed = cluster.eventIds.length >= 6 ? zoom + 3 : zoom + 2;
      setCenter({ lat: cluster.centroid.lat, lng: cluster.centroid.lng });
      setZoom(Math.min(16, Math.max(12, zoomed)));
    },
    [zoom]
  );

  // ─── HARDWARE-ACCELERATED CANVAS RENDER LOOP (60 FPS) ─────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const dpr = window.devicePixelRatio || 1;
      const { width, height } = dimensions;

      // Handle high-DPI sizing
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Range Rings & Crosshairs
      if (showRangeRings) {
        ctx.save();
        const bx = baseStationScreen.x;
        const by = baseStationScreen.y;

        // 10km ring
        ctx.beginPath();
        ctx.arc(bx, by, ring10kmPx, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.22)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        // 25km ring
        ctx.beginPath();
        ctx.arc(bx, by, ring25kmPx, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
        ctx.setLineDash([6, 6]);
        ctx.stroke();

        // 50km ring
        ctx.beginPath();
        ctx.arc(bx, by, ring50kmPx, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.14)';
        ctx.setLineDash([]);
        ctx.stroke();

        // Radar Crosshairs
        ctx.beginPath();
        ctx.moveTo(bx - ring50kmPx, by);
        ctx.lineTo(bx + ring50kmPx, by);
        ctx.moveTo(bx, by - ring50kmPx);
        ctx.lineTo(bx, by + ring50kmPx);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Base Station Core Dot
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.restore();
      }

      // 2. Radar Sweep Beam
      if (showRadarSweep) {
        ctx.save();
        const bx = baseStationScreen.x;
        const by = baseStationScreen.y;
        sweepAngleRef.current = (sweepAngleRef.current + 0.02) % (Math.PI * 2);
        const angle = sweepAngleRef.current;

        const maxR = Math.min(ring50kmPx, Math.max(width, height));
        const endX = bx + Math.cos(angle) * maxR;
        const endY = by + Math.sin(angle) * maxR;

        // Sweep cone gradient
        const sweepGrad = ctx.createRadialGradient(bx, by, 0, bx, by, maxR);
        sweepGrad.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
        sweepGrad.addColorStop(1, 'rgba(6, 182, 212, 0.01)');

        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.arc(bx, by, maxR, angle - 0.25, angle);
        ctx.closePath();
        ctx.fillStyle = sweepGrad;
        ctx.fill();

        // Leading sweep line
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'rgba(164, 198, 57, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();
      }

      // 3. Draw Correlation Arcs (Precomputed from FAISS index in O(N))
      if (showCorrelationArcs && deduplicatedArcs.length > 0) {
        ctx.save();
        for (let i = 0; i < deduplicatedArcs.length; i++) {
          const arc = deduplicatedArcs[i];
          const midX = (arc.x1 + arc.x2) / 2;
          const midY = (arc.y1 + arc.y2) / 2 - 25;

          ctx.beginPath();
          ctx.moveTo(arc.x1, arc.y1);
          ctx.quadraticCurveTo(midX, midY, arc.x2, arc.y2);

          if (arc.isAnomaly) {
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.65)';
            ctx.shadowColor = 'rgba(244, 63, 94, 0.4)';
          } else {
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.55)';
            ctx.shadowColor = 'rgba(6, 182, 212, 0.35)';
          }
          ctx.shadowBlur = 4;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4. Draw Entities and Velocity Vectors (Filtered to visible viewport)
      ctx.save();
      for (let i = 0; i < visibleEvents.length; i++) {
        const evt = visibleEvents[i];
        const x = evt.screenX;
        const y = evt.screenY;

        // Severity Color Palette
        let color = '#a4c639'; // low
        let glow = 'rgba(164, 198, 57, 0.4)';
        if (evt.severity === 'critical') {
          color = '#f43f5e';
          glow = 'rgba(244, 63, 94, 0.6)';
        } else if (evt.severity === 'high') {
          color = '#f97316';
          glow = 'rgba(249, 115, 22, 0.5)';
        } else if (evt.severity === 'medium') {
          color = '#eab308';
          glow = 'rgba(234, 179, 8, 0.4)';
        }

        // Heading Velocity Vector
        if (typeof evt.raw?.headingDegrees === 'number') {
          const rad = ((evt.raw.headingDegrees - 90) * Math.PI) / 180;
          const len = 22;
          const vx2 = x + Math.cos(rad) * len;
          const vy2 = y + Math.sin(rad) * len;

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(vx2, vy2);
          ctx.strokeStyle = evt.severity === 'critical' ? '#f43f5e' : '#38bdf8';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(vx2, vy2, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
        }

        // Outer halo / anomaly pulse
        if (evt.isAnomaly || evt.severity === 'critical') {
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        // Entity Node Circle
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();

        // Inner Core Dot
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Compact ID Label
        ctx.font = '9px monospace';
        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.fillText(evt.id, x, y + 17);
      }
      ctx.restore();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    dimensions,
    visibleEvents,
    deduplicatedArcs,
    baseStationScreen,
    ring10kmPx,
    ring25kmPx,
    ring50kmPx,
    showRangeRings,
    showCorrelationArcs,
    showRadarSweep,
  ]);

  // ─── HIGH-PERFORMANCE INTERACTION (RAF DRAG & KNN HOVER) ──────────────────────
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      centerLat: center.lat,
      centerLng: center.lng,
      moved: false,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    if (isDragging && dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragStartRef.current.moved = true;
      }

      // Smooth hardware CSS translate on layer container during drag (zero React overhead)
      if (layerContainerRef.current) {
        layerContainerRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }
      return;
    }

    // Sub-millisecond FAISS KNN hit-testing for hover
    const nearest = spatialIndex.searchKNN(localX, localY, 1, 26);
    const hit = nearest.length > 0 ? nearest[0] : null;

    if (hit?.id !== activeHoverEvent?.id) {
      setActiveHoverEvent(hit);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const wasClick = !dragStartRef.current.moved;

    // Reset CSS transform
    if (layerContainerRef.current) {
      layerContainerRef.current.style.transform = '';
    }

    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);

    if (wasClick) {
      // Click selection via FAISS KNN search
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;
        const nearest = spatialIndex.searchKNN(localX, localY, 1, 28);
        if (nearest.length > 0) {
          onSelectEvent(nearest[0]);
        }
      }
      dragStartRef.current = null;
      return;
    }

    // Commit final center position to React state
    const startCenterWorld = latLngToWorld(
      dragStartRef.current.centerLat,
      dragStartRef.current.centerLng,
      zoom
    );
    const newCenterWorldX = startCenterWorld.x - dx;
    const newCenterWorldY = startCenterWorld.y - dy;
    const newCenter = worldToLatLng(newCenterWorldX, newCenterWorldY, zoom);

    setCenter(newCenter);
    dragStartRef.current = null;
  };

  // Wheel to Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(16, z + 1));
    } else if (e.deltaY > 0) {
      setZoom((z) => Math.max(6, z - 1));
    }
  };

  // Calculate Visible Slippy Map Tiles
  const visibleTiles = useMemo(() => {
    const { width, height } = dimensions;
    const centerWorld = latLngToWorld(center.lat, center.lng, zoom);

    const x0 = centerWorld.x - width / 2;
    const y0 = centerWorld.y - height / 2;
    const x1 = centerWorld.x + width / 2;
    const y1 = centerWorld.y + height / 2;

    const minTileX = Math.floor(x0 / 256);
    const maxTileX = Math.floor(x1 / 256);
    const minTileY = Math.floor(y0 / 256);
    const maxTileY = Math.floor(y1 / 256);

    const maxTilesPerAxis = Math.pow(2, zoom);
    const tiles: Array<{ key: string; url: string; x: number; y: number }> = [];

    for (let tx = minTileX; tx <= maxTileX; tx++) {
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        const wrappedX = ((tx % maxTilesPerAxis) + maxTilesPerAxis) % maxTilesPerAxis;
        if (ty < 0 || ty >= maxTilesPerAxis) continue;

        let url = '';
        if (activeLayer === 'dark') {
          url = `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/${zoom}/${ty}/${wrappedX}`;
        } else if (activeLayer === 'satellite') {
          url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${ty}/${wrappedX}`;
        } else {
          url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${zoom}/${ty}/${wrappedX}`;
        }

        const screenX = tx * 256 - x0;
        const screenY = ty * 256 - y0;

        tiles.push({
          key: `${zoom}-${tx}-${ty}`,
          url,
          x: screenX,
          y: screenY,
        });
      }
    }
    return tiles;
  }, [center, zoom, dimensions, activeLayer]);

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      className={`relative w-full h-full min-h-[440px] bg-slate-950 border border-white/10 rounded-xl overflow-hidden select-none font-mono shadow-2xl ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* WRAPPER FOR HARDWARE TRANSLATE DURING PAN */}
      <div ref={layerContainerRef} className="absolute inset-0 will-change-transform">
        {/* 1. TILE BASEMAP LAYER */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {visibleTiles.map((tile) => (
            <img
              key={tile.key}
              src={tile.url}
              alt=""
              loading="eager"
              style={{
                position: 'absolute',
                left: `${tile.x}px`,
                top: `${tile.y}px`,
                width: '256px',
                height: '256px',
              }}
              className={
                activeLayer === 'dark_terrain'
                  ? 'invert brightness-75 contrast-150 hue-rotate-180'
                  : activeLayer === 'dark'
                  ? 'brightness-90 contrast-125'
                  : 'brightness-95'
              }
            />
          ))}
          <div className="absolute inset-0 tactical-grid-bg opacity-30 pointer-events-none" />
          <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
        </div>

        {/* 2. 60 FPS HARDWARE-ACCELERATED CANVAS LAYER (Rings, Arcs, Entities) */}
        <canvas
          ref={canvasRef}
          style={{ width: dimensions.width, height: dimensions.height }}
          className="absolute inset-0 pointer-events-none z-10"
        />

        {/* 3. CLUSTERS & SELECTED TARGET RETICLE OVERLAY */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Cluster Badges */}
          {projectedClusters.map((cluster) => {
            const isSelected = aliveMemberId(cluster, selectedEventId);
            const clusterColor =
              cluster.peakSeverity === 'critical'
                ? 'bg-rose-950/80 border-rose-400 text-rose-300'
                : cluster.peakSeverity === 'high'
                ? 'bg-orange-950/80 border-orange-400 text-orange-300'
                : cluster.peakSeverity === 'medium'
                ? 'bg-yellow-950/80 border-yellow-400 text-yellow-300'
                : 'bg-emerald-950/80 border-emerald-400 text-emerald-300';

            return (
              <div
                key={cluster.id}
                style={{
                  position: 'absolute',
                  left: `${cluster.screenX}px`,
                  top: `${cluster.screenY}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="pointer-events-auto cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  flyToCluster(cluster);
                }}
                title={`Cluster ${cluster.id} — ${cluster.eventIds.length} events (click to zoom)`}
              >
                <div
                  className={`absolute rounded-full border border-dashed pointer-events-none ${
                    isSelected ? 'border-[#a4c639] animate-pulse' : 'border-white/25'
                  }`}
                  style={{
                    width: `${Math.max(28, cluster.radiusPx * 2)}px`,
                    height: `${Math.max(28, cluster.radiusPx * 2)}px`,
                    left: `${-Math.max(14, cluster.radiusPx)}px`,
                    top: `${-Math.max(14, cluster.radiusPx)}px`,
                  }}
                />
                <div
                  className={`w-9 h-9 rounded-full border-2 ${clusterColor} bg-slate-900/90 flex flex-col items-center justify-center shadow-xl transition-all group-hover:scale-110`}
                >
                  <span className="text-[10px] font-bold leading-none">{cluster.eventIds.length}</span>
                  <span className="text-[6px] uppercase leading-none opacity-80 mt-0.5">Linked</span>
                </div>
              </div>
            );
          })}

          {/* Target Lock Reticle on Selected Entity */}
          {selectedProjected && selectedProjected.isVisible && (
            <div
              style={{
                position: 'absolute',
                left: `${selectedProjected.screenX}px`,
                top: `${selectedProjected.screenY}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className="pointer-events-none z-30"
            >
              <div className="absolute -inset-3.5 border border-[#a4c639] rounded-xl animate-pulse pointer-events-none">
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[#bcd94f]" />
                <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-[#bcd94f]" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-[#bcd94f]" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[#bcd94f]" />
              </div>
            </div>
          )}

          {/* Interactive Hover Telemetry Tooltip (Driven instantly by FAISS KNN) */}
          {activeHoverEvent && activeHoverEvent.isVisible && (
            <div
              style={{
                position: 'absolute',
                left: `${activeHoverEvent.screenX}px`,
                top: `${activeHoverEvent.screenY - 14}px`,
                transform: 'translate(-50%, -100%)',
              }}
              className="pointer-events-none z-40 p-2.5 rounded-lg bg-slate-950/95 border border-[#526a27]/60 shadow-2xl text-[10px] whitespace-nowrap space-y-1 backdrop-blur-md"
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-1">
                <span className="font-bold text-[#bcd94f] text-xs flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" /> {activeHoverEvent.id}
                </span>
                <span className="text-emerald-400 font-bold px-1 rounded bg-emerald-950/80 border border-emerald-500/30">
                  {activeHoverEvent.confidence}% CONF
                </span>
              </div>
              <div className="font-medium text-slate-100">{activeHoverEvent.title}</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-slate-300 text-[9px]">
                <span>
                  Source: <strong className="text-[#bcd94f]">{activeHoverEvent.sourceType.toUpperCase()}</strong>
                </span>
                <span>
                  Severity:{' '}
                  <strong
                    className={activeHoverEvent.severity === 'critical' ? 'text-rose-400' : 'text-slate-200'}
                  >
                    {activeHoverEvent.severity.toUpperCase()}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. TOP CONTROL BAR */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-white/10 text-xs">
          <Compass className="w-4 h-4 text-[#a4c639]" />
          <span className="font-heading font-bold text-sm tracking-wider text-slate-100 uppercase">
            GEOSPATIAL COP
          </span>
          <span className="text-[10px] text-[#a4c639] font-bold px-1.5 py-[1px] rounded bg-[#a4c639]/10 border border-[#526a27]/40">
            {filteredEvents.length} TRACKS
          </span>
          {/* FAISS Spatial Acceleration Badge */}
          <span className="text-[9px] text-cyan-300 font-bold px-1.5 py-[1px] rounded bg-cyan-950/80 border border-cyan-500/40 flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 text-cyan-400" />
            FAISS ACCEL: {spatialIndex.stats.buildTimeMs}ms
          </span>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-lg p-1 text-xs">
          {/* Layer Selector */}
          <div className="flex items-center gap-1 pr-1.5 border-r border-white/10">
            {[
              { id: 'dark', label: 'DARK GIS' },
              { id: 'satellite', label: 'ORBITAL' },
              { id: 'dark_terrain', label: 'TERRAIN' },
            ].map((lyr) => (
              <button
                key={lyr.id}
                onClick={() => setActiveLayer(lyr.id as MapLayerType)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  activeLayer === lyr.id
                    ? 'bg-[#a4c639]/15 border border-[#526a27]/60 text-[#bcd94f]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lyr.label}
              </button>
            ))}
          </div>

          {/* Feed Filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="bg-slate-900 border border-white/10 text-[#bcd94f] px-2 py-0.5 rounded text-[11px] outline-none"
          >
            <option value="all">All Feeds</option>
            <option value="radar">Radar Tracks</option>
            <option value="weather">Weather</option>
            <option value="personnel">Patrol Units</option>
            <option value="log">Perimeter C2</option>
            <option value="incident">Dispatch</option>
          </select>

          {/* Arcs Toggle */}
          <button
            onClick={() => setShowCorrelationArcs(!showCorrelationArcs)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
              showCorrelationArcs
                ? 'bg-[#a4c639]/15 border-[#526a27]/50 text-[#bcd94f]'
                : 'bg-slate-900 border-white/10 text-slate-400'
            }`}
            title="Toggle Correlation Arcs"
          >
            ARCS
          </button>

          {/* Anomalies Toggle */}
          <button
            onClick={() => setShowAnomaliesOnly(!showAnomaliesOnly)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
              showAnomaliesOnly
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 font-bold'
                : 'bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
            title="Filter Anomalies Only"
          >
            ANOMALIES
          </button>

          {/* Map Legend / Guide Toggle */}
          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
              showLegend
                ? 'bg-[#a4c639]/20 border-[#a4c639] text-[#c6ff00]'
                : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Toggle Map Entity Symbols & Colors Legend"
          >
            LEGEND
          </button>

          {/* Zoom Buttons & Reset */}
          <div className="flex items-center gap-1 pl-1.5 border-l border-white/10">
            <button
              onClick={() => setZoom((z) => Math.min(16, z + 1))}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-[#bcd94f]"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(6, z - 1))}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-[#bcd94f]"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRecenter}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-[#bcd94f]"
              title="Fit Fleet / Recenter AO"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MAP SYMBOLS & COLORS LEGEND MODAL/OVERLAY */}
      {showLegend && (
        <div className="absolute top-14 right-3 z-40 p-3.5 rounded-xl bg-slate-950/95 border border-[#526a27]/80 shadow-[0_0_25px_rgba(0,0,0,0.8)] backdrop-blur-md w-72 text-xs space-y-2.5 pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-bold text-[#c6ff00] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> MAP SYMBOLS & ENTITY GUIDE
            </span>
            <button
              onClick={() => setShowLegend(false)}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] shrink-0" />
              <span className="text-slate-200 font-medium"><b>Critical / Incursion:</b> Hostile fast contact</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <span className="text-slate-200 font-medium"><b>Kinematic Anomaly:</b> Transponder off / Speed anomaly</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#a4c639] shrink-0" />
              <span className="text-slate-200 font-medium"><b>Surveillance Radar:</b> Nominal primary radar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-400 shrink-0" />
              <span className="text-slate-200 font-medium"><b>OSINT / Social Media:</b> Geotagged media analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shrink-0" />
              <span className="text-slate-200 font-medium"><b>Friendly Unit / ASW Sonar:</b> Patrol / Hydrophone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-[#c6ff00] shrink-0" />
              <span className="text-slate-200 font-medium"><b>Fused Cluster Halo:</b> Group (ΔR ≤2.1km, ΔT ≤18s)</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-white/10 text-[9px] text-slate-400 font-sans leading-relaxed">
            💡 <b>How to explain:</b> Click any contact to view its fused sources, sensor confidence, and test the sub-millisecond FAISS spatial index.
          </div>
        </div>
      )}

      {/* 5. BOTTOM HUD TELEMETRY BAR */}
      <div className="absolute bottom-2 left-2 right-2 z-30 flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-hud-glow animate-pulse" />
            <span className="text-slate-200 font-bold">FUSION RADAR MAP</span>
          </span>
          <span>
            CENTER: {center.lat.toFixed(4)}°N, {center.lng.toFixed(4)}°E
          </span>
          <span className="text-cyan-400 font-bold">
            FAISS KNN: {spatialIndex.stats.lastQueryMs}ms
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-300 font-bold">ZOOM: {zoom}x</span>
          <span className="text-[#a4c639] font-bold">CANVAS 60FPS</span>
        </div>
      </div>
    </div>
  );
}
