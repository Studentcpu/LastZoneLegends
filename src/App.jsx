import { db as firestoreDB } from "./firebase";


import {
  collection,
  getDocs,
  setDoc,
  doc,
  addDoc,
  query,
  where
} from "firebase/firestore";

import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
   LAST ZONE LEGEND — Full App
   Login · Register · Home · Tournaments · Leaderboard
   Wallet (UPI Deposit + Withdraw) · Profile · Admin Panel
   ═══════════════════════════════════════════════════════════ */

const db = {
  async get(k) {
    try {
      const snapshot = await getDocs(
        collection(firestoreDB, k)
      );

      const data = [];
      snapshot.forEach((d) => {
        data.push(d.data());
      });

      return data.length ? data : null;
    } catch {
      return null;
    }
  },

  async set(k, v) {
    try {
      if (Array.isArray(v)) {
        for (const item of v) {
          await setDoc(
            doc(
              firestoreDB,
              k,
              String(item.id)
            ),
            item
          );
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
};

const D = {
users: [
  {
    id: 1,
    email: "admin@lastzone.com",
    password: "admin123",
    name: "Admin",
    role: "admin",
    balance: 9999,
    bgmiUid: "",
    ffUid: "",
    joined: [],
    transactions: []
  },
  {
    id: 2,
    email: "player@test.com",
    password: "pass123",
    name: "ProPlayer123",
    role: "user",
    balance: 350,
    bgmiUid: "512847291",
    ffUid: "8827364",
    joined: [2],
    transactions: []
  }
],
  tournaments: [
    { id: 1, game: "BGMI", title: "BGMI Squad War", prize: "₹10,000", entryFee: 50, slots: 25, filled: 18, time: "07:00 PM", date: "Today", map: "Erangel", mode: "Squad", status: "open", roomId: "", password: "" },
    { id: 2, game: "FreeFire", title: "FF Solo Clash", prize: "₹5,000", entryFee: 30, slots: 48, filled: 48, time: "05:30 PM", date: "Today", map: "Bermuda", mode: "Solo", status: "live", roomId: "FF2847", password: "zone99" },
    { id: 3, game: "BGMI", title: "BGMI Duo Rush", prize: "₹8,000", entryFee: 40, slots: 25, filled: 10, time: "09:00 PM", date: "Today", map: "Miramar", mode: "Duo", status: "open", roomId: "", password: "" },
  ],
  settings: { upiId: "yourname@paytm", upiName: "Last Zone Legend", qrUrl: "", minDeposit: 50, minWithdraw: 200, maxWithdraw: 10000 },
};

// ── STYLE TOKENS ──────────────────────────────────────────
const C = { red: "#ff3c3c", gold: "#ffd740", green: "#00e676", orange: "#ff8c00", dark: "#060b14", card: "rgba(255,255,255,.04)", border: "rgba(255,255,255,.08)" };
const sc = s => s === "live" ? C.red : s === "open" ? C.green : C.gold;
const sl = s => s === "live" ? "🔴 LIVE" : s === "open" ? "🟢 OPEN" : "🟡 UPCOMING";

const inp = { width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
const btnP = { width: "100%", padding: 14, background: `linear-gradient(135deg,${C.red},${C.orange})`, border: "none", borderRadius: 10, color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 20px rgba(255,60,60,.35)" };
const btnS = { width: "100%", padding: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: "#888", fontWeight: 700, fontSize: 14, cursor: "pointer" };

// ── TINY SHARED COMPONENTS ────────────────────────────────
const Fg = ({ label, children }) => <div style={{ marginBottom: 13 }}><div style={{ fontSize: 10, color: "#666", letterSpacing: 2, marginBottom: 5, fontWeight: 700 }}>{label}</div>{children}</div>;
const EyeIcon = ({ o }) => o
  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const Badge = ({ s }) => { const m = { pending: [C.gold,"⏳ Pending"], approved: [C.green,"✅ Approved"], paid: [C.green,"💸 Paid"], rejected: [C.red,"❌ Rejected"], done: [C.green,"✅ Done"] }; const [c,l] = m[s]||["#888",s]; return <span style={{ fontSize:10, fontWeight:800, color:c, background:c+"22", border:`1px solid ${c}55`, borderRadius:20, padding:"3px 10px" }}>{l}</span>; };
const Notif = ({ n }) => { const bg = { error:C.red, warn:C.gold, success:C.green }[n.type]||C.green; return <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", background:bg, color:"#000", padding:"10px 22px", borderRadius:10, fontWeight:800, fontSize:13, zIndex:9999, boxShadow:"0 4px 20px rgba(0,0,0,.5)", maxWidth:"92vw", textAlign:"center", whiteSpace:"nowrap" }}>{n.msg}</div>; };
const Overlay = ({ onClick, children }) => <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.88)", backdropFilter:"blur(6px)", zIndex:500, display:"flex", alignItems:"flex-end" }} onClick={onClick}>{children}</div>;
const Modal = ({ children, onClick }) => <div style={{ width:"100%", maxWidth:430, background:"#0d1520", borderRadius:"20px 20px 0 0", border:"1px solid rgba(255,255,255,.1)", padding:20, margin:"0 auto", maxHeight:"88vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>{children}</div>;

// ══════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("splash");
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [tours, setTours] = useState([]);
  const [reqs, setReqs] = useState([]);
  const [settings, setSettings] = useState(D.settings);
  const [tab, setTab] = useState("home");
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    (async () => {
      const su=await db.get("lzl-u"), st=await db.get("lzl-t"), ss=await db.get("lzl-s"), sr=await db.get("lzl-r"), sg=await db.get("lzl-g");


const u = su || D.users;
const r = sr || [];
const g = sg || D.settings;
      // fix: D.tournaments not D.tours
      const tt = st || D.tournaments;
      setUsers(u); setTours(tt); setReqs(r); setSettings(g);
      if(!su) await db.set("lzl-u",u);
      if(!st) await db.set("lzl-t",tt);
      if(!sr) await db.set("lzl-r",r);
      if(!sg) await db.set("lzl-g",g);
      if(ss){ const found=u.find(x=>x.id===ss.id); if(found){ setUser(found); setScreen(found.role==="admin"?"admin":"app"); } else setScreen("login"); }
      else setTimeout(()=>setScreen("login"),1500);
    })();
  }, []);

  const saveU = async u => { setUsers(u); await db.set("lzl-u",u); };
  const saveT = async t => { setTours(t); await db.set("lzl-t",t); };
  const saveR = async r => { setReqs(r); await db.set("lzl-r",r); };
  const saveG = async g => { setSettings(g); await db.set("lzl-g",g); };
  const toast = (msg, type="success") => { setNotif({msg,type}); setTimeout(()=>setNotif(null),3000); };

const login = async (email, pass) => {
  try {
    const q = query(
      collection(firestoreDB, "users"),
      where("email", "==", email)
    );

if(email==="admin@lastzone.com" && pass==="admin123"){
  const admin = D.users.find(u=>u.role==="admin");
  setUser(admin);
  db.set("lzl-s",{id:admin.id});
  setScreen("admin");
  return;
}
    const snap = await getDocs(q);

    if (snap.empty) {
      return toast("❌ User not found", "error");
    }

    const found = snap.docs[0].data();

    if (found.password !== pass) {
      return toast("❌ Wrong password", "error");
    }

    setUser(found);
    db.set("lzl-s", { id: found.id });

    setScreen(
      found.role === "admin" ? "admin" : "app"
    );

    toast(`Welcome ${found.name} 🎮`);
  } catch {
    toast("Login failed", "error");
  }
};
const register = async (name,email,pass) => {
  try {

    if (
      users.find(
        u => u.email.toLowerCase() === email.toLowerCase()
      )
    ) {
      return toast("❌ Email already registered!","error");
    }

    const nu = {
      id: Date.now(),
      email: email,
      password: pass,
      name: name,
      role: "user",
      balance: 0,
      bgmiUid: "",
      ffUid: "",
      joined: [],
      transactions: []
    };

    await addDoc(
      collection(firestoreDB,"users"),
      nu
    );

    await saveU([...users,nu]);

    //setUser(nu);
setUser({...nu, balance:0});
    db.set("lzl-s",{id:nu.id});

    setScreen("app");

    toast(`Welcome ${name}! 🎉`);

  } catch(e) {
    console.log(e);
    alert(e.message);
  }
};


  const logout = () => { setUser(null); db.set("lzl-s",null); setScreen("login"); setTab("home"); };

  const joinTour = async t => {
    if(user.joined?.includes(t.id)) return toast("Already joined!","warn");
    if(user.balance<t.entryFee) return toast("❌ Low balance! Add money first.","error");
    const tx={id:Date.now(),type:"debit",desc:`Entry: ${t.title}`,amount:t.entryFee,date:new Date().toLocaleDateString("en-IN"),status:"done"};
    const nu={...user,balance:user.balance-t.entryFee,joined:[...(user.joined||[]),t.id],transactions:[tx,...(user.transactions||[])]};
    const nt=tours.map(x=>x.id===t.id?{...x,filled:Math.min(x.filled+1,x.slots)}:x);
    await saveU(users.map(u=>u.id===user.id?nu:u)); await saveT(nt); setUser(nu); toast(`✅ Joined "${t.title}"! 🎮`);
  };

  const doDeposit = async ({amount,txnId,screenshot}) => {
    const req={id:Date.now(),type:"deposit",userId:user.id,userName:user.name,userEmail:user.email,amount:Number(amount),txnId,screenshot,status:"pending",date:new Date().toLocaleDateString("en-IN"),time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})};
    await saveR([req,...reqs]); toast("✅ Deposit submitted! Admin will verify soon.");
  };

  const doWithdraw = async ({amount,upiId,upiName}) => {
    if(Number(amount)<settings.minWithdraw) return toast(`❌ Min withdraw ₹${settings.minWithdraw}`,"error");
    if(Number(amount)>settings.maxWithdraw) return toast(`❌ Max withdraw ₹${settings.maxWithdraw}`,"error");
    if(user.balance<Number(amount)) return toast("❌ Insufficient balance!","error");
    const tx={id:Date.now(),type:"debit",desc:`Withdrawal ₹${amount}`,amount:Number(amount),date:new Date().toLocaleDateString("en-IN"),status:"pending"};
    const nu={...user,balance:user.balance-Number(amount),transactions:[tx,...(user.transactions||[])]};
    const req={id:Date.now(),type:"withdraw",userId:user.id,userName:user.name,userEmail:user.email,amount:Number(amount),upiId,upiName,status:"pending",date:new Date().toLocaleDateString("en-IN"),time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})};
    await saveU(users.map(u=>u.id===user.id?nu:u)); await saveR([req,...reqs]); setUser(nu); toast("✅ Withdrawal requested!");
  };

  const approveDeposit = async id => {
    const req=reqs.find(r=>r.id===id); if(!req) return;
    const tu=users.find(u=>u.id===req.userId); if(!tu) return;
    const tx={id:Date.now(),type:"credit",desc:`Deposit Approved ₹${req.amount}`,amount:req.amount,date:new Date().toLocaleDateString("en-IN"),status:"done"};
    const nu={...tu,balance:tu.balance+req.amount,transactions:[tx,...(tu.transactions||[])]};
    await saveU(users.map(u=>u.id===tu.id?nu:u)); await saveR(reqs.map(r=>r.id===id?{...r,status:"approved"}:r));
    if(user.id===tu.id) setUser(nu); toast(`✅ ₹${req.amount} credited to ${req.userName}!`);
  };

  const rejectDeposit = async id => { await saveR(reqs.map(r=>r.id===id?{...r,status:"rejected"}:r)); toast("Deposit rejected."); };

  const markPaid = async id => {
    const req=reqs.find(r=>r.id===id); if(!req) return;
    const tu=users.find(u=>u.id===req.userId);
    if(tu){ const nu={...tu,transactions:(tu.transactions||[]).map(t=>t.desc?.includes("Withdrawal")&&t.status==="pending"?{...t,status:"done"}:t)}; await saveU(users.map(u=>u.id===tu.id?nu:u)); }
    await saveR(reqs.map(r=>r.id===id?{...r,status:"paid"}:r)); toast(`💸 Paid to ${req.userName}!`);
  };

  const refundWithdraw = async id => {
    const req=reqs.find(r=>r.id===id); if(!req) return;
    const tu=users.find(u=>u.id===req.userId); if(!tu) return;
    const tx={id:Date.now(),type:"credit",desc:`Refund ₹${req.amount}`,amount:req.amount,date:new Date().toLocaleDateString("en-IN"),status:"done"};
    const nu={...tu,balance:tu.balance+req.amount,transactions:[tx,...(tu.transactions||[])]};
    await saveU(users.map(u=>u.id===tu.id?nu:u)); await saveR(reqs.map(r=>r.id===id?{...r,status:"rejected"}:r));
    if(user.id===tu.id) setUser(nu); toast(`↩️ ₹${req.amount} refunded!`);
  };

  if(screen==="splash") return <Splash/>;

  return (
    <div style={{ minHeight:"100vh", background:C.dark, color:"#fff", fontFamily:"'Rajdhani','Orbitron',sans-serif", maxWidth:430, margin:"0 auto", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"fixed",top:-100,right:-100,width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,60,60,.15) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 }}/>
      <div style={{ position:"fixed",bottom:100,left:-100,width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,230,118,.1) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 }}/>
      {notif && <Notif n={notif}/>}
      {screen==="login" && <LoginScreen onLogin={login} onReg={()=>setScreen("register")}/>}
      {screen==="register" && <RegisterScreen onReg={register} onBack={()=>setScreen("login")}/>}
      {screen==="app" && user && <UserApp user={user} tours={tours} tab={tab} setTab={setTab} onJoin={joinTour} onLogout={logout} toast={toast} settings={settings} reqs={reqs.filter(r=>r.userId===user.id)} onDeposit={doDeposit} onWithdraw={doWithdraw} onUpdateUser={async nu=>{await saveU(users.map(u=>u.id===nu.id?nu:u));setUser(nu);}}/>}
      {screen==="admin" && user?.role==="admin" && <AdminPanel tours={tours} users={users} reqs={reqs} settings={settings} onSaveTours={saveT} onSaveSettings={saveG} onApprove={approveDeposit} onRejectDep={rejectDeposit} onMarkPaid={markPaid} onRefund={refundWithdraw} onSaveUsers={saveU} onLogout={logout} toast={toast}/>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  SPLASH
// ══════════════════════════════════════════════════════════
function Splash() {
  return (
    <div style={{ minHeight:"100vh", background:C.dark, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontSize:60, marginBottom:16, animation:"zp 1s infinite" }}>⚡</div>
      <div style={{ fontSize:32, fontWeight:900, letterSpacing:4, color:C.gold }}>LAST ZONE</div>
      <div style={{ fontSize:14, letterSpacing:8, color:C.red, marginBottom:40 }}>LEGEND</div>
      <div style={{ display:"flex", gap:6 }}>{[0,1,2].map(i=><div key={i} style={{ width:8,height:8,borderRadius:"50%",background:C.gold,animation:`zb 1s ${i*.2}s infinite` }}/>)}</div>
      <style>{`@keyframes zp{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}} @keyframes zb{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-8px);opacity:1}}`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════════
function LoginScreen({ onLogin, onReg }) {
  const [email,setEmail]=useState(""); const [pass,setPass]=useState(""); const [show,setShow]=useState(false);
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:16, position:"relative", zIndex:1 }}>
      <div style={{ width:"100%", maxWidth:390, background:"rgba(13,21,32,.95)", border:"1px solid rgba(255,255,255,.08)", borderRadius:20, padding:24 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:44, marginBottom:6 }}>⚡</div>
          <div style={{ fontSize:26, fontWeight:900, letterSpacing:3, color:C.gold }}>LAST ZONE</div>
          <div style={{ fontSize:10, letterSpacing:6, color:C.red, marginBottom:4 }}>LEGEND</div>
          <div style={{ fontSize:12, color:"#444" }}>BGMI & FreeFire Tournaments</div>
        </div>
        <Fg label="EMAIL"><input style={inp} type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}/></Fg>
        <Fg label="PASSWORD">
          <div style={{ position:"relative" }}>
            <input style={{...inp,paddingRight:44}} type={show?"text":"password"} placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onLogin(email,pass)}/>
            <button onClick={()=>setShow(!show)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#555",cursor:"pointer" }}><EyeIcon o={show}/></button>
          </div>
        </Fg>
        <button style={btnP} onClick={()=>onLogin(email,pass)}>LOGIN 🎮</button>
        <button style={{...btnS,marginTop:10}} onClick={onReg}>New Player? REGISTER FREE →</button>
</div>
    </div>
  );
}

function RegisterScreen({ onReg, onBack }) {
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [pass,setPass]=useState(""); const [show,setShow]=useState(false);
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:16, position:"relative", zIndex:1 }}>
      <div style={{ width:"100%", maxWidth:390, background:"rgba(13,21,32,.95)", border:"1px solid rgba(255,255,255,.08)", borderRadius:20, padding:24 }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:36, marginBottom:6 }}>🎮</div>
          <div style={{ fontSize:22, fontWeight:900 }}>Create Account</div>
          <div style={{ fontSize:12, color:"#555", marginTop:4 }}>Get ₹100 welcome bonus!</div>
        </div>
        <Fg label="PLAYER NAME"><input style={inp} placeholder="Your gamer name" value={name} onChange={e=>setName(e.target.value)}/></Fg>
        <Fg label="EMAIL"><input style={inp} type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}/></Fg>
        <Fg label="PASSWORD">
          <div style={{ position:"relative" }}>
            <input style={{...inp,paddingRight:44}} type={show?"text":"password"} placeholder="Min 6 characters" value={pass} onChange={e=>setPass(e.target.value)}/>
            <button onClick={()=>setShow(!show)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#555",cursor:"pointer" }}><EyeIcon o={show}/></button>
          </div>
        </Fg>
        <button style={btnP} onClick={()=>{if(!name.trim()||!email.trim()||pass.length<6) return alert("Fill all fields. Min 6 char password."); onReg(name.trim(),email.trim(),pass);}}>CREATE ACCOUNT 🚀</button>
        <button style={{...btnS,marginTop:10}} onClick={onBack}>← Back to Login</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  USER APP SHELL
// ══════════════════════════════════════════════════════════
function UserApp({ user,tours,tab,setTab,onJoin,onLogout,toast,settings,reqs,onDeposit,onWithdraw,onUpdateUser }) {
  const [selT,setSelT]=useState(null); const [modal,setModal]=useState(false);
  return (
    <div>
      <header style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px 10px",background:"rgba(6,11,20,.97)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,255,255,.07)",position:"sticky",top:0,zIndex:100 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:24,filter:`drop-shadow(0 0 6px ${C.gold})` }}>⚡</span>
          <div><div style={{ fontSize:16,fontWeight:900,letterSpacing:2,color:C.gold,lineHeight:1 }}>LAST ZONE</div><div style={{ fontSize:9,letterSpacing:4,color:C.red }}>LEGEND</div></div>
        </div>
        <div style={{ display:"flex",gap:10,alignItems:"center" }}>
          <div style={{ display:"flex",alignItems:"center",gap:5,background:"rgba(255,215,64,.1)",border:"1px solid rgba(255,215,64,.3)",borderRadius:20,padding:"5px 12px",fontSize:14 }}>💰 <span style={{color:C.gold,fontWeight:800}}>₹{user.balance}</span></div>
          <div style={{ width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${C.red},${C.orange})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14 }}>{user.name[0]}</div>
        </div>
      </header>
      <main style={{ padding:"0 12px",paddingBottom:90,position:"relative",zIndex:1 }}>
        {tab==="home" && <HomeTab tours={tours} setTab={setTab} joined={user.joined||[]} onPress={t=>{setSelT(t);setModal(true);}}/>}
        {tab==="tournaments" && <ToursTab tours={tours} joined={user.joined||[]} onPress={t=>{ if(t.status==="live"&&(user.joined||[]).includes(t.id)) setSelT(t); else{setSelT(t);setModal(true);}}}/>}
        {tab==="leaderboard" && <LeaderTab/>}
        {tab==="wallet" && <WalletTab user={user} settings={settings} reqs={reqs} onDeposit={onDeposit} onWithdraw={onWithdraw} toast={toast}/>}
        {tab==="profile" && <ProfileTab user={user} onLogout={onLogout} toast={toast} onUpdate={onUpdateUser}/>}
      </main>
      <nav style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,display:"flex",background:"rgba(6,11,20,.97)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(255,255,255,.07)",zIndex:200,padding:"6px 0 10px" }}>
        {[["home","🏠","Home"],["tournaments","🎮","Play"],["leaderboard","🏆","Rank"],["wallet","💰","Wallet"],["profile","👤","Me"]].map(([id,icon,label])=>(
          <button key={id} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",position:"relative",padding:4 }} onClick={()=>setTab(id)}>
            <span style={{fontSize:20}}>{icon}</span>
            <span style={{fontSize:9,color:tab===id?C.gold:"#555",fontWeight:700}}>{label}</span>
            {tab===id&&<div style={{position:"absolute",bottom:-6,left:"50%",transform:"translateX(-50%)",width:20,height:2,background:`linear-gradient(90deg,${C.red},${C.gold})`,borderRadius:2}}/>}
          </button>
        ))}
      </nav>
      {/* Join Modal */}
      {modal&&selT&&(
        <Overlay onClick={()=>setModal(false)}>
          <Modal>
            <div style={{fontSize:11,color:"#888",marginBottom:4}}>{selT.game==="BGMI"?"🔫":"🔥"} {selT.game}</div>
            <div style={{fontSize:20,fontWeight:900,marginBottom:14}}>{selT.title}</div>
            {[["🏆 Prize",selT.prize],["💳 Entry",`₹${selT.entryFee}`],["🗺️ Map",selT.map],["👥 Mode",selT.mode],["📅 Time",`${selT.date} ${selT.time}`],["🎯 Slots",`${selT.filled}/${selT.slots}`]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.05)",fontSize:13}}><span style={{color:"#666"}}>{k}</span><span style={{fontWeight:700}}>{v}</span></div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",margin:"12px 0",background:"rgba(255,215,64,.07)",borderRadius:8,padding:"10px 14px",fontSize:13}}>
              <span>Balance: <strong style={{color:C.gold}}>₹{user.balance}</strong></span>
              <span>After: <strong style={{color:user.balance-selT.entryFee<0?C.red:C.green}}>₹{user.balance-selT.entryFee}</strong></span>
            </div>
            {(user.joined||[]).includes(selT.id)?<div style={{textAlign:"center",padding:14,background:"rgba(0,230,118,.1)",border:"1px solid rgba(0,230,118,.3)",borderRadius:10,color:C.green,fontWeight:800}}>✅ Already Joined</div>
              :selT.filled>=selT.slots?<div style={{textAlign:"center",padding:14,background:C.card,borderRadius:10,color:"#666",fontWeight:800}}>⛔ Slots Full</div>
              :<button style={btnP} onClick={async()=>{await onJoin(selT);setModal(false);}}>PAY ₹{selT.entryFee} & JOIN 🎮</button>}
            <button style={{...btnS,marginTop:8}} onClick={()=>setModal(false)}>Cancel</button>
          </Modal>
        </Overlay>
      )}
      {/* Room Modal */}
      {selT&&!modal&&selT.status==="live"&&(user.joined||[]).includes(selT.id)&&(
        <Overlay onClick={()=>setSelT(null)}>
          <Modal>
            <div style={{fontSize:16,fontWeight:900,marginBottom:16,color:C.red}}>🔴 LIVE — Room Details</div>
            {[["Room ID",selT.roomId],["Password",selT.password]].map(([k,v])=>(
              <div key={k} style={{background:"rgba(255,60,60,.07)",border:"1px solid rgba(255,60,60,.2)",borderRadius:10,padding:"12px 16px",marginBottom:10}}>
                <div style={{fontSize:11,color:"#888",marginBottom:4}}>{k}</div>
                <div style={{fontSize:26,fontWeight:900,letterSpacing:4,color:"#ff6b6b"}}>{v||"—"}</div>
              </div>
            ))}
            <div style={{fontSize:12,color:C.gold,background:"rgba(255,215,64,.07)",borderRadius:8,padding:10,marginBottom:14,textAlign:"center"}}>⚠️ Join within 5 minutes or you'll be disqualified.</div>
            <button style={btnP} onClick={()=>{toast("Room details copied! 📋");setSelT(null);}}>COPY DETAILS 📋</button>
          </Modal>
        </Overlay>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  HOME
// ══════════════════════════════════════════════════════════
function HomeTab({ tours, setTab, joined, onPress }) {
  const live=tours.filter(t=>t.status==="live"), open=tours.filter(t=>t.status==="open");
  return (
    <div>
      <div style={{borderRadius:16,background:"linear-gradient(135deg,#0d1a2a,#1a0a0a)",border:"1px solid rgba(255,60,60,.2)",padding:"20px 18px 16px",position:"relative",overflow:"hidden",margin:"14px 0"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at top right,rgba(255,60,60,.15) 0%,transparent 60%)"}}/>
        <div style={{position:"relative"}}>
          <div style={{display:"inline-block",background:"rgba(255,60,60,.15)",border:`1px solid ${C.red}`,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700,color:"#ff6b6b",marginBottom:10}}>🏆 SEASON 6 LIVE</div>
          <div style={{fontSize:28,fontWeight:900,lineHeight:1.1,marginBottom:6,background:"linear-gradient(135deg,#fff 40%,#ffd740 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Win Big,<br/>Play Bigger</div>
          <div style={{fontSize:12,color:"#999",marginBottom:14}}>BGMI & FreeFire Daily Tournaments</div>
          <button style={{background:`linear-gradient(135deg,${C.red},${C.orange})`,border:"none",borderRadius:8,padding:"10px 22px",color:"#fff",fontWeight:900,fontSize:14,cursor:"pointer"}} onClick={()=>setTab("tournaments")}>JOIN NOW →</button>
        </div>
        <div style={{display:"flex",marginTop:18,background:"rgba(255,255,255,.04)",borderRadius:10,padding:"10px 0",border:"1px solid rgba(255,255,255,.07)"}}>
          {[["₹50K+","Daily Prize"],["10K+","Players"],["500+","Matches"]].map(([v,l],i)=>(
            <div key={l} style={{flex:1,textAlign:"center",borderRight:i<2?"1px solid rgba(255,255,255,.1)":"none"}}>
              <div style={{fontSize:17,fontWeight:900,color:C.gold}}>{v}</div>
              <div style={{fontSize:10,color:"#666"}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      {live.length>0&&<Sec title="🔴 LIVE NOW" onAll={()=>setTab("tournaments")}>{live.map(t=><TCard key={t.id} t={t} joined={joined.includes(t.id)} onPress={()=>onPress(t)}/>)}</Sec>}
      {open.length>0&&<Sec title="🟢 OPEN MATCHES" onAll={()=>setTab("tournaments")}>{open.map(t=><TCard key={t.id} t={t} joined={joined.includes(t.id)} onPress={()=>onPress(t)}/>)}</Sec>}
    </div>
  );
}
const Sec=({title,onAll,children})=><div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:14,fontWeight:800,letterSpacing:1}}>{title}</span>{onAll&&<span style={{fontSize:12,color:C.gold,cursor:"pointer"}} onClick={onAll}>See All</span>}</div>{children}</div>;

// ══════════════════════════════════════════════════════════
//  TOURNAMENT CARD
// ══════════════════════════════════════════════════════════
function TCard({ t, joined, onPress }) {
  const pct=(t.filled/t.slots)*100;
  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:14,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontSize:13,fontWeight:700,color:"#aaa"}}>{t.game==="BGMI"?"🔫":"🔥"} {t.game}</span>
        <span style={{fontSize:11,fontWeight:800,padding:"3px 10px",borderRadius:20,background:sc(t.status)+"22",color:sc(t.status),border:`1px solid ${sc(t.status)}`}}>{sl(t.status)}</span>
      </div>
      <div style={{fontSize:17,fontWeight:900,marginBottom:10}}>{t.title}</div>
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        {[["Prize",t.prize],["Entry",`₹${t.entryFee}`],["Mode",t.mode],["Map",t.map]].map(([k,v])=>(
          <div key={k} style={{flex:1,background:"rgba(255,255,255,.04)",borderRadius:8,padding:"7px 4px",textAlign:"center"}}>
            <div style={{fontSize:9,color:"#666",marginBottom:2}}>{k}</div>
            <div style={{fontSize:12,fontWeight:800}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#888",marginBottom:5}}><span>{t.filled}/{t.slots} Slots</span><span>⏰ {t.date} {t.time}</span></div>
      <div style={{height:4,background:"rgba(255,255,255,.08)",borderRadius:2,marginBottom:12,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,borderRadius:2,background:pct>=90?C.red:pct>=60?C.gold:C.green}}/>
      </div>
      {joined
        ?<div style={{display:"flex",gap:8}}>
          <div style={{flex:1,textAlign:"center",padding:10,background:"rgba(0,230,118,.1)",border:"1px solid rgba(0,230,118,.3)",borderRadius:8,color:C.green,fontWeight:800}}>✅ Joined</div>
          {t.status==="live"&&<button style={{flex:1,padding:10,background:"rgba(255,60,60,.1)",border:"1px solid rgba(255,60,60,.4)",borderRadius:8,color:"#ff6b6b",fontWeight:800,cursor:"pointer"}} onClick={onPress}>🔴 Room</button>}
        </div>
        :t.filled>=t.slots
          ?<div style={{textAlign:"center",padding:10,background:C.card,borderRadius:8,color:"#666",fontWeight:800}}>⛔ Slots Full</div>
          :<button style={{width:"100%",padding:11,background:`linear-gradient(135deg,${C.red},${C.orange})`,border:"none",borderRadius:8,color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer"}} onClick={onPress}>JOIN — ₹{t.entryFee}</button>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  TOURNAMENTS TAB
// ══════════════════════════════════════════════════════════
function ToursTab({ tours, joined, onPress }) {
  const [f,setF]=useState("All");
  const list=tours.filter(t=>f==="All"||t.game===f);
  return (
    <div>
      <div style={{fontSize:20,fontWeight:900,padding:"16px 0 12px"}}>🎮 Tournaments</div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {["All","BGMI","FreeFire"].map(x=><button key={x} onClick={()=>setF(x)} style={{padding:"7px 16px",borderRadius:20,background:f===x?"rgba(255,215,64,.1)":"rgba(255,255,255,.06)",border:f===x?"1px solid #ffd740":"1px solid rgba(255,255,255,.1)",color:f===x?C.gold:"#aaa",fontWeight:700,fontSize:13,cursor:"pointer"}}>{x==="BGMI"?"🔫 BGMI":x==="FreeFire"?"🔥 FreeFire":"All"}</button>)}
      </div>
      {list.length===0&&<div style={{textAlign:"center",color:"#444",marginTop:40}}>No tournaments yet!</div>}
      {list.map(t=><TCard key={t.id} t={t} joined={joined.includes(t.id)} onPress={()=>onPress(t)}/>)}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  LEADERBOARD
// ══════════════════════════════════════════════════════════
function LeaderTab() {
  const bd=[{r:1,n:"ProKiller_X",k:45,e:"₹2,400",a:"🔥"},{r:2,n:"ZoneRaider99",k:38,e:"₹1,800",a:"⚡"},{r:3,n:"HeadshotKing",k:35,e:"₹1,200",a:"💀"},{r:4,n:"SniperElite",k:30,e:"₹900",a:"🎯"},{r:5,n:"RushMaster",k:28,e:"₹600",a:"⚔️"}];
  return (
    <div>
      <div style={{fontSize:20,fontWeight:900,padding:"16px 0 12px"}}>🏆 Leaderboard</div>
      <div style={{display:"grid",gridTemplateColumns:"48px 1fr 60px 80px",padding:"8px 12px",fontSize:11,color:"#666",letterSpacing:1,fontWeight:700,marginBottom:4}}><span>Rank</span><span>Player</span><span>Kills</span><span>Earned</span></div>
      {bd.map(p=>(
        <div key={p.r} style={{display:"grid",gridTemplateColumns:"48px 1fr 60px 80px",alignItems:"center",padding:12,marginBottom:6,background:p.r<=3?"rgba(255,215,64,.05)":"rgba(255,255,255,.03)",borderRadius:10,border:`1px solid ${p.r===1?"#ffd74033":p.r===2?"#e0e0e033":p.r===3?"#ff8c0033":"transparent"}`}}>
          <span style={{fontSize:18}}>{p.r===1?"🥇":p.r===2?"🥈":p.r===3?"🥉":`#${p.r}`}</span>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>{p.a}</span><span style={{fontSize:13,fontWeight:700}}>{p.n}</span></div>
          <span style={{fontSize:14,fontWeight:800,color:"#ff6b6b"}}>{p.k}</span>
          <span style={{fontSize:13,fontWeight:800,color:C.green}}>{p.e}</span>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  WALLET
// ══════════════════════════════════════════════════════════
function WalletTab({ user, settings, reqs, onDeposit, onWithdraw, toast }) {
  const [view,setView]=useState("main");
  const pD=reqs.filter(r=>r.type==="deposit"&&r.status==="pending").length;
  const pW=reqs.filter(r=>r.type==="withdraw"&&r.status==="pending").length;
  if(view==="deposit") return <DepositView user={user} settings={settings} onSubmit={onDeposit} onBack={()=>setView("main")} toast={toast}/>;
  if(view==="withdraw") return <WithdrawView user={user} settings={settings} onSubmit={onWithdraw} onBack={()=>setView("main")} toast={toast}/>;
  if(view==="history") return <HistoryView user={user} reqs={reqs} onBack={()=>setView("main")}/>;
  return (
    <div>
      <div style={{fontSize:20,fontWeight:900,padding:"16px 0 12px"}}>💰 Wallet</div>
      <div style={{background:"linear-gradient(135deg,#0d1a2a,#1a1000)",border:"1px solid rgba(255,215,64,.25)",borderRadius:18,padding:24,textAlign:"center",marginBottom:16,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at top,rgba(255,215,64,.08) 0%,transparent 70%)"}}/>
        <div style={{position:"relative"}}>
          <div style={{fontSize:11,color:"#888",letterSpacing:3,marginBottom:8}}>TOTAL BALANCE</div>
          <div style={{fontSize:52,fontWeight:900,background:`linear-gradient(135deg,${C.gold},${C.orange})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>₹{user.balance}</div>
          <div style={{fontSize:12,color:"#555",marginTop:8}}>Available to play & withdraw</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <button onClick={()=>setView("deposit")} style={{padding:"16px 10px",background:"linear-gradient(135deg,rgba(0,230,118,.15),rgba(0,161,82,.1))",border:"1px solid rgba(0,230,118,.35)",borderRadius:14,color:C.green,fontWeight:900,fontSize:15,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
          <span style={{fontSize:28}}>➕</span><span>Add Money</span><span style={{fontSize:11,color:"#00a152",fontWeight:700}}>Scan UPI QR</span>
        </button>
        <button onClick={()=>setView("withdraw")} style={{padding:"16px 10px",background:"linear-gradient(135deg,rgba(255,140,0,.12),rgba(255,60,60,.08))",border:"1px solid rgba(255,140,0,.35)",borderRadius:14,color:C.orange,fontWeight:900,fontSize:15,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
          <span style={{fontSize:28}}>🏧</span><span>Withdraw</span><span style={{fontSize:11,color:C.orange,fontWeight:700}}>To Your UPI</span>
        </button>
      </div>
      {(pD>0||pW>0)&&(
        <div style={{background:"rgba(255,215,64,.06)",border:"1px solid rgba(255,215,64,.2)",borderRadius:12,padding:14,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:800,color:C.gold,marginBottom:6}}>⏳ Pending Requests</div>
          {pD>0&&<div style={{fontSize:12,color:"#aaa"}}>• {pD} deposit awaiting admin approval</div>}
          {pW>0&&<div style={{fontSize:12,color:"#aaa"}}>• {pW} withdrawal being processed</div>}
        </div>
      )}
      <button onClick={()=>setView("history")} style={{width:"100%",padding:"13px 16px",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
        <span style={{fontSize:22}}>📋</span>
        <div style={{flex:1,textAlign:"left"}}><div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Transaction History</div><div style={{fontSize:11,color:"#555"}}>{(user.transactions||[]).length} transactions</div></div>
        <span style={{color:"#444",fontSize:20}}>›</span>
      </button>
    </div>
  );
}

function DepositView({ user, settings, onSubmit, onBack, toast }) {
  const [step,setStep]=useState(1); const [amount,setAmount]=useState(""); const [txnId,setTxnId]=useState(""); const [ss,setSs]=useState(null); const [ssName,setSsName]=useState(""); const fileRef=useRef();
  const quick=[50,100,200,500,1000];
  const handleFile=e=>{const f=e.target.files[0];if(!f)return;if(f.size>3*1024*1024)return toast("❌ Image max 3MB","error");setSsName(f.name);const r=new FileReader();r.onload=()=>setSs(r.result);r.readAsDataURL(f);};
  const submit=async()=>{if(!txnId.trim())return toast("❌ Enter Transaction ID!","error");if(!ss)return toast("❌ Upload screenshot!","error");await onSubmit({amount,txnId:txnId.trim(),screenshot:ss});setStep(3);};
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 0 12px"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"6px 12px",color:"#fff",fontWeight:700,cursor:"pointer"}}>← Back</button>
        <div style={{fontSize:20,fontWeight:900}}>➕ Add Money via UPI</div>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:20}}>
        {["Enter Amount","Pay & Upload","Done!"].map((s,i)=>(
          <div key={s} style={{flex:1,textAlign:"center"}}>
            <div style={{height:3,borderRadius:2,background:step>i?C.green:step===i+1?C.gold:"rgba(255,255,255,.1)",marginBottom:4}}/>
            <div style={{fontSize:10,color:step===i+1?C.gold:step>i?C.green:"#444"}}>{s}</div>
          </div>
        ))}
      </div>
      {step===1&&(
        <div>
          <div style={{background:"rgba(0,230,118,.05)",border:"1px solid rgba(0,230,118,.2)",borderRadius:14,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,color:"#888",marginBottom:12}}>Min deposit: <span style={{color:C.green,fontWeight:700}}>₹{settings.minDeposit}</span></div>
            <Fg label="ENTER AMOUNT (₹)"><input style={{...inp,fontSize:26,fontWeight:900,textAlign:"center"}} type="number" placeholder="0" value={amount} onChange={e=>setAmount(e.target.value)}/></Fg>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
              {quick.map(a=><button key={a} onClick={()=>setAmount(String(a))} style={{padding:"6px 14px",background:amount==a?"rgba(0,230,118,.15)":"rgba(255,255,255,.05)",border:amount==a?"1px solid #00e676":"1px solid rgba(255,255,255,.1)",borderRadius:20,color:amount==a?C.green:"#aaa",fontWeight:700,fontSize:13,cursor:"pointer"}}>₹{a}</button>)}
            </div>
          </div>
          <button style={btnP} onClick={()=>{if(!amount||Number(amount)<settings.minDeposit)return toast(`❌ Min deposit ₹${settings.minDeposit}`,"error");setStep(2);}}>NEXT → PAY ₹{amount||"0"}</button>
        </div>
      )}
      {step===2&&(
        <div>
          <div style={{background:"#0d1520",border:"1px solid rgba(0,230,118,.25)",borderRadius:16,padding:20,textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:800,color:C.green,marginBottom:4,letterSpacing:1}}>📱 SCAN QR & PAY ₹{amount}</div>
            <div style={{fontSize:12,color:"#888",marginBottom:14}}>UPI: <span style={{color:C.gold,fontWeight:800}}>{settings.upiId}</span></div>
            {settings.qrUrl
              ?<div style={{display:"inline-block",padding:10,background:"#fff",borderRadius:14,marginBottom:12,boxShadow:"0 0 30px rgba(0,230,118,.2)"}}>
                <img src={settings.qrUrl} alt="UPI QR" style={{width:190,height:190,display:"block",objectFit:"contain"}}/>
              </div>
              :<div style={{width:190,height:190,borderRadius:14,background:"rgba(255,255,255,.04)",border:"2px dashed rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",flexDirection:"column",gap:8}}>
                <div style={{fontSize:40}}>📱</div><div style={{fontSize:12,color:"#555"}}>Admin hasn't set QR yet</div><div style={{fontSize:11,color:"#444"}}>Pay to UPI ID above</div>
              </div>}
            <div style={{fontSize:12,color:"#888"}}>{settings.upiName}</div>
          </div>
          <div style={{background:"rgba(255,215,64,.05)",border:"1px solid rgba(255,215,64,.15)",borderRadius:12,padding:14,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:800,color:C.gold,marginBottom:8}}>📋 Steps:</div>
            {["Open PhonePe / GPay / Paytm",`Scan QR or pay to: ${settings.upiId}`,`Pay exact: ₹${amount}`,"Screenshot the success screen","Enter UTR / TxnID below","Upload screenshot & submit"].map((s,i)=>(
              <div key={i} style={{fontSize:12,color:"#aaa",marginBottom:4,display:"flex",gap:8}}><span style={{color:C.gold,fontWeight:900,minWidth:14}}>{i+1}.</span>{s}</div>
            ))}
          </div>
          <Fg label="UTR / TRANSACTION ID *"><input style={inp} placeholder="12-digit UTR or TxnID" value={txnId} onChange={e=>setTxnId(e.target.value)}/></Fg>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,color:"#666",letterSpacing:2,marginBottom:8,fontWeight:700}}>PAYMENT SCREENSHOT *</div>
            <div onClick={()=>fileRef.current.click()} style={{border:`2px dashed ${ss?"rgba(0,230,118,.5)":"rgba(255,255,255,.15)"}`,borderRadius:14,padding:"20px 16px",textAlign:"center",cursor:"pointer",background:ss?"rgba(0,230,118,.04)":"rgba(255,255,255,.02)"}}>
              {ss?<div><img src={ss} alt="ss" style={{maxWidth:"100%",maxHeight:200,borderRadius:10,marginBottom:10,objectFit:"contain",border:"1px solid rgba(0,230,118,.2)"}}/><div style={{fontSize:13,color:C.green,fontWeight:700}}>✅ {ssName}</div><div style={{fontSize:11,color:"#555",marginTop:4}}>Tap to change</div></div>
                :<div><div style={{fontSize:40,marginBottom:8}}>📸</div><div style={{fontSize:15,fontWeight:800,color:C.green}}>Upload Screenshot</div><div style={{fontSize:11,color:"#555",marginTop:6}}>JPG, PNG · Max 3MB</div></div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
          </div>
          <button style={{...btnP,background:`linear-gradient(135deg,${C.green},#00a152)`,boxShadow:"0 4px 20px rgba(0,230,118,.3)",color:"#000"}} onClick={submit}>✅ SUBMIT FOR VERIFICATION</button>
          <button style={{...btnS,marginTop:10}} onClick={()=>setStep(1)}>← Change Amount</button>
        </div>
      )}
      {step===3&&(
        <div style={{textAlign:"center",padding:"50px 20px"}}>
          <div style={{fontSize:70,marginBottom:16}}>✅</div>
          <div style={{fontSize:24,fontWeight:900,marginBottom:8,color:C.green}}>Request Submitted!</div>
          <div style={{fontSize:16,color:"#aaa",marginBottom:6}}>Amount: <strong style={{color:C.gold}}>₹{amount}</strong></div>
          <div style={{fontSize:13,color:"#555",marginBottom:6}}>TxnID: <strong style={{color:"#fff"}}>{txnId}</strong></div>
          <div style={{fontSize:13,color:"#666",marginBottom:30,lineHeight:1.7,background:C.card,borderRadius:10,padding:"12px 16px"}}>Admin will verify your screenshot and credit ₹{amount} to your wallet shortly.</div>
          <button style={btnP} onClick={onBack}>← Back to Wallet</button>
        </div>
      )}
    </div>
  );
}

function WithdrawView({ user, settings, onSubmit, onBack, toast }) {
  const [amount,setAmount]=useState(""); const [upiId,setUpiId]=useState(""); const [upiName,setUpiName]=useState(""); const [done,setDone]=useState(false);
  const submit=async()=>{
    if(!amount||Number(amount)<settings.minWithdraw)return toast(`❌ Min withdraw ₹${settings.minWithdraw}`,"error");
    if(Number(amount)>settings.maxWithdraw)return toast(`❌ Max withdraw ₹${settings.maxWithdraw}`,"error");
    if(Number(amount)>user.balance)return toast("❌ Insufficient balance!","error");
    if(!upiId.trim())return toast("❌ Enter UPI ID!","error");
    if(!upiName.trim())return toast("❌ Enter account holder name!","error");
    await onSubmit({amount,upiId:upiId.trim(),upiName:upiName.trim()}); setDone(true);
  };
  if(done) return (
    <div style={{textAlign:"center",padding:"50px 20px"}}>
      <div style={{fontSize:70,marginBottom:16}}>🏧</div>
      <div style={{fontSize:24,fontWeight:900,marginBottom:8,color:C.gold}}>Withdrawal Requested!</div>
      <div style={{background:"rgba(255,215,64,.06)",border:"1px solid rgba(255,215,64,.2)",borderRadius:12,padding:14,marginBottom:24}}>
        <div style={{fontSize:12,color:"#888",marginBottom:4}}>Sending to:</div>
        <div style={{fontSize:20,fontWeight:900,color:C.gold}}>{upiId}</div>
        <div style={{fontSize:13,color:"#aaa",marginTop:4}}>{upiName}</div>
        <div style={{fontSize:22,fontWeight:900,color:C.gold,marginTop:8}}>₹{amount}</div>
        <div style={{fontSize:12,color:"#555",marginTop:6}}>⏱ Admin will process within 24 hours</div>
      </div>
      <button style={btnP} onClick={onBack}>← Back to Wallet</button>
    </div>
  );
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 0 12px"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"6px 12px",color:"#fff",fontWeight:700,cursor:"pointer"}}>← Back</button>
        <div style={{fontSize:20,fontWeight:900}}>🏧 Withdraw Money</div>
      </div>
      <div style={{background:"rgba(255,215,64,.06)",border:"1px solid rgba(255,215,64,.2)",borderRadius:12,padding:"14px 16px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:11,color:"#888",marginBottom:2}}>AVAILABLE</div><div style={{fontSize:26,fontWeight:900,color:C.gold}}>₹{user.balance}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:11,color:"#888",marginBottom:2}}>LIMITS</div><div style={{fontSize:13,fontWeight:700,color:"#aaa"}}>₹{settings.minWithdraw} – ₹{settings.maxWithdraw}</div></div>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:800,color:"#aaa",marginBottom:14}}>💳 WHERE TO SEND MONEY</div>
        <Fg label="YOUR UPI ID"><input style={inp} placeholder="yourname@paytm / 9876543210@upi" value={upiId} onChange={e=>setUpiId(e.target.value)}/></Fg>
        <Fg label="ACCOUNT HOLDER NAME"><input style={inp} placeholder="Name on your UPI account" value={upiName} onChange={e=>setUpiName(e.target.value)}/></Fg>
      </div>
      <Fg label={`AMOUNT (₹${settings.minWithdraw}–₹${settings.maxWithdraw})`}><input style={{...inp,fontSize:26,fontWeight:900,textAlign:"center"}} type="number" placeholder="0" value={amount} onChange={e=>setAmount(e.target.value)}/></Fg>
      {amount&&Number(amount)>0&&<div style={{display:"flex",justifyContent:"space-between",background:C.card,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13}}><span style={{color:"#888"}}>Balance after:</span><span style={{fontWeight:900,color:user.balance-Number(amount)<0?C.red:C.green}}>₹{user.balance-Number(amount)}</span></div>}
      <div style={{background:"rgba(255,60,60,.05)",border:"1px solid rgba(255,60,60,.15)",borderRadius:10,padding:"12px 14px",marginBottom:16,fontSize:12,color:"#aaa",lineHeight:1.6}}>⚠️ Amount deducted immediately. Admin sends to your UPI within 24 hours. Wrong UPI = lost money.</div>
      <button style={{...btnP,background:`linear-gradient(135deg,${C.gold},${C.orange})`,color:"#000",boxShadow:"0 4px 20px rgba(255,215,64,.3)"}} onClick={submit}>REQUEST WITHDRAWAL 🏧</button>
    </div>
  );
}

function HistoryView({ user, reqs, onBack }) {
  const txns=user.transactions||[];
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 0 12px"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"6px 12px",color:"#fff",fontWeight:700,cursor:"pointer"}}>← Back</button>
        <div style={{fontSize:20,fontWeight:900}}>📋 History</div>
      </div>
      {reqs.length>0&&(
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:800,marginBottom:10,color:C.gold}}>Payment Requests</div>
          {reqs.slice(0,10).map(r=>(
            <div key={r.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><div style={{fontSize:14,fontWeight:800}}>{r.type==="deposit"?"➕ Deposit":"🏧 Withdrawal"}</div><div style={{fontSize:11,color:"#555",marginTop:2}}>{r.date} {r.time}</div>{r.txnId&&<div style={{fontSize:11,color:"#666",marginTop:2}}>TxnID: {r.txnId}</div>}{r.upiId&&<div style={{fontSize:11,color:"#666",marginTop:2}}>UPI: {r.upiId}</div>}</div>
                <div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:900,color:r.type==="deposit"?C.green:C.gold}}>{r.type==="deposit"?"+":"-"}₹{r.amount}</div><div style={{marginTop:4}}><Badge s={r.status}/></div></div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{fontSize:13,fontWeight:800,marginBottom:10}}>Wallet Transactions</div>
      {txns.length===0&&<div style={{color:"#444",textAlign:"center",padding:"20px 0"}}>No transactions yet.</div>}
      {txns.map(tx=>(
        <div key={tx.id} style={{display:"flex",alignItems:"center",gap:12,padding:12,marginBottom:6,background:"rgba(255,255,255,.03)",borderRadius:10}}>
          <div style={{width:38,height:38,borderRadius:"50%",background:tx.type==="credit"?"rgba(0,230,118,.1)":"rgba(255,82,82,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{tx.type==="credit"?"⬆️":"⬇️"}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{tx.desc}</div><div style={{fontSize:11,color:"#555",marginTop:2}}>{tx.date}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:900,color:tx.type==="credit"?C.green:"#ff5252"}}>{tx.type==="credit"?"+":"-"}₹{tx.amount}</div>{tx.status&&<div style={{marginTop:2}}><Badge s={tx.status}/></div>}</div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  PROFILE
// ══════════════════════════════════════════════════════════
function ProfileTab({ user, onLogout, toast, onUpdate }) {
  const [editing,setEditing]=useState(false); const [bgmi,setBgmi]=useState(user.bgmiUid||""); const [ff,setFf]=useState(user.ffUid||"");
  return (
    <div>
      <div style={{fontSize:20,fontWeight:900,padding:"16px 0 12px"}}>👤 Profile</div>
      <div style={{textAlign:"center",padding:"24px 16px",background:C.card,borderRadius:16,marginBottom:14,border:`1px solid ${C.border}`}}>
        <div style={{width:70,height:70,borderRadius:"50%",background:`linear-gradient(135deg,${C.red},${C.orange})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:900,margin:"0 auto 12px",boxShadow:"0 0 20px rgba(255,60,60,.4)"}}>{user.name[0]}</div>
        <div style={{fontSize:22,fontWeight:900,marginBottom:4}}>{user.name}</div>
        <div style={{fontSize:12,color:"#555",marginBottom:12}}>{user.email}</div>
        <span style={{fontSize:11,padding:"4px 12px",background:"rgba(255,215,64,.1)",border:"1px solid rgba(255,215,64,.3)",borderRadius:20,color:C.gold,fontWeight:700}}>🎮 Player</span>
      </div>
      <div style={{background:C.card,borderRadius:12,padding:16,marginBottom:12,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontSize:14,fontWeight:800}}>Game UIDs</span>
          <button onClick={()=>{if(editing){onUpdate({...user,bgmiUid:bgmi,ffUid:ff});toast("UIDs saved! ✅");}setEditing(!editing);}} style={{background:editing?"rgba(0,230,118,.1)":"rgba(255,255,255,.07)",border:editing?"1px solid #00e676":"1px solid rgba(255,255,255,.15)",borderRadius:8,padding:"6px 14px",color:editing?C.green:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>{editing?"Save ✅":"Edit ✏️"}</button>
        </div>
        {[["🔫 BGMI UID",bgmi,setBgmi],["🔥 FreeFire UID",ff,setFf]].map(([label,val,setter])=>(
          <div key={label} style={{marginBottom:10}}>
            <div style={{fontSize:11,color:"#666",marginBottom:4}}>{label}</div>
            {editing?<input style={{...inp,padding:"8px 12px",fontSize:14}} value={val} onChange={e=>setter(e.target.value)} placeholder="Enter UID"/>:<div style={{fontSize:15,fontWeight:700,color:val?"#fff":"#444"}}>{val||"Not set"}</div>}
          </div>
        ))}
      </div>
      {[{icon:"👥",label:"Refer & Earn ₹50",action:()=>toast("Referral link copied! 🎉")},{icon:"🛟",label:"Help & Support",action:()=>toast("WhatsApp: +91 98765XXXXX")},{icon:"📋",label:"Rules & Fair Play",action:()=>toast("No hacking. Play fair! ⚔️")},{icon:"🚪",label:"Logout",action:onLogout,danger:true}].map(item=>(
        <div key={item.label} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 12px",background:C.card,borderRadius:10,marginBottom:6,cursor:"pointer",border:`1px solid ${C.border}`}} onClick={item.action}>
          <span style={{fontSize:20}}>{item.icon}</span>
          <span style={{flex:1,fontSize:14,fontWeight:700,color:item.danger?"#ff5252":"#fff"}}>{item.label}</span>
          <span style={{color:"#444",fontSize:20}}>›</span>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  ADMIN PANEL
// ══════════════════════════════════════════════════════════
function AdminPanel({ tours,users,reqs,settings,onSaveTours,onSaveSettings,onApprove,onRejectDep,onMarkPaid,onRefund,onSaveUsers,onLogout,toast }) {
  const [aTab,setATab]=useState("requests");
  const pending=reqs.filter(r=>r.status==="pending").length;
  return (
    <div style={{minHeight:"100vh",background:C.dark,color:"#fff",fontFamily:"'Rajdhani',sans-serif",maxWidth:430,margin:"0 auto"}}>
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px 10px",background:"rgba(6,11,20,.97)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,215,64,.2)",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:22,filter:`drop-shadow(0 0 6px ${C.gold})`}}>⚡</span>
          <div><div style={{fontSize:14,fontWeight:900,color:C.gold,letterSpacing:2,lineHeight:1}}>LAST ZONE</div><div style={{fontSize:9,letterSpacing:3,color:C.red}}>ADMIN</div></div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:11,color:C.gold,background:"rgba(255,215,64,.1)",border:"1px solid rgba(255,215,64,.3)",borderRadius:20,padding:"4px 12px",fontWeight:800}}>👑 ADMIN</span>
          <button onClick={onLogout} style={{background:"rgba(255,60,60,.1)",border:"1px solid rgba(255,60,60,.3)",borderRadius:8,padding:"6px 12px",color:"#ff6b6b",fontWeight:700,fontSize:12,cursor:"pointer"}}>Logout</button>
        </div>
      </header>
      <div style={{display:"flex",background:"rgba(255,255,255,.03)",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        {[["requests",`💸${pending>0?` (${pending})`:""} Requests`],["tournaments","🎮 Matches"],["users","👥 Users"],["settings","⚙️ Settings"]].map(([id,label])=>(
          <button key={id} onClick={()=>setATab(id)} style={{flex:1,padding:"13px 2px",background:"none",border:"none",color:aTab===id?C.gold:"#555",fontWeight:800,fontSize:11,cursor:"pointer",borderBottom:aTab===id?`2px solid ${C.gold}`:"2px solid transparent",whiteSpace:"nowrap"}}>{label}</button>
        ))}
      </div>
      <main style={{padding:"12px 12px 80px"}}>
        {aTab==="requests"&&<AdminReqs reqs={reqs} onApprove={onApprove} onRejectDep={onRejectDep} onMarkPaid={onMarkPaid} onRefund={onRefund}/>}
        {aTab==="tournaments"&&<AdminTours tours={tours} onSave={onSaveTours} toast={toast}/>}
        {aTab==="users"&&<AdminUsers users={users} onSave={onSaveUsers} toast={toast}/>}
        {aTab==="settings"&&<AdminSettings settings={settings} onSave={onSaveSettings} toast={toast}/>}
      </main>
    </div>
  );
}

function AdminReqs({ reqs, onApprove, onRejectDep, onMarkPaid, onRefund }) {
  const [f,setF]=useState("pending"); const [ssModal,setSsModal]=useState(null);
  const list=reqs.filter(r=>f==="pending"?r.status==="pending":f==="deposit"?r.type==="deposit":f==="withdraw"?r.type==="withdraw":true);
  const pending=reqs.filter(r=>r.status==="pending").length;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingTop:4}}>
        <div style={{fontSize:16,fontWeight:900}}>💸 Payment Requests</div>
        {pending>0&&<div style={{fontSize:12,fontWeight:800,color:C.gold,background:"rgba(255,215,64,.1)",border:"1px solid rgba(255,215,64,.3)",borderRadius:20,padding:"4px 12px"}}>⏳ {pending} Pending</div>}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        {[["all","All"],["pending","⏳ Pending"],["deposit","➕ Deposits"],["withdraw","🏧 Withdrawals"]].map(([x,l])=>(
          <button key={x} onClick={()=>setF(x)} style={{padding:"6px 14px",borderRadius:20,background:f===x?"rgba(255,215,64,.1)":"rgba(255,255,255,.05)",border:f===x?"1px solid #ffd740":"1px solid rgba(255,255,255,.1)",color:f===x?C.gold:"#888",fontWeight:700,fontSize:12,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
      {list.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:"#444"}}><div style={{fontSize:40,marginBottom:10}}>📭</div>No requests found.</div>}
      {list.map(r=>(
        <div key={r.id} style={{background:r.status==="pending"?"rgba(255,215,64,.04)":C.card,border:r.status==="pending"?"1px solid rgba(255,215,64,.2)":`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:15,fontWeight:900}}>{r.type==="deposit"?"➕ Deposit":"🏧 Withdrawal"}</div>
              <div style={{fontSize:12,color:"#aaa",marginTop:2}}>👤 {r.userName}</div>
              <div style={{fontSize:11,color:"#555"}}>{r.userEmail}</div>
              <div style={{fontSize:11,color:"#444"}}>📅 {r.date} {r.time}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:24,fontWeight:900,color:r.type==="deposit"?C.green:C.gold,lineHeight:1}}>₹{r.amount}</div>
              <div style={{marginTop:6}}><Badge s={r.status}/></div>
            </div>
          </div>
          {r.type==="deposit"&&(
            <div>
              {r.txnId&&<div style={{background:"rgba(255,255,255,.04)",borderRadius:8,padding:"8px 12px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:"#888"}}>UTR / TxnID:</span><span style={{fontSize:13,fontWeight:800,color:C.gold,letterSpacing:1}}>{r.txnId}</span></div>}
              {r.screenshot&&<div style={{marginBottom:12}}><div style={{fontSize:11,color:"#666",marginBottom:6}}>📸 Payment Screenshot:</div><img src={r.screenshot} alt="proof" style={{width:"100%",maxHeight:150,objectFit:"cover",borderRadius:10,cursor:"pointer",border:"1px solid rgba(255,255,255,.08)"}} onClick={()=>setSsModal(r.screenshot)}/><div style={{fontSize:11,color:"#555",marginTop:4,textAlign:"center"}}>👆 Tap to view full</div></div>}
              {r.status==="pending"&&<div style={{display:"flex",gap:8}}><button onClick={()=>onApprove(r.id)} style={{flex:1,padding:12,background:`linear-gradient(135deg,${C.green},#00a152)`,border:"none",borderRadius:10,color:"#000",fontWeight:900,fontSize:14,cursor:"pointer"}}>✅ APPROVE & CREDIT ₹{r.amount}</button><button onClick={()=>onRejectDep(r.id)} style={{padding:"12px 16px",background:"rgba(255,60,60,.1)",border:"1px solid rgba(255,60,60,.3)",borderRadius:10,color:"#ff6b6b",fontWeight:800,cursor:"pointer"}}>❌</button></div>}
            </div>
          )}
          {r.type==="withdraw"&&(
            <div>
              <div style={{background:"rgba(255,215,64,.08)",border:"1px solid rgba(255,215,64,.25)",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
                <div style={{fontSize:11,color:"#888",marginBottom:6,letterSpacing:1}}>👉 SEND MONEY TO:</div>
                <div style={{fontSize:20,fontWeight:900,color:C.gold,marginBottom:3}}>{r.upiId}</div>
                <div style={{fontSize:13,color:"#aaa"}}>{r.upiName}</div>
                <div style={{marginTop:8,fontSize:13,fontWeight:800,color:C.gold}}>Amount: ₹{r.amount}</div>
              </div>
              {r.status==="pending"&&(
                <div>
                  <div style={{fontSize:12,color:"#888",background:"rgba(255,255,255,.03)",borderRadius:8,padding:"8px 12px",marginBottom:10,lineHeight:1.5}}>Open UPI app → Send ₹{r.amount} to <strong style={{color:C.gold}}>{r.upiId}</strong> → Click Mark Paid.</div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>onMarkPaid(r.id)} style={{flex:1,padding:12,background:`linear-gradient(135deg,${C.gold},${C.orange})`,border:"none",borderRadius:10,color:"#000",fontWeight:900,fontSize:14,cursor:"pointer"}}>💸 MARK AS PAID</button>
                    <button onClick={()=>onRefund(r.id)} style={{padding:"12px 14px",background:"rgba(255,60,60,.1)",border:"1px solid rgba(255,60,60,.3)",borderRadius:10,color:"#ff6b6b",fontWeight:800,cursor:"pointer"}}>↩️ Refund</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {ssModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.97)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setSsModal(null)}><div style={{position:"relative"}}><img src={ssModal} alt="proof" style={{maxWidth:"100%",maxHeight:"88vh",borderRadius:12,objectFit:"contain"}}/><button style={{position:"absolute",top:-12,right:-12,width:34,height:34,borderRadius:"50%",background:C.red,border:"none",color:"#fff",fontSize:16,fontWeight:900,cursor:"pointer"}}>✕</button></div></div>}
    </div>
  );
}
function AdminTours({ tours, onSave, toast }) {
  const [editT,setEditT]=useState(null); const [adding,setAdding]=useState(false); const [delId,setDelId]=useState(null);
  const ef={game:"BGMI",title:"",prize:"",entryFee:50,slots:25,filled:0,time:"07:00 PM",date:"Today",map:"Erangel",mode:"Squad",status:"open",roomId:"",password:""};
  const [form,setForm]=useState(ef);
  const F=editT||form; const setF=editT?(k,v)=>setEditT({...editT,[k]:v}):(k,v)=>setForm({...form,[k]:v});
  const doSave=async()=>{
    if(!F.title||!F.prize)return toast("❌ Fill title & prize!","error");
    if(editT){await onSave(tours.map(t=>t.id===editT.id?{...editT,entryFee:Number(editT.entryFee),slots:Number(editT.slots),filled:Number(editT.filled)}:t));setEditT(null);toast("✅ Updated!");}
    else{await onSave([...tours,{...form,id:Date.now(),entryFee:Number(form.entryFee),slots:Number(form.slots),filled:Number(form.filled)}]);setAdding(false);setForm(ef);toast("✅ Added!");}
  };
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingTop:4}}>
        <span style={{fontSize:16,fontWeight:900}}>Matches ({tours.length})</span>
        <button onClick={()=>{setAdding(true);setEditT(null);}} style={{background:`linear-gradient(135deg,${C.red},${C.orange})`,border:"none",borderRadius:8,padding:"9px 18px",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer"}}>+ Add Match</button>
      </div>
      {(adding||editT)&&(
        <div style={{background:"#0d1520",border:"1px solid rgba(255,215,64,.2)",borderRadius:14,padding:16,marginBottom:16}}>
          <div style={{fontSize:14,fontWeight:900,marginBottom:14,color:C.gold}}>{editT?"✏️ Edit":"➕ New"} Match</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {[["Title","title","text","Tournament Name"],["Prize Pool","prize","text","₹10,000"],["Entry Fee (₹)","entryFee","number","50"],["Total Slots","slots","number","25"],["Filled Slots","filled","number","0"],["Time","time","text","07:00 PM"],["Date","date","text","Today"],["Map","map","text","Erangel"],["Room ID","roomId","text","Set when live"],["Password","password","text","Set when live"]].map(([label,key,type,ph])=>(
              <div key={key}><div style={{fontSize:10,color:"#666",letterSpacing:1,marginBottom:4}}>{label.toUpperCase()}</div><input style={{...inp,padding:"8px 10px",fontSize:13}} type={type} placeholder={ph} value={F[key]} onChange={e=>setF(key,e.target.value)}/></div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
            {[["GAME","game",["BGMI","FreeFire"]],["MODE","mode",["Solo","Duo","Squad"]],["STATUS","status",["open","live","upcoming"]]].map(([label,key,opts])=>(
              <div key={key}><div style={{fontSize:10,color:"#666",letterSpacing:1,marginBottom:4}}>{label}</div><select style={{...inp,padding:"8px 10px",fontSize:13}} value={F[key]} onChange={e=>setF(key,e.target.value)}>{opts.map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}</select></div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button style={{flex:1,padding:12,background:`linear-gradient(135deg,${C.green},#00a152)`,border:"none",borderRadius:8,color:"#000",fontWeight:900,cursor:"pointer"}} onClick={doSave}>{editT?"💾 Save":"✅ Add"}</button>
            <button style={{padding:"12px 18px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,color:"#888",fontWeight:700,cursor:"pointer"}} onClick={()=>{setAdding(false);setEditT(null);}}>Cancel</button>
          </div>
        </div>
      )}
      {tours.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:"#444"}}><div style={{fontSize:40,marginBottom:10}}>🎮</div>No matches yet!</div>}
      {tours.map(t=>(
        <div key={t.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div><div style={{fontSize:15,fontWeight:900}}>{t.title}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>{t.game} • {t.mode} • {t.map}</div></div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>{setEditT({...t});setAdding(false);}} style={{background:"rgba(255,215,64,.08)",border:"1px solid rgba(255,215,64,.3)",borderRadius:8,padding:"6px 14px",color:C.gold,fontWeight:700,fontSize:12,cursor:"pointer"}}>✏️ Edit</button>
              <button onClick={()=>setDelId(t.id)} style={{background:"rgba(255,60,60,.08)",border:"1px solid rgba(255,60,60,.3)",borderRadius:8,padding:"6px 12px",color:"#ff6b6b",fontWeight:700,fontSize:12,cursor:"pointer"}}>🗑️</button>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {[{l:t.status.toUpperCase(),c:sc(t.status)},{l:`🏆 ${t.prize}`},{l:`💳 ₹${t.entryFee}`},{l:`👥 ${t.filled}/${t.slots}`},{l:`⏰ ${t.date} ${t.time}`}].map((b,i)=>(
              <span key={i} style={{padding:"3px 10px",borderRadius:20,background:b.c?b.c+"22":"rgba(255,255,255,.06)",color:b.c||"#aaa",border:b.c?`1px solid ${b.c}`:"none",fontWeight:700,fontSize:11}}>{b.l}</span>
            ))}
          </div>
          {t.roomId&&<div style={{marginTop:10,fontSize:12,color:"#ff6b6b",background:"rgba(255,60,60,.07)",borderRadius:8,padding:"8px 12px",display:"flex",gap:16}}><span>🔴 Room: <strong>{t.roomId}</strong></span><span>Pass: <strong>{t.password}</strong></span></div>}
        </div>
      ))}
      {delId&&(
        <Overlay onClick={()=>setDelId(null)}>
          <Modal>
            <div style={{textAlign:"center",padding:"10px 0 20px"}}>
              <div style={{fontSize:50,marginBottom:12}}>🗑️</div>
              <div style={{fontSize:20,fontWeight:900,marginBottom:8}}>Delete Match?</div>
              <div style={{color:"#888",marginBottom:24,fontSize:13}}>This cannot be undone.</div>
              <button style={{...btnP,background:`linear-gradient(135deg,${C.red},#aa0000)`}} onClick={async()=>{await onSave(tours.filter(t=>t.id!==delId));setDelId(null);toast("🗑️ Deleted!");}}>Yes, Delete</button>
              <button style={{...btnS,marginTop:10}} onClick={()=>setDelId(null)}>Cancel</button>
            </div>
          </Modal>
        </Overlay>
      )}
    </div>
  );
}
function AdminUsers({ users, onSave, toast }) {
  const [editU, setEditU] = useState(null);
  const [search, setSearch] = useState("");

  const list = users.filter(
    u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const save = async () => {
    await onSave(
      users.map(u =>
        u.id === editU.id
          ? { ...editU, balance: Number(editU.balance) }
          : u
      )
    );

    setEditU(null);
    toast("✅ User updated!");
  };

  const addBal = async (uid, amt) => {
    const n = Number(amt);

    if (isNaN(n) || n <= 0) return;

    const tx = {
      id: Date.now(),
      type: "credit",
      desc: `Admin Added ₹${n}`,
      amount: n,
      date: new Date().toLocaleDateString("en-IN"),
      status: "done"
    };

    await onSave(
      users.map(u =>
        u.id === uid
          ? {
              ...u,
              balance: u.balance + n,
              transactions: [tx, ...(u.transactions || [])]
            }
          : u
      )
    );

    toast(`✅ ₹${n} added!`);
  };

  const deductBal = async (uid, amt) => {
    const n = Number(amt);

    if (isNaN(n) || n <= 0) return;

    const tgt = users.find(u => u.id === uid);

    if (tgt.balance < n)
      return toast("❌ Not enough balance", "error");

    const tx = {
      id: Date.now(),
      type: "debit",
      desc: `Admin Deducted ₹${n}`,
      amount: n,
      date: new Date().toLocaleDateString("en-IN"),
      status: "done"
    };

    await onSave(
      users.map(u =>
        u.id === uid
          ? {
              ...u,
              balance: u.balance - n,
              transactions: [tx, ...(u.transactions || [])]
            }
          : u
      )
    );

    toast(`✅ ₹${n} deducted!`);
  };

  return (
 
    <div>
      <div style={{fontSize:16,fontWeight:900,marginBottom:14,paddingTop:4}}>Users ({users.filter(u=>u.role==="user").length} players)</div>
      <input style={{...inp,padding:"10px 14px",marginBottom:14}} placeholder="🔍 Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)}/>
      {list.map(u=>(
        <div key={u.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:u.role!=="admin"?12:0}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:u.role==="admin"?`linear-gradient(135deg,${C.gold},${C.orange})`:`linear-gradient(135deg,${C.red},#aa0000)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:18,flexShrink:0}}>{u.name[0]}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:900,display:"flex",alignItems:"center",gap:6}}>{u.name}{u.role==="admin"&&<span style={{fontSize:10,background:"rgba(255,215,64,.15)",border:"1px solid rgba(255,215,64,.3)",borderRadius:20,padding:"2px 8px",color:C.gold}}>ADMIN</span>}</div>
              <div style={{fontSize:12,color:"#666"}}>{u.email}</div>
              <div style={{fontSize:11,color:"#555"}}>{(u.joined||[]).length} matches joined</div>
            </div>
            <div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:900,color:C.gold}}>₹{u.balance}</div></div>
          </div>
          {u.role!=="admin"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
              <button onClick={()=>setEditU({...u})} style={{padding:9,background:"rgba(255,215,64,.08)",border:"1px solid rgba(255,215,64,.3)",borderRadius:8,color:C.gold,fontWeight:700,fontSize:11,cursor:"pointer"}}>✏️ Edit</button>
              <button onClick={()=>{const a=prompt("Add balance (₹):");if(a)addBal(u.id,a);}} style={{padding:9,background:"rgba(0,230,118,.08)",border:"1px solid rgba(0,230,118,.3)",borderRadius:8,color:C.green,fontWeight:700,fontSize:11,cursor:"pointer"}}>➕ Add</button>
      
            <button onClick={()=>{const a=prompt("Deduct balance (₹):");if(a)deductBal(u.id,a);}} style={{padding:9,background:"rgba(255,60,60,.08)",border:"1px solid rgba(255,60,60,.3)",borderRadius:8,color:"#ff6b6b",fontWeight:700,fontSize:11,cursor:"pointer"}}>➖ Deduct</button>
            </div>
        
          )}
        </div>
      ))}
      {editU&&(
        <Overlay onClick={()=>setEditU(null)}>
          <Modal>
            <div style={{fontSize:16,fontWeight:900,marginBottom:16}}>✏️ Edit User</div>
            {[["NAME","name","text"],["EMAIL","email","email"],["PASSWORD","password","text"],["BALANCE (₹)","balance","number"]].map(([label,key,type])=>(
              <Fg key={key} label={label}><input style={inp} type={type} value={editU[key]} onChange={e=>setEditU({...editU,[key]:e.target.value})}/></Fg>
            ))}
            <button style={btnP} onClick={save}>💾 Save Changes</button>
            <button style={{...btnS,marginTop:10}} onClick={()=>setEditU(null)}>Cancel</button>
          </Modal>
        </Overlay>
      )}
    </div>
  );
}

function AdminSettings({ settings, onSave, toast }) {
  const [form,setForm]=useState({...settings}); const [qrPrev,setQrPrev]=useState(settings.qrUrl||""); const qrRef=useRef();
  const handleQr=e=>{const f=e.target.files[0];if(!f)return;if(f.size>3*1024*1024)return toast("❌ QR max 3MB","error");const r=new FileReader();r.onload=()=>{setQrPrev(r.result);setForm(x=>({...x,qrUrl:r.result}));};r.readAsDataURL(f);};
  return (
    <div>
      <div style={{fontSize:16,fontWeight:900,marginBottom:16,paddingTop:4}}>⚙️ App Settings</div>
      <div style={{background:"rgba(0,230,118,.05)",border:"1px solid rgba(0,230,118,.2)",borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:800,color:C.green,marginBottom:16,letterSpacing:1}}>💳 YOUR UPI PAYMENT DETAILS</div>
        <Fg label="YOUR UPI ID"><input style={inp} placeholder="yourname@paytm" value={form.upiId} onChange={e=>setForm({...form,upiId:e.target.value})}/></Fg>
        <Fg label="DISPLAY NAME (shown to users)"><input style={inp} placeholder="Last Zone Legend" value={form.upiName} onChange={e=>setForm({...form,upiName:e.target.value})}/></Fg>
        <div>
          <div style={{fontSize:10,color:"#666",letterSpacing:2,marginBottom:10,fontWeight:700}}>YOUR UPI QR CODE (Users will scan this to pay)</div>
          <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>
            <div onClick={()=>qrRef.current.click()} style={{width:120,height:120,borderRadius:14,border:`2px dashed ${qrPrev?"rgba(0,230,118,.5)":"rgba(0,230,118,.25)"}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",flexShrink:0,background:qrPrev?"#fff":"rgba(255,255,255,.03)"}}>
              {qrPrev?<img src={qrPrev} alt="QR" style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<div style={{textAlign:"center"}}><div style={{fontSize:32}}>📱</div><div style={{fontSize:9,color:"#555",marginTop:4}}>Upload QR</div></div>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:"#888",marginBottom:12,lineHeight:1.6}}>Upload your personal UPI QR code. Users scan this to pay entry fees & add wallet money.</div>
              <button onClick={()=>qrRef.current.click()} style={{padding:"9px 16px",background:"rgba(0,230,118,.1)",border:"1px solid rgba(0,230,118,.3)",borderRadius:8,color:C.green,fontWeight:700,fontSize:12,cursor:"pointer"}}>{qrPrev?"🔄 Change QR":"📸 Upload QR"}</button>
              {qrPrev&&<div style={{fontSize:11,color:C.green,marginTop:8}}>✅ QR uploaded!</div>}
            </div>
          </div>
          <input ref={qrRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleQr}/>
        </div>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:800,color:"#aaa",marginBottom:14}}>💰 PAYMENT LIMITS</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          {[["Min Deposit","minDeposit","₹50"],["Min Withdraw","minWithdraw","₹200"],["Max Withdraw","maxWithdraw","₹10000"]].map(([label,key,ph])=>(
            <div key={key}><div style={{fontSize:10,color:"#666",letterSpacing:1,marginBottom:4}}>{label.toUpperCase()}</div><input style={{...inp,padding:"9px 10px",fontSize:14,textAlign:"center"}} type="number" placeholder={ph} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></div>
          ))}
        </div>
      </div>
      {/* Preview */}
      <div style={{background:"#0d1520",border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:800,color:"#aaa",marginBottom:12}}>👁️ PREVIEW (How users see it)</div>
        <div style={{textAlign:"center",padding:"12px 0"}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:4}}>📱 SCAN & PAY</div>
          <div style={{fontSize:12,color:"#888",marginBottom:12}}>UPI: <span style={{color:C.gold,fontWeight:700}}>{form.upiId||"yourname@paytm"}</span></div>
          {qrPrev?<div style={{display:"inline-block",padding:8,background:"#fff",borderRadius:10}}><img src={qrPrev} alt="QR" style={{width:100,height:100,display:"block"}}/></div>
            :<div style={{width:100,height:100,margin:"0 auto",borderRadius:10,background:"rgba(255,255,255,.04)",border:"2px dashed rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>📱</div>}
          <div style={{fontSize:12,color:"#888",marginTop:8}}>{form.upiName||"Last Zone Legend"}</div>
        </div>
      </div>
      <button style={{...btnP,background:`linear-gradient(135deg,${C.green},#00a152)`,color:"#000",boxShadow:"0 4px 20px rgba(0,230,118,.3)"}} onClick={async()=>{await onSave({...form,minDeposit:Number(form.minDeposit),minWithdraw:Number(form.minWithdraw),maxWithdraw:Number(form.maxWithdraw)});toast("✅ Settings saved!");}}>💾 SAVE ALL SETTINGS</button>
    </div>
  );
}

