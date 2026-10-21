import { NextResponse } from 'next/server';
import { getPublishedRunicCorpus } from '@/lib/runor/contract';
import { inscriptionsToGeoJson, type PlacementViewMode } from '@/lib/runor/geojson';
import { RUNIC_PILOT_INSCRIPTIONS } from '@/lib/runor/pilot-data';
import { RUNIC_COMBINED_CORPUS_50 } from '@/lib/runor/batch1-data';
import {
  CURRENT_RUNIC_DATASET_VERSION,
  isValidDatasetVersion,
  getRunicCacheHeaders,
} from '@/lib/runor/cache-control';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Dataset-Version',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';
  const placementMode = (searchParams.get('placement') || 'fyndplats') as PlacementViewMode;
  const province = searchParams.get('province') || undefined;
  const carrierType = searchParams.get('carrier') || undefined;
  const search = searchParams.get('q') || undefined;
  const reqVersion = searchParams.get('version');
  const datasetVersion = isValidDatasetVersion(reqVersion) ? reqVersion : CURRENT_RUNIC_DATASET_VERSION;

  const cacheHeaders = getRunicCacheHeaders(datasetVersion);
  const sourceCorpus = datasetVersion === '2026.2-batch1' ? RUNIC_COMBINED_CORPUS_50 : RUNIC_PILOT_INSCRIPTIONS;

  if (format === 'geojson') {
    // GeoJSON-export enligt RFC 7946 (E24)
    let items = sourceCorpus.filter(
      (i) => i.curationStatus === 'granskad_pilot' || i.curationStatus === 'publicerad'
    );

    if (province && province !== 'all') {
      items = items.filter((i) => i.provinceCode === province);
    }
    if (carrierType && carrierType !== 'all') {
      items = items.filter((i) => i.carrier.type === carrierType);
    }

    const geoJson = inscriptionsToGeoJson(items, placementMode);

    return NextResponse.json(geoJson, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        ...cacheHeaders,
        'Content-Type': 'application/geo+json; charset=utf-8',
      },
    });
  }

  const data = getPublishedRunicCorpus(sourceCorpus, {
    province,
    carrierType,
    search,
  });

  return NextResponse.json(
    {
      ...data,
      datasetVersion,
    },
    {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        ...cacheHeaders,
        'Content-Type': 'application/json; charset=utf-8',
      },
    }
  );
}
