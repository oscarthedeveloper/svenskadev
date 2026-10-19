"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { saveHomepage } from "@/lib/actions";
import { validateHomepage, type HomepageContent, type FeaturedArticle } from "@/lib/homepage-model";
export default function HomepageEditor({initial,initialRevision,articles,needsMigration}:{initial:HomepageContent;initialRevision:number;articles:FeaturedArticle[];needsMigration:boolean}) {
  const [content,setContent] = useState(initial);
  const [revision,setRevision] = useState(initialRevision);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [dirty,setDirty] = useState(false);
  useEffect(()=>{
    const warn=(event:BeforeUnloadEvent)=>{if(dirty){event.preventDefault();event.returnValue="";}};
    window.addEventListener("beforeunload",warn);
    return ()=>window.removeEventListener("beforeunload",warn);
  },[dirty]);
  function update(next:HomepageContent) {setContent(next);setDirty(true);setMessage("");}
  return <section className="homepage-editor" aria-labelledby="homepage-editor-title"><h2 id="homepage-editor-title">Startsidan</h2><p>Ändra introduktionen och välj upp till fyra publicerade artiklar under ”Börja här”. Ändringarna blir synliga när du sparar.</p>
    {needsMigration ? <p role="alert">Kör migrationen <code>20261017_homepage.sql</code> för att aktivera startsidans redigering.</p> : <form onSubmit={async event=>{
      event.preventDefault(); const payload = {...content,featuredIds:content.featuredIds.filter(Boolean)}; const invalid = validateHomepage(payload); if(invalid){setMessage(invalid);return;}
      setBusy(true);try{const result=await saveHomepage(payload,revision); if(result.ok && result.revision!==undefined){setRevision(result.revision);setContent(payload);setDirty(false);setMessage("Startsidan är sparad och uppdaterad.");}else setMessage(result.error??"Sparningen misslyckades.");}catch{setMessage("Anslutningen bröts. Försök spara igen.");}finally{setBusy(false);}
    }}><fieldset disabled={busy}>
      <label>Överrubrik<input required maxLength={80} value={content.eyebrow} onChange={e=>update({...content,eyebrow:e.target.value})}/></label>
      <div className="homepage-heading-fields"><label>Rubrik, första raden<input required maxLength={24} value={content.headline} onChange={e=>update({...content,headline:e.target.value})}/></label><label>Rubrik, andra raden<input required maxLength={24} value={content.accent} onChange={e=>update({...content,accent:e.target.value})}/></label></div>
      <label>Introduktion<textarea required maxLength={500} rows={5} value={content.intro} onChange={e=>update({...content,intro:e.target.value})}/></label>
      <h3>Utvalda artiklar</h3><p>Endast publicerade artiklar visas. Avpublicerade artiklar försvinner automatiskt från startsidans urval.</p>
      {[0,1,2,3].map(i=><label key={i}>Plats {i+1}<select value={content.featuredIds[i]??""} onChange={e=>{const ids=Array.from({length:4},(_,index)=>content.featuredIds[index]??"");ids[i]=e.target.value;update({...content,featuredIds:ids});}}><option value="">Ingen artikel</option>{articles.map(article=><option key={article.id} value={article.id}>{article.section} — {article.title}</option>)}</select></label>)}
      <button type="submit">{busy?"Sparar …":"Spara startsidan"}</button><span>{dirty?"Osparade ändringar":""}</span>
    </fieldset></form>}
    {message && <p role="status">{message}</p>}<Link href="/">Visa startsidan →</Link>
  </section>;
}
