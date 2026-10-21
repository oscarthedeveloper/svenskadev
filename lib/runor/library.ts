/**
 * Biblioteks- och källregister för Sveriges runinskrifter (SRI)
 * och dess kopplingar till grammatik, ordbok och handskriftsarkiv (E28).
 */

import { RUNIC_PILOT_INSCRIPTIONS } from './pilot-data.ts';
import type { RunicInscription } from './types.ts';

export interface RunicSourceVolume {
  id: string; // t.ex. "band-01"
  title: string;
  shortTitle: string;
  authors: string[];
  publicationYear: number;
  description: string;
  printedPagesTotal: number;
  externalFacsimileUrl?: string;
  relatedProvinces: string[];
}

export const RUNIC_SOURCE_LIBRARY: RunicSourceVolume[] = [
  {
    id: 'band-01',
    title: 'Ölands runinskrifter',
    shortTitle: 'SRI Band 1',
    authors: ['Sven Söderberg', 'Erik Brate'],
    publicationYear: 1906,
    description: 'Verket behandlar Ölands rika runstens- och gravhällsmaterial, inklusive Karlevistenen (Öl 1) och de tidigkristna lockhällarna.',
    printedPagesTotal: 164,
    externalFacsimileUrl: 'https://www.raa.se/kulturarv/runor-och-runstenar/digitala-sveriges-runinskrifter/',
    relatedProvinces: ['Öland'],
  },
  {
    id: 'band-02',
    title: 'Östergötlands runinskrifter',
    shortTitle: 'SRI Band 2',
    authors: ['Erik Brate'],
    publicationYear: 1918,
    description: 'Omfattar Östergötlands runstenar, gravmonument och Rökstenen (Ög 136) med dess komplexa fornvästnordiska och runsvenska fornyrðislag.',
    printedPagesTotal: 270,
    externalFacsimileUrl: 'https://www.raa.se/kulturarv/runor-och-runstenar/digitala-sveriges-runinskrifter/',
    relatedProvinces: ['Östergötland'],
  },
  {
    id: 'band-03',
    title: 'Södermanlands runinskrifter',
    shortTitle: 'SRI Band 3',
    authors: ['Erik Brate', 'Elias Wessén'],
    publicationYear: 1936,
    description: 'Monografisk inventering av Södermanlands inskrifter, däribland Sigurdsristningen (Sö 101) och Gripsholmsstenen (Sö 179).',
    printedPagesTotal: 432,
    externalFacsimileUrl: 'https://www.raa.se/kulturarv/runor-och-runstenar/digitala-sveriges-runinskrifter/',
    relatedProvinces: ['Södermanland'],
  },
  {
    id: 'band-06',
    title: 'Upplands runinskrifter, del 1',
    shortTitle: 'SRI Band 6',
    authors: ['Elias Wessén', 'Sven B.F. Jansson'],
    publicationYear: 1943,
    description: 'Upplands södra och mellersta härader, omfattande kända ristningar vid Hansta (U 73) och Kyrkstigen i Ed (U 112).',
    printedPagesTotal: 510,
    externalFacsimileUrl: 'https://www.raa.se/kulturarv/runor-och-runstenar/digitala-sveriges-runinskrifter/',
    relatedProvinces: ['Uppland'],
  },
  {
    id: 'band-07',
    title: 'Upplands runinskrifter, del 2',
    shortTitle: 'SRI Band 7',
    authors: ['Elias Wessén', 'Sven B.F. Jansson'],
    publicationYear: 1946,
    description: 'Fortsättning av Upplands runinskrifter med noggranna fotofaksimil och språkliga analyser.',
    printedPagesTotal: 495,
    externalFacsimileUrl: 'https://www.raa.se/kulturarv/runor-och-runstenar/digitala-sveriges-runinskrifter/',
    relatedProvinces: ['Uppland'],
  },
  {
    id: 'band-08',
    title: 'Upplands runinskrifter, del 3',
    shortTitle: 'SRI Band 8',
    authors: ['Elias Wessén', 'Sven B.F. Jansson'],
    publicationYear: 1951,
    description: 'Omfattar Upplands norra delar och rika ristarmiljöer under Fot, Asmund och Öpir.',
    printedPagesTotal: 480,
    externalFacsimileUrl: 'https://www.raa.se/kulturarv/runor-och-runstenar/digitala-sveriges-runinskrifter/',
    relatedProvinces: ['Uppland'],
  },
  {
    id: 'band-13',
    title: 'Västmanlands runinskrifter',
    shortTitle: 'SRI Band 13',
    authors: ['Sven B.F. Jansson'],
    publicationYear: 1964,
    description: 'Västmanlands samlade runmaterial, inklusive skaldedikten över Odendisa vid Hassmyra (Vs 24).',
    printedPagesTotal: 122,
    externalFacsimileUrl: 'https://www.raa.se/kulturarv/runor-och-runstenar/digitala-sveriges-runinskrifter/',
    relatedProvinces: ['Västmanland'],
  },
];

/**
 * Slår upp en källvolym på dess volym-ID.
 */
export function getSourceVolumeById(volumeId: string): RunicSourceVolume | null {
  return RUNIC_SOURCE_LIBRARY.find((vol) => vol.id === volumeId) || null;
}

/**
 * Returnerar alla inskrifter ur piloten som härrör från en viss volym.
 */
export function getInscriptionsForSourceVolume(
  volumeId: string,
  inscriptions: RunicInscription[] = RUNIC_PILOT_INSCRIPTIONS
): RunicInscription[] {
  return inscriptions.filter((ins) => ins.source.sriVolumeId === volumeId);
}

/**
 * Språkhistoriska korsreferenser mellan runmaterialet och sajtens grammatik-/ordvalsartiklar.
 */
export interface RunicLinguisticBridge {
  signum: string;
  topic: string;
  targetHref: string;
  description: string;
}

export const RUNIC_LINGUISTIC_BRIDGES: RunicLinguisticBridge[] = [
  {
    signum: 'Vs 24',
    topic: 'Verbböjning och fornspråklig personkongruens',
    targetHref: '/sprakliv/person-och-numerus',
    description: 'Vs 24 innehåller formerna "kumbr" (3 sg. pres. av koma) och "raþr" (3 sg. pres. av raða), belysande den fornnordiska utvecklingen före synkretismen.',
  },
  {
    signum: 'Ög 136',
    topic: 'Allittererande versmått och stavrim',
    targetHref: '/grammatik',
    description: 'Rökstenens fornyrðislag visar principerna för fornnordisk versbyggnad och fornvästnordisk kasusböjning.',
  },
  {
    signum: 'U 73',
    topic: 'Pronomen och kasus (hann / honom)',
    targetHref: '/sprakrad',
    description: 'Inskriftens formuleringsmönster visar ackusativ- och dativkonstruktioner i vikingatida runsvenska.',
  },
];
