/**
 * Rörelse-, kamera- och övergångsparametrar för Runsidan (E30).
 * Garanterar användarstyrda, korta transitioner med full respekt för prefers-reduced-motion.
 */

export interface CameraMotionConfig {
  flyDurationSeconds: number;
  targetZoomLevel: number;
  useAnimation: boolean;
  easeLinearity: number;
}

export const DEFAULT_CAMERA_MOTION: CameraMotionConfig = {
  flyDurationSeconds: 0.8,
  targetZoomLevel: 12,
  useAnimation: true,
  easeLinearity: 0.25,
};

export const REDUCED_CAMERA_MOTION: CameraMotionConfig = {
  flyDurationSeconds: 0,
  targetZoomLevel: 12,
  useAnimation: false,
  easeLinearity: 1,
};

/**
 * Avgör om systemet begär reducerad rörelse (prefers-reduced-motion).
 */
export function checkPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/**
 * Returnerar lämplig kamerakonfiguration baserat på användarens systeminställningar.
 */
export function getCameraMotionConfig(overrideReducedMotion?: boolean): CameraMotionConfig {
  const isReduced = overrideReducedMotion !== undefined ? overrideReducedMotion : checkPrefersReducedMotion();
  return isReduced ? REDUCED_CAMERA_MOTION : DEFAULT_CAMERA_MOTION;
}

/**
 * Beräknar koordinatförskjutning om en sidopanel täcker en del av kartytan på desktop.
 * Förhindrar att vald inskrift döljs bakom snabbpanelen.
 */
export function calculateVisibleCenter(
  lat: number,
  lon: number,
  panelWidthPixels: number = 0,
  mapWidthPixels: number = 1000,
  zoomLevel: number = 12
): [number, number] {
  if (panelWidthPixels <= 0 || mapWidthPixels <= 0) {
    return [lat, lon];
  }

  // Om panelen täcker mer än 50 % av kartan (t.ex. mobilvy), förskjut inte lat/lon
  if (panelWidthPixels / mapWidthPixels > 0.5) {
    return [lat, lon];
  }

  // På desktop: förskjut centrum något åt höger så markören hamnar till vänster om panelen
  const degreesPerPixel = 360 / (256 * Math.pow(2, zoomLevel));
  const offsetLon = (panelWidthPixels / 2) * degreesPerPixel;

  return [lat, lon + offsetLon];
}
