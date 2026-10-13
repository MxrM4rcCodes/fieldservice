"use client";
import { useState } from "react"; import { useRouter } from "next/navigation"; import Link from "next/link";
export default function Login() { const r = useRouter(); const [e, setE] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
 async function go(ev: React.FormEvent) { ev.preventDefault(); setBusy(true); setErr(""); const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: e, password: p }) }); const j = await res.json(); setBusy(false); if (!res.ok) return setErr(j.error || "Login failed"); r.push("/dashboard"); r.refresh(); }
 return (<div style={{maxWidth:440,margin:"36px auto"}}><div className="card" style={{padding:26}}>
  <h1 style={{marginTop:0}}>Sign in</h1><p className="muted">CGS ORIS Field Service Academy — your progress, scores, notes, and tickets are saved to your account.</p>
  <form onSubmit={go}><label className="small">Email<input className="input" type="email" required value={e} onChange={x=>setE(x.target.value)} autoComplete="email"/></label>
  <label className="small">Password<input className="input" type="password" required value={p} onChange={x=>setP(x.target.value)} autoComplete="current-password"/></label>
  {err && <p role="alert" style={{color:"#FF8A8A"}}>{err}</p>}<p><button className="btn" disabled={busy}>{busy?"Signing in…":"Sign in"}</button></p></form>
  <p className="small">New here? <Link href="/register">Create an account</Link></p>
  <div className="card" style={{padding:12}}><p className="small" style={{margin:0}}><strong>Seeded demo accounts</strong> (change in production):<br/>Learner — learner@academy.local / learner12345<br/>Admin — admin@academy.local / admin12345</p></div>
 </div></div>); }
