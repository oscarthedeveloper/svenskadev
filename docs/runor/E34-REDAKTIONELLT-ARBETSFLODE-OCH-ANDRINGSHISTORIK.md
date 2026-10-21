# E34 — Bygg redaktionellt arbetsflöde och ändringshistorik

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-22  
**Etapp-ID**: E34  
**Ansvar**: Redaktör och backendutvecklare  
**Beroenden**: E06, E17, E21, E28, E29 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json), Krav K12, K13  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och källkritiska principer

Etapp E34 inför ett komplett redaktionellt arbetsflöde och en oförstörande ändringshistorik (audit log) som säkerställer att ingen ny information kan publiceras utan källkontroll, och att inga manuella rättelser kan skrivas över i tysthet vid batch-importer:

1. **Strikta tillståndsövergångar (Kandidat → Granskning → Godkänd för release)**:
   - `kandidat`: Nyimporterad eller råextraherad post som kräver granskning mot PDF-förlagan i *Sveriges runinskrifter* (SRI). Kan inte publiceras direkt.
   - `under_granskning`: Tilldelad en namngiven sakgranskare.
   - `godkand_for_publicering`: Kvalitetskontrollerad, källhänvisad och redo för nästa versionssatta release (`svenska_publish_runic_dataset`).
   - `avvisad`: Avvisad post (t.ex. dubblett, icke-runinskrift eller oklara rättigheter) med obligatoriskt dokumenterat avvisningsskäl. Måste återstartas som `kandidat` om den ska prövas på nytt.
2. **Revisionslogg med aktör, orsak och tillståndsspårning (`svenska_runor_audit_log`)**:
   - Varje statusändring, fältredigering eller rollback loggas obligatoriskt med:
     - `slug` & `signum`
     - `action` (`status_change`, `field_update`, `rollback`, `import_conflict`, `published`)
     - `actor` (redaktörens namn eller användar-ID)
     - `reason` (saklig motivering på minst 5 tecken)
     - `previous_state` & `new_state` (fullständig JSONB-spårning)
3. **Återställbarhet vid misstag (Rollback)**:
   - Databasfunktionen `public.svenska_rollback_runic_draft` tillåter administratörer att återställa ett utkast till en godkänd historisk revision med en atomär transaktion och full loggning.
4. **Behörighetsskydd och RLS (Krav K13)**:
   - Anonyma och vanliga besökare nekas all åtkomst till utkast (`svenska_runor_drafts`) och ändringshistorik (`svenska_runor_audit_log`).
   - En råimport kan aldrig själv publicera data direkt till `svenska_runor_editions` — publicering kräver uttryckligt administrativt beslut och revisionstilldelning.

---

## 2. Implementerade moduler och gränssnitt

- **Databaslagring och migration**: [`supabase/migrations/20261022_runic_editorial.sql`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/supabase/migrations/20261022_runic_editorial.sql) (inkluderad i [`supabase/install-svenska.sql`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/supabase/install-svenska.sql))
- **Affärslogik och validering**: [`lib/runor/editorial.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/editorial.ts)
- **Administrationsgränssnitt**: [`app/admin/runor/page.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/app/admin/runor/page.tsx) & [`components/admin/RunicEditorialAdmin.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/admin/RunicEditorialAdmin.tsx)
- **Huvudmenyintegrering**: [`app/admin/page.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/app/admin/page.tsx)

---

## 3. Automatiserad verifiering ([`tests/runor-editorial.test.mjs`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/tests/runor-editorial.test.mjs))

Testsviten kontrollerar med PGlite:
1. `ALLOWED_STATUS_TRANSITIONS` tillåter endast reglementsenliga övergångar (t.ex. avvisar kandidat direkt till godkänd).
2. `validateApprovalForPublication` kräver registrerad granskare, motivering och källhänvisning.
3. `createAuditLogRecord` kastar fel om motivering saknas.
4. PostgreSQL-funktionerna `svenska_set_runic_draft_status` och `svenska_rollback_runic_draft` ändrar tillstånd, ökar revisionsnummer och skriver atomärt till `svenska_runor_audit_log`.
5. RLS nekar obehöriga och anonyma klienter läs- och skrivrättigheter till ändringshistorik och utkast.

Utfall: **117 av 117 tester godkända** i `npm test`. Typecheck och Next.js produktionsbygge slutförs felfritt.
