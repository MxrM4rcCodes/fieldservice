"use client";
import { useState } from "react"; import { useRouter } from "next/navigation"; import Link from "next/link";
export default function Register() { const r = useRouter(); const [n,setN]=useState(""); const [e,setE]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState("");
 async function go(ev: React.FormEvent) { ev.preventDefault(); setErr(""); const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: n, email: e, password: p }) }); const j = await res.json(); if (!res.ok) return setErr(j.error || "Registration failed"); r.push("/dashboard"); r.refresh(); }
 return (<div style={{maxWidth:440,margin:"36px auto"}}><div className="card" style={{padding:26}}><h1 style={{marginTop:0}}>Create your account</h1>
 <form onSubmit={go}><label className="small">Full name<input className="input" required value={n} onChange={x=>setN(x.target.value)} autoComplete="name"/></label>
 <label className="small">Email<input className="input" type="email" required value={e} onChange={x=>setE(x.target.value)} autoComplete="email"/></label>
 <label className="small">Password (10+ characters)<input className="input" type="password" required minLength={10} value={p} onChange={x=>setP(x.target.value)} autoComplete="new-password"/></label>
 {err && <p role="alert" style={{color:"#FF8A8A"}}>{err}</p>}<p><button className="btn">Create account & start learning</button></p></form>
 <p className="small">Already registered? <Link href="/login">Sign in</Link></p></div></div>); }
