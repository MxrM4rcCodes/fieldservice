"use client";
import { useEffect, useState } from "react"; import Link from "next/link";
export default function Dashboard() {
 const [d, setD] = useState<any>(null); const [date, setDate] = useState(""); const [track, setTrack] = useState("course14"); const [saved, setSaved] = useState("");
 useEffect(() => { fetch("/api/dashboard").then(r => r.json()).then(j => { setD(j); setDate(j.user.interviewDate || ""); setTrack(j.user.track || "course14"); }); }, []);
 async function saveProfile() { const res = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ interviewDate: date || null, track }) }); if (res.ok) { setSaved("Saved to your account."); fetch("/api/dashboard").then(r=>r.json()).then(setD); } }
 if (!d) return <p>Loading your dashboard…</p>;
 const rec = d.recommendation;
 return (<div>
  <h1 style={{marginBottom:4}}>Welcome back, {d.user.name}</h1>
  <p className="muted">Progress below comes only from your recorded lessons, quizzes, scenarios, flashcards, and interview practice — nothing is estimated.</p>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14}}>
   <section className="card" style={{padding:18}} aria-label="Interview countdown"><h2 style={{marginTop:0}}>Interview date</h2>
    {d.user.countdownDays !== null ? <p><strong style={{fontSize:28}}>{d.user.countdownDays} days</strong> <span className="muted">until {d.user.interviewDate}</span></p> : <p className="muted">Set your interview date to start the countdown.</p>}
    <label className="small">Interview date<input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
    <label className="small">Current track<select className="input" value={track} onChange={e=>setTrack(e.target.value)}><option value="course14">Full 14-Day Technical Course</option><option value="bootcamp3">3-Day Interview Bootcamp</option></select></label>
    <p><button className="btn" onClick={saveProfile}>Save to account</button> {saved && <span className="small" style={{color:"#3ECF8E"}}>{saved}</span>}</p></section>
   <section className="card" style={{padding:18}} aria-label="Overall progress"><h2 style={{marginTop:0}}>Course progress</h2>
    <p><strong style={{fontSize:28}}>{d.overallPercent}%</strong> <span className="muted">{d.completedLessons} of {d.totalLessons} days completed</span></p>
    <div style={{background:"#0B1220",borderRadius:8,height:14}}><div style={{width:d.overallPercent+"%",background:"#2DD4BF",height:14,borderRadius:8}}/></div>
    <p>{rec ? <Link className="btn" href={`/course/${rec.slug}`}>Resume Learning →</Link> : <span style={{color:"#3ECF8E"}}>Course complete — run the Day 14 mock interview.</span>}</p></section>
   <section className="card" style={{padding:18}} aria-label="Recommendation"><h2 style={{marginTop:0}}>Recommended next</h2>
    {rec ? <><p><strong>{rec.title}</strong></p><p className="small muted">Weakest area right now: <strong style={{color:"#F5B544"}}>{d.weakest}</strong>. Recommendations rank incomplete lessons by lowest mastery, then least evidence, weighted by study priority.</p><Link className="btn2" href={`/course/${rec.slug}`}>Start recommended lesson</Link></> : <p>All lessons complete.</p>}
    <p className="small muted">Counts — tickets: {d.counts.tickets} · interview attempts: {d.counts.interviewAttempts} · scenario runs: {d.counts.scenarioRuns}</p></section>
  </div>
  <section className="card" style={{padding:18,marginTop:14}} aria-label="Competency mastery"><h2 style={{marginTop:0}}>Competency mastery <span className="small muted">(observed, from your records)</span></h2>
   {Object.keys(d.mastery).map(c => (<div key={c} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}><span>{c}</span><span className="small muted">Mastery {d.mastery[c]}% · evidence items {d.evidence[c]} · study-priority weight {d.studyWeights[c]}% (where to spend time — not a score)</span></div>
   <div style={{background:"#0B1220",borderRadius:8,height:12}}><div style={{width:d.mastery[c]+"%",background:c===d.weakest?"#F5B544":"#2DD4BF",height:12,borderRadius:8}}/></div></div>))}
  </section>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14,marginTop:14}}>
   <section className="card" style={{padding:18}}><h2 style={{marginTop:0}}>Recent lessons</h2>{d.recent.length? d.recent.map((l:any)=><p key={l.id} style={{margin:"6px 0"}}><Link href={`/course/${l.slug}`}>Day {l.day}: {l.title}</Link> <span className="small muted">{l.status} · {l.percent}%</span></p>) : <p className="muted">No lessons started yet.</p>}</section>
   <section className="card" style={{padding:18}}><h2 style={{marginTop:0}}>Saved notes</h2>{d.notes.length? d.notes.map((n:any)=><p key={n.id} className="small" style={{borderLeft:"3px solid #2DD4BF",paddingLeft:8}}>{n.body.slice(0,160)}</p>) : <p className="muted">Notes you save inside lessons appear here.</p>}<Link href="/course">Open the course →</Link></section>
   <section className="card" style={{padding:18}}><h2 style={{marginTop:0}}>Study history</h2><p className="small">{d.lessons.filter((l:any)=>l.status==="completed").map((l:any)=>`Day ${l.day}`).join(", ") || "Nothing completed yet — Day 1 is a great start."}</p><p><Link href="/bootcamp">3-Day Bootcamp</Link> · <Link href="/simulator">Diagnostic Simulator</Link> · <Link href="/flashcards">Flashcards</Link></p></section>
  </div></div>); }
