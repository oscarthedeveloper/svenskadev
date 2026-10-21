import type {
  CaseStudiesData,
  EvidenceStatus,
  NordicAtlasData,
  ParadigmCell,
  ParadigmDefinition,
  SourceDocument,
  SourceLocation,
  ThesisPilotEdition,
  ThesisRegion,
  TimeRole,
  TimeSpecification,
  UncertaintyMarker,
} from './types.ts';

const VALID_TIME_ROLES: ReadonlySet<TimeRole> = new Set([
  'historical_synthesis_period',
  'collection_window',
  'attestation_year',
  'birth_year',
  'recording_year',
  'hypothetical_period',
]);

export function validateSourceLocation(
  loc: SourceLocation | null | undefined,
  doc?: SourceDocument
): string[] {
  const errors: string[] = [];
  if (!loc || typeof loc !== 'object') {
    return ['Källhänvisning (SourceLocation) saknas.'];
  }
  if (!loc.sourceId || typeof loc.sourceId !== 'string' || !loc.sourceId.trim()) {
    errors.push('sourceId måste anges.');
  }
  if (!loc.objectId || typeof loc.objectId !== 'string' || !loc.objectId.trim()) {
    errors.push('objectId måste anges.');
  }
  if (
    typeof loc.printedPage !== 'number' ||
    !Number.isInteger(loc.printedPage) ||
    loc.printedPage < 1
  ) {
    errors.push(`Ogiltig tryckt sida (printedPage) för ${loc.objectId || 'okänt objekt'}.`);
  }
  if (
    typeof loc.pdfPage !== 'number' ||
    !Number.isInteger(loc.pdfPage) ||
    loc.pdfPage < 1
  ) {
    errors.push(`Ogiltig fysisk PDF-sida (pdfPage) för ${loc.objectId || 'okänt objekt'}.`);
  }
  if (doc) {
    if (loc.printedPage > doc.printedPagesTotal) {
      errors.push(
        `Tryckt sida ${loc.printedPage} överskrider källans omfång (${doc.printedPagesTotal}) för ${loc.objectId}.`
      );
    }
    if (loc.pdfPage > doc.pdfPagesTotal) {
      errors.push(
        `PDF-sida ${loc.pdfPage} överskrider PDF-filens sidantal (${doc.pdfPagesTotal}) för ${loc.objectId}.`
      );
    }
  }
  if (loc.printedPageEnd !== undefined && loc.printedPageEnd < loc.printedPage) {
    errors.push(`printedPageEnd (${loc.printedPageEnd}) är mindre än printedPage (${loc.printedPage}).`);
  }
  if (loc.pdfPageEnd !== undefined && loc.pdfPageEnd < loc.pdfPage) {
    errors.push(`pdfPageEnd (${loc.pdfPageEnd}) är mindre än pdfPage (${loc.pdfPage}).`);
  }
  return errors;
}

export function validateTimeSpecification(
  time: TimeSpecification | null | undefined,
  doc?: SourceDocument
): string[] {
  const errors: string[] = [];
  if (!time || typeof time !== 'object') {
    return ['Tidsuppgift (TimeSpecification) saknas.'];
  }
  if (!time.id || !time.id.trim()) {
    errors.push('TimeSpecification.id måste anges.');
  }
  if (!VALID_TIME_ROLES.has(time.role)) {
    errors.push(`Ogiltig tidsroll (TimeRole): ${String(time.role)}.`);
  }
  if (time.allowsInterpolation !== false) {
    errors.push(
      `Tidsuppgiften "${time.id}" tillåter interpolation; årsvis interpolation mellan historiska nedslag är förbjuden.`
    );
  }
  if (!time.label || !time.label.trim()) {
    errors.push(`Tidsuppgiften "${time.id}" saknar läsbar etikett (label).`);
  }
  if (
    !time.warningAgainstMisinterpretation ||
    !time.warningAgainstMisinterpretation.trim()
  ) {
    errors.push(
      `Tidsuppgiften "${time.id}" saknar varning mot feltolkning (warningAgainstMisinterpretation).`
    );
  }
  if (time.isUnknown) {
    if (time.startYear !== null || time.endYear !== null) {
      errors.push(
        `Tidsuppgiften "${time.id}" är markerad som okänd (isUnknown=true) men har ändå årtal (${time.startYear}–${time.endYear}). Okända datum får inte ersättas med födelseår eller periodens mittpunkt.`
      );
    }
  } else {
    if (time.startYear === null && time.endYear === null) {
      errors.push(
        `Tidsuppgiften "${time.id}" har varken årtal eller isUnknown=true.`
      );
    }
    if (
      time.startYear !== null &&
      time.endYear !== null &&
      time.startYear > time.endYear
    ) {
      errors.push(
        `Tidsuppgiften "${time.id}" har startYear (${time.startYear}) > endYear (${time.endYear}).`
      );
    }
  }
  if (
    (time.role === 'birth_year' || time.role === 'recording_year') &&
    time.startYear !== null &&
    time.endYear !== null &&
    time.startYear !== time.endYear
  ) {
    errors.push(
      `Tidsrollen "${time.role}" i "${time.id}" avser en enskild informants födelse- eller inspelningsår men anger ett intervall (${time.startYear}–${time.endYear}). Använd collection_window eller behåll isApproximate=true för ett enskilt år.`
    );
  }
  errors.push(...validateSourceLocation(time.source, doc));
  return errors;
}

export function canCompareTimeSpecsDirectly(
  a: TimeSpecification,
  b: TimeSpecification
): { allowed: boolean; reason?: string } {
  if (a.role !== b.role) {
    return {
      allowed: false,
      reason: `Kan inte blanda tidsrollerna "${a.role}" (${a.id}) och "${b.role}" (${b.id}) på samma axel utan separat rollmarkering.`,
    };
  }
  if (a.isUnknown || b.isUnknown) {
    return {
      allowed: false,
      reason: 'Okända tidsuppgifter får inte sorteras in som numeriska årtal.',
    };
  }
  return { allowed: true };
}

export function validateUncertaintyMarker(
  uncertainty: UncertaintyMarker | null | undefined,
  evidenceStatus: EvidenceStatus,
  contextId: string
): string[] {
  const errors: string[] = [];
  if (!uncertainty || typeof uncertainty !== 'object') {
    return [`Osäkerhetsmarkering saknas för ${contextId}.`];
  }
  if (!uncertainty.whatSourceShows?.trim()) {
    errors.push(`${contextId}: "whatSourceShows" (Detta visar källan) måste anges.`);
  }
  if (!uncertainty.howWeRepresentIt?.trim()) {
    errors.push(`${contextId}: "howWeRepresentIt" (Så har vi återgett det) måste anges.`);
  }
  if (!uncertainty.whatIsUncertain?.trim()) {
    errors.push(`${contextId}: "whatIsUncertain" (Detta är osäkert) måste anges.`);
  }
  if (
    (evidenceStatus === 'inferred_from_neighbor' ||
      evidenceStatus === 'hypothetical_reconstruction') &&
    (uncertainty.level === 'none' || uncertainty.patternStyle === 'solid')
  ) {
    errors.push(
      `${contextId}: Objekt med evidenstyp "${evidenceStatus}" får inte ha osäkerhetsnivå "none" eller mönster "solid" (osäkerhet måste synas med mönster/streckad gräns och text).`
    );
  }
  return errors;
}

export function validateParadigmCell(
  cell: ParadigmCell,
  doc?: SourceDocument
): string[] {
  const errors: string[] = [];
  if (!cell.id || !cell.id.trim()) {
    errors.push('ParadigmCell saknar id.');
  }
  if (![1, 2, 3].includes(cell.person)) {
    errors.push(`ParadigmCell ${cell.id}: ogiltig grammatisk person ${String(cell.person)}.`);
  }
  if (cell.number !== 'plural') {
    errors.push(`ParadigmCell ${cell.id}: Tablå 28 avser endast plural.`);
  }
  if (cell.mood !== 'indikativ') {
    errors.push(`ParadigmCell ${cell.id}: Tablå 28 avser endast indikativ.`);
  }
  if (!cell.rawCellText?.trim()) {
    errors.push(`ParadigmCell ${cell.id}: rawCellText saknas.`);
  }
  if (!cell.presentEnding?.trim() || !cell.pastEnding?.trim()) {
    errors.push(`ParadigmCell ${cell.id}: presentEnding och pastEnding måste anges.`);
  }

  const hasSlash = cell.rawCellText.includes('/');
  if (hasSlash !== cell.splitsTenseBySlash) {
    errors.push(
      `ParadigmCell ${cell.id}: splitsTenseBySlash (${cell.splitsTenseBySlash}) matchar inte rawCellText ("${cell.rawCellText}").`
    );
  }
  if (hasSlash) {
    const parts = cell.rawCellText.split('/').map((part) => part.trim());
    if (parts.length !== 2 || parts[0] !== cell.presentEnding || parts[1] !== cell.pastEnding) {
      errors.push(
        `ParadigmCell ${cell.id}: Snedstreck i "${cell.rawCellText}" måste tolkas som "presens / preteritum" (${parts[0]} respektive ${parts[1]}), inte som fria varianter.`
      );
    }
    if (cell.presentEnding === cell.pastEnding) {
      errors.push(
        `ParadigmCell ${cell.id}: Vid snedstreck måste presens- och preteritumändelse skilja sig åt.`
      );
    }
  } else if (cell.presentEnding !== cell.pastEnding) {
    errors.push(
      `ParadigmCell ${cell.id}: Utan snedstreck i "${cell.rawCellText}" ska presentEnding (${cell.presentEnding}) och pastEnding (${cell.pastEnding}) vara identiska.`
    );
  }

  if (!cell.hiatusRule?.trim()) {
    errors.push(`ParadigmCell ${cell.id}: hiatusRule (vokalkrocksregel) måste anges.`);
  }
  for (const allomorph of cell.allomorphs) {
    if (!allomorph.form?.trim() || !allomorph.condition?.trim()) {
      errors.push(`ParadigmCell ${cell.id}: allomorf saknar form eller villkor.`);
    }
    errors.push(...validateSourceLocation(allomorph.source, doc));
  }
  errors.push(...validateSourceLocation(cell.source, doc));
  return errors;
}

export function validateParadigmDefinition(
  paradigm: ParadigmDefinition,
  doc?: SourceDocument
): string[] {
  const errors: string[] = [];
  if (!paradigm.id || !paradigm.name?.trim()) {
    errors.push('ParadigmDefinition saknar id eller namn.');
  }
  if (!paradigm.patternMarkerLabel?.trim()) {
    errors.push(
      `Paradigm ${paradigm.id}: patternMarkerLabel måste anges så att färg aldrig är enda informationsbärare.`
    );
  }
  if (!Array.isArray(paradigm.cells) || paradigm.cells.length !== 3) {
    errors.push(`Paradigm ${paradigm.id}: måste ha exakt 3 pluralceller (1, 2 och 3 person).`);
  } else {
    const persons = paradigm.cells.map((c) => c.person);
    if (persons[0] !== 1 || persons[1] !== 2 || persons[2] !== 3) {
      errors.push(`Paradigm ${paradigm.id}: cellerna måste ligga i ordningen 1, 2, 3 person.`);
    }
    for (const cell of paradigm.cells) {
      if (cell.paradigmId !== paradigm.id) {
        errors.push(
          `ParadigmCell ${cell.id} har paradigmId "${cell.paradigmId}" men ligger under "${paradigm.id}".`
        );
      }
      errors.push(...validateParadigmCell(cell, doc));
    }
  }
  if (!Array.isArray(paradigm.exampleForms) || paradigm.exampleForms.length === 0) {
    errors.push(
      `Paradigm ${paradigm.id}: minst ett böjt exempel med pronomen + verb krävs.`
    );
  } else {
    for (const ex of paradigm.exampleForms) {
      if (!ex.pronoun?.trim() || !ex.presentForm?.trim() || !ex.pastForm?.trim()) {
        errors.push(`Paradigm ${paradigm.id}: exempelform saknar pronomen eller böjd form.`);
      }
      errors.push(...validateSourceLocation(ex.source, doc));
    }
  }
  errors.push(...validateSourceLocation(paradigm.source, doc));
  return errors;
}

export function validateThesisRegion(
  region: ThesisRegion,
  knownParadigms: ReadonlySet<string>,
  doc?: SourceDocument
): string[] {
  const errors: string[] = [];
  if (!region.id || !region.name?.trim()) {
    errors.push('ThesisRegion saknar id eller namn.');
  }
  if (!knownParadigms.has(region.paradigmId)) {
    errors.push(
      `Region ${region.id} hänvisar till okänt paradigm "${region.paradigmId}".`
    );
  }
  errors.push(...validateTimeSpecification(region.timeSpecification, doc));
  errors.push(
    ...validateUncertaintyMarker(region.uncertainty, 'synthesized', region.id)
  );
  errors.push(...validateSourceLocation(region.source, doc));

  if (!Array.isArray(region.subAreas) || region.subAreas.length === 0) {
    errors.push(`Region ${region.id}: måste redovisa minst ett delområde (subAreas).`);
  } else {
    for (const sub of region.subAreas) {
      errors.push(
        ...validateUncertaintyMarker(sub.uncertainty, sub.evidenceStatus, sub.id)
      );
      errors.push(...validateSourceLocation(sub.source, doc));
    }
  }

  for (const exc of region.documentedExceptions) {
    if (!exc.location?.trim() || !exc.explanation?.trim()) {
      errors.push(`Undantag ${exc.id} i ${region.id} saknar plats eller förklaring.`);
    }
    errors.push(...validateSourceLocation(exc.source, doc));
  }
  return errors;
}

export function validateThesisPilotEdition(
  edition: ThesisPilotEdition
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const doc = edition.sourceDocument;

  if (!doc) {
    errors.push('sourceDocument saknas.');
  } else {
    if (
      doc.pdfSha256 !==
      '64b9980bac02a28377cf2297de91e180017eb7f74d1021688569f32ebc548284'
    ) {
      errors.push('sourceDocument.pdfSha256 matchar inte verifierad original-PDF.');
    }
    if (doc.printedPagesTotal !== 288 || doc.pdfPagesTotal !== 292) {
      errors.push('sourceDocument sidantal måste vara 288 tryckta / 292 PDF-sidor.');
    }
  }

  for (const [key, timeSpec] of Object.entries(edition.timeSpecifications || {})) {
    if (timeSpec.id !== key) {
      errors.push(`timeSpecifications["${key}"] har avvikande id "${timeSpec.id}".`);
    }
    errors.push(...validateTimeSpecification(timeSpec, doc));
  }

  if (!Array.isArray(edition.paradigms) || edition.paradigms.length !== 4) {
    errors.push('Pilotutgåvan måste innehålla exakt de 4 huvudparadigmen ur Tablå 28.');
  } else {
    for (const p of edition.paradigms) {
      errors.push(...validateParadigmDefinition(p, doc));
    }
  }

  const knownParadigms = new Set((edition.paradigms || []).map((p) => p.id));

  if (!Array.isArray(edition.regions) || edition.regions.length !== 4) {
    errors.push('Pilotutgåvan måste innehålla de 4 huvudregionerna på Karta 10.');
  } else {
    for (const r of edition.regions) {
      errors.push(...validateThesisRegion(r, knownParadigms, doc));
    }
    // Kontrollera att fotnot 81:s båda indirekt härledda områden finns registrerade
    const allSubAreas = edition.regions.flatMap((r) => r.subAreas);
    const fn81Areas = allSubAreas.filter(
      (s) =>
        s.evidenceStatus === 'inferred_from_neighbor' &&
        s.source.footnotes?.includes(81)
    );
    if (fn81Areas.length < 2) {
      errors.push(
        'Karta 10 måste redovisa fotnot 81:s indirekt härledda ytterområden (norra Hallands e-område och Blekinges a-område) med evidenceStatus="inferred_from_neighbor" och fotnot 81.'
      );
    }
  }

  if (!edition.changeModelFigur6 || edition.changeModelFigur6.steps.length === 0) {
    errors.push('changeModelFigur6 saknas eller har inga steg.');
  } else {
    errors.push(...validateSourceLocation(edition.changeModelFigur6.source, doc));
    for (const step of edition.changeModelFigur6.steps) {
      errors.push(...validateSourceLocation(step.source, doc));
    }
  }

  if (!Array.isArray(edition.glossary) || edition.glossary.length < 8) {
    errors.push('Ordlistan måste innehålla minst de 8 kärnbegreppen enligt A01.4.');
  } else {
    for (const term of edition.glossary) {
      if (!term.term?.trim() || !term.shortDefinition?.trim()) {
        errors.push(`Ordlisteterm ${term.id} saknar term eller definition.`);
      }
      errors.push(...validateSourceLocation(term.source, doc));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateNordicAtlasData(
  atlas: NordicAtlasData,
  doc?: SourceDocument
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!atlas.karta7AndTabla26) {
    errors.push('karta7AndTabla26 saknas.');
  } else {
    const slices = atlas.karta7AndTabla26.discreteTimeSlices || [];
    if (slices.length !== 2 || slices[0]?.id !== 'ca_1850' || slices[1]?.id !== 'ca_1900') {
      errors.push(
        'Karta 7 måste ha exakt 2 diskreta tidsskikt: ca_1850 och ca_1900 (aldrig steglöst reglage).'
      );
    }
    for (const s of slices) {
      errors.push(...validateTimeSpecification(s.timeSpec, doc));
    }
    if (!atlas.karta7AndTabla26.borderHistoricalNote?.includes('1920–1939')) {
      errors.push('Karta 7 måste ange att nationsgränserna avser 1920–1939 (not 63 s. 117).');
    }
    if (!atlas.karta7AndTabla26.unevenSourceCoverageWarning?.includes('1850')) {
      errors.push('Karta 7 måste varna för ojämn källtäckning ca 1850 (s. 117).');
    }
    if ((atlas.karta7AndTabla26.tabla26Rows || []).length !== 42) {
      errors.push(
        `Tablå 26 måste innehålla exakt 42 rader (fick ${atlas.karta7AndTabla26.tabla26Rows?.length ?? 0}).`
      );
    }
    for (const row of atlas.karta7AndTabla26.tabla26Rows || []) {
      errors.push(...validateSourceLocation(row.source, doc));
    }
    for (const reg of atlas.karta7AndTabla26.karta7Regions || []) {
      errors.push(...validateSourceLocation(reg.source, doc));
    }
    errors.push(...validateSourceLocation(atlas.karta7AndTabla26.sourceKarta7, doc));
    errors.push(...validateSourceLocation(atlas.karta7AndTabla26.sourceTabla26, doc));
  }

  // Regionala fördjupningar (Dalmål, Överkalixmål, Estlandssvenska)
  if (!atlas.regionalDeepDives) {
    errors.push('regionalDeepDives saknas.');
  } else {
    const { dalmal, overkalixmal, estlandssvenska } = atlas.regionalDeepDives;
    if (!dalmal || dalmal.tabla23Alvdalska.verbs.length !== 5) {
      errors.push('Tablå 23 (standardälvdalska) måste innehålla 5 typverb.');
    }
    if (!overkalixmal || overkalixmal.tabla24Overkalix.verbs.length !== 5) {
      errors.push('Tablå 24 (överkalixmål) måste innehålla 5 typverb.');
    }
    if (!estlandssvenska || estlandssvenska.tabla25Nuckomal.verbs.length !== 5) {
      errors.push('Tablå 25 (nuckömål) måste innehålla 5 typverb.');
    }
    errors.push(...validateSourceLocation(dalmal.tabla23Alvdalska.source, doc));
    errors.push(...validateSourceLocation(overkalixmal.tabla24Overkalix.source, doc));
    errors.push(...validateSourceLocation(estlandssvenska.tabla25Nuckomal.source, doc));
  }

  // Plural imperativ (Karta 15 & 16)
  if (
    !atlas.pluralImperativeSouthwest ||
    atlas.pluralImperativeSouthwest.karta15Zones.length < 3
  ) {
    errors.push('Karta 15 måste redovisa ändelsezonerna -e(n), -a och -er.');
  } else {
    if (
      atlas.pluralImperativeSouthwest.karta16QuestionnaireBias.elicitationPhrases.length !== 4
    ) {
      errors.push(
        'Karta 16 måste redovisa typordlistornas 4 imperativfraser med er (skynda er, lägg er, bränn er inte, skär er inte).'
      );
    }
    errors.push(...validateSourceLocation(atlas.pluralImperativeSouthwest.sourceKarta15, doc));
    errors.push(
      ...validateSourceLocation(
        atlas.pluralImperativeSouthwest.karta16QuestionnaireBias.source,
        doc
      )
    );
  }

  // Hypotetisk rekonstruktion (Karta 14)
  const k14 = atlas.hypotheticalReconstructionKarta14;
  if (!k14) {
    errors.push('hypotheticalReconstructionKarta14 saknas.');
  } else {
    if (k14.evidenceStatus !== 'hypothetical_reconstruction') {
      errors.push('Karta 14 måste ha evidenceStatus="hypothetical_reconstruction".');
    }
    errors.push(...validateTimeSpecification(k14.timeSpec, doc));
    errors.push(...validateUncertaintyMarker(k14.uncertainty, k14.evidenceStatus, k14.id));
    errors.push(...validateSourceLocation(k14.source, doc));
  }

  // Avvecklingstyper (Tablå 42, Figur 10, Tablå 43)
  const dt = atlas.dismantlingTypes;
  if (!dt || dt.types.length !== 4) {
    errors.push('Tablå 42 måste innehålla exakt 4 avvecklingstyper (typ-1..typ-4).');
  } else {
    const typ4 = dt.types.find((t) => t.id === 'typ-4');
    if (
      !typ4 ||
      typ4.steps.step3.p1 !== '?' ||
      typ4.steps.step3.p2 !== '?' ||
      typ4.steps.step3.p3 !== '?' ||
      typ4.steps.step4.p1 !== '?' ||
      typ4.steps.step4.p2 !== '?' ||
      typ4.steps.step4.p3 !== '?'
    ) {
      errors.push(
        'Avvecklingstyp 4 måste bevara "?" för de obelagda stegen 3 och 4 enligt Tablå 42 (s. 243) och får aldrig fyllas i som säker fakta.'
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateCaseStudiesData(
  cs: CaseStudiesData,
  doc?: SourceDocument
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Mark & Kind (41 informanter)
  if (!cs.markAndKind) {
    errors.push('markAndKind saknas.');
  } else {
    if (cs.markAndKind.informants.length !== 41) {
      errors.push(
        `Mark & Kind måste ha exakt 41 informanter i Tablå 30/32/34 (fick ${cs.markAndKind.informants.length}).`
      );
    }
    const cohortSum = cs.markAndKind.cohortsTabla33.reduce(
      (acc, c) => acc + c.informantCount,
      0
    );
    if (cohortSum !== 41) {
      errors.push(
        `Tablå 33 kohorter måste summera till 41 informanter (9 + 22 + 10), fick ${cohortSum}.`
      );
    }
    for (const c of cs.markAndKind.cohortsTabla33) {
      if (c.unit !== 'grammatiska_personer') {
        errors.push(`Tablå 33 kohort ${c.cohort} måste ha unit="grammatiska_personer".`);
      }
    }
    if (cs.markAndKind.pronounSummaryAllTokensTabell1.unit !== 'antal_informanter') {
      errors.push('Tabell 1 måste ha unit="antal_informanter".');
    }
    if (cs.markAndKind.pronounSummaryMinFiveTabell2.unit !== 'antal_informanter') {
      errors.push('Tabell 2 måste ha unit="antal_informanter".');
    }
    errors.push(...validateSourceLocation(cs.markAndKind.sourceTabla30, doc));
    errors.push(...validateSourceLocation(cs.markAndKind.sourceTabla32, doc));
    errors.push(...validateSourceLocation(cs.markAndKind.sourceTabla33, doc));
    errors.push(...validateSourceLocation(cs.markAndKind.sourceTabla34, doc));
  }

  // Östra Göinge (21 informanter i Tablå 35–38 vs K01 på s. 212)
  if (!cs.ostraGoinge) {
    errors.push('ostraGoinge saknas.');
  } else {
    if (cs.ostraGoinge.informants.length !== 21) {
      errors.push(
        `Östra Göinge måste ha exakt 21 informanter i Tablå 35/36/38 (fick ${cs.ostraGoinge.informants.length}).`
      );
    }
    const k01 = cs.ostraGoinge.auditNoticeK01;
    if (
      !k01 ||
      k01.issueId !== 'K01' ||
      cs.ostraGoinge.overview.informantsInTablesCount !== 21 ||
      cs.ostraGoinge.overview.informantsNamedInProsePage212 !== 22 ||
      !k01.page212Quote.includes('22') ||
      !k01.page217AndTablesFact.includes('21')
    ) {
      errors.push(
        'K01 måste redovisas öppet med både s. 212 ("22 namngivna informanter, varav 18 män och 3 kvinnor") och s. 217 / Tablå 35–38 (21 informanter).'
      );
    }
    const ogCohortSum = cs.ostraGoinge.cohortsTabla37.reduce(
      (acc, c) => acc + c.informantCount,
      0
    );
    if (ogCohortSum !== 21) {
      errors.push(
        `Tablå 37 kohorter måste summera till 21 informanter (12 + 6 + 3), fick ${ogCohortSum}.`
      );
    }
    // Kontrollera att ungefärliga födelseår (*) och okända inspelningsår (?) har bevarats
    const approxBirthIds = cs.ostraGoinge.informants
      .filter((i) => i.isBirthYearApproximate)
      .map((i) => i.id);
    if (
      approxBirthIds.length !== 3 ||
      !approxBirthIds.includes('VS') ||
      !approxBirthIds.includes('NN 2') ||
      !approxBirthIds.includes('AP')
    ) {
      errors.push(
        'Tablå 35 måste bevara asterisk (*) för ungefärligt födelseår hos exakt VS (1878*), NN 2 (1879*) och AP (1883*).'
      );
    }
    const unknownRecIds = cs.ostraGoinge.informants
      .filter((i) => i.isRecordingYearUnknown)
      .map((i) => i.id);
    if (
      unknownRecIds.length !== 4 ||
      !unknownRecIds.includes('NN 1') ||
      !unknownRecIds.includes('PT') ||
      !unknownRecIds.includes('JJ') ||
      !unknownRecIds.includes('AB')
    ) {
      errors.push(
        'Tablå 35 måste bevara "?" (isRecordingYearUnknown=true) för exakt NN 1, PT, JJ och AB.'
      );
    }
    for (const inf of cs.ostraGoinge.informants) {
      if (inf.isRecordingYearUnknown && inf.recordedYear !== null) {
        errors.push(
          `Informant ${inf.id} har okänt inspelningsår ("?") men har ändå tilldelats numeriskt årtal (${inf.recordedYear}).`
        );
      }
    }
    errors.push(...validateSourceLocation(cs.ostraGoinge.sourceTabla35, doc));
    errors.push(...validateSourceLocation(cs.ostraGoinge.sourceTabla36, doc));
    errors.push(...validateSourceLocation(cs.ostraGoinge.sourceTabla37, doc));
    errors.push(...validateSourceLocation(cs.ostraGoinge.sourceTabla38, doc));
  }

  return { valid: errors.length === 0, errors };
}

