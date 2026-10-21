import { NextResponse } from 'next/server';
import { getPublishedRunicInscription } from '@/lib/runor/contract';
import {
  CURRENT_RUNIC_DATASET_VERSION,
  getRunicCacheHeaders,
} from '@/lib/runor/cache-control';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Dataset-Version',
};

interface Context {
  params: Promise<{ slug: string }>;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: Request, context: Context) {
  const { slug } = await context.params;
  const inscription = getPublishedRunicInscription(slug);

  if (!inscription) {
    return NextResponse.json(
      {
        error: 'Inskrift hittades inte eller är inte godkänd för publicering',
        requestedSlug: slug,
      },
      {
        status: 404,
        headers: CORS_HEADERS,
      }
    );
  }

  const datasetVersion = CURRENT_RUNIC_DATASET_VERSION;
  const cacheHeaders = getRunicCacheHeaders(datasetVersion);

  return NextResponse.json(
    {
      version: '1.0.0',
      datasetVersion,
      apiEndpoint: `/api/runor/v1/${slug}`,
      license: 'Samnordisk runtextdatabas (ODbL 1.0) / Sveriges runinskrifter (Public Domain)',
      attribution:
        'Källutgåva: Sveriges runinskrifter (Kungl. Vitterhetsakademien / Riksantikvarieämbetet). Metadata och koordinater: Samnordisk runtextdatabas (Uppsala universitet).',
      generatedAt: new Date().toISOString(),
      inscription,
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
