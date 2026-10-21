'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import type { RunicInscription } from '@/lib/runor/types';
import {
  inscriptionsToGeoJson,
  groupPointsByCoordinate,
  type PlacementViewMode,
  type RunicGeoJsonFeature,
  type ClusteredPointGroup,
} from '@/lib/runor/geojson';
import { getCameraMotionConfig } from '@/lib/runor/motion';

interface Props {
  inscriptions: RunicInscription[];
  selectedSlug?: string | null;
  onSelectInscription?: (slug: string) => void;
}

export default function RunorInteractiveMap({
  inscriptions,
  selectedSlug = null,
  onSelectInscription,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [tileWarning, setTileWarning] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [placementMode, setPlacementMode] = useState<PlacementViewMode>('fyndplats');

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Konvertera och gruppera GeoJSON för det valda visningsläget
  const geoJsonData = useMemo(() => {
    return inscriptionsToGeoJson(inscriptions, placementMode);
  }, [inscriptions, placementMode]);

  const clusters = useMemo(() => {
    return groupPointsByCoordinate(geoJsonData.features);
  }, [geoJsonData]);

  // Initiera Leaflet-karta en gång
  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        if (!isMounted || !mapContainerRef.current) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [59.0, 16.5],
          zoom: 6,
          minZoom: 5,
          maxZoom: 18,
          scrollWheelZoom: false, // Avstängd scroll för att inte störa läsflödet på sidan
        });

        mapInstanceRef.current = map;

        // CartoDB Voyager kartunderlag (Beslut D06)
        const tileLayer = L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
          }
        );

        tileLayer.on('tileerror', () => {
          if (isMounted) {
            setTileWarning(true);
          }
        });

        tileLayer.addTo(map);

        // Skapa en LayerGroup för dynamiska markörer och cirklar
        const layerGroup = L.layerGroup().addTo(map);
        layerGroupRef.current = layerGroup;
      } catch (err: any) {
        console.error('Kunde inte initiera Leaflet:', err);
        if (isMounted) {
          setLoadError(err.message || 'Kartmotorn kunde inte initieras');
        }
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient]);

  // Uppdatera markörer och kluster när data, visningsläge eller urval ändras
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    let isMounted = true;

    async function updateMarkers() {
      const L = (await import('leaflet')).default;
      if (!isMounted || !layerGroupRef.current) return;

      const layerGroup = layerGroupRef.current;
      layerGroup.clearLayers();

      const allMarkers: any[] = [];
      const markersBySlug = new Map<string, { marker: any; latLng: [number, number] }>();

      for (const cluster of clusters) {
        const [lon, lat] = cluster.coordinates;

        if (cluster.isSingle) {
          // Enskild markör
          const f = cluster.features[0];
          const isSelected = selectedSlug === f.properties.slug;
          const isLost = f.properties.isLost;
          const isUncertain = f.properties.precision === 'sockencentrum';

          // Vid sockencentrum / osäkert läge: rita en diskret streckad osäkerhetscirkel
          if (isUncertain) {
            const circle = L.circle([lat, lon], {
              radius: 1400,
              color: '#94a3b8',
              weight: 1.5,
              dashArray: '5, 5',
              fillColor: '#cbd5e1',
              fillOpacity: 0.15,
            }).bindTooltip(
              `Sockencentrum (${f.properties.parish}) — exakt fyndplats okänd`,
              { sticky: true }
            );
            layerGroup.addLayer(circle);
          }

          const markerColor = isSelected ? '#3b82f6' : isLost ? '#78716c' : '#8b1e0f';
          const size = isSelected ? 18 : 14;

          const iconHtml = `
            <div style="
              width: ${size}px;
              height: ${size}px;
              background-color: ${markerColor};
              border: 2px solid ${isSelected ? '#ffffff' : '#181815'};
              border-radius: 50%;
              box-shadow: 0 1px 5px rgba(0,0,0,0.4);
              transition: transform 120ms ease;
            "></div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'runor-leaflet-marker',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

          const precisionLabel =
            f.properties.precision === 'exakt_koordinat'
              ? 'Exakt koordinat'
              : 'Sockencentrum (approximativt läge för förlorad sten)';

          const popupContent = `
            <div style="font-family: system-ui, sans-serif; font-size: 13px; line-height: 1.45; max-width: 250px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <strong style="font-size: 14px; color: #8b1e0f;">${f.properties.signum}</strong>
                <span style="font-size: 10px; font-family: monospace; color: ${isLost ? '#92400e' : '#047857'};">
                  ${isLost ? 'Förlorad' : f.properties.carrierType}
                </span>
              </div>
              ${f.properties.name ? `<div style="font-weight: 600; font-size: 12px; margin-bottom: 3px;">${f.properties.name}</div>` : ''}
              <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">
                ${f.properties.placeName ? `${f.properties.placeName}, ` : ''}${f.properties.parish} (${f.properties.province})
              </div>
              <div style="font-size: 10px; color: #64748b; font-style: italic; margin-bottom: 6px;">
                Läge: ${precisionLabel}
              </div>
              ${f.properties.translationSnippet ? `<div style="font-size: 11px; font-style: italic; background: #f8fafc; padding: 4px 8px; border-left: 2px solid #cbd5e1; margin-bottom: 8px;">”${f.properties.translationSnippet}”</div>` : ''}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                <span style="font-size: 10px; color: #64748b;">${f.properties.datingLabel}</span>
                <a href="/runor/${f.properties.slug}" style="
                  display: inline-block;
                  padding: 3px 8px;
                  background: #8b1e0f;
                  color: #ffffff;
                  font-size: 11px;
                  text-decoration: none;
                  font-weight: 600;
                  border-radius: 4px;
                ">Öppna inskrift →</a>
              </div>
            </div>
          `;

          const marker = L.marker([lat, lon], { icon: customIcon })
            .bindPopup(popupContent);

          if (onSelectInscription) {
            marker.on('click', () => onSelectInscription(f.properties.slug));
          }

          layerGroup.addLayer(marker);
          allMarkers.push(marker);
          markersBySlug.set(f.properties.slug, { marker, latLng: [lat, lon] });
        } else {
          // Klustermarkör för flera inskrifter på samma koordinat
          const count = cluster.features.length;
          const containsSelected = cluster.features.some((f) => f.properties.slug === selectedSlug);

          const clusterIcon = L.divIcon({
            html: `
              <div style="
                width: 26px;
                height: 26px;
                background-color: ${containsSelected ? '#2563eb' : '#8b1e0f'};
                color: #ffffff;
                border: 2px solid #ffffff;
                border-radius: 50%;
                display: grid;
                place-items: center;
                font-family: monospace;
                font-size: 12px;
                font-weight: bold;
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                cursor: pointer;
              ">
                ${count}
              </div>
            `,
            className: 'runor-leaflet-cluster',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          // Bygg lista över alla inskrifter i klustret
          const clusterPopup = `
            <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4; max-width: 270px;">
              <div style="font-weight: 700; font-size: 13px; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
                ${count} inskrifter på denna plats
              </div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
                ${cluster.features[0].properties.parish} (${cluster.features[0].properties.province})
              </div>
              <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
                ${cluster.features
                  .map(
                    (f) => `
                  <li style="border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                      <a href="/runor/${f.properties.slug}" style="color: #8b1e0f; font-weight: 700; text-decoration: none;">
                        ${f.properties.signum}
                      </a>
                      <span style="font-size: 10px; color: #64748b;">${f.properties.carrierType}</span>
                    </div>
                    ${f.properties.name ? `<div style="font-size: 11px; color: #334155;">${f.properties.name}</div>` : ''}
                    <div style="font-size: 10px; color: #64748b;">${f.properties.datingLabel}</div>
                  </li>
                `
                  )
                  .join('')}
              </ul>
            </div>
          `;

          const marker = L.marker([lat, lon], { icon: clusterIcon })
            .bindPopup(clusterPopup);

          layerGroup.addLayer(marker);
          allMarkers.push(marker);

          // Registrera alla ingående inskrifter till detta kluster
          for (const feat of cluster.features) {
            markersBySlug.set(feat.properties.slug, { marker, latLng: [lat, lon] });
          }
        }
      }

      // Kamerarörelse och valövergångar (E30)
      if (mapInstanceRef.current) {
        const map = mapInstanceRef.current;

        // Om en specifik inskrift är vald: panorera mjukt dit och öppna popup
        if (selectedSlug && markersBySlug.has(selectedSlug)) {
          const target = markersBySlug.get(selectedSlug)!;
          map.stop(); // Avbryt föregående rörelse vid snabba val

          const motion = getCameraMotionConfig();
          const targetZoom = Math.max(map.getZoom(), motion.targetZoomLevel);

          if (motion.useAnimation) {
            map.flyTo(target.latLng, targetZoom, {
              duration: motion.flyDurationSeconds,
              easeLinearity: motion.easeLinearity,
            });
          } else {
            map.setView(target.latLng, targetZoom);
          }

          setTimeout(() => {
            if (isMounted && target.marker) {
              target.marker.openPopup();
            }
          }, motion.useAnimation ? 820 : 50);
        } else if (allMarkers.length > 0) {
          // Översiktsvy när ingen inskrift är vald
          const group = L.featureGroup(allMarkers);
          map.fitBounds(group.getBounds().pad(0.1));
        }
      }
    }

    updateMarkers();

    return () => {
      isMounted = false;
    };
  }, [clusters, selectedSlug, onSelectInscription]);

  if (loadError) {
    return (
      <div
        className="runor-map-fallback-box"
        role="region"
        aria-label="Reservvy för runkarta"
        style={{
          padding: '20px 24px',
          background: '#f8fafc',
          border: '1px solid var(--line)',
          borderRadius: '6px',
          margin: '16px 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '18px' }} aria-hidden="true">⚠️</span>
          <h3 style={{ fontSize: '15px', color: '#8b1e0f', margin: 0, fontWeight: 600 }}>
            Interaktiv karta otillgänglig ({loadError})
          </h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          Kartmotorn kunde inte initieras eller nätverksfel uppstod.
          Alla <strong>{geoJsonData.totalFeatures}</strong> inskrifter är tillgängliga och kan sökas, filtreras och läsas i katalogen nedan.
        </p>
        <div
          style={{
            maxHeight: '180px',
            overflowY: 'auto',
            border: '1px solid var(--line)',
            background: '#ffffff',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: 'var(--text-main)' }}>
            Inskrifter i det aktuella urvalet:
          </p>
          <ul
            style={{
              margin: 0,
              paddingLeft: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '6px',
            }}
          >
            {inscriptions.map((ins) => (
              <li key={ins.id}>
                <Link
                  href={`/runor/${ins.canonicalSlug}`}
                  style={{ fontWeight: 600, color: '#8b1e0f', textDecoration: 'none' }}
                >
                  {ins.canonicalSignum}
                </Link>
                {ins.name ? ` (${ins.name})` : ''}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="runor-interactive-map-wrapper">
      {tileWarning && (
        <div
          role="status"
          aria-live="polite"
          style={{
            padding: '8px 12px',
            background: '#fffbeb',
            borderBottom: '1px solid #fef3c7',
            color: '#92400e',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span aria-hidden="true">ℹ️</span>
          <span>
            Kartplattor kunde inte hämtas från extern leverantör (möjligen offline eller nätverksfel).
            Markörer visas på neutral bottenplatta och katalogen nedan fungerar normalt.
          </span>
        </div>
      )}
      {/* Kartkontroll med lägesväljare */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '8px 12px',
          background: '#f8fafc',
          borderBottom: '1px solid var(--line)',
          fontSize: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Platsläge:</span>
          <div style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: '4px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setPlacementMode('fyndplats')}
              style={{
                padding: '4px 8px',
                border: 'none',
                background: placementMode === 'fyndplats' ? '#8b1e0f' : '#ffffff',
                color: placementMode === 'fyndplats' ? '#ffffff' : 'var(--text-main)',
                fontWeight: placementMode === 'fyndplats' ? 600 : 400,
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Fyndplats (ursprunglig)
            </button>
            <button
              type="button"
              onClick={() => setPlacementMode('nuvarande_plats')}
              style={{
                padding: '4px 8px',
                border: 'none',
                borderLeft: '1px solid var(--line)',
                background: placementMode === 'nuvarande_plats' ? '#8b1e0f' : '#ffffff',
                color: placementMode === 'nuvarande_plats' ? '#ffffff' : 'var(--text-main)',
                fontWeight: placementMode === 'nuvarande_plats' ? 600 : 400,
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Nuvarande placering
            </button>
          </div>
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
          Visar <strong>{geoJsonData.totalFeatures}</strong> punkter
          {geoJsonData.totalMissingCoordinates > 0 && (
            <span> ({geoJsonData.totalMissingCoordinates} saknar koordinat och listas i textkatalogen)</span>
          )}
        </div>
      </div>

      <div
        ref={mapContainerRef}
        className="runor-leaflet-container"
        style={{ width: '100%', height: '520px', backgroundColor: '#e2edf5' }}
        aria-label="Interaktiv karta över Sveriges runinskrifter"
      />

      {/* Legend & Förklaring */}
      <div className="map-legend-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '11px', alignItems: 'center' }}>
        <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8b1e0f', display: 'inline-block' }} />
          Bevarad inskrift (exakt koordinat)
        </span>
        <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#78716c', display: 'inline-block' }} />
          Förlorad inskrift (sockencentrum)
        </span>
        <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#8b1e0f', color: '#fff', fontSize: '9px', fontWeight: 'bold', display: 'grid', placeItems: 'center' }}>3</span>
          Kluster (flera stenar i samma läge)
        </span>
        <span className="legend-hint" style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
          Streckad cirkel visar sockencentrum för förlorade objekt. Klicka på en punkt för källutdrag och länk.
        </span>
      </div>
    </div>
  );
}
