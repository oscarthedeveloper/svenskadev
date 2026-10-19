import Link from "next/link";

const NAV = [{ label: "Språkråd", href: "/sprakrad" }, { label: "Grammatik", href: "/grammatik" }, { label: "Ordval", href: "/ordval" }, { label: "Språkliv", href: "/sprakliv" }];

export default function StudyFrame({ children, title, active }: { children: React.ReactNode; title: string; active?: string }) {
  return (
    <main className="sub-shell">
      <div className="edition-strip"><span>Självstudiearkiv — öppen utgåva</span><strong>{title}</strong><span>Svenska · bruk och nyfikenhet</span></div>
      <header className="sub-header">
        <Link className="wordmark" href="/" aria-label="svenska.dev — startsida"><span>svenska.dev</span></Link>
        <nav aria-label="Huvudnavigation">
          <ul>
            {NAV.map((item) => <li key={item.href}><Link className={active === item.href ? "active" : ""} href={item.href}>{item.label}</Link></li>)}
          </ul>
        </nav>
      </header>
      <div className="sub-body">{children}</div>
      <div className="edition-strip edition-strip-bottom"><span>Levande referensverk</span><strong>Språk · texter · sammanhang</strong><span>Utgåva 1.0</span></div>
    </main>
  );
}
