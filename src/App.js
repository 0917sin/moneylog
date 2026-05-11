// ✅ Our Story — Firebase 연동 완전판
// App.js에 붙여넣기 전에 firebaseConfig 값을 교체해주세요!

import { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc,
  onSnapshot, addDoc, deleteDoc, setDoc, getDoc
} from "firebase/firestore";

/* 🔥 Firebase Config */
const firebaseConfig = {
  apiKey:            "AIzaSyDqbBkmW6X_18LNq8P6xPM2d5gSfAftiqg",
  authDomain:        "moneylog-af38e.firebaseapp.com",
  projectId:         "moneylog-af38e",
  storageBucket:     "moneylog-af38e.firebasestorage.app",
  messagingSenderId: "931609977521",
  appId:             "1:931609977521:web:fff32bee08ba42027c7890",
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
  gyeonggi:[129,122],gangwon:[221,104],seoul:[115,113],incheon:[91,122],
  chungnam:[96,167],chungbuk:[163,163],sejong:[125,176],daejeon:[120,185],
  jeonbuk:[105,213],jeonnam:[86,253],gwangju:[101,240],gyeongbuk:[206,176],
  daegu:[197,204],gyeongnam:[192,240],ulsan:[235,222],busan:[230,253],jeju:[120,317],
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
        <div style={{background:"rgba(100,149,237,.04)",borderRadius:16,padding:"6px 2px",border:"1px solid rgba(255,182,193,.08)",position:"relative"}}>
          <img src="data:image/png;base64,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" style={{width:"100%",height:"auto",display:"block",opacity:0.85,borderRadius:14}} alt="남한 지도"/>
          <svg viewBox="0 0 380 340" style={{width:"100%",height:"auto",display:"block",position:"absolute",top:0,left:0}}>
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
