import Link from "next/link";
import { getHomepage } from "@/lib/homepage";
import { selectFeaturedArticles } from "@/lib/homepage-model";
import { SECTIONS } from "@/lib/sections";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { content, articles } = await getHomepage();
  const featured = selectFeaturedArticles(content.featuredIds,articles);
  const exampleHref = articles.find(article=>article.href==="/sprakrad/de-och-dem")?.href ?? "/sprakrad";
  const wordHref = articles.find(article=>article.href==="/ordval/anglicismer")?.href ?? "/ordval";
  return (
    <main className="home-shell">
      <header className="home-header">
        <Link className="wordmark" href="/" aria-label="svenska.dev — startsida"><span>svenska.dev</span></Link>
        <nav aria-label="Huvudnavigation"><ul className="home-nav">{SECTIONS.map((item, i) => <li key={item.slug}><Link href={`/${item.slug}`}><span aria-hidden="true">0{i + 1}</span>{item.title}</Link></li>)}</ul></nav>
      </header>
      <section className="hero-grid">
        <div className="hero-intro">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1>{content.headline}<em>{content.accent}</em></h1>
          <p className="hero-copy">{content.intro}</p>
          <div className="hero-actions"><Link className="button button-primary" href="/sprakrad">Hitta ett språkråd <span aria-hidden="true">↗</span></Link><Link className="text-link" href="/ordval">Utforska ordval →</Link></div>
        </div>
        <div className="specimen" aria-label="Språkexempel: de och dem">
          <div className="specimen-topline"><span>Språkfråga 001</span><span>De / dem</span></div>
          <blockquote>De skriver.<br />Vi läser dem.</blockquote>
          <div className="specimen-analysis"><span className="analysis-marker">!</span><p><strong>Prova med vi och oss.</strong><small>Vi skriver → de skriver.<br />Vi läser oss → vi läser dem.</small></p></div>
          <Link className="specimen-source" href={exampleHref}><span>När väljer man vad?</span><span>Läs förklaringen ↗</span></Link>
        </div>
        <aside className="period-index" aria-label="Börja med en fråga"><p className="eyebrow">Börja här</p><ol>
          {featured.map((article,i)=><li key={article.id}><Link href={article.href}><span>{String(i+1).padStart(2,"0")} / {article.section}</span>{article.title}</Link></li>)}
          {!featured.length && <li><Link href="/sprakrad"><span>Språkråd</span>Utforska arkivet →</Link></li>}
        </ol></aside>
      </section>
      <section className="study-grid" aria-labelledby="study-title">
        <div className="study-heading"><p className="eyebrow">Från fråga till förståelse</p><h2 id="study-title">Följ din<br />nyfikenhet.</h2></div>
        <Link className="study-card card-coral" href="/sprakrad"><span className="card-number">01</span><div><h3>Språkråd</h3><p>Vardagliga frågor. Begripliga svar. Exempel som hjälper.</p></div><span className="card-arrow" aria-hidden="true">↗</span></Link>
        <Link className="study-card card-blue" href="/grammatik"><span className="card-number">02</span><div><h3>Grammatik</h3><p>Upptäck mönstren bakom meningarna, formerna och orden.</p></div><span className="card-arrow" aria-hidden="true">↗</span></Link>
        <div className="study-note"><span>SV / Ord & tanke</span><p>Ett levande språk förtjänar mer än en lista med rätt och fel.</p></div>
      </section>
      <section className="word-section" aria-labelledby="word-title"><div><p className="eyebrow">Säg det på svenska</p><h2 id="word-title">Ett ordval.<br />Flera möjligheter.</h2><Link className="text-link" href={wordHref}>Fler svenska alternativ →</Link></div><div className="word-pairs"><p><span>makea sense</span><strong>låta rimligt / vara begripligt</strong></p><p><span>brainstorma</span><strong>spåna / kläcka idéer</strong></p><p><span>en deadline</span><strong>en sista dag / en tidsfrist</strong></p><small>Välj efter sammanhang. Alternativen är redaktionella förslag.</small></div></section>
      <section className="more-section" aria-labelledby="more-title">
        <div>
          <p className="eyebrow">Det finns mer att upptäcka</p>
          <h2 id="more-title">Svenskan i livet & historien.</h2>
        </div>
        <p>
          Dialekter, språkhistoria, stil och uttryck — bland annat den interaktiva studien{' '}
          <Link className="text-link" href="/sprakliv/person-och-numerus">
            Från person till person ↗
          </Link>{' '}
          om sydvästsvensk verbböjning samt det nya källkritiska verket{' '}
          <Link className="text-link" href="/runor">
            Runor ↗
          </Link>{' '}
          med Sveriges runinskrifter, digitala faksimil och interaktiv karta.
        </p>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <Link className="button" href="/sprakliv">
            Till språklivet ↗
          </Link>
          <Link className="button button-primary" href="/runor">
            Utforska Runor ↗
          </Link>
        </div>
      </section>
      <footer className="home-footer">
        <span>svenska.dev — med ordet i centrum</span>
        <span>Språkråd · grammatik · ordval · språkliv · runor</span>
        <Link href="/admin">Administration ↗</Link>
      </footer>
    </main>
  );
}
