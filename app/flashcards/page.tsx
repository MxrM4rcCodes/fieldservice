"use client";
import { useEffect, useMemo, useState } from "react";
export default function Flashcards() { const [cards,setCards]=useState<any[]>([]); const [q,setQ]=useState(""); const [cat,setCat]=useState("All"); const [flip,setFlip]=useState<string|null>(null); const [onlyDifficult,setOnlyDifficult]=useState(false);
 useEffect(()=>{ fetch("/api/flashcards").then(r=>r.json()).then(setCards); },[]);
 const cats = useMemo(()=>["All",...Array.from(new Set(cards.map(c=>c.category)))],[cards]);
 const list = cards.filter(c=>(cat==="All"||c.category===cat)&&(!onlyDifficult||c.mastery.state==="difficult")&&(c.term.toLowerCase().includes(q.toLowerCase())||c.definition.toLowerCase().includes(q.toLowerCase())));
 async function mark(id:string,state:string){ const res=await fetch("/api/flashcards",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({cardId:id,state})}); if(res.ok) setCards(cs=>cs.map(c=>c.id===id?{...c,mastery:{state,reviews:(c.mastery.reviews||0)+1}}:c)); }
 const known = cards.filter(c=>c.mastery.state==="known").length, difficult = cards.filter(c=>c.mastery.state==="difficult").length;
 return (<div><h1>Flashcards & Glossary</h1>
 <p className="muted">{cards.length} terms · {known} known · {difficult} marked difficult. Mastery is saved to your account and feeds your competency scores. Spaced-review rule: difficult cards resurface first here and are recommended on your Dashboard until upgraded to Known.</p>
 <div className="no-print" style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}><input className="input" style={{maxWidth:280}} placeholder="Search terms or definitions…" value={q} onChange={e=>setQ(e.target.value)} aria-label="Search flashcards"/>
 <select className="input" style={{maxWidth:220}} value={cat} onChange={e=>setCat(e.target.value)} aria-label="Category filter">{cats.map(c=><option key={c}>{c}</option>)}</select>
 <button className="btn2" aria-pressed={onlyDifficult} style={onlyDifficult?{borderColor:"#F5B544",color:"#F5B544"}:{}} onClick={()=>setOnlyDifficult(!onlyDifficult)}>Review difficult ({difficult})</button></div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>{list.map(c=>(<article key={c.id} className="card" style={{padding:16}}>
  <p className="small" style={{color:"#2DD4BF",margin:0}}>{c.category} · {c.mastery.state}{c.mastery.reviews?` · reviewed ${c.mastery.reviews}×`:""}</p>
  {flip===c.id ? <><p style={{lineHeight:1.6}}>{c.definition}</p><button className="btn2" onClick={()=>setFlip(null)}>Show term</button></> : <><h2 style={{margin:"8px 0"}}>{c.term}</h2><button className="btn2" onClick={()=>setFlip(c.id)}>Flip card</button></>}
  <p style={{display:"flex",gap:8}}><button className="btn" onClick={()=>mark(c.id,"known")}>Mark known</button><button className="btn2" onClick={()=>mark(c.id,"difficult")}>Difficult</button><button className="btn2" onClick={()=>mark(c.id,"learning")}>Learning</button></p></article>))}</div>
 {list.length===0 && <p className="muted">No cards match. Adjust search/filter — or celebrate: no difficult cards pending.</p>}</div>); }
