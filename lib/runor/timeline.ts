/**
 * Tidslinjemodell och kontroller för tidsfiltrering och uppspelning (E31).
 * Implementerar Avsnitt 9.4 med slutna intervall utan falska mittpunkter.
 */

export interface RunicEpoch {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  description: string;
}

export const RUNIC_EPOCHS: RunicEpoch[] = [
  {
    id: 'alla-tider',
    name: 'Alla perioder',
    startYear: 750,
    endYear: 1250,
    description: 'Hela det dokumenterade runmaterialet i Sverige (ca 750–1250 e.Kr.).',
  },
  {
    id: 'tidig-vikingatid',
    name: 'Tidig vikingatid',
    startYear: 750,
    endYear: 950,
    description: 'Tidiga ristningar med kortkvistrunor, tidiga urnordiska arv och Rökstenen (Ög 136).',
  },
  {
    id: 'sen-vikingatid',
    name: 'Sen vikingatid',
    startYear: 950,
    endYear: 1100,
    description: 'De stora minnesstenarnas och runmuffarnas period; Ingvarsstenarna och runmästare som Fot, Balle och Asmund.',
  },
  {
    id: 'tidig-medeltid',
    name: 'Övergångstid & tidig medeltid',
    startYear: 1100,
    endYear: 1250,
    description: 'Kristna gravkistor, lockhällar på Öland och runinskrifter i kyrkomiljöer.',
  },
];

export interface PlaybackState {
  isPlaying: boolean;
  speedMs: number; // T.ex. 1200ms per tidssteg
  stepYears: number; // T.ex. 25 år
  windowSizeYears: number; // T.ex. 75 år brett tidsfönster
  minYear: number;
  maxYear: number;
}

export const DEFAULT_PLAYBACK_STATE: PlaybackState = {
  isPlaying: false,
  speedMs: 1200,
  stepYears: 25,
  windowSizeYears: 75,
  minYear: 800,
  maxYear: 1175,
};

/**
 * Beräknar nästa tidsintervall under automatisk stegning/uppspelning.
 * Loopar tillbaka till startåret när maxgränsen nås.
 */
export function advanceTimeWindow(
  currentStart: number,
  windowSize: number = 75,
  minYear: number = 800,
  maxYear: number = 1175,
  stepYears: number = 25
): { nextStart: number; nextEnd: number; hasLooped: boolean } {
  let nextStart = currentStart + stepYears;
  let hasLooped = false;

  if (nextStart + windowSize > maxYear + stepYears) {
    nextStart = minYear;
    hasLooped = true;
  }

  const nextEnd = Math.min(nextStart + windowSize, maxYear);
  return { nextStart, nextEnd, hasLooped };
}
