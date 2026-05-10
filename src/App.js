// ✅ Firebase 연동 버전 — 우링 & 혁이의 머니로그
// 사용 전: 아래 firebaseConfig 값을 본인 Firebase 프로젝트 값으로 교체하세요!

import { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, onSnapshot,
  addDoc, deleteDoc, doc, setDoc,
} from "firebase/firestore";

/* ──────────────────────────────────────
   🔥 여기에 Firebase config 붙여넣기!
────────────────────────────────────── */
const firebaseConfig = {
  apiKey:            "여기에_붙여넣기",
  authDomain:        "여기에_붙여넣기",
  projectId:         "여기에_붙여넣기",
  storageBucket:     "여기에_붙여넣기",
  messagingSenderId: "여기에_붙여넣기",
  appId:             "여기에_붙여넣기",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

/* ─── 상수 ─── */
const CATEGORIES = [
  { id:"food",      label:"🍜 식비",      color:"#FFB3BA" },
  { id:"cafe",      label:"☕ 카페",      color:"#FFDFBA" },
  { id:"transport", label:"🚌 교통",      color:"#FFFFBA" },
  { id:"shopping",  label:"🛍️ 쇼핑",     color:"#BAFFC9" },
  { id:"date",      label:"💕 데이트",    color:"#BAE1FF" },
  { id:"health",    label:"💊 건강/병원", color:"#FFD6FF" },
  { id:"beauty",    label:"💄 뷰티",      color:"#FFC8DD" },
  { id:"hobby",     label:"🎮 취미",      color:"#BDE0FE" },
  { id:"travel",    label:"✈️ 여행",      color:"#A2D2FF" },
  { id:"living",    label:"🏠 생활/마트", color:"#CDB4DB" },
  { id:"education", label:"📚 교육",      color:"#B5EAD7" },
  { id:"subscribe", label:"📱 구독",      color:"#FFDDD2" },
  { id:"event",     label:"🎊 경조사",    color:"#FDFFB6" },
  { id:"gift",      label:"🎁 선물",      color:"#FFCFD2" },
  { id:"etc",       label:"🎀 기타",      color:"#E8BAFF" },
];

const INCOME_CATS = [
  { id:"salary",   label:"💰 월급",   color:"#B5EAD7" },
  { id:"allowance",label:"🎁 용돈",   color:"#FFC8DD" },
  { id:"extra",    label:"💵 부수입", color:"#BDE0FE" },
  { id:"etc_in",   label:"🌸 기타",   color:"#FFFFBA" },
];

const USERS = [
  { id:"me",      label:"우링 🐣", color:"#FF8FAB", bg:"#FFF0F3" },
  { id:"partner", label:"혁이 🐥", color:"#FFB347", bg:"#FFF8EE" },
];

const PAY_METHODS = [
  { id:"credit", label:"💳 신용카드" },
  { id:"debit",  label:"🏧 체크카드" },
  { id:"cash",   label:"💵 현금"     },
];

const ALL_MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

const fmt = (n) => Number(n).toLocaleString("ko-KR");

/* ═══════════════════════════════════════════════════ */
export default function App() {
  const today = new Date();
  const [tab, setTab]           = useState("home");
  const [records, setRecords]   = useState([]);
  const [budgets, setBudgets]   = useState({ me:300000, partner:300000 });
  const [loading, setLoading]   = useState(true);
  const [selYear, setSelYear]   = useState(today.getFullYear());
  const [selMonth, setSelMonth] = useState(today.getMonth()+1);
  const [form, setForm] = useState({
    type:"expense", user:"me", category:"food", pay:"credit",
    amount:"", memo:"", date:today.toISOString().split("T")[0],
  });
  const [filterUser, setFilterUser] = useState("all");
  const [filterCat,  setFilterCat]  = useState("all");
  const [filterPay,  setFilterPay]  = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [editBudget, setEditBudget] = useState(false);
  const [toast, setToast]           = useState("");

  /* 🔥 Firestore 실시간 구독 — records */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "records"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRecords(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /* 🔥 Firestore 실시간 구독 — budgets */
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "budgets"), (snap) => {
      if (snap.exists()) setBudgets(snap.data());
    });
    return () => unsub();
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg); setTimeout(()=>setToast(""), 2200);
  }, []);

  const monthKey     = `${selYear}-${String(selMonth).padStart(2,"0")}`;
  const monthRecords = records.filter(r=>r.date.startsWith(monthKey));
  const monthExpense = monthRecords.filter(r=>r.type==="expense");
  const monthIncome  = monthRecords.filter(r=>r.type==="income");

  const totalByUser  = (uid) => monthExpense.filter(r=>r.user===uid).reduce((s,r)=>s+r.amount,0);
  const meTotal      = totalByUser("me");
  const partnerTotal = totalByUser("partner");
  const grandTotal   = meTotal+partnerTotal;
  const mePct        = grandTotal>0?(meTotal/grandTotal)*100:50;
  const totalIncome  = monthIncome.reduce((s,r)=>s+r.amount,0);

  /* 🔥 Firestore에 저장 */
  const addRecord = async () => {
    const amt = Number(form.amount);
    if (!amt||isNaN(amt)) return showToast("금액을 입력해주세요 💸");
    if (!form.memo.trim()) return showToast("메모를 입력해주세요 📝");
    try {
      await addDoc(collection(db, "records"), {
        ...form, amount: amt, createdAt: Date.now(),
      });
      setForm(f=>({...f, amount:"", memo:""}));
      showToast(form.type==="income"?"수입이 추가됐어요 💰":"지출이 추가됐어요 🎉");
    } catch(e) {
      showToast("저장 실패 😢 인터넷을 확인해주세요");
    }
  };

  /* 🔥 Firestore에서 삭제 */
  const deleteRecord = async (id) => {
    try {
      await deleteDoc(doc(db, "records", id));
      showToast("삭제됐어요 🗑️");
    } catch(e) {
      showToast("삭제 실패 😢");
    }
  };

  /* 🔥 예산 Firestore에 저장 */
  const saveBudgets = async (newBudgets) => {
    try {
      await setDoc(doc(db, "settings", "budgets"), newBudgets);
      setBudgets(newBudgets);
    } catch(e) {
      showToast("예산 저장 실패 😢");
    }
  };

  const isCurrentMonth = selYear===today.getFullYear()&&selMonth===today.getMonth()+1;
  const prevMonth = ()=>{ if(selMonth===1){setSelYear(y=>y-1);setSelMonth(12);}else setSelMonth(m=>m-1); };
  const nextMonth = ()=>{ if(isCurrentMonth)return; if(selMonth===12){setSelYear(y=>y+1);setSelMonth(1);}else setSelMonth(m=>m+1); };

  const shared = {
    records, monthRecords, monthExpense, monthIncome,
    meTotal, partnerTotal, grandTotal, mePct, totalIncome,
    budgets, saveBudgets,
    filterUser, setFilterUser, filterCat, setFilterCat,
    filterPay, setFilterPay, filterType, setFilterType,
    editBudget, setEditBudget,
    form, setForm, addRecord, deleteRecord, showToast,
    selYear, selMonth,
  };

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", background:"#FFF5F8", gap:16 }}>
      <div style={{ fontSize:40 }}>💕</div>
      <div style={{ fontFamily:"sans-serif", color:"#FF8FAB", fontWeight:700 }}>머니로그 불러오는 중...</div>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Nanum Gothic',sans-serif", background:"#FFF5F8", minHeight:"100vh", maxWidth:420, margin:"0 auto", position:"relative", paddingBottom:88 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .card{background:white;border-radius:20px;padding:18px;margin:12px 16px;box-shadow:0 4px 16px rgba(255,143,171,.12)}
        .btn{border:none;border-radius:50px;cursor:pointer;font-family:inherit;font-weight:700;transition:all .15s}
        .btn:active{transform:scale(.96)}
        .tab-btn{background:none;border:none;cursor:pointer;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 10px}
        input,select{font-family:inherit;border:2px solid #FFD6E0;border-radius:12px;padding:10px 14px;outline:none;width:100%;font-size:14px;transition:border .2s;background:white}
        input:focus,select:focus{border-color:#FF8FAB}
        .pill{border-radius:50px;padding:4px 10px;font-size:11px;font-weight:700;border:none;cursor:pointer;transition:all .15s;white-space:nowrap}
        .toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#FF8FAB;color:white;padding:10px 22px;border-radius:50px;font-weight:700;font-size:14px;z-index:999;box-shadow:0 4px 16px rgba(255,143,171,.4);animation:sIn .3s ease}
        .heart{display:inline-block;animation:hb 1.2s infinite}
        .si{animation:sIn .28s ease}
        @keyframes sIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes hb{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}
        ::-webkit-scrollbar{width:0}
      `}</style>

      {toast && <div className="toast">{toast}</div>}

      <div style={{ background:"linear-gradient(135deg,#FF8FAB,#FFB3C6)", padding:"20px 20px 14px", color:"white" }}>
        <div style={{ textAlign:"center", fontSize:11, opacity:.8, marginBottom:2 }}>
          <span className="heart">💕</span> 함께 쓰는 가계부 · 실시간 공유 중 🔥
        </div>
        <div style={{ textAlign:"center", fontSize:24, fontWeight:800, letterSpacing:-1, marginBottom:12 }}>우리의 머니로그</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14 }}>
          <button className="btn" onClick={prevMonth} style={{ background:"rgba(255,255,255,.25)", color:"white", width:30, height:30, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
          <span style={{ fontWeight:800, fontSize:16 }}>{selYear}년 {ALL_MONTHS[selMonth-1]}</span>
          <button className="btn" onClick={nextMonth} style={{ background:isCurrentMonth?"rgba(255,255,255,.1)":"rgba(255,255,255,.25)", color:isCurrentMonth?"rgba(255,255,255,.3)":"white", width:30, height:30, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", cursor:isCurrentMonth?"default":"pointer" }}>›</button>
        </div>
      </div>

      <div style={{ paddingTop:4 }}>
        {tab==="home"     && <HomeTab     {...shared} />}
        {tab==="calendar" && <CalendarTab {...shared} />}
        {tab==="add"      && <AddTab      {...shared} />}
        {tab==="list"     && <ListTab     {...shared} />}
        {tab==="chart"    && <ChartTab    {...shared} />}
        {tab==="budget"   && <BudgetTab   {...shared} />}
      </div>

      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:420, background:"white", borderTop:"2px solid #FFE4EC", display:"flex", justifyContent:"space-around", padding:"5px 0 13px", zIndex:100 }}>
        {[
          {id:"home",     icon:"🏠", label:"홈"},
          {id:"calendar", icon:"📅", label:"달력"},
          {id:"add",      icon:"✏️",  label:"입력"},
          {id:"list",     icon:"📋", label:"내역"},
          {id:"chart",    icon:"📊", label:"그래프"},
          {id:"budget",   icon:"🎯", label:"예산"},
        ].map(t=>(
          <button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)}>
            <span style={{ fontSize:18 }}>{t.icon}</span>
            <span style={{ fontSize:9, fontWeight:700, color:tab===t.id?"#FF8FAB":"#ccc" }}>{t.label}</span>
            {tab===t.id && <div style={{ width:4, height:4, borderRadius:"50%", background:"#FF8FAB" }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════ HOME ══════════════ */
function HomeTab({ meTotal, partnerTotal, grandTotal, mePct, monthExpense, monthIncome, totalIncome }) {
  const balance = totalIncome - grandTotal;
  return (
    <div className="si">
      <div className="card" style={{ background:"linear-gradient(135deg,#FFF0F3,#FFF8EE)" }}>
        <div style={{ display:"flex", justifyContent:"space-around", textAlign:"center", marginBottom:14 }}>
          <div>
            <div style={{ fontSize:11, color:"#aaa" }}>수입</div>
            <div style={{ fontSize:16, fontWeight:800, color:"#4CAF82" }}>+₩{fmt(totalIncome)}</div>
          </div>
          <div style={{ width:1, background:"#FFE4EC" }} />
          <div>
            <div style={{ fontSize:11, color:"#aaa" }}>지출</div>
            <div style={{ fontSize:16, fontWeight:800, color:"#FF8FAB" }}>-₩{fmt(grandTotal)}</div>
          </div>
          <div style={{ width:1, background:"#FFE4EC" }} />
          <div>
            <div style={{ fontSize:11, color:"#aaa" }}>잔액</div>
            <div style={{ fontSize:16, fontWeight:800, color:balance>=0?"#5B8DEF":"#FF4D6D" }}>{balance>=0?"+":"-"}₩{fmt(Math.abs(balance))}</div>
          </div>
        </div>
        <div style={{ textAlign:"center", fontSize:11, color:"#bbb" }}>이번 달 총 지출</div>
        <div style={{ textAlign:"center", fontSize:32, fontWeight:800, color:"#FF8FAB", marginBottom:10 }}>₩{fmt(grandTotal)}</div>
        <div style={{ background:"#FFE4EC", borderRadius:20, height:18, overflow:"hidden", display:"flex" }}>
          <div style={{ width:`${mePct}%`, background:"linear-gradient(90deg,#FF8FAB,#FFB3C6)", transition:"width .6s", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {mePct>20 && <span style={{ fontSize:10, color:"white", fontWeight:800 }}>우링 {Math.round(mePct)}%</span>}
          </div>
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {mePct<80 && <span style={{ fontSize:10, color:"#FFB347", fontWeight:800 }}>혁이 {Math.round(100-mePct)}%</span>}
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginTop:6 }}>
          <span style={{ color:"#FF8FAB", fontWeight:700 }}>우링 🐣 ₩{fmt(meTotal)}</span>
          <span style={{ color:"#FFB347", fontWeight:700 }}>혁이 🐥 ₩{fmt(partnerTotal)}</span>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight:800, marginBottom:12, fontSize:15 }}>🗂️ 카테고리별 지출</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {CATEGORIES.map(cat=>{
            const total=monthExpense.filter(r=>r.category===cat.id).reduce((s,r)=>s+r.amount,0);
            if(!total) return null;
            return (
              <div key={cat.id} style={{ background:cat.color+"44", borderRadius:14, padding:"10px 12px" }}>
                <div style={{ fontSize:18 }}>{cat.label.split(" ")[0]}</div>
                <div style={{ fontSize:11, color:"#555", marginTop:1 }}>{cat.label.slice(cat.label.indexOf(" ")+1)}</div>
                <div style={{ fontSize:14, fontWeight:800, color:"#333" }}>₩{fmt(total)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight:800, marginBottom:10, fontSize:15 }}>🕐 최근 내역</div>
        {monthExpense.length===0&&monthIncome.length===0
          ? <div style={{ textAlign:"center", color:"#ccc", padding:16 }}>이번 달 내역이 없어요 🥲</div>
          : [...monthExpense,...monthIncome].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map(r=><RecordRow key={r.id} r={r} />)
        }
      </div>
    </div>
  );
}

/* ══════════════ CALENDAR ══════════════ */
function CalendarTab({ records, selYear, selMonth }) {
  const [selDay, setSelDay] = useState(null);
  const mk = `${selYear}-${String(selMonth).padStart(2,"0")}`;
  const monthRec = records.filter(r=>r.date.startsWith(mk));
  const firstDay = new Date(selYear, selMonth-1, 1).getDay();
  const daysInMonth = new Date(selYear, selMonth, 0).getDate();
  const today = new Date();
  const isThisMonth = selYear===today.getFullYear()&&selMonth===today.getMonth()+1;

  const dayMap = {};
  monthRec.forEach(r=>{
    const d=parseInt(r.date.split("-")[2]);
    if(!dayMap[d]) dayMap[d]={expense:0,income:0,records:[]};
    if(r.type==="expense") dayMap[d].expense+=r.amount;
    else dayMap[d].income+=r.amount;
    dayMap[d].records.push(r);
  });

  const cells=[];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);

  return (
    <div className="si">
      <div className="card" style={{ padding:"14px 10px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:6 }}>
          {["일","월","화","수","목","금","토"].map((d,i)=>(
            <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:800, color:i===0?"#FF8FAB":i===6?"#5B8DEF":"#bbb", paddingBottom:4 }}>{d}</div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
          {cells.map((d,i)=>{
            if(!d) return <div key={`e${i}`} />;
            const data=dayMap[d];
            const isToday=isThisMonth&&d===today.getDate();
            const isSel=d===selDay;
            const dow=(firstDay+d-1)%7;
            return (
              <div key={d} onClick={()=>setSelDay(isSel?null:d)}
                style={{ borderRadius:10, padding:"4px 2px", cursor:"pointer", background:isSel?"#FFE4EC":isToday?"#FFF0F3":"transparent", border:isSel?"2px solid #FF8FAB":isToday?"2px solid #FFB3C6":"2px solid transparent", minHeight:52, display:"flex", flexDirection:"column", alignItems:"center", gap:1 }}>
                <span style={{ fontSize:12, fontWeight:isToday?800:600, color:dow===0?"#FF8FAB":dow===6?"#5B8DEF":"#444" }}>{d}</span>
                {data&&(
                  <>
                    {data.income>0&&<span style={{ fontSize:9, color:"#4CAF82", fontWeight:800, lineHeight:1 }}>+{(data.income/10000).toFixed(0)}만</span>}
                    {data.expense>0&&<span style={{ fontSize:9, color:"#FF8FAB", fontWeight:800, lineHeight:1 }}>-{(data.expense/10000).toFixed(0)}만</span>}
                    <div style={{ display:"flex", gap:1, flexWrap:"wrap", justifyContent:"center" }}>
                      {data.records.slice(0,3).map((r,ri)=>{
                        const cat=r.type==="expense"?CATEGORIES.find(c=>c.id===r.category):INCOME_CATS.find(c=>c.id===r.category);
                        return <span key={ri} style={{ fontSize:8 }}>{cat?.label.split(" ")[0]}</span>;
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selDay&&(
        <div className="card si">
          <div style={{ fontWeight:800, fontSize:15, marginBottom:10 }}>
            {selMonth}월 {selDay}일 내역
            {dayMap[selDay]&&(
              <span style={{ fontSize:12, fontWeight:400, color:"#aaa", marginLeft:8 }}>
                {dayMap[selDay].income>0&&<span style={{ color:"#4CAF82" }}>+₩{fmt(dayMap[selDay].income)} </span>}
                {dayMap[selDay].expense>0&&<span style={{ color:"#FF8FAB" }}>-₩{fmt(dayMap[selDay].expense)}</span>}
              </span>
            )}
          </div>
          {(dayMap[selDay]?.records||[]).sort((a,b)=>a.type==="income"?-1:1).map(r=><RecordRow key={r.id} r={r} />)}
        </div>
      )}

      <div className="card">
        <div style={{ fontWeight:800, fontSize:15, marginBottom:10 }}>📋 이번 달 요약</div>
        <div style={{ display:"flex", justifyContent:"space-around", textAlign:"center" }}>
          <div>
            <div style={{ fontSize:11, color:"#aaa" }}>지출일수</div>
            <div style={{ fontSize:18, fontWeight:800, color:"#FF8FAB" }}>{Object.keys(dayMap).filter(d=>dayMap[d].expense>0).length}일</div>
          </div>
          <div>
            <div style={{ fontSize:11, color:"#aaa" }}>총 수입</div>
            <div style={{ fontSize:18, fontWeight:800, color:"#4CAF82" }}>₩{fmt(monthRec.filter(r=>r.type==="income").reduce((s,r)=>s+r.amount,0))}</div>
          </div>
          <div>
            <div style={{ fontSize:11, color:"#aaa" }}>총 지출</div>
            <div style={{ fontSize:18, fontWeight:800, color:"#FF8FAB" }}>₩{fmt(monthRec.filter(r=>r.type==="expense").reduce((s,r)=>s+r.amount,0))}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════ ADD ══════════════ */
function AddTab({ form, setForm, addRecord }) {
  const [displayAmt, setDisplayAmt] = useState("");
  const isExpense = form.type==="expense";
  const cats = isExpense ? CATEGORIES : INCOME_CATS;

  const handleAmt=(e)=>{
    const digits=e.target.value.replace(/[^0-9]/g,"");
    setDisplayAmt(digits?fmt(Number(digits)):"");
    setForm(f=>({...f,amount:digits}));
  };

  return (
    <div className="si">
      <div className="card">
        <div style={{ fontWeight:800, fontSize:16, marginBottom:16, textAlign:"center" }}>✏️ 내역 입력하기</div>
        <div style={{ display:"flex", background:"#f5f5f5", borderRadius:50, padding:3, marginBottom:16, gap:3 }}>
          {[{id:"expense",label:"💸 지출"},{id:"income",label:"💰 수입"}].map(t=>(
            <button key={t.id} className="btn" onClick={()=>setForm(f=>({...f,type:t.id,category:t.id==="expense"?"food":"salary"}))}
              style={{ flex:1, padding:"9px", background:form.type===t.id?(t.id==="expense"?"#FF8FAB":"#4CAF82"):"transparent", color:form.type===t.id?"white":"#aaa", fontSize:14 }}>
              {t.label}
            </button>
          ))}
        </div>

        <Lbl>누가 {isExpense?"썼나요?":"받았나요?"}</Lbl>
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          {USERS.map(u=>(
            <button key={u.id} className="btn" onClick={()=>setForm(f=>({...f,user:u.id}))}
              style={{ flex:1, padding:10, background:form.user===u.id?u.color:"#f5f5f5", color:form.user===u.id?"white":"#888", fontSize:14 }}>
              {u.label}
            </button>
          ))}
        </div>

        <Lbl>카테고리</Lbl>
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:14 }}>
          {cats.map(c=>(
            <button key={c.id} className="pill" onClick={()=>setForm(f=>({...f,category:c.id}))}
              style={{ background:form.category===c.id?c.color:"#f0f0f0", color:form.category===c.id?"#333":"#aaa", border:`2px solid ${form.category===c.id?c.color:"transparent"}` }}>
              {c.label}
            </button>
          ))}
        </div>

        {isExpense&&(
          <>
            <Lbl>결제수단</Lbl>
            <div style={{ display:"flex", gap:6, marginBottom:14 }}>
              {PAY_METHODS.map(p=>(
                <button key={p.id} className="pill" onClick={()=>setForm(f=>({...f,pay:p.id}))}
                  style={{ flex:1, padding:"8px 2px", background:form.pay===p.id?"#FF8FAB":"#f0f0f0", color:form.pay===p.id?"white":"#aaa" }}>
                  {p.label}
                </button>
              ))}
            </div>
          </>
        )}

        <Lbl>금액 (원)</Lbl>
        <div style={{ position:"relative", marginBottom:14 }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:isExpense?"#FF8FAB":"#4CAF82", fontWeight:800 }}>₩</span>
          <input type="text" inputMode="numeric" placeholder="0" value={displayAmt} onChange={handleAmt} style={{ paddingLeft:28 }} />
        </div>

        <Lbl>메모</Lbl>
        <input type="text" placeholder="내용을 입력하세요 🤔" value={form.memo}
          onChange={e=>setForm(f=>({...f,memo:e.target.value}))} style={{ marginBottom:14 }} />

        <Lbl>날짜</Lbl>
        <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{ marginBottom:18 }} />

        <button className="btn" onClick={addRecord}
          style={{ width:"100%", padding:14, background:isExpense?"linear-gradient(135deg,#FF8FAB,#FFB3C6)":"linear-gradient(135deg,#4CAF82,#81C784)", color:"white", fontSize:16 }}>
          {isExpense?"💸 지출 추가하기":"💰 수입 추가하기"}
        </button>
      </div>
    </div>
  );
}

/* ══════════════ LIST ══════════════ */
function ListTab({ records, selYear, selMonth, filterUser, setFilterUser, filterCat, setFilterCat, filterPay, setFilterPay, filterType, setFilterType, deleteRecord }) {
  const mk=`${selYear}-${String(selMonth).padStart(2,"0")}`;
  const filtered=records.filter(r=>{
    if(!r.date.startsWith(mk)) return false;
    if(filterType!=="all"&&r.type!==filterType) return false;
    if(filterUser!=="all"&&r.user!==filterUser) return false;
    if(filterCat!=="all"&&r.category!==filterCat) return false;
    if(filterPay!=="all"&&r.pay!==filterPay) return false;
    return true;
  });
  const totalExp=filtered.filter(r=>r.type==="expense").reduce((s,r)=>s+r.amount,0);
  const totalInc=filtered.filter(r=>r.type==="income").reduce((s,r)=>s+r.amount,0);

  return (
    <div className="si">
      <div className="card" style={{ paddingBottom:12 }}>
        <div style={{ fontWeight:800, fontSize:15, marginBottom:10 }}>🔍 필터</div>
        <div style={{ display:"flex", gap:5, marginBottom:7 }}>
          {[{id:"all",label:"전체"},{id:"expense",label:"💸 지출"},{id:"income",label:"💰 수입"}].map(t=>(
            <button key={t.id} className="pill" onClick={()=>setFilterType(t.id)}
              style={{ background:filterType===t.id?"#FF8FAB":"#f0f0f0", color:filterType===t.id?"white":"#888" }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:7 }}>
          {[{id:"all",label:"전체"},...USERS.map(u=>({id:u.id,label:u.label}))].map(u=>(
            <button key={u.id} className="pill" onClick={()=>setFilterUser(u.id)}
              style={{ background:filterUser===u.id?"#FFB347":"#f0f0f0", color:filterUser===u.id?"white":"#888" }}>
              {u.label}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          <button className="pill" onClick={()=>setFilterPay("all")} style={{ background:filterPay==="all"?"#BAE1FF":"#f0f0f0", color:filterPay==="all"?"#555":"#888" }}>전체</button>
          {PAY_METHODS.map(p=>(
            <button key={p.id} className="pill" onClick={()=>setFilterPay(p.id)}
              style={{ background:filterPay===p.id?"#BAE1FF":"#f0f0f0", color:filterPay===p.id?"#555":"#888" }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", padding:"0 20px 4px", alignItems:"center" }}>
        <span style={{ fontSize:12, color:"#aaa" }}>{filtered.length}건</span>
        <div style={{ display:"flex", gap:10 }}>
          {totalInc>0&&<span style={{ fontWeight:800, color:"#4CAF82", fontSize:13 }}>+₩{fmt(totalInc)}</span>}
          {totalExp>0&&<span style={{ fontWeight:800, color:"#FF8FAB", fontSize:13 }}>-₩{fmt(totalExp)}</span>}
        </div>
      </div>
      <div className="card" style={{ padding:"12px 16px" }}>
        {filtered.length===0&&<div style={{ textAlign:"center", color:"#ccc", padding:20 }}>내역이 없어요 🥲</div>}
        {filtered.sort((a,b)=>b.date.localeCompare(a.date)).map(r=><RecordRow key={r.id} r={r} onDelete={()=>deleteRecord(r.id)} />)}
      </div>
    </div>
  );
}

/* ══════════════ CHART ══════════════ */
function ChartTab({ records, selYear, selMonth }) {
  const [ct,setCt]=useState("category");
  const mk=`${selYear}-${String(selMonth).padStart(2,"0")}`;
  const mr=records.filter(r=>r.date.startsWith(mk)&&r.type==="expense");
  const gt=mr.reduce((s,r)=>s+r.amount,0);
  const catData=CATEGORIES.map(c=>({...c,total:mr.filter(r=>r.category===c.id).reduce((s,r)=>s+r.amount,0)})).filter(c=>c.total>0).sort((a,b)=>b.total-a.total);
  const maxCat=Math.max(...catData.map(c=>c.total),1);
  const payData=PAY_METHODS.map(p=>({...p,total:mr.filter(r=>r.pay===p.id).reduce((s,r)=>s+r.amount,0)}));
  const maxPay=Math.max(...payData.map(p=>p.total),1);
  const userData=USERS.map(u=>({...u,total:mr.filter(r=>r.user===u.id).reduce((s,r)=>s+r.amount,0)}));
  const trendMonths=[];
  for(let i=5;i>=0;i--){let y=selYear,m=selMonth-i;while(m<=0){m+=12;y--;}trendMonths.push({label:`${m}월`,key:`${y}-${String(m).padStart(2,"0")}`});}
  const trendData=trendMonths.map(t=>({
    label:t.label,
    me:records.filter(r=>r.date.startsWith(t.key)&&r.user==="me"&&r.type==="expense").reduce((s,r)=>s+r.amount,0),
    partner:records.filter(r=>r.date.startsWith(t.key)&&r.user==="partner"&&r.type==="expense").reduce((s,r)=>s+r.amount,0),
    income:records.filter(r=>r.date.startsWith(t.key)&&r.type==="income").reduce((s,r)=>s+r.amount,0),
  }));
  const maxTrend=Math.max(...trendData.map(d=>Math.max(d.me+d.partner,d.income)),1);

  return (
    <div className="si">
      <div className="card" style={{ padding:"12px 14px" }}>
        <div style={{ display:"flex", gap:4 }}>
          {[{id:"category",label:"📂 카테고리"},{id:"payment",label:"💳 결제수단"},{id:"compare",label:"👥 비교"},{id:"trend",label:"📈 트렌드"}].map(t=>(
            <button key={t.id} className="pill" onClick={()=>setCt(t.id)}
              style={{ flex:1, padding:"8px 2px", fontSize:9, background:ct===t.id?"#FF8FAB":"#f0f0f0", color:ct===t.id?"white":"#888" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {ct==="category"&&(<div className="card">
        <div style={{ fontWeight:800, fontSize:15, marginBottom:14 }}>📂 카테고리별 지출</div>
        {catData.length===0&&<EmptyMsg />}
        {catData.map(c=>(<div key={c.id} style={{ marginBottom:11 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
            <span style={{ fontWeight:700 }}>{c.label}</span>
            <span style={{ color:"#888" }}>₩{fmt(c.total)} · {gt>0?Math.round(c.total/gt*100):0}%</span>
          </div>
          <div style={{ background:"#f5f5f5", borderRadius:20, height:22, overflow:"hidden" }}>
            <div style={{ width:`${(c.total/maxCat)*100}%`, height:"100%", background:c.color, borderRadius:20, transition:"width .6s" }} />
          </div>
        </div>))}
      </div>)}

      {ct==="payment"&&(<div className="card">
        <div style={{ fontWeight:800, fontSize:15, marginBottom:14 }}>💳 결제수단별</div>
        {payData.map(p=>(<div key={p.id} style={{ marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
            <span style={{ fontWeight:700 }}>{p.label}</span>
            <span style={{ color:"#888" }}>₩{fmt(p.total)} · {gt>0?Math.round(p.total/gt*100):0}%</span>
          </div>
          <div style={{ background:"#f5f5f5", borderRadius:20, height:20, overflow:"hidden" }}>
            <div style={{ width:`${(p.total/maxPay)*100}%`, height:"100%", background:"linear-gradient(90deg,#FF8FAB,#FFD6E0)", borderRadius:20, transition:"width .6s" }} />
          </div>
        </div>))}
        <div style={{ display:"flex", justifyContent:"space-around", marginTop:16 }}>
          {payData.map(p=>{const pct=gt>0?p.total/gt:0;const sz=58+pct*34;return(
            <div key={p.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ width:sz, height:sz, borderRadius:"50%", background:`conic-gradient(#FF8FAB ${pct*360}deg,#f0f0f0 0)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ width:sz-16, height:sz-16, borderRadius:"50%", background:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#FF8FAB" }}>{Math.round(pct*100)}%</div>
              </div>
              <span style={{ fontSize:10, color:"#888" }}>{p.label.split(" ")[1]}</span>
            </div>
          );})}
        </div>
      </div>)}

      {ct==="compare"&&(<div className="card">
        <div style={{ fontWeight:800, fontSize:15, marginBottom:14 }}>👥 우링 vs 혁이 지출</div>
        <div style={{ display:"flex", gap:10, marginBottom:16 }}>
          {userData.map(u=>(<div key={u.id} style={{ flex:1, background:u.bg, borderRadius:16, padding:"12px", textAlign:"center" }}>
            <div style={{ fontSize:24 }}>{u.label.split(" ")[1]}</div>
            <div style={{ fontSize:12, color:"#aaa" }}>{u.label.split(" ")[0]}</div>
            <div style={{ fontSize:17, fontWeight:800, color:u.color, marginTop:4 }}>₩{fmt(u.total)}</div>
          </div>))}
        </div>
        {CATEGORIES.map(cat=>{
          const me=mr.filter(r=>r.category===cat.id&&r.user==="me").reduce((s,r)=>s+r.amount,0);
          const pa=mr.filter(r=>r.category===cat.id&&r.user==="partner").reduce((s,r)=>s+r.amount,0);
          if(!me&&!pa) return null;
          const mx=Math.max(me,pa,1);
          return(<div key={cat.id} style={{ marginBottom:10 }}>
            <div style={{ fontSize:12, fontWeight:700, marginBottom:3 }}>{cat.label}</div>
            {[{uid:"me",amt:me,color:"#FF8FAB",lbl:"우링"},{uid:"partner",amt:pa,color:"#FFB347",lbl:"혁이"}].map(x=>(
              <div key={x.uid} style={{ display:"flex", gap:5, alignItems:"center", marginBottom:2 }}>
                <span style={{ fontSize:10, color:x.color, width:28 }}>{x.lbl}</span>
                <div style={{ flex:1, background:"#f5f5f5", borderRadius:20, height:12, overflow:"hidden" }}>
                  <div style={{ width:`${(x.amt/mx)*100}%`, height:"100%", background:x.color, borderRadius:20 }} />
                </div>
                <span style={{ fontSize:10, color:"#888", width:50, textAlign:"right" }}>₩{fmt(x.amt)}</span>
              </div>
            ))}
          </div>);
        })}
      </div>)}

      {ct==="trend"&&(<div className="card">
        <div style={{ fontWeight:800, fontSize:15, marginBottom:14 }}>📈 최근 6개월 트렌드</div>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-around", height:150, paddingTop:8 }}>
          {trendData.map((d,i)=>{
            const mH=(d.me/maxTrend)*130;const pH=(d.partner/maxTrend)*130;
            const isSel=d.label===`${selMonth}월`;
            return(<div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, flex:1 }}>
              <div style={{ display:"flex", gap:2, alignItems:"flex-end" }}>
                <div style={{ width:12, height:Math.max(mH,2), background:"#FF8FAB", borderRadius:"4px 4px 0 0", opacity:isSel?1:.6 }} />
                <div style={{ width:12, height:Math.max(pH,2), background:"#FFB347", borderRadius:"4px 4px 0 0", opacity:isSel?1:.6 }} />
              </div>
              <span style={{ fontSize:9, color:isSel?"#FF8FAB":"#bbb", fontWeight:isSel?800:400 }}>{d.label}</span>
            </div>);
          })}
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:14, margin:"8px 0 12px" }}>
          <span style={{ fontSize:11, color:"#FF8FAB" }}>■ 우링</span>
          <span style={{ fontSize:11, color:"#FFB347" }}>■ 혁이</span>
        </div>
        {trendData.map((d,i)=>(<div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:11, padding:"5px 0", borderBottom:"1px dashed #FFE4EC" }}>
          <span style={{ fontWeight:700, width:28 }}>{d.label}</span>
          <span style={{ color:"#FF8FAB" }}>₩{fmt(d.me)}</span>
          <span style={{ color:"#FFB347" }}>₩{fmt(d.partner)}</span>
          <span style={{ color:"#4CAF82" }}>수입 ₩{fmt(d.income)}</span>
        </div>))}
      </div>)}
    </div>
  );
}

/* ══════════════ BUDGET ══════════════ */
function BudgetTab({ budgets, saveBudgets, meTotal, partnerTotal, editBudget, setEditBudget, showToast }) {
  const [temp,setTemp]   = useState(budgets);
  const [rawMe,setRawMe] = useState(fmt(budgets.me));
  const [rawPa,setRawPa] = useState(fmt(budgets.partner));

  const handleInput=(uid,val)=>{
    const d=val.replace(/[^0-9]/g,""),n=Number(d)||0;
    if(uid==="me"){setRawMe(d?fmt(n):"");setTemp(b=>({...b,me:n}));}
    else{setRawPa(d?fmt(n):"");setTemp(b=>({...b,partner:n}));}
  };
  const save=async()=>{ await saveBudgets(temp); setEditBudget(false); showToast("예산이 저장됐어요 🎯"); };

  return (
    <div className="si">
      <div className="card">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontWeight:800, fontSize:15 }}>🎯 이번 달 예산</div>
          <button className="btn" onClick={()=>setEditBudget(!editBudget)}
            style={{ padding:"6px 14px", background:editBudget?"#eee":"#FFE4EC", color:editBudget?"#888":"#FF8FAB", fontSize:13 }}>
            {editBudget?"취소":"수정 ✏️"}
          </button>
        </div>
        {USERS.map(u=>{
          const spent=u.id==="me"?meTotal:partnerTotal,budget=budgets[u.id];
          const pct=Math.min((spent/budget)*100,100),over=spent>budget;
          return(<div key={u.id} style={{ marginBottom:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontWeight:700, color:u.color }}>{u.label}</span>
              <span style={{ fontSize:12, color:over?"#FF4D6D":"#aaa" }}>₩{fmt(spent)} / ₩{fmt(budget)}</span>
            </div>
            {editBudget?(
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#FF8FAB", fontWeight:800 }}>₩</span>
                <input type="text" inputMode="numeric" value={u.id==="me"?rawMe:rawPa} onChange={e=>handleInput(u.id,e.target.value)} style={{ paddingLeft:28 }} />
              </div>
            ):(
              <>
                <div style={{ background:"#f0f0f0", borderRadius:20, height:16, overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:over?"linear-gradient(90deg,#FF4D6D,#FF8FA3)":`linear-gradient(90deg,${u.color},${u.color}88)`, borderRadius:20, transition:"width .6s" }} />
                </div>
                <div style={{ fontSize:12, color:over?"#FF4D6D":"#aaa", marginTop:3, textAlign:"right" }}>
                  {over?`🚨 ₩${fmt(spent-budget)} 초과!`:`₩${fmt(budget-spent)} 남음 (${Math.round(pct)}%)`}
                </div>
              </>
            )}
          </div>);
        })}
        {editBudget&&<button className="btn" onClick={save} style={{ width:"100%", padding:12, background:"linear-gradient(135deg,#FF8FAB,#FFB3C6)", color:"white", fontSize:15 }}>저장하기 💾</button>}
      </div>
      <div className="card" style={{ background:"linear-gradient(135deg,#FFF0F3,#FFF8EE)", textAlign:"center" }}>
        <div style={{ fontSize:13, color:"#aaa", marginBottom:4 }}>이번 달 절약 금액</div>
        <div style={{ fontSize:28, fontWeight:800, color:"#FF8FAB" }}>₩{fmt(Math.max(0,(budgets.me+budgets.partner)-(meTotal+partnerTotal)))}</div>
        <div style={{ fontSize:12, color:"#bbb", marginTop:4 }}>{meTotal+partnerTotal<=budgets.me+budgets.partner?"👏 예산 안에서 잘 지내고 있어요!":"🚨 예산을 초과했어요!"}</div>
      </div>
    </div>
  );
}

/* ══════════════ SHARED ══════════════ */
function RecordRow({ r, onDelete }) {
  const isExpense=r.type==="expense";
  const cat=isExpense?CATEGORIES.find(c=>c.id===r.category):INCOME_CATS.find(c=>c.id===r.category);
  const user=USERS.find(u=>u.id===r.user);
  const pay=PAY_METHODS.find(p=>p.id===r.pay);
  return(
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px dashed #FFE4EC" }}>
      <div style={{ width:36, height:36, borderRadius:12, background:(cat?.color||"#eee")+"66", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
        {cat?.label.split(" ")[0]}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.memo}</div>
        <div style={{ fontSize:10, color:"#aaa" }}>
          {r.date} · <span style={{ color:user?.color }}>{user?.label}</span>
          {isExpense&&pay&&<> · <span style={{ color:"#bbb" }}>{pay.label}</span></>}
        </div>
      </div>
      <div style={{ textAlign:"right", flexShrink:0 }}>
        <div style={{ fontWeight:800, color:isExpense?"#FF8FAB":"#4CAF82", fontSize:14 }}>{isExpense?"-":"+"}₩{fmt(r.amount)}</div>
        {onDelete&&<button onClick={onDelete} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, opacity:.4 }}>🗑️</button>}
      </div>
    </div>
  );
}

function Lbl({ children }) {
  return <div style={{ fontSize:13, fontWeight:700, color:"#888", marginBottom:6 }}>{children}</div>;
}
function EmptyMsg() {
  return <div style={{ textAlign:"center", color:"#ccc", padding:24 }}>데이터가 없어요 🥲</div>;
}
