// ✅ Our Story — Firebase 연동 완전판
// App.js에 붙여넣기 전에 firebaseConfig 값을 교체해주세요!

import { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc,
  onSnapshot, addDoc, deleteDoc, setDoc, getDoc
} from "firebase/firestore";

/* 🔥 Firebase Config — 본인 값으로 교체! */
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

/* ── 상수 ── */
const CATEGORIES = [
  {id:"food",      label:"🍜 식비",     color:"#FFB3BA"},
  {id:"cafe",      label:"☕ 카페",     color:"#FFDFBA"},
  {id:"transport", label:"🚌 교통",     color:"#FFFFBA"},
  {id:"shopping",  label:"🛍️ 쇼핑",    color:"#BAFFC9"},
  {id:"date",      label:"💕 데이트",   color:"#BAE1FF"},
  {id:"health",    label:"💊 건강/병원",color:"#FFD6FF"},
  {id:"beauty",    label:"💄 뷰티",     color:"#FFC8DD"},
  {id:"hobby",     label:"🎮 취미",     color:"#BDE0FE"},
  {id:"travel",    label:"✈️ 여행",     color:"#A2D2FF"},
  {id:"living",    label:"🏠 생활/마트",color:"#CDB4DB"},
  {id:"education", label:"📚 교육",     color:"#B5EAD7"},
  {id:"subscribe", label:"📱 구독",     color:"#FFDDD2"},
  {id:"event",     label:"🎊 경조사",   color:"#FDFFB6"},
  {id:"gift",      label:"🎁 선물",     color:"#FFCFD2"},
  {id:"etc",       label:"🎀 기타",     color:"#E8BAFF"},
];
const INCOME_CATS = [
  {id:"salary",    label:"💰 월급",   color:"#B5EAD7"},
  {id:"allowance", label:"🎁 용돈",   color:"#FFC8DD"},
  {id:"extra",     label:"💵 부수입", color:"#BDE0FE"},
  {id:"etc_in",    label:"🌸 기타",   color:"#FFFFBA"},
];
const PAY_METHODS = [
  {id:"credit", label:"💳 신용카드"},
  {id:"debit",  label:"🏧 체크카드"},
  {id:"cash",   label:"💵 현금"},
];
const USERS = [
  {id:"me",      label:"우링 🐣", color:"#FF8FAB", bg:"#FFF0F3"},
  {id:"partner", label:"혁이 🐥", color:"#FFB347", bg:"#FFF8EE"},
];
const ALL_MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const ANNIVERSARIES = [
  {days:100,label:"100일"},{days:200,label:"200일"},{days:365,label:"1주년"},
  {days:500,label:"500일"},{days:730,label:"2주년"},{days:1000,label:"1000일"},
  {days:1095,label:"3주년"},{days:1460,label:"4주년"},{days:1825,label:"5주년"},
];
const KOREA_PATHS = {
  gyeonggi:`M 176,142 L 184,128 L 196,118 L 214,112 L 230,110 L 248,112 L 264,118 L 276,128 L 284,142 L 286,156 L 280,170 L 268,180 L 252,186 L 236,188 L 220,184 L 206,176 L 194,164 L 178,156 Z`,
  gangwon: `M 284,112 L 302,104 L 322,100 L 344,102 L 364,110 L 380,124 L 388,140 L 388,158 L 380,174 L 366,184 L 348,190 L 328,190 L 308,184 L 292,172 L 282,158 L 282,142 Z`,
  seoul:   `M 210,148 L 220,140 L 234,138 L 246,142 L 252,152 L 248,162 L 236,166 L 222,164 L 212,156 Z`,
  incheon: `M 172,150 L 182,142 L 196,140 L 206,148 L 204,160 L 192,166 L 178,162 Z`,
  chungnam:`M 148,192 L 168,180 L 192,174 L 214,176 L 228,186 L 232,202 L 224,218 L 208,228 L 188,232 L 166,226 L 150,212 Z`,
  chungbuk:`M 228,180 L 252,174 L 278,176 L 296,188 L 300,206 L 292,222 L 274,232 L 254,234 L 234,226 L 222,212 L 224,196 Z`,
  sejong:  `M 220,200 L 234,194 L 246,200 L 244,214 L 230,218 L 218,212 Z`,
  daejeon: `M 208,212 L 222,206 L 234,212 L 230,224 L 214,226 L 204,218 Z`,
  jeonbuk: `M 148,232 L 180,226 L 212,228 L 232,240 L 234,260 L 222,276 L 200,284 L 176,282 L 152,270 L 138,252 Z`,
  jeonnam: `M 136,274 L 164,278 L 198,282 L 228,278 L 244,292 L 242,318 L 224,338 L 198,348 L 168,344 L 142,328 L 126,306 L 128,286 Z`,
  gwangju: `M 174,296 L 190,288 L 206,294 L 208,310 L 194,318 L 176,312 Z`,
  gyeongbuk:`M 296,186 L 330,182 L 364,184 L 386,200 L 390,224 L 378,248 L 354,264 L 326,268 L 298,258 L 278,240 L 274,218 L 282,202 Z`,
  daegu:   `M 316,230 L 334,222 L 350,230 L 348,248 L 330,256 L 312,248 Z`,
  gyeongnam:`M 270,262 L 306,260 L 344,258 L 370,272 L 374,298 L 356,320 L 326,332 L 292,330 L 262,314 L 250,292 L 256,272 Z`,
  ulsan:   `M 362,250 L 384,242 L 396,258 L 390,278 L 372,284 L 356,272 Z`,
  busan:   `M 354,308 L 378,296 L 396,308 L 392,330 L 368,340 L 348,328 Z`,
  jeju:    `M 168,420 L 202,410 L 238,412 L 258,424 L 254,442 L 228,454 L 196,452 L 170,438 Z`,
};
const LABEL_POS = {
  gyeonggi:[232,152],gangwon:[334,148],seoul:[232,154],incheon:[188,154],
  chungnam:[190,204],chungbuk:[262,204],sejong:[232,208],daejeon:[220,216],
  jeonbuk:[188,256],jeonnam:[186,316],gwangju:[192,306],gyeongbuk:[334,224],
  daegu:[332,240],gyeongnam:[312,296],ulsan:[378,264],busan:[372,318],jeju:[214,432],
};
const REGIONS = [
  {id:"seoul",name:"서울",emoji:"🏙️"},{id:"busan",name:"부산",emoji:"🌊"},
  {id:"daegu",name:"대구",emoji:"🍎"},{id:"incheon",name:"인천",emoji:"✈️"},
  {id:"gwangju",name:"광주",emoji:"🌸"},{id:"daejeon",name:"대전",emoji:"🔬"},
  {id:"ulsan",name:"울산",emoji:"🐳"},{id:"sejong",name:"세종",emoji:"🏛️"},
  {id:"gyeonggi",name:"경기",emoji:"🌿"},{id:"gangwon",name:"강원",emoji:"⛷️"},
  {id:"chungbuk",name:"충북",emoji:"🌾"},{id:"chungnam",name:"충남",emoji:"🦀"},
  {id:"jeonbuk",name:"전북",emoji:"🌻"},{id:"jeonnam",name:"전남",emoji:"🦋"},
  {id:"gyeongbuk",name:"경북",emoji:"🍑"},{id:"gyeongnam",name:"경남",emoji:"🎣"},
  {id:"jeju",name:"제주",emoji:"🍊"},
];
const SMALL_REGIONS=["seoul","incheon","daejeon","sejong","daegu","gwangju","ulsan","busan"];

const fmt = (n) => Number(n).toLocaleString("ko-KR");

/* ════════════════════════════════════════════════════ */
export default function App() {
  const [connected, setConnected] = useState(false);
  const [settings, setSettings]   = useState(null); // {myName, partnerName, startDate, coupleCode}
  const [records, setRecords]     = useState([]);
  const [budgets, setBudgets]     = useState({me:300000, partner:300000});
  const [visits, setVisits]       = useState({});
  const [photos, setPhotos]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("home");
  const [toast, setToast]         = useState("");

  const today = new Date();
  const [selYear, setSelYear]   = useState(today.getFullYear());
  const [selMonth, setSelMonth] = useState(today.getMonth()+1);

  const showToast = useCallback((msg)=>{setToast(msg);setTimeout(()=>setToast(""),2400);},[]);

  /* 🔥 Firestore 실시간 구독 */
  useEffect(()=>{
    // settings 구독
    const unsubSettings = onSnapshot(doc(db,"settings","main"), (snap)=>{
      if(snap.exists()){
        setSettings(snap.data());
        setConnected(true);
      } else {
        setConnected(false);
      }
      setLoading(false);
    });
    // records 구독
    const unsubRecords = onSnapshot(collection(db,"records"), (snap)=>{
      setRecords(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    // budgets 구독
    const unsubBudgets = onSnapshot(doc(db,"settings","budgets"), (snap)=>{
      if(snap.exists()) setBudgets(snap.data());
    });
    // visits 구독
    const unsubVisits = onSnapshot(doc(db,"settings","visits"), (snap)=>{
      if(snap.exists()) setVisits(snap.data());
    });
    // photos 구독
    const unsubPhotos = onSnapshot(collection(db,"photos"), (snap)=>{
      setPhotos(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return ()=>{ unsubSettings(); unsubRecords(); unsubBudgets(); unsubVisits(); unsubPhotos(); };
  },[]);

  /* 🔥 셋업 저장 */
  const saveSettings = async(data)=>{
    await setDoc(doc(db,"settings","main"), data);
    setConnected(true);
  };

  /* 🔥 초기화 */
  const resetAll = async()=>{
    if(!window.confirm("정말 초기화할까요? 모든 데이터가 삭제돼요 😢")) return;
    try {
      await deleteDoc(doc(db,"settings","main"));
      await deleteDoc(doc(db,"settings","budgets"));
      await deleteDoc(doc(db,"settings","visits"));
      // records, photos는 컬렉션이라 개별 삭제
      for(const r of records) await deleteDoc(doc(db,"records",r.id));
      for(const p of photos)  await deleteDoc(doc(db,"photos",p.id));
      setConnected(false);
      setSettings(null);
      setRecords([]);
      setBudgets({me:300000,partner:300000});
      setVisits({});
      setPhotos([]);
      showToast("초기화 완료! 처음 화면으로 돌아갔어요 🔄");
    } catch(e){ showToast("초기화 실패 😢 다시 시도해주세요"); }
  };

  /* 🔥 가계부 추가/삭제 */
  const addRecord = async(form)=>{
    const amt = Number(form.amount);
    if(!amt||isNaN(amt)){ showToast("금액을 입력해주세요 💸"); return false; }
    if(!form.memo.trim()){ showToast("메모를 입력해주세요 📝"); return false; }
    try {
      await addDoc(collection(db,"records"),{...form, amount:amt, createdAt:Date.now()});
      showToast(form.type==="income"?"수입이 추가됐어요 💰":"지출이 추가됐어요 🎉");
      return true;
    } catch(e){ showToast("저장 실패 😢 인터넷을 확인해주세요"); return false; }
  };
  const deleteRecord = async(id)=>{
    try { await deleteDoc(doc(db,"records",id)); showToast("삭제됐어요 🗑️"); }
    catch(e){ showToast("삭제 실패 😢"); }
  };

  /* 🔥 예산 저장 */
  const saveBudgets = async(b)=>{
    try { await setDoc(doc(db,"settings","budgets"),b); showToast("예산 저장됐어요 🎯"); }
    catch(e){ showToast("저장 실패 😢"); }
  };

  /* 🔥 방문 저장 */
  const saveVisits = async(v)=>{
    try { await setDoc(doc(db,"settings","visits"),v); }
    catch(e){ showToast("저장 실패 😢"); }
  };

  /* 🔥 사진 추가/삭제 */
  const addPhoto = async(form)=>{
    if(!form.url.trim()){ showToast("사진 URL을 입력해주세요!"); return false; }
    try { await addDoc(collection(db,"photos"),{...form, createdAt:Date.now()}); showToast("사진 추가됐어요 📸"); return true; }
    catch(e){ showToast("저장 실패 😢"); return false; }
  };
  const deletePhoto = async(id)=>{
    try { await deleteDoc(doc(db,"photos",id)); showToast("삭제됐어요 🗑️"); }
    catch(e){ showToast("삭제 실패 😢"); }
  };

  /* 🔥 설정 업데이트 */
  const updateSettings = async(patch)=>{
    try { await setDoc(doc(db,"settings","main"),{...settings,...patch}); showToast("저장됐어요 💾"); }
    catch(e){ showToast("저장 실패 😢"); }
  };

  // 날짜 계산
  const startD = settings?.startDate ? new Date(settings.startDate) : null;
  if(startD) startD.setHours(0,0,0,0);
  const dDay       = startD ? Math.floor((today-startD)/86400000)+1 : 0;
  const nextAnniv  = startD ? ANNIVERSARIES.find(a=>a.days>=dDay) : null;
  const daysToNext = nextAnniv&&startD ? nextAnniv.days-dDay : 0;

  // 가계부
  const monthKey  = `${selYear}-${String(selMonth).padStart(2,"0")}`;
  const monthRecs = records.filter(r=>r.date?.startsWith(monthKey));
  const monthExp  = monthRecs.filter(r=>r.type==="expense");
  const monthInc  = monthRecs.filter(r=>r.type==="income");
  const meTotal   = monthExp.filter(r=>r.user==="me").reduce((s,r)=>s+r.amount,0);
  const parTotal  = monthExp.filter(r=>r.user==="partner").reduce((s,r)=>s+r.amount,0);
  const grandTotal= meTotal+parTotal;
  const mePct     = grandTotal>0?(meTotal/grandTotal)*100:50;
  const totalInc  = monthInc.reduce((s,r)=>s+r.amount,0);
  const visitedCount = Object.keys(visits).length;
  const photoCount={};
  photos.forEach(p=>{photoCount[p.regionId]=(photoCount[p.regionId]||0)+1;});

  const isCurrentMonth = selYear===today.getFullYear()&&selMonth===today.getMonth()+1;
  const prevMonth=()=>{if(selMonth===1){setSelYear(y=>y-1);setSelMonth(12);}else setSelMonth(m=>m-1);};
  const nextMonth=()=>{if(isCurrentMonth)return;if(selMonth===12){setSelYear(y=>y+1);setSelMonth(1);}else setSelMonth(m=>m+1);};

  if(loading) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#120810",gap:16}}>
      <div style={{fontSize:40,animation:"hb 1.2s infinite"}}>💕</div>
      <div style={{fontFamily:"sans-serif",color:"#FF8FAB",fontWeight:700,fontSize:15}}>불러오는 중...</div>
      <style>{`@keyframes hb{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}`}</style>
    </div>
  );

  if(!connected) return (
    <SetupScreen saveSettings={saveSettings} showToast={showToast} toast={toast}/>
  );

  const shared = {
    settings, updateSettings, resetAll, showToast,
    records, addRecord, deleteRecord,
    budgets, saveBudgets,
    visits, saveVisits,
    photos, addPhoto, deletePhoto,
    photoCount, visitedCount,
    dDay, nextAnniv, daysToNext, startD,
    monthKey, monthExp, monthInc, meTotal, parTotal, grandTotal, mePct, totalInc,
    selYear, selMonth, prevMonth, nextMonth, isCurrentMonth,
  };

  const TABS = [
    {id:"home",icon:"🏠",label:"홈"},
    {id:"budget",icon:"💰",label:"가계부"},
    {id:"map",icon:"🗺️",label:"지도"},
    {id:"album",icon:"📸",label:"앨범"},
    {id:"datespot",icon:"💝",label:"데이트"},
    {id:"setting",icon:"⚙️",label:"설정"},
  ];

  return (
    <div style={{fontFamily:"'Nanum Gothic',sans-serif",background:"#120810",minHeight:"100vh",maxWidth:420,margin:"0 auto",position:"relative",paddingBottom:110,color:"white"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&family=Playfair+Display:wght@700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .card{background:rgba(255,255,255,.05);border:1px solid rgba(255,182,193,.12);border-radius:20px;padding:18px;margin:12px 16px}
        .tab-btn{background:none;border:none;cursor:pointer;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 6px}
        input,textarea,select{font-family:inherit;border:1.5px solid rgba(255,182,193,.25);border-radius:12px;padding:10px 14px;outline:none;width:100%;font-size:14px;background:rgba(255,255,255,.06);color:white;transition:border .2s}
        input:focus,textarea:focus,select:focus{border-color:#FF8FAB}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,.25)}
        .toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#FF8FAB;color:white;padding:10px 22px;border-radius:50px;font-weight:700;font-size:14px;z-index:999;box-shadow:0 4px 24px rgba(255,143,171,.5);animation:sIn .3s ease;white-space:nowrap}
        .heart{display:inline-block;animation:hb 1.4s infinite}
        .si{animation:sIn .3s ease}
        .pill{border-radius:50px;padding:4px 10px;font-size:11px;font-weight:700;border:none;cursor:pointer;white-space:nowrap;transition:all .15s}
        @keyframes sIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes hb{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
        ::-webkit-scrollbar{width:0}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(1) opacity(.4)}
        select option{background:#1e0d14}
      `}</style>

      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",top:-80,right:-80,width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,143,171,.12) 0%,transparent 70%)"}}/>
        <div style={{position:"absolute",bottom:-40,left:-60,width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,179,100,.07) 0%,transparent 70%)"}}/>
      </div>

      {toast&&<div className="toast">{toast}</div>}

      {/* 헤더 */}
      <div style={{position:"relative",zIndex:1,padding:"18px 20px 10px",textAlign:"center"}}>
        <div style={{fontSize:10,color:"rgba(255,182,193,.5)",marginBottom:2,letterSpacing:3}}>OUR STORY · 실시간 공유 🔥</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"#FFB6C1"}}>
          {settings?.myName} <span className="heart">💕</span> {settings?.partnerName}
        </div>
        {startD&&<div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:1}}>함께한 지 <span style={{color:"#FF8FAB",fontWeight:800}}>D+{fmt(dDay)}</span> 일째</div>}
        {tab==="budget"&&(
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginTop:8}}>
            <button onClick={prevMonth} style={{background:"rgba(255,255,255,.1)",border:"none",color:"white",width:28,height:28,fontSize:16,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
            <span style={{fontWeight:800,fontSize:14,color:"#FFB6C1"}}>{selYear}년 {ALL_MONTHS[selMonth-1]}</span>
            <button onClick={nextMonth} style={{background:isCurrentMonth?"rgba(255,255,255,.05)":"rgba(255,255,255,.1)",border:"none",color:isCurrentMonth?"rgba(255,255,255,.25)":"white",width:28,height:28,fontSize:16,borderRadius:"50%",cursor:isCurrentMonth?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
          </div>
        )}
      </div>

      <div style={{position:"relative",zIndex:1}}>
        {tab==="home"     && <HomeTab     {...shared}/>}
        {tab==="budget"   && <BudgetTab   {...shared}/>}
        {tab==="map"      && <MapTab      {...shared}/>}
        {tab==="album"    && <AlbumTab    {...shared}/>}
        {tab==="datespot" && <DateSpotTab {...shared}/>}
        {tab==="setting"  && <SettingTab  {...shared}/>}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:420,background:"rgba(18,8,16,.97)",borderTop:"1px solid rgba(255,182,193,.12)",display:"flex",justifyContent:"space-around",padding:"6px 0 14px",zIndex:100}}>
        {TABS.map(t=>(
          <button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)}>
            <span style={{fontSize:18}}>{t.icon}</span>
            <span style={{fontSize:8,fontWeight:700,color:tab===t.id?"#FF8FAB":"rgba(255,255,255,.28)"}}>{t.label}</span>
            {tab===t.id&&<div style={{width:3,height:3,borderRadius:"50%",background:"#FF8FAB"}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══ SETUP ══ */
function SetupScreen({saveSettings,showToast,toast}){
  const [myName,setMyName]=useState("");
  const [partnerName,setPartnerName]=useState("");
  const [startDate,setStartDate]=useState("");
  const [inputCode,setInputCode]=useState("");
  const [mode,setMode]=useState("");
  const [saving,setSaving]=useState(false);
  const genCode=()=>Math.random().toString(36).substring(2,8).toUpperCase();

  const handleCreate=async()=>{
    if(!myName.trim()) return showToast("내 이름을 입력해주세요!");
    if(!partnerName.trim()) return showToast("상대방 이름을 입력해주세요!");
    if(!startDate) return showToast("처음 만난 날을 입력해주세요!");
    setSaving(true);
    await saveSettings({myName,partnerName,startDate,coupleCode:genCode()});
    setSaving(false);
  };
  const handleJoin=async()=>{
    if(!inputCode.trim()) return showToast("커플 코드를 입력해주세요!");
    setSaving(true);
    // Firebase에서 기존 설정 불러옴
    try {
      const snap = await getDoc(doc(db,"settings","main"));
      if(snap.exists()&&snap.data().coupleCode===inputCode.toUpperCase()){
        await saveSettings(snap.data());
        showToast("입장했어요 💕");
      } else {
        showToast("코드가 맞지 않아요 😢");
      }
    } catch { showToast("연결 실패 😢 인터넷을 확인해주세요"); }
    setSaving(false);
  };

  const INP={fontFamily:"inherit",border:"1.5px solid rgba(255,182,193,.25)",borderRadius:12,padding:"12px 16px",outline:"none",width:"100%",fontSize:15,background:"rgba(255,255,255,.06)",color:"white",marginBottom:12};
  const BTN={border:"none",borderRadius:50,cursor:"pointer",fontFamily:"inherit",fontWeight:800,padding:"15px",fontSize:16,width:"100%"};

  return (
    <div style={{fontFamily:"'Nanum Gothic',sans-serif",background:"#120810",minHeight:"100vh",maxWidth:420,margin:"0 auto",color:"white",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&family=Playfair+Display:wght@700&display=swap');*{box-sizing:border-box;margin:0;padding:0}input::placeholder{color:rgba(255,255,255,.25)}input[type=date]::-webkit-calendar-picker-indicator{filter:invert(1) opacity(.4)}.heart{animation:hb 1.4s infinite;display:inline-block}@keyframes hb{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}`}</style>
      {toast&&<div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:"#FF8FAB",color:"white",padding:"10px 22px",borderRadius:50,fontWeight:700,zIndex:999}}>{toast}</div>}
      <div style={{position:"fixed",inset:0,pointerEvents:"none"}}><div style={{position:"absolute",top:-80,right:-80,width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,143,171,.12) 0%,transparent 70%)"}}/></div>
      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:340}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:52,marginBottom:14}} className="heart">💕</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:30,color:"#FFB6C1",marginBottom:6}}>Our Story</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.35)"}}>우리만의 모든 것을 기록해요</div>
        </div>
        {!mode&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <button onClick={()=>setMode("create")} style={{...BTN,background:"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white"}}>💑 커플 방 만들기</button>
            <button onClick={()=>setMode("join")}   style={{...BTN,background:"rgba(255,255,255,.05)",color:"rgba(255,255,255,.7)",border:"1.5px solid rgba(255,182,193,.25)"}}>🔗 커플 코드로 입장</button>
          </div>
        )}
        {mode==="create"&&<>
          <div style={{fontSize:13,color:"rgba(255,182,193,.6)",marginBottom:16,textAlign:"center"}}>새 커플 방 만들기 💕</div>
          <input style={INP} placeholder="내 이름 (예: 우링)"     value={myName}      onChange={e=>setMyName(e.target.value)}/>
          <input style={INP} placeholder="상대방 이름 (예: 혁이)" value={partnerName} onChange={e=>setPartnerName(e.target.value)}/>
          <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>처음 만난 날 💝</div>
          <input style={INP} type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}/>
          <button onClick={handleCreate} disabled={saving} style={{...BTN,background:saving?"rgba(255,143,171,.4)":"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white",marginTop:6}}>{saving?"저장 중...":"방 만들기 🎉"}</button>
          <button onClick={()=>setMode("")} style={{background:"none",border:"none",color:"rgba(255,255,255,.35)",cursor:"pointer",width:"100%",marginTop:12,fontSize:13}}>← 뒤로</button>
        </>}
        {mode==="join"&&<>
          <div style={{fontSize:13,color:"rgba(255,182,193,.6)",marginBottom:8,textAlign:"center"}}>커플 코드로 입장 🔗</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginBottom:16,textAlign:"center"}}>코드 입력하면 방 정보가 자동으로 불러와져요 😊</div>
          <input style={{...INP,letterSpacing:8,textAlign:"center",fontSize:24,fontWeight:800}} placeholder="AB1C2D" value={inputCode} onChange={e=>setInputCode(e.target.value.toUpperCase())} maxLength={6}/>
          <button onClick={handleJoin} disabled={saving} style={{...BTN,background:saving?"rgba(255,143,171,.4)":"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white",marginTop:4}}>{saving?"확인 중...":"입장하기 💕"}</button>
          <button onClick={()=>setMode("")} style={{background:"none",border:"none",color:"rgba(255,255,255,.35)",cursor:"pointer",width:"100%",marginTop:12,fontSize:13}}>← 뒤로</button>
        </>}
      </div>
    </div>
  );
}

/* ══ HOME ══ */
function HomeTab({dDay,nextAnniv,daysToNext,startD,visitedCount,grandTotal,totalInc,meTotal,parTotal,monthExp,monthInc}){
  const balance=totalInc-grandTotal;
  return (
    <div className="si">
      <div className="card" style={{background:"linear-gradient(135deg,rgba(255,143,171,.13),rgba(255,179,100,.06))",textAlign:"center",padding:"24px 20px"}}>
        <div style={{fontSize:11,color:"rgba(255,182,193,.5)",letterSpacing:3,marginBottom:6}}>LOVE COUNTER</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:58,color:"#FF8FAB",lineHeight:1,textShadow:"0 0 30px rgba(255,143,171,.35)"}}>D+{fmt(dDay)}</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.35)",margin:"6px 0 14px"}}>
          {startD&&`${startD.getFullYear()}년 ${startD.getMonth()+1}월 ${startD.getDate()}일부터`}
        </div>
        {nextAnniv&&(
          <div style={{background:"rgba(255,143,171,.1)",border:"1px solid rgba(255,143,171,.2)",borderRadius:14,padding:"10px 16px"}}>
            <div style={{fontSize:11,color:"rgba(255,182,193,.6)",marginBottom:2}}>다음 기념일</div>
            <div style={{fontSize:16,fontWeight:800,color:"#FFB6C1"}}>{nextAnniv.label} 🎉</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:2}}>D-{daysToNext}일 남았어요</div>
          </div>
        )}
      </div>
      <div className="card">
        <div style={{fontWeight:800,fontSize:14,color:"#FFB6C1",marginBottom:10}}>💰 이번 달 가계부</div>
        <div style={{display:"flex",justifyContent:"space-around",textAlign:"center"}}>
          <div><div style={{fontSize:13,color:"#4CAF82",fontWeight:800}}>+₩{fmt(totalInc)}</div><div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>수입</div></div>
          <div><div style={{fontSize:13,color:"#FF8FAB",fontWeight:800}}>-₩{fmt(grandTotal)}</div><div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>지출</div></div>
          <div><div style={{fontSize:13,color:balance>=0?"#5B8DEF":"#FF4D6D",fontWeight:800}}>{balance>=0?"+":"-"}₩{fmt(Math.abs(balance))}</div><div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>잔액</div></div>
        </div>
      </div>
      <div className="card">
        <div style={{fontWeight:800,fontSize:14,marginBottom:12,color:"#FFB6C1"}}>🎊 기념일 달력</div>
        {ANNIVERSARIES.map(a=>{
          const passed=dDay>a.days,isCurrent=nextAnniv?.days===a.days;
          const annivDate=startD?new Date(startD.getTime()+(a.days-1)*86400000):null;
          return (
            <div key={a.days} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 10px",borderRadius:12,marginBottom:3,background:isCurrent?"rgba(255,143,171,.12)":"transparent",border:isCurrent?"1px solid rgba(255,143,171,.25)":"1px solid transparent"}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:passed?"rgba(255,143,171,.2)":"rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>
                {passed?"✅":isCurrent?"⏳":"🔒"}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:passed?"#FF8FAB":isCurrent?"#FFB6C1":"rgba(255,255,255,.35)"}}>{a.label}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.25)"}}>{annivDate?`${annivDate.getFullYear()}.${String(annivDate.getMonth()+1).padStart(2,"0")}.${String(annivDate.getDate()).padStart(2,"0")}`:""}</div>
              </div>
              {isCurrent&&<div style={{fontSize:11,color:"#FF8FAB",fontWeight:800}}>D-{daysToNext}</div>}
            </div>
          );
        })}
      </div>
      <div className="card">
        <div style={{fontWeight:800,fontSize:14,marginBottom:10,color:"#FFB6C1"}}>🗺️ 여행 현황</div>
        <div style={{display:"flex",justifyContent:"space-around",textAlign:"center",marginBottom:10}}>
          <div><div style={{fontSize:26,fontWeight:800,color:"#FF8FAB"}}>{visitedCount}</div><div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>방문 지역</div></div>
          <div><div style={{fontSize:26,fontWeight:800,color:"#FFB347"}}>{17-visitedCount}</div><div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>남은 지역</div></div>
          <div><div style={{fontSize:26,fontWeight:800,color:"#B5EAD7"}}>{Math.round(visitedCount/17*100)}%</div><div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>달성률</div></div>
        </div>
        <div style={{background:"rgba(255,255,255,.05)",borderRadius:20,height:8,overflow:"hidden"}}>
          <div style={{width:`${visitedCount/17*100}%`,height:"100%",background:"linear-gradient(90deg,#FF8FAB,#FFB347)",borderRadius:20,transition:"width .8s"}}/>
        </div>
      </div>
    </div>
  );
}

/* ══ BUDGET ══ */
function BudgetTab(props){
  const [subTab,setSubTab]=useState("home");
  return (
    <div className="si">
      <div style={{display:"flex",gap:6,padding:"0 16px",marginTop:4,marginBottom:2}}>
        {[{id:"home",label:"📊 요약"},{id:"add",label:"✏️ 입력"},{id:"list",label:"📋 내역"},{id:"chart",label:"📈 그래프"}].map(t=>(
          <button key={t.id} onClick={()=>setSubTab(t.id)}
            style={{borderRadius:50,padding:"6px 12px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer",background:subTab===t.id?"#FF8FAB":"rgba(255,255,255,.07)",color:subTab===t.id?"white":"rgba(255,255,255,.45)"}}>
            {t.label}
          </button>
        ))}
      </div>
      {subTab==="home"  && <BudgetHome  {...props}/>}
      {subTab==="add"   && <BudgetAdd   {...props}/>}
      {subTab==="list"  && <BudgetList  {...props}/>}
      {subTab==="chart" && <BudgetChart {...props}/>}
    </div>
  );
}

function BudgetHome({meTotal,parTotal,grandTotal,mePct,totalInc,monthExp,monthInc,budgets,saveBudgets,showToast}){
  const [editBudget,setEditBudget]=useState(false);
  const [tempMe,setTempMe]=useState(fmt(budgets.me||300000));
  const [tempPa,setTempPa]=useState(fmt(budgets.partner||300000));
  const balance=totalInc-grandTotal;

  const handleInput=(uid,val)=>{
    const d=val.replace(/[^0-9]/g,""),n=Number(d)||0;
    if(uid==="me") setTempMe(d?fmt(n):""); else setTempPa(d?fmt(n):"");
  };
  const handleSaveBudget=async()=>{
    await saveBudgets({me:Number(tempMe.replace(/,/g,""))||0,partner:Number(tempPa.replace(/,/g,""))||0});
    setEditBudget(false);
  };

  return (
    <div>
      <div className="card" style={{background:"linear-gradient(135deg,rgba(255,143,171,.1),rgba(255,179,100,.05))"}}>
        <div style={{display:"flex",justifyContent:"space-around",textAlign:"center",marginBottom:14}}>
          <div><div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>수입</div><div style={{fontSize:14,fontWeight:800,color:"#4CAF82"}}>+₩{fmt(totalInc)}</div></div>
          <div style={{width:1,background:"rgba(255,255,255,.1)"}}/>
          <div><div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>지출</div><div style={{fontSize:14,fontWeight:800,color:"#FF8FAB"}}>-₩{fmt(grandTotal)}</div></div>
          <div style={{width:1,background:"rgba(255,255,255,.1)"}}/>
          <div><div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>잔액</div><div style={{fontSize:14,fontWeight:800,color:balance>=0?"#5B8DEF":"#FF4D6D"}}>{balance>=0?"+":"-"}₩{fmt(Math.abs(balance))}</div></div>
        </div>
        <div style={{textAlign:"center",fontSize:10,color:"rgba(255,255,255,.3)",marginBottom:4}}>이번 달 총 지출</div>
        <div style={{textAlign:"center",fontSize:28,fontWeight:800,color:"#FF8FAB",marginBottom:10}}>₩{fmt(grandTotal)}</div>
        <div style={{background:"rgba(255,255,255,.08)",borderRadius:20,height:16,overflow:"hidden",display:"flex"}}>
          <div style={{width:`${mePct}%`,background:"linear-gradient(90deg,#FF8FAB,#FFB3C6)",transition:"width .6s",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {mePct>20&&<span style={{fontSize:9,color:"white",fontWeight:800}}>우링 {Math.round(mePct)}%</span>}
          </div>
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {mePct<80&&<span style={{fontSize:9,color:"#FFB347",fontWeight:800}}>혁이 {Math.round(100-mePct)}%</span>}
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginTop:6}}>
          <span style={{color:"#FF8FAB",fontWeight:700}}>우링 🐣 ₩{fmt(meTotal)}</span>
          <span style={{color:"#FFB347",fontWeight:700}}>혁이 🐥 ₩{fmt(parTotal)}</span>
        </div>
      </div>

      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:800,fontSize:14,color:"#FFB6C1"}}>🎯 이번 달 예산</div>
          <button onClick={()=>setEditBudget(!editBudget)} style={{background:editBudget?"rgba(255,255,255,.08)":"rgba(255,143,171,.15)",border:"none",color:editBudget?"rgba(255,255,255,.5)":"#FF8FAB",borderRadius:50,padding:"5px 12px",fontFamily:"inherit",fontWeight:700,fontSize:12,cursor:"pointer"}}>
            {editBudget?"취소":"수정 ✏️"}
          </button>
        </div>
        {USERS.map(u=>{
          const spent=u.id==="me"?meTotal:parTotal,budget=budgets[u.id]||300000;
          const pct=Math.min((spent/budget)*100,100),over=spent>budget;
          return (
            <div key={u.id} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontWeight:700,color:u.color,fontSize:13}}>{u.label}</span>
                <span style={{fontSize:12,color:over?"#FF4D6D":"rgba(255,255,255,.4)"}}>₩{fmt(spent)} / ₩{fmt(budget)}</span>
              </div>
              {editBudget
                ?<input type="text" inputMode="numeric" value={u.id==="me"?tempMe:tempPa} onChange={e=>handleInput(u.id,e.target.value)} style={{marginBottom:4}}/>
                :<>
                  <div style={{background:"rgba(255,255,255,.06)",borderRadius:20,height:14,overflow:"hidden"}}>
                    <div style={{width:`${pct}%`,height:"100%",background:over?"linear-gradient(90deg,#FF4D6D,#FF8FA3)":`linear-gradient(90deg,${u.color},${u.color}88)`,borderRadius:20,transition:"width .6s"}}/>
                  </div>
                  <div style={{fontSize:11,color:over?"#FF4D6D":"rgba(255,255,255,.3)",marginTop:3,textAlign:"right"}}>
                    {over?`🚨 ₩${fmt(spent-budget)} 초과!`:`₩${fmt(budget-spent)} 남음`}
                  </div>
                </>
              }
            </div>
          );
        })}
        {editBudget&&<button onClick={handleSaveBudget} style={{width:"100%",padding:12,background:"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:14,cursor:"pointer"}}>저장 💾</button>}
      </div>

      <div className="card">
        <div style={{fontWeight:800,fontSize:14,color:"#FFB6C1",marginBottom:12}}>🗂️ 카테고리별</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {CATEGORIES.map(cat=>{
            const total=monthExp.filter(r=>r.category===cat.id).reduce((s,r)=>s+r.amount,0);
            if(!total) return null;
            return (
              <div key={cat.id} style={{background:cat.color+"22",borderRadius:14,padding:"10px 12px",border:`1px solid ${cat.color}44`}}>
                <div style={{fontSize:16}}>{cat.label.split(" ")[0]}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.5)",marginTop:1}}>{cat.label.slice(cat.label.indexOf(" ")+1)}</div>
                <div style={{fontSize:13,fontWeight:800,color:"white"}}>₩{fmt(total)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div style={{fontWeight:800,fontSize:14,color:"#FFB6C1",marginBottom:10}}>🕐 최근 내역</div>
        {[...monthExp,...monthInc].length===0
          ?<div style={{textAlign:"center",color:"rgba(255,255,255,.2)",padding:16}}>이번 달 내역이 없어요 🥲</div>
          :[...monthExp,...monthInc].sort((a,b)=>(b.date||"").localeCompare(a.date||"")).slice(0,5).map(r=><RecordRow key={r.id} r={r}/>)
        }
      </div>
    </div>
  );
}

function BudgetAdd({addRecord,showToast}){
  const today=new Date().toISOString().split("T")[0];
  const [form,setForm]=useState({type:"expense",user:"me",category:"food",pay:"credit",amount:"",memo:"",date:today});
  const [displayAmt,setDisplayAmt]=useState("");
  const [saving,setSaving]=useState(false);
  const isExp=form.type==="expense";
  const cats=isExp?CATEGORIES:INCOME_CATS;

  const handleAmt=(e)=>{
    const d=e.target.value.replace(/[^0-9]/g,"");
    setDisplayAmt(d?fmt(Number(d)):"");
    setForm(f=>({...f,amount:d}));
  };
  const handleAdd=async()=>{
    setSaving(true);
    const ok=await addRecord(form);
    if(ok){setDisplayAmt("");setForm(f=>({...f,amount:"",memo:""}));}
    setSaving(false);
  };

  return (
    <div className="card">
      <div style={{fontWeight:800,fontSize:15,color:"#FFB6C1",marginBottom:14,textAlign:"center"}}>✏️ 내역 입력</div>
      <div style={{display:"flex",background:"rgba(255,255,255,.06)",borderRadius:50,padding:3,marginBottom:14,gap:3}}>
        {[{id:"expense",label:"💸 지출"},{id:"income",label:"💰 수입"}].map(t=>(
          <button key={t.id} onClick={()=>setForm(f=>({...f,type:t.id,category:t.id==="expense"?"food":"salary"}))}
            style={{flex:1,padding:"9px",background:form.type===t.id?(t.id==="expense"?"#FF8FAB":"#4CAF82"):"transparent",color:form.type===t.id?"white":"rgba(255,255,255,.4)",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:14,cursor:"pointer"}}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>누가 {isExp?"썼나요?":"받았나요?"}</div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {USERS.map(u=>(
          <button key={u.id} onClick={()=>setForm(f=>({...f,user:u.id}))}
            style={{flex:1,padding:10,background:form.user===u.id?u.color:"rgba(255,255,255,.06)",color:form.user===u.id?"white":"rgba(255,255,255,.5)",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:"pointer"}}>
            {u.label}
          </button>
        ))}
      </div>
      <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>카테고리</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
        {cats.map(c=>(
          <button key={c.id} onClick={()=>setForm(f=>({...f,category:c.id}))}
            style={{borderRadius:50,padding:"4px 10px",fontSize:11,fontWeight:700,border:`2px solid ${form.category===c.id?c.color:"transparent"}`,cursor:"pointer",background:form.category===c.id?c.color+"33":"rgba(255,255,255,.06)",color:form.category===c.id?"white":"rgba(255,255,255,.45)"}}>
            {c.label}
          </button>
        ))}
      </div>
      {isExp&&<>
        <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>결제수단</div>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {PAY_METHODS.map(p=>(
            <button key={p.id} onClick={()=>setForm(f=>({...f,pay:p.id}))}
              style={{flex:1,padding:"7px 4px",borderRadius:50,fontSize:11,fontWeight:700,border:"none",cursor:"pointer",background:form.pay===p.id?"#FF8FAB":"rgba(255,255,255,.06)",color:form.pay===p.id?"white":"rgba(255,255,255,.45)"}}>
              {p.label}
            </button>
          ))}
        </div>
      </>}
      <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>금액</div>
      <div style={{position:"relative",marginBottom:14}}>
        <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:isExp?"#FF8FAB":"#4CAF82",fontWeight:800}}>₩</span>
        <input type="text" inputMode="numeric" placeholder="0" value={displayAmt} onChange={handleAmt} style={{paddingLeft:28}}/>
      </div>
      <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>메모</div>
      <input placeholder="내용 입력 🤔" value={form.memo} onChange={e=>setForm(f=>({...f,memo:e.target.value}))} style={{marginBottom:14}}/>
      <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>날짜</div>
      <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{marginBottom:20}}/>
      <button onClick={handleAdd} disabled={saving}
        style={{width:"100%",padding:14,background:saving?"rgba(255,143,171,.4)":isExp?"linear-gradient(135deg,#FF8FAB,#FFB3C6)":"linear-gradient(135deg,#4CAF82,#81C784)",color:"white",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:15,cursor:saving?"not-allowed":"pointer"}}>
        {saving?"저장 중...":(isExp?"💸 지출 추가하기":"💰 수입 추가하기")}
      </button>
    </div>
  );
}

function BudgetList({monthExp,monthInc,deleteRecord}){
  const [filterType,setFilterType]=useState("all");
  const [filterUser,setFilterUser]=useState("all");
  const all=[...monthExp,...monthInc].sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const filtered=all.filter(r=>{
    if(filterType!=="all"&&r.type!==filterType) return false;
    if(filterUser!=="all"&&r.user!==filterUser) return false;
    return true;
  });
  const totalExp=filtered.filter(r=>r.type==="expense").reduce((s,r)=>s+r.amount,0);
  const totalInc=filtered.filter(r=>r.type==="income").reduce((s,r)=>s+r.amount,0);

  return (
    <div>
      <div className="card" style={{paddingBottom:10}}>
        <div style={{display:"flex",gap:5,marginBottom:7,flexWrap:"wrap"}}>
          {[{id:"all",label:"전체"},{id:"expense",label:"💸 지출"},{id:"income",label:"💰 수입"}].map(t=>(
            <button key={t.id} className="pill" onClick={()=>setFilterType(t.id)} style={{background:filterType===t.id?"#FF8FAB":"rgba(255,255,255,.07)",color:filterType===t.id?"white":"rgba(255,255,255,.45)"}}>{t.label}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {[{id:"all",label:"전체"},...USERS.map(u=>({id:u.id,label:u.label}))].map(u=>(
            <button key={u.id} className="pill" onClick={()=>setFilterUser(u.id)} style={{background:filterUser===u.id?"#FFB347":"rgba(255,255,255,.07)",color:filterUser===u.id?"white":"rgba(255,255,255,.45)"}}>{u.label}</button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",padding:"0 20px 4px"}}>
        <span style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>{filtered.length}건</span>
        <div style={{display:"flex",gap:10}}>
          {totalInc>0&&<span style={{fontWeight:800,color:"#4CAF82",fontSize:12}}>+₩{fmt(totalInc)}</span>}
          {totalExp>0&&<span style={{fontWeight:800,color:"#FF8FAB",fontSize:12}}>-₩{fmt(totalExp)}</span>}
        </div>
      </div>
      <div className="card" style={{padding:"12px 16px"}}>
        {filtered.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,.2)",padding:20}}>내역이 없어요 🥲</div>}
        {filtered.map(r=><RecordRow key={r.id} r={r} onDelete={()=>deleteRecord(r.id)}/>)}
      </div>
    </div>
  );
}

function BudgetChart({monthExp,grandTotal,records,selYear,selMonth}){
  const catData=CATEGORIES.map(c=>({...c,total:monthExp.filter(r=>r.category===c.id).reduce((s,r)=>s+r.amount,0)})).filter(c=>c.total>0).sort((a,b)=>b.total-a.total);
  const maxCat=Math.max(...catData.map(c=>c.total),1);
  const userData=USERS.map(u=>({...u,total:monthExp.filter(r=>r.user===u.id).reduce((s,r)=>s+r.amount,0)}));
  const trendMonths=[];
  for(let i=5;i>=0;i--){let y=selYear,m=selMonth-i;while(m<=0){m+=12;y--;}trendMonths.push({label:`${m}월`,key:`${y}-${String(m).padStart(2,"0")}`});}
  const trendData=trendMonths.map(t=>({
    label:t.label,
    me:(records||[]).filter(r=>r.date?.startsWith(t.key)&&r.user==="me"&&r.type==="expense").reduce((s,r)=>s+r.amount,0),
    partner:(records||[]).filter(r=>r.date?.startsWith(t.key)&&r.user==="partner"&&r.type==="expense").reduce((s,r)=>s+r.amount,0),
  }));
  const maxTrend=Math.max(...trendData.map(d=>d.me+d.partner),1);

  return (
    <div>
      <div className="card">
        <div style={{fontWeight:800,fontSize:14,color:"#FFB6C1",marginBottom:14}}>📂 카테고리별</div>
        {catData.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,.2)",padding:20}}>데이터가 없어요</div>}
        {catData.map(c=>(
          <div key={c.id} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
              <span style={{fontWeight:700,color:"white"}}>{c.label}</span>
              <span style={{color:"rgba(255,255,255,.5)"}}>₩{fmt(c.total)} · {grandTotal>0?Math.round(c.total/grandTotal*100):0}%</span>
            </div>
            <div style={{background:"rgba(255,255,255,.05)",borderRadius:20,height:20,overflow:"hidden"}}>
              <div style={{width:`${(c.total/maxCat)*100}%`,height:"100%",background:c.color,borderRadius:20,transition:"width .6s"}}/>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div style={{fontWeight:800,fontSize:14,color:"#FFB6C1",marginBottom:12}}>📈 6개월 트렌드</div>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-around",height:140,paddingTop:8}}>
          {trendData.map((d,i)=>{
            const mH=(d.me/maxTrend)*120,pH=(d.partner/maxTrend)*120,isSel=d.label===`${selMonth}월`;
            return (
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flex:1}}>
                <div style={{display:"flex",gap:2,alignItems:"flex-end"}}>
                  <div style={{width:11,height:Math.max(mH,2),background:"#FF8FAB",borderRadius:"4px 4px 0 0",opacity:isSel?1:.55}}/>
                  <div style={{width:11,height:Math.max(pH,2),background:"#FFB347",borderRadius:"4px 4px 0 0",opacity:isSel?1:.55}}/>
                </div>
                <span style={{fontSize:9,color:isSel?"#FF8FAB":"rgba(255,255,255,.3)",fontWeight:isSel?800:400}}>{d.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:14,marginTop:8}}>
          <span style={{fontSize:11,color:"#FF8FAB"}}>■ 우링</span>
          <span style={{fontSize:11,color:"#FFB347"}}>■ 혁이</span>
        </div>
      </div>
    </div>
  );
}

function RecordRow({r,onDelete}){
  const isExp=r.type==="expense";
  const cat=isExp?CATEGORIES.find(c=>c.id===r.category):INCOME_CATS.find(c=>c.id===r.category);
  const user=USERS.find(u=>u.id===r.user);
  const pay=PAY_METHODS.find(p=>p.id===r.pay);
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
      <div style={{width:34,height:34,borderRadius:10,background:(cat?.color||"#eee")+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{cat?.label.split(" ")[0]}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:700,color:"white",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.memo}</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{r.date} · <span style={{color:user?.color}}>{user?.label}</span>{isExp&&pay&&<> · {pay.label}</>}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontWeight:800,color:isExp?"#FF8FAB":"#4CAF82",fontSize:13}}>{isExp?"-":"+"}₩{fmt(r.amount)}</div>
        {onDelete&&<button onClick={onDelete} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,opacity:.35,color:"white"}}>🗑️</button>}
      </div>
    </div>
  );
}

/* ══ MAP ══ */
function MapTab({visits,saveVisits,showToast,photoCount}){
  const [selRegion,setSelRegion]=useState(null);
  const [memo,setMemo]=useState("");
  const [visitDate,setVisitDate]=useState(new Date().toISOString().split("T")[0]);
  const [hoverId,setHoverId]=useState(null);
  const [saving,setSaving]=useState(false);

  const openRegion=(r)=>{setSelRegion(r);const ex=visits[r.id];setMemo(ex?.memo||"");setVisitDate(ex?.date||new Date().toISOString().split("T")[0]);};
  const handleSave=async()=>{
    setSaving(true);
    await saveVisits({...visits,[selRegion.id]:{memo,date:visitDate}});
    setSelRegion(null);setSaving(false);
    showToast(`${selRegion.name} 방문 기록 완료 📍`);
  };
  const handleRemove=async(id)=>{
    const v={...visits};delete v[id];
    await saveVisits(v);
    showToast("삭제됐어요 🗑️");
  };

  return (
    <div className="si">
      <div className="card" style={{padding:"14px 10px"}}>
        <div style={{fontWeight:800,fontSize:15,color:"#FFB6C1",marginBottom:2}}>🗺️ 대한민국 여행지도</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginBottom:10}}>지역을 눌러서 방문 기록을 추가해요</div>
        <div style={{background:"rgba(100,149,237,.04)",borderRadius:16,padding:"6px 2px",border:"1px solid rgba(255,182,193,.08)"}}>
          <svg viewBox="120 90 300 380" style={{width:"100%",height:"auto",display:"block"}}>
            <rect x="120" y="90" width="300" height="380" fill="rgba(100,149,237,.03)" rx="10"/>
            {REGIONS.map(r=>{
              const visited=!!visits[r.id],cnt=photoCount[r.id]||0,isHover=hoverId===r.id,lp=LABEL_POS[r.id],path=KOREA_PATHS[r.id];
              if(!path) return null;
              return (
                <g key={r.id} onClick={()=>openRegion(r)} onMouseEnter={()=>setHoverId(r.id)} onMouseLeave={()=>setHoverId(null)} style={{cursor:"pointer"}}>
                  <path d={path} fill={visited?(isHover?"#e0607a":"#FF8FAB"):(isHover?"rgba(255,182,193,.2)":"rgba(255,255,255,.07)")} stroke={visited?"rgba(255,220,230,.8)":"rgba(255,182,193,.3)"} strokeWidth={visited?1.5:1} strokeLinejoin="round" style={{transition:"fill .2s"}}/>
                  {lp&&<text x={lp[0]} y={lp[1]} textAnchor="middle" fontSize={SMALL_REGIONS.includes(r.id)?"5.5":"7"} fill={visited?"#fff":"rgba(255,255,255,.55)"} fontWeight={visited?"700":"400"} fontFamily="'Nanum Gothic',sans-serif" style={{pointerEvents:"none",userSelect:"none"}}>{r.name}</text>}
                  {cnt>0&&lp&&<g style={{pointerEvents:"none"}}><circle cx={lp[0]+10} cy={lp[1]-10} r={7} fill="#FFB347" stroke="#120810" strokeWidth="1"/><text x={lp[0]+10} y={lp[1]-10} textAnchor="middle" dominantBaseline="central" fontSize="6.5" fill="white" fontWeight="800" fontFamily="sans-serif">{cnt}</text></g>}
                </g>
              );
            })}
            <circle cx="415" cy="200" r="5" fill="rgba(255,255,255,.07)" stroke="rgba(255,182,193,.3)" strokeWidth="1"/>
            <text x="415" y="212" textAnchor="middle" fontSize="5" fill="rgba(255,255,255,.3)" fontFamily="sans-serif">독도</text>
          </svg>
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:10}}>
          <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"rgba(255,255,255,.4)"}}><div style={{width:10,height:10,borderRadius:2,background:"#FF8FAB"}}/>방문완료</div>
          <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"rgba(255,255,255,.4)"}}><div style={{width:10,height:10,borderRadius:2,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,182,193,.3)"}}/>미방문</div>
          <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"rgba(255,255,255,.4)"}}><div style={{width:12,height:12,borderRadius:"50%",background:"#FFB347",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:"white",fontWeight:800}}>2</div>사진수</div>
        </div>
      </div>

      {Object.keys(visits).length>0&&(
        <div className="card">
          <div style={{fontWeight:800,fontSize:15,color:"#FFB6C1",marginBottom:12}}>📍 방문 기록</div>
          {Object.entries(visits).map(([id,v])=>{
            const r=REGIONS.find(x=>x.id===id),cnt=photoCount[id]||0;
            return (
              <div key={id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                <span style={{fontSize:18}}>{r?.emoji}</span>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#FFB6C1"}}>{r?.name}</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{v.date}{v.memo&&` · ${v.memo}`}</div></div>
                {cnt>0&&<div style={{background:"#FFB347",borderRadius:50,padding:"2px 8px",fontSize:11,fontWeight:800,color:"white"}}>📸 {cnt}</div>}
                <button onClick={()=>handleRemove(id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,opacity:.35,color:"white"}}>🗑️</button>
              </div>
            );
          })}
        </div>
      )}

      {selRegion&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setSelRegion(null)}>
          <div style={{background:"#1c0c14",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:420,maxHeight:"85vh",overflowY:"auto",paddingBottom:100}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}><div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,.2)"}}/></div>
            <div style={{padding:"0 24px 24px"}}>
              <div style={{textAlign:"center",marginBottom:18}}>
                <div style={{fontSize:36}}>{selRegion.emoji}</div>
                <div style={{fontSize:18,fontWeight:800,color:"#FFB6C1",marginTop:6}}>{selRegion.name}</div>
                {visits[selRegion.id]&&<div style={{fontSize:11,color:"rgba(255,143,171,.6)",marginTop:3}}>✓ 방문한 지역이에요</div>}
              </div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>방문 날짜</div>
              <input type="date" value={visitDate} onChange={e=>setVisitDate(e.target.value)} style={{marginBottom:12}}/>
              <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>메모</div>
              <textarea value={memo} onChange={e=>setMemo(e.target.value)} placeholder="어떤 추억이 있었나요? 🌟" rows={3} style={{fontFamily:"inherit",border:"1.5px solid rgba(255,182,193,.25)",borderRadius:12,padding:"10px 14px",outline:"none",width:"100%",fontSize:14,background:"rgba(255,255,255,.06)",color:"white",resize:"none",marginBottom:16}}/>
              <div style={{display:"flex",gap:10,marginBottom:10}}>
                {visits[selRegion.id]&&<button onClick={()=>{handleRemove(selRegion.id);setSelRegion(null);}} style={{flex:1,padding:13,background:"rgba(255,100,100,.1)",border:"1px solid rgba(255,100,100,.2)",color:"rgba(255,150,150,.8)",borderRadius:50,fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer"}}>삭제</button>}
                <button onClick={handleSave} disabled={saving} style={{flex:2,padding:13,background:saving?"rgba(255,143,171,.4)":"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:15,cursor:saving?"not-allowed":"pointer"}}>{saving?"저장 중...":"📍 기록하기"}</button>
              </div>
              <button onClick={()=>setSelRegion(null)} style={{width:"100%",padding:12,background:"none",border:"none",color:"rgba(255,255,255,.35)",fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:"pointer"}}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══ ALBUM ══ */
function AlbumTab({photos,addPhoto,deletePhoto,photoCount}){
  const [selRegion,setSelRegion]=useState("all");
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({regionId:"seoul",memo:"",date:new Date().toISOString().split("T")[0],url:""});
  const [saving,setSaving]=useState(false);

  const handleAdd=async()=>{
    setSaving(true);
    const ok=await addPhoto(form);
    if(ok){setShowAdd(false);setForm({regionId:"seoul",memo:"",date:new Date().toISOString().split("T")[0],url:""});}
    setSaving(false);
  };

  const filtered=selRegion==="all"?photos:photos.filter(p=>p.regionId===selRegion);

  return (
    <div className="si">
      <div className="card" style={{paddingBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div><div style={{fontWeight:800,fontSize:15,color:"#FFB6C1"}}>📸 추억 앨범</div><div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:1}}>총 {photos.length}장</div></div>
          <button onClick={()=>setShowAdd(true)} style={{background:"rgba(255,143,171,.15)",border:"1px solid rgba(255,143,171,.3)",color:"#FF8FAB",borderRadius:50,padding:"7px 16px",fontFamily:"inherit",fontWeight:700,fontSize:12,cursor:"pointer"}}>+ 추가</button>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          <button onClick={()=>setSelRegion("all")} style={{borderRadius:50,padding:"4px 12px",fontSize:11,fontWeight:700,border:"none",cursor:"pointer",background:selRegion==="all"?"#FF8FAB":"rgba(255,255,255,.07)",color:selRegion==="all"?"white":"rgba(255,255,255,.45)"}}>전체 {photos.length>0&&photos.length}</button>
          {REGIONS.filter(r=>photoCount[r.id]>0).map(r=>(
            <button key={r.id} onClick={()=>setSelRegion(r.id)} style={{borderRadius:50,padding:"4px 10px",fontSize:11,fontWeight:700,border:"none",cursor:"pointer",background:selRegion===r.id?"#FF8FAB":"rgba(255,255,255,.07)",color:selRegion===r.id?"white":"rgba(255,255,255,.45)"}}>
              {r.emoji}{r.name} <span style={{background:selRegion===r.id?"rgba(255,255,255,.3)":"rgba(255,143,171,.4)",borderRadius:50,padding:"0 5px",color:"white",fontWeight:800}}>{photoCount[r.id]}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:"0 16px 16px"}}>
        {filtered.length===0?(
          <div style={{textAlign:"center",color:"rgba(255,255,255,.2)",padding:40}}>
            <div style={{fontSize:40,marginBottom:10}}>📷</div><div style={{fontSize:13}}>아직 사진이 없어요</div>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {filtered.map(p=>{
              const r=REGIONS.find(x=>x.id===p.regionId);
              return (
                <div key={p.id} style={{borderRadius:16,overflow:"hidden",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)"}}>
                  <div style={{height:130,backgroundImage:`url(${p.url})`,backgroundSize:"cover",backgroundPosition:"center",backgroundColor:"rgba(255,255,255,.05)",position:"relative"}}>
                    <button onClick={()=>deletePhoto(p.id)} style={{position:"absolute",top:6,right:6,background:"rgba(0,0,0,.55)",border:"none",cursor:"pointer",fontSize:11,color:"white",borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                    <div style={{position:"absolute",bottom:6,left:6,background:"rgba(0,0,0,.55)",borderRadius:8,padding:"2px 7px",fontSize:10,color:"white"}}>{r?.emoji}{r?.name}</div>
                  </div>
                  <div style={{padding:"8px 10px"}}>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.25)",marginBottom:2}}>{p.date}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,.65)"}}>{p.memo}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowAdd(false)}>
          <div style={{background:"#1c0c14",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:420,maxHeight:"85vh",overflowY:"auto",paddingBottom:100}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}><div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,.2)"}}/></div>
            <div style={{padding:"0 24px 24px"}}>
              <div style={{fontWeight:800,fontSize:16,color:"#FFB6C1",marginBottom:18,textAlign:"center"}}>📸 사진 추가</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>지역</div>
              <select value={form.regionId} onChange={e=>setForm(f=>({...f,regionId:e.target.value}))} style={{marginBottom:12}}>{REGIONS.map(r=><option key={r.id} value={r.id}>{r.emoji} {r.name}</option>)}</select>
              <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>사진 URL</div>
              <input placeholder="https://이미지주소.jpg" value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} style={{marginBottom:12}}/>
              {form.url&&<div style={{marginBottom:12,borderRadius:12,overflow:"hidden",height:120,backgroundImage:`url(${form.url})`,backgroundSize:"cover",backgroundPosition:"center",background:"rgba(255,255,255,.05)"}}/>}
              <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>날짜</div>
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{marginBottom:12}}/>
              <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>메모</div>
              <input placeholder="이날의 추억 ✨" value={form.memo} onChange={e=>setForm(f=>({...f,memo:e.target.value}))} style={{marginBottom:20}}/>
              <button onClick={handleAdd} disabled={saving} style={{width:"100%",padding:14,background:saving?"rgba(255,143,171,.4)":"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:15,cursor:saving?"not-allowed":"pointer"}}>{saving?"저장 중...":"추가하기 📸"}</button>
              <button onClick={()=>setShowAdd(false)} style={{width:"100%",padding:12,marginTop:10,background:"none",border:"none",color:"rgba(255,255,255,.35)",fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:"pointer"}}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══ DATE SPOT ══ */
function DateSpotTab(){
  const REGION_LIST=["서울","부산","대구","인천","광주","대전","울산","경기","강원","충북","충남","전북","전남","경북","경남","제주"];
  const TYPE_LIST=["전체","공방/체험","카페/디저트","야외/자연","맛집","문화/전시","드라이브","액티비티"];
  const ICONS={"공방/체험":"🎨","카페/디저트":"☕","야외/자연":"🌿","맛집":"🍽️","문화/전시":"🖼️","드라이브":"🚗","액티비티":"⚡","기타":"💕"};
  const [region,setRegion]=useState("서울");
  const [type,setType]=useState("전체");
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);

  const fetchRecommend=async()=>{
    setLoading(true);setResult(null);
    try{
      const prompt=`커플 데이트 장소 추천. 지역: ${region}, 카테고리: ${type}.\n순수 JSON만 답해줘:\n{"places":[{"name":"장소명","category":"카테고리(공방/체험,카페/디저트,야외/자연,맛집,문화/전시,드라이브,액티비티,기타 중)","description":"2-3줄 설명","tip":"데이트 팁","price":"가격대"}]}\n5개 추천, 실제 유명한 장소로.`;
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:prompt}]})});
      const d=await res.json();
      const text=d.content?.filter(c=>c.type==="text").map(c=>c.text).join("")||"";
      setResult(JSON.parse(text.replace(/```json|```/g,"").trim()));
    }catch{setResult({error:true});}
    setLoading(false);
  };

  return (
    <div className="si">
      <div className="card">
        <div style={{fontWeight:800,fontSize:15,color:"#FFB6C1",marginBottom:4}}>💝 데이트 코스 추천</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginBottom:14}}>AI가 실시간으로 데이트 장소를 추천해드려요</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>📍 지역</div>
        <select value={region} onChange={e=>setRegion(e.target.value)} style={{marginBottom:14}}>{REGION_LIST.map(r=><option key={r} value={r}>{r}</option>)}</select>
        <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:8}}>🏷️ 카테고리</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:18}}>
          {TYPE_LIST.map(t=>(
            <button key={t} onClick={()=>setType(t)} style={{borderRadius:50,padding:"5px 12px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer",background:type===t?"#FF8FAB":"rgba(255,255,255,.07)",color:type===t?"white":"rgba(255,255,255,.45)"}}>{t}</button>
          ))}
        </div>
        <button onClick={fetchRecommend} disabled={loading} style={{width:"100%",padding:14,background:loading?"rgba(255,143,171,.3)":"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:15,cursor:loading?"not-allowed":"pointer"}}>
          {loading?"🔍 찾는 중...":"💝 데이트 장소 추천받기"}
        </button>
      </div>
      {loading&&<div className="card" style={{textAlign:"center",padding:"28px 20px"}}><div style={{fontSize:32,marginBottom:10,display:"inline-block",animation:"hb 1s infinite"}}>💕</div><div style={{fontSize:14,color:"rgba(255,255,255,.5)"}}>{region} 데이트 명소 찾는 중...</div></div>}
      {result?.error&&<div className="card" style={{textAlign:"center",padding:24}}><div style={{fontSize:28,marginBottom:8}}>😢</div><div style={{fontSize:14,color:"rgba(255,255,255,.5)"}}>다시 시도해주세요!</div></div>}
      {result?.places&&result.places.map((p,i)=>(
        <div key={i} className="card si" style={{padding:"16px 18px"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
            <div style={{width:44,height:44,borderRadius:14,background:"rgba(255,143,171,.15)",border:"1px solid rgba(255,143,171,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{ICONS[p.category]||"💕"}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:800,color:"#FFB6C1",marginBottom:4}}>{p.name}</div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontSize:11,background:"rgba(255,143,171,.15)",border:"1px solid rgba(255,143,171,.2)",borderRadius:50,padding:"2px 9px",color:"#FF8FAB"}}>{p.category}</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>💰 {p.price}</span>
              </div>
            </div>
          </div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.65)",lineHeight:1.7,marginBottom:10}}>{p.description}</div>
          <div style={{background:"rgba(255,183,77,.08)",border:"1px solid rgba(255,183,77,.18)",borderRadius:12,padding:"10px 14px",display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{fontSize:16,flexShrink:0}}>💡</span>
            <span style={{fontSize:12,color:"rgba(255,220,120,.9)",lineHeight:1.6}}>{p.tip}</span>
          </div>
        </div>
      ))}
      {result?.places&&<div style={{textAlign:"center",padding:"4px 0 20px",fontSize:11,color:"rgba(255,255,255,.2)"}}>AI 추천 장소 · 방문 전 영업시간 확인 필수 📍</div>}
    </div>
  );
}

/* ══ SETTING ══ */
function SettingTab({settings,updateSettings,resetAll,showToast}){
  const [myName,setMyName]=useState(settings?.myName||"");
  const [partnerName,setPartnerName]=useState(settings?.partnerName||"");
  const [startDate,setStartDate]=useState(settings?.startDate||"");
  const [saving,setSaving]=useState(false);

  const handleSave=async()=>{
    setSaving(true);
    await updateSettings({myName,partnerName,startDate});
    setSaving(false);
  };

  return (
    <div className="si">
      <div className="card">
        <div style={{fontWeight:800,fontSize:15,color:"#FFB6C1",marginBottom:4}}>⚙️ 설정</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginBottom:16}}>두 사람 모두 자유롭게 변경할 수 있어요</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>첫 번째 이름 🐣</div>
        <input value={myName} onChange={e=>setMyName(e.target.value)} style={{marginBottom:12}}/>
        <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>두 번째 이름 🐥</div>
        <input value={partnerName} onChange={e=>setPartnerName(e.target.value)} style={{marginBottom:12}}/>
        <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>처음 만난 날 💝</div>
        <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={{marginBottom:20}}/>
        <button onClick={handleSave} disabled={saving} style={{width:"100%",padding:14,background:saving?"rgba(255,143,171,.4)":"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:15,cursor:saving?"not-allowed":"pointer",marginBottom:12}}>
          {saving?"저장 중...":"저장하기 💾"}
        </button>
      </div>
      <div className="card">
        <div style={{fontWeight:800,fontSize:14,color:"#FFB6C1",marginBottom:10}}>🔗 커플 코드</div>
        <div style={{background:"rgba(255,143,171,.07)",border:"1px solid rgba(255,143,171,.18)",borderRadius:14,padding:16,textAlign:"center"}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:6}}>상대방에게 이 코드를 공유하세요</div>
          <div style={{fontSize:30,fontWeight:800,color:"#FF8FAB",letterSpacing:6}}>{settings?.coupleCode}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.2)",marginTop:8}}>코드로 입장하면 모든 데이터가 공유돼요 🔥</div>
        </div>
      </div>
      <div className="card">
        <div style={{fontWeight:800,fontSize:14,color:"rgba(255,100,100,.65)",marginBottom:10}}>⚠️ 위험 구역</div>
        <button onClick={resetAll} style={{width:"100%",padding:12,background:"rgba(255,100,100,.08)",color:"rgba(255,120,120,.65)",border:"1px solid rgba(255,100,100,.18)",borderRadius:50,fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:"pointer"}}>
          데이터 초기화 (처음 화면으로)
        </button>
      </div>
    </div>
  );
}
