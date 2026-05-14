// ✅ Our Story — 커플 방 공유 + 미니게임 + 코인 시스템
import { useState, useEffect, useCallback, useRef } from "react";
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
const app     = initializeApp(firebaseConfig);
const db      = getFirestore(app);

/* ── 상수 ── */
const CATEGORIES = [
  {id:"food",label:"🍜 식비",color:"#FFB3BA"},{id:"cafe",label:"☕ 카페",color:"#FFDFBA"},
  {id:"transport",label:"🚌 교통",color:"#FFFFBA"},{id:"shopping",label:"🛍️ 쇼핑",color:"#BAFFC9"},
  {id:"date",label:"💕 데이트",color:"#BAE1FF"},{id:"health",label:"💊 건강/병원",color:"#FFD6FF"},
  {id:"beauty",label:"💄 뷰티",color:"#FFC8DD"},{id:"hobby",label:"🎮 취미",color:"#BDE0FE"},
  {id:"travel",label:"✈️ 여행",color:"#A2D2FF"},{id:"living",label:"🏠 생활/마트",color:"#CDB4DB"},
  {id:"education",label:"📚 교육",color:"#B5EAD7"},{id:"subscribe",label:"📱 구독",color:"#FFDDD2"},
  {id:"event",label:"🎊 경조사",color:"#FDFFB6"},{id:"gift",label:"🎁 선물",color:"#FFCFD2"},
  {id:"etc",label:"🎀 기타",color:"#E8BAFF"},
];
const INCOME_CATS = [
  {id:"salary",label:"💰 월급",color:"#B5EAD7"},{id:"allowance",label:"🎁 용돈",color:"#FFC8DD"},
  {id:"extra",label:"💵 부수입",color:"#BDE0FE"},{id:"etc_in",label:"🌸 기타",color:"#FFFFBA"},
];
const PAY_METHODS = [
  {id:"credit",label:"💳 신용카드"},{id:"debit",label:"🏧 체크카드"},{id:"cash",label:"💵 현금"},
];
const USERS = [
  {id:"me",label:"우링 🐣",color:"#FF8FAB"},{id:"partner",label:"혁이 🐥",color:"#FFB347"},
];
const ALL_MONTHS=["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const ANNIVERSARIES=[
  {days:100,label:"100일"},{days:200,label:"200일"},{days:365,label:"1주년"},
  {days:500,label:"500일"},{days:730,label:"2주년"},{days:1000,label:"1000일"},
  {days:1095,label:"3주년"},{days:1460,label:"4주년"},{days:1825,label:"5주년"},
];

/* 지도 */
const KOREA_PATHS = {
  gyeonggi:`M 58.7,79.0 L 78.3,71.9 L 107.7,68.8 L 146.8,66.7 L 176.2,61.6 L 205.5,66.7 L 230.0,71.9 L 244.7,87.3 L 249.6,107.8 L 244.7,128.3 L 225.1,150.9 L 205.5,164.2 L 186.0,174.5 L 166.4,177.6 L 146.8,174.5 L 127.2,169.4 L 107.7,161.2 L 88.1,150.9 L 68.5,133.5 L 53.8,112.9 L 56.8,95.5 L 58.7,79.0 Z`,
  gangwon:`M 217.3,5.1 L 244.7,5.1 L 283.8,10.3 L 313.2,20.5 L 342.6,35.9 L 371.9,56.5 L 391.5,82.1 L 396.4,107.8 L 386.6,138.6 L 362.1,159.1 L 332.8,169.4 L 303.4,174.5 L 274.0,169.4 L 244.7,159.1 L 225.1,150.9 L 244.7,128.3 L 249.6,107.8 L 244.7,87.3 L 230.0,71.9 L 217.3,66.7 L 217.3,5.1 Z`,
  seoul:`M 130.2,97.5 L 137.0,96.5 L 146.8,96.5 L 156.6,97.5 L 164.4,99.6 L 166.4,105.7 L 164.4,112.9 L 156.6,120.1 L 146.8,125.2 L 137.0,125.2 L 130.2,122.2 L 127.2,115.0 L 127.2,105.7 L 130.2,97.5 Z`,
  incheon:`M 68.5,89.3 L 88.1,85.2 L 107.7,87.3 L 122.3,89.3 L 130.2,92.4 L 130.2,99.6 L 127.2,105.7 L 127.2,115.0 L 125.3,122.2 L 112.6,128.3 L 97.9,130.4 L 83.2,128.3 L 68.5,118.1 L 58.7,107.8 L 63.6,97.5 L 68.5,89.3 Z`,
  chungnam:`M 68.5,133.5 L 88.1,150.9 L 107.7,161.2 L 127.2,169.4 L 146.8,174.5 L 156.6,184.8 L 151.7,200.2 L 141.9,215.6 L 127.2,231.0 L 112.6,246.4 L 97.9,256.6 L 73.4,261.8 L 48.9,253.6 L 39.1,236.1 L 29.4,220.7 L 31.3,205.3 L 39.1,189.9 L 48.9,177.6 L 63.6,159.1 L 68.5,133.5 Z`,
  sejong:`M 156.6,200.2 L 166.4,198.1 L 176.2,200.2 L 181.1,210.4 L 176.2,220.7 L 166.4,223.8 L 156.6,220.7 L 151.7,210.4 L 156.6,200.2 Z`,
  daejeon:`M 171.3,215.6 L 186.0,213.5 L 195.7,217.6 L 197.7,227.9 L 190.9,238.2 L 178.1,243.3 L 168.3,241.2 L 164.4,231.0 L 166.4,220.7 L 171.3,215.6 Z`,
  chungbuk:`M 146.8,174.5 L 166.4,177.6 L 186.0,174.5 L 205.5,164.2 L 225.1,150.9 L 244.7,159.1 L 274.0,169.4 L 303.4,174.5 L 308.3,189.9 L 298.5,215.6 L 283.8,236.1 L 264.3,253.6 L 244.7,263.8 L 225.1,266.9 L 205.5,261.8 L 186.0,251.5 L 176.2,239.2 L 166.4,223.8 L 176.2,220.7 L 181.1,210.4 L 176.2,200.2 L 166.4,198.1 L 156.6,200.2 L 151.7,210.4 L 156.6,220.7 L 151.7,233.0 L 141.9,215.6 L 151.7,200.2 L 156.6,184.8 L 146.8,174.5 Z`,
  jeonbuk:`M 48.9,253.6 L 73.4,261.8 L 97.9,256.6 L 112.6,246.4 L 127.2,231.0 L 141.9,215.6 L 151.7,233.0 L 156.6,251.5 L 176.2,261.8 L 195.7,263.8 L 215.3,266.9 L 225.1,266.9 L 244.7,263.8 L 230.0,282.3 L 215.3,300.8 L 200.6,315.2 L 181.1,323.4 L 161.5,325.4 L 141.9,318.2 L 122.3,311.0 L 102.8,304.9 L 78.3,297.7 L 58.7,287.4 L 44.0,272.0 L 39.1,256.6 L 48.9,253.6 Z`,
  jeonnam:`M 58.7,287.4 L 78.3,297.7 L 102.8,304.9 L 122.3,311.0 L 141.9,318.2 L 161.5,325.4 L 181.1,323.4 L 200.6,315.2 L 215.3,300.8 L 230.0,282.3 L 244.7,263.8 L 254.5,277.2 L 249.6,297.7 L 234.9,318.2 L 220.2,338.8 L 205.5,359.3 L 190.9,379.8 L 166.4,400.4 L 146.8,420.9 L 122.3,436.3 L 97.9,446.5 L 73.4,441.4 L 53.8,426.0 L 39.1,405.5 L 29.4,385.0 L 34.3,364.4 L 44.0,343.9 L 53.8,318.2 L 58.7,287.4 Z`,
  gwangju:`M 119.4,345.9 L 129.2,343.9 L 141.9,345.9 L 148.8,354.2 L 146.8,366.5 L 137.0,374.7 L 125.3,374.7 L 117.4,366.5 L 115.5,356.2 L 119.4,345.9 Z`,
  gyeongbuk:`M 225.1,150.9 L 244.7,159.1 L 274.0,169.4 L 303.4,174.5 L 332.8,169.4 L 362.1,159.1 L 386.6,138.6 L 396.4,107.8 L 391.5,82.1 L 371.9,56.5 L 342.6,35.9 L 313.2,20.5 L 283.8,10.3 L 244.7,5.1 L 217.3,5.1 L 217.3,66.7 L 230.0,71.9 L 244.7,87.3 L 249.6,107.8 L 244.7,128.3 L 225.1,150.9 Z`,
  daegu:`M 278.9,263.8 L 298.5,261.8 L 313.2,266.9 L 318.1,280.2 L 315.1,292.6 L 303.4,300.8 L 288.7,302.8 L 276.0,297.7 L 269.1,284.4 L 272.1,272.0 L 278.9,263.8 Z`,
  gyeongnam:`M 200.6,315.2 L 215.3,300.8 L 230.0,282.3 L 254.5,277.2 L 264.3,282.3 L 283.8,284.4 L 303.4,300.8 L 315.1,292.6 L 318.1,280.2 L 313.2,266.9 L 332.8,261.8 L 352.3,272.0 L 371.9,287.4 L 381.7,313.1 L 376.8,335.7 L 362.1,356.2 L 347.4,369.6 L 327.9,385.0 L 308.3,395.2 L 283.8,403.4 L 259.4,405.5 L 234.9,400.4 L 210.4,390.1 L 190.9,379.8 L 181.1,356.2 L 181.1,333.6 L 190.9,318.2 L 200.6,315.2 Z`,
  ulsan:`M 352.3,272.0 L 371.9,287.4 L 381.7,313.1 L 386.6,333.6 L 381.7,354.2 L 367.0,369.6 L 347.4,369.6 L 332.8,261.8 L 352.3,272.0 Z`,
  busan:`M 327.9,335.7 L 347.4,335.7 L 367.0,343.9 L 381.7,356.2 L 386.6,374.7 L 379.7,387.0 L 362.1,395.2 L 342.6,395.2 L 323.0,387.0 L 313.2,372.6 L 315.1,356.2 L 327.9,335.7 Z`,
  jeju:`M 63.6,520.5 L 88.1,513.3 L 112.6,510.2 L 141.9,513.3 L 166.4,523.5 L 181.1,536.9 L 176.2,554.3 L 156.6,564.6 L 132.1,569.7 L 102.8,569.7 L 73.4,561.5 L 56.8,547.2 L 53.8,530.7 L 63.6,520.5 Z`,
};
const LABEL_POS={
  gyeonggi:[146.9,120.0],gangwon:[308.0,100.0],seoul:[147.0,113.0],incheon:[96.0,111.0],
  chungnam:[87.0,200.0],sejong:[163.0,213.0],daejeon:[180.0,230.0],chungbuk:[220.0,218.0],
  jeonbuk:[136.0,284.0],jeonnam:[128.0,358.0],gwangju:[131.0,362.0],gyeongbuk:[306.0,108.0],
  daegu:[293.0,285.0],gyeongnam:[276.0,338.0],ulsan:[368.0,320.0],busan:[348.0,370.0],jeju:[119.0,540.0],
};
const REGIONS=[
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

const fmt=(n)=>Number(n).toLocaleString("ko-KR");

/* ════ STORAGE KEY for room ════ */
const ROOM_KEY = "ourstory_room";

// 모바일 브라우저에서 localStorage가 가끔 날아갈 수 있어서 쿠키도 같이 저장
const saveRoom = (code) => {
  try { localStorage.setItem(ROOM_KEY, code); } catch(e) {}
  try {
    // 쿠키도 백업으로 저장 (1년 유효)
    document.cookie = `${ROOM_KEY}=${code}; path=/; max-age=31536000; SameSite=Lax`;
  } catch(e) {}
};
const loadRoom = () => {
  try {
    const ls = localStorage.getItem(ROOM_KEY);
    if (ls) return ls;
  } catch(e) {}
  try {
    const match = document.cookie.match(new RegExp(`${ROOM_KEY}=([^;]+)`));
    if (match) {
      // 쿠키에서 복구되면 localStorage에도 다시 저장
      try { localStorage.setItem(ROOM_KEY, match[1]); } catch(e) {}
      return match[1];
    }
  } catch(e) {}
  return "";
};
const clearRoom = () => {
  try { localStorage.removeItem(ROOM_KEY); } catch(e) {}
  try { document.cookie = `${ROOM_KEY}=; path=/; max-age=0`; } catch(e) {}
};

/* ════════════════════ APP ════════════════════ */
export default function App() {
  const [roomCode, setRoomCode]   = useState(()=>loadRoom());
  const [connected, setConnected] = useState(false);
  const [settings, setSettings]   = useState(null);
  const [records, setRecords]     = useState([]);
  const [budgets, setBudgets]     = useState({me:300000,partner:300000});
  const [visits, setVisits]       = useState({});
  const [photos, setPhotos]       = useState([]);
  const [coins, setCoins]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("home");
  const [toast, setToast]         = useState("");
  const today = new Date();
  const [selYear,setSelYear]   = useState(today.getFullYear());
  const [selMonth,setSelMonth] = useState(today.getMonth()+1);

  const [letters, setLetters]     = useState([]);
  const [newLetter, setNewLetter] = useState(null); // 새로 받은 편지 팝업용

  const showToast=useCallback((msg)=>{setToast(msg);setTimeout(()=>setToast(""),2400);},[]);

  /* 🔥 방 코드 있으면 구독 시작 */
  useEffect(()=>{
    if(!roomCode){ setLoading(false); return; }
    saveRoom(roomCode);

    const u1 = onSnapshot(doc(db,"rooms",roomCode,"settings","main"), snap=>{
      if(snap.exists()){ setSettings(snap.data()); setConnected(true); }
      else { setConnected(false); }
      setLoading(false);
    });
    const u2 = onSnapshot(collection(db,"rooms",roomCode,"records"), snap=>{
      setRecords(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    const u3 = onSnapshot(doc(db,"rooms",roomCode,"settings","budgets"), snap=>{
      if(snap.exists()) setBudgets(snap.data());
    });
    const u4 = onSnapshot(doc(db,"rooms",roomCode,"settings","visits"), snap=>{
      if(snap.exists()) setVisits(snap.data());
    });
    const u5 = onSnapshot(collection(db,"rooms",roomCode,"photos"), snap=>{
      setPhotos(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    const u6 = onSnapshot(doc(db,"rooms",roomCode,"settings","coins"), snap=>{
      if(snap.exists()) setCoins(snap.data().amount||0);
    });
    // 편지 구독
    const u7 = onSnapshot(collection(db,"rooms",roomCode,"letters"), snap=>{
      const ls=snap.docs.map(d=>({id:d.id,...d.data()}));
      setLetters(ls);
      // 새 편지 팝업
      snap.docChanges().forEach(change=>{
        if(change.type==="added"){
          const letter=change.doc.data();
          if(!letter.read&&Date.now()-letter.createdAt<10000){
            setNewLetter({id:change.doc.id,...letter});
          }
        }
      });
    });
    return ()=>{ u1();u2();u3();u4();u5();u6();u7(); };
  },[roomCode]);

  /* 🔥 방 만들기 */
  const createRoom = async(myName,partnerName,startDate)=>{
    const code = Math.random().toString(36).substring(2,8).toUpperCase();
    await setDoc(doc(db,"rooms",code,"settings","main"),{myName,partnerName,startDate,coupleCode:code,createdAt:Date.now()});
    await setDoc(doc(db,"rooms",code,"settings","coins"),{amount:0});
    setRoomCode(code);
    saveRoom(code);
  };

  /* 🔥 방 입장 (코드로) */
  const joinRoom = async(code)=>{
    try {
      const snap = await getDoc(doc(db,"rooms",code,"settings","main"));
      if(snap.exists()){
        // 입장 성공: state 업데이트 + 저장 + 즉시 연결 표시
        saveRoom(code);
        setRoomCode(code);
        setSettings(snap.data());
        setConnected(true);
        setLoading(false);
        showToast("입장했어요 💕 같은 데이터가 공유돼요!");
        return true;
      }
      return false;
    } catch(err) {
      console.error('joinRoom error:',err);
      showToast("연결에 실패했어요. 인터넷을 확인해주세요 📡");
      return false;
    }
  };

  /* 🔥 편지 전송 */
  const sendLetter=async(content,effect)=>{
    try{
      await addDoc(collection(db,"rooms",roomCode,"letters"),{
        content,effect,from:settings?.myName||"나",
        createdAt:Date.now(),read:false
      });
      showToast("💌 편지를 보냈어요!");
      return true;
    }catch{showToast("전송 실패 😢");return false;}
  };
  const markLetterRead=async(id)=>{
    try{ await setDoc(doc(db,"rooms",roomCode,"letters",id),{read:true},{merge:true}); }catch{}
  };

  /* 🔥 초기화 */
  const resetAll = async()=>{
    if(!window.confirm("정말 초기화할까요?")) return;
    clearRoom();
    setRoomCode(""); setConnected(false); setSettings(null);
    setRecords([]); setBudgets({me:300000,partner:300000}); setVisits({}); setPhotos([]); setCoins(0);
    showToast("초기화됐어요 🔄");
  };

  /* 🔥 가계부 */
  const addRecord=async(form)=>{
    const amt=Number(form.amount);
    if(!amt||isNaN(amt)){showToast("금액을 입력해주세요 💸");return false;}
    if(!form.memo.trim()){showToast("메모를 입력해주세요 📝");return false;}
    try{
      await addDoc(collection(db,"rooms",roomCode,"records"),{...form,amount:amt,createdAt:Date.now()});
      showToast(form.type==="income"?"수입 추가됐어요 💰":"지출 추가됐어요 🎉");
      return true;
    }catch{showToast("저장 실패 😢");return false;}
  };
  const deleteRecord=async(id)=>{
    try{await deleteDoc(doc(db,"rooms",roomCode,"records",id));showToast("삭제됐어요 🗑️");}
    catch{showToast("삭제 실패 😢");}
  };

  /* 🔥 예산 */
  const saveBudgets=async(b)=>{
    try{await setDoc(doc(db,"rooms",roomCode,"settings","budgets"),b);showToast("예산 저장됐어요 🎯");}
    catch{showToast("저장 실패 😢");}
  };

  /* 🔥 방문 */
  const saveVisits=async(v)=>{
    try{await setDoc(doc(db,"rooms",roomCode,"settings","visits"),v);}
    catch{showToast("저장 실패 😢");}
  };

  /* 🔥 사진 — Cloudinary 업로드 */
  const addPhoto=async(file,regionId,memo,date)=>{
    if(!file){showToast("사진을 선택해주세요!");return false;}
    try{
      const formData=new FormData();
      formData.append("file",file);
      formData.append("upload_preset","zmbg7eid");
      formData.append("cloud_name","dtunnkqeb");
      const res=await fetch("https://api.cloudinary.com/v1_1/dtunnkqeb/image/upload",{
        method:"POST",
        body:formData,
      });
      const data=await res.json();
      if(!data.secure_url) throw new Error("업로드 실패");
      await addDoc(collection(db,"rooms",roomCode,"photos"),{
        url:data.secure_url,regionId,memo,date,createdAt:Date.now()
      });
      showToast("사진 추가됐어요 📸");return true;
    }catch(e){showToast("사진 업로드 실패 😢 "+e.message);return false;}
  };
  const deletePhoto=async(id)=>{
    try{await deleteDoc(doc(db,"rooms",roomCode,"photos",id));showToast("삭제됐어요 🗑️");}
    catch{showToast("삭제 실패 😢");}
  };

  /* 🔥 설정 업데이트 */
  const updateSettings=async(patch)=>{
    try{await setDoc(doc(db,"rooms",roomCode,"settings","main"),{...settings,...patch});showToast("저장됐어요 💾");}
    catch{showToast("저장 실패 😢");}
  };

  /* 🔥 코인 */
  const addCoins=async(amount)=>{
    try{
      await setDoc(doc(db,"rooms",roomCode,"settings","coins"),{amount:coins+amount});
      showToast(`+${amount} 코인 획득! 🪙`);
    }catch{}
  };
  const spendCoins=async(amount)=>{
    if(coins<amount){showToast("코인이 부족해요 🪙");return false;}
    try{
      await setDoc(doc(db,"rooms",roomCode,"settings","coins"),{amount:coins-amount});
      return true;
    }catch{return false;}
  };

  // 날짜 계산
  const startD=settings?.startDate?new Date(settings.startDate):null;
  if(startD)startD.setHours(0,0,0,0);
  const dDay=startD?Math.floor((today-startD)/86400000)+1:0;
  const nextAnniv=startD?ANNIVERSARIES.find(a=>a.days>=dDay):null;
  const daysToNext=nextAnniv&&startD?nextAnniv.days-dDay:0;

  const monthKey=`${selYear}-${String(selMonth).padStart(2,"0")}`;
  const monthRecs=records.filter(r=>r.date?.startsWith(monthKey));
  const monthExp=monthRecs.filter(r=>r.type==="expense");
  const monthInc=monthRecs.filter(r=>r.type==="income");
  const meTotal=monthExp.filter(r=>r.user==="me").reduce((s,r)=>s+r.amount,0);
  const parTotal=monthExp.filter(r=>r.user==="partner").reduce((s,r)=>s+r.amount,0);
  const grandTotal=meTotal+parTotal;
  const mePct=grandTotal>0?(meTotal/grandTotal)*100:50;
  const totalInc=monthInc.reduce((s,r)=>s+r.amount,0);
  const visitedCount=Object.keys(visits).length;
  const photoCount={};
  photos.forEach(p=>{photoCount[p.regionId]=(photoCount[p.regionId]||0)+1;});
  const isCurrentMonth=selYear===today.getFullYear()&&selMonth===today.getMonth()+1;
  const prevMonth=()=>{if(selMonth===1){setSelYear(y=>y-1);setSelMonth(12);}else setSelMonth(m=>m-1);};
  const nextMonth=()=>{if(isCurrentMonth)return;if(selMonth===12){setSelYear(y=>y+1);setSelMonth(1);}else setSelMonth(m=>m+1);};

  const THEME_COLORS={pink:"#120810",purple:"#0d0820",blue:"#081220",green:"#081410",gold:"#141008"};
  const currentTheme=settings?.theme||"pink";
  const bgColor=THEME_COLORS[currentTheme]||"#120810";

  if(loading) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#120810",gap:16}}>
      <div style={{fontSize:40,animation:"hb 1.2s infinite"}}>💕</div>
      <div style={{fontFamily:"sans-serif",color:"#FF8FAB",fontWeight:700}}>불러오는 중...</div>
      <style>{`@keyframes hb{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}`}</style>
    </div>
  );

  if(!connected) return <SetupScreen createRoom={createRoom} joinRoom={joinRoom} showToast={showToast} toast={toast}/>;

  const shared={settings,updateSettings,resetAll,showToast,coins,addCoins,spendCoins,
    records,addRecord,deleteRecord,budgets,saveBudgets,visits,saveVisits,
    photos,addPhoto,deletePhoto,photoCount,visitedCount,
    dDay,nextAnniv,daysToNext,startD,
    monthKey,monthExp,monthInc,meTotal,parTotal,grandTotal,mePct,totalInc,
    selYear,selMonth,prevMonth,nextMonth,isCurrentMonth,roomCode,
    letters,sendLetter,markLetterRead};

  const TABS=[
    {id:"home",icon:"🏠",label:"홈"},{id:"budget",icon:"💰",label:"가계부"},
    {id:"map",icon:"🗺️",label:"지도"},{id:"album",icon:"📸",label:"앨범"},
    {id:"datespot",icon:"💝",label:"데이트"},{id:"game",icon:"🎮",label:"게임"},
    {id:"couple",icon:"🏡",label:"꾸미기"},{id:"setting",icon:"⚙️",label:"설정"},
  ];

  return (
    <div style={{fontFamily:"'Nanum Gothic',sans-serif",background:bgColor,minHeight:"100vh",maxWidth:420,margin:"0 auto",position:"relative",paddingBottom:110,color:"white",transition:"background .5s"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&family=Playfair+Display:wght@700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .card{background:rgba(255,255,255,.05);border:1px solid rgba(255,182,193,.12);border-radius:20px;padding:18px;margin:12px 16px}
        .tab-btn{background:none;border:none;cursor:pointer;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 4px}
        input,textarea,select{font-family:inherit;border:1.5px solid rgba(255,182,193,.25);border-radius:12px;padding:10px 14px;outline:none;width:100%;font-size:14px;background:rgba(255,255,255,.06);color:white;transition:border .2s}
        input:focus,textarea:focus,select:focus{border-color:#FF8FAB}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,.25)}
        .toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#FF8FAB;color:white;padding:10px 22px;border-radius:50px;font-weight:700;font-size:14px;z-index:999;white-space:nowrap;animation:sIn .3s ease}
        .heart{display:inline-block;animation:hb 1.4s infinite}
        .si{animation:sIn .3s ease}
        .pill{border-radius:50px;padding:4px 10px;font-size:11px;font-weight:700;border:none;cursor:pointer;white-space:nowrap}
        @keyframes sIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes hb{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
        ::-webkit-scrollbar{width:0}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(1) opacity(.4)}
        select option{background:#1e0d14}
      `}</style>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",top:-80,right:-80,width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,143,171,.12) 0%,transparent 70%)"}}/>
      </div>
      {toast&&<div className="toast">{toast}</div>}

      {/* 💌 편지 팝업 */}
      {newLetter&&(
        <LetterPopup letter={newLetter} onClose={()=>{markLetterRead(newLetter.id);setNewLetter(null);}}/>
      )}

      {/* VIP 배너 */}
      {settings?.vip&&(
        <div style={{position:"relative",zIndex:1,margin:"0 16px 0",background:"linear-gradient(135deg,rgba(255,183,77,.15),rgba(255,143,171,.1))",border:"1px solid rgba(255,183,77,.3)",borderRadius:12,padding:"6px 14px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>💎</span>
          <span style={{fontSize:12,fontWeight:700,color:"#FFB347"}}>VIP 회원 혜택: 게임 보너스 코인 +50% · 코인샵 10% 할인</span>
        </div>
      )}

      {/* 헤더 */}
      <div style={{position:"relative",zIndex:1,padding:"16px 20px 8px",textAlign:"center"}}>
        <div style={{fontSize:10,color:"rgba(255,182,193,.5)",marginBottom:2,letterSpacing:3}}>OUR STORY 🔥 실시간 공유</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"#FFB6C1"}}>
          {settings?.myName} <span className="heart">💕</span> {settings?.partnerName}
        </div>
        {startD&&<div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:1}}>D+<span style={{color:"#FF8FAB",fontWeight:800}}>{fmt(dDay)}</span>일째 · 🪙 {fmt(coins)}</div>}
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
        {tab==="game"     && <GameTab     coins={shared.coins} addCoins={shared.addCoins} spendCoins={shared.spendCoins} showToast={shared.showToast} settings={shared.settings} updateSettings={shared.updateSettings} roomCode={shared.roomCode} sendLetter={shared.sendLetter}/>}
        {tab==="couple"   && <CoupleRoomTab coins={shared.coins} spendCoins={shared.spendCoins} showToast={shared.showToast} settings={shared.settings} updateSettings={shared.updateSettings}/>}
        {tab==="setting"  && <SettingTab  {...shared}/>}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:420,background:"rgba(18,8,16,.97)",borderTop:"1px solid rgba(255,182,193,.12)",display:"flex",justifyContent:"space-around",padding:"6px 0 14px",zIndex:100}}>
        {TABS.map(t=>(
          <button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)}>
            <span style={{fontSize:16}}>{t.icon}</span>
            <span style={{fontSize:7,fontWeight:700,color:tab===t.id?"#FF8FAB":"rgba(255,255,255,.28)"}}>{t.label}</span>
            {tab===t.id&&<div style={{width:3,height:3,borderRadius:"50%",background:"#FF8FAB"}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══ LETTER POPUP ══ */
function LetterPopup({letter,onClose}){
  const EFFECTS={
    hearts:"💕💕💕",stars:"⭐⭐⭐",flowers:"🌸🌸🌸",sparkles:"✨✨✨",rainbow:"🌈🌈🌈"
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:24,animation:"sIn .3s ease"}}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes sparkle{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.5)}}
        .effect-emoji{animation:sparkle 1s infinite;display:inline-block;font-size:28px;margin:0 4px}
      `}</style>
      <div style={{background:"linear-gradient(135deg,#1c0c14,#0d0820)",borderRadius:24,padding:28,width:"100%",maxWidth:360,textAlign:"center",border:"1px solid rgba(255,182,193,.3)",boxShadow:"0 0 60px rgba(255,143,171,.2)"}}>
        {/* 이펙트 */}
        <div style={{marginBottom:16,animation:"float 2s infinite"}}>
          {(EFFECTS[letter.effect]||"💕💕💕").split("").map((e,i)=>(
            <span key={i} className="effect-emoji" style={{animationDelay:`${i*0.2}s`}}>{e}</span>
          ))}
        </div>

        <div style={{fontSize:13,color:"rgba(255,182,193,.6)",marginBottom:8}}>💌 {letter.from}이(가) 편지를 보냈어요</div>

        {/* 편지 내용 */}
        <div style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,182,193,.2)",borderRadius:16,padding:"20px",marginBottom:20,minHeight:100,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontSize:16,color:"white",lineHeight:1.8,fontWeight:500,wordBreak:"break-all"}}>{letter.content}</div>
        </div>

        <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginBottom:16}}>
          {new Date(letter.createdAt).toLocaleString("ko-KR")}
        </div>

        <button onClick={onClose} style={{width:"100%",padding:14,background:"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:15,cursor:"pointer"}}>
          💕 읽었어요!
        </button>
      </div>
    </div>
  );
}

/* ══ SETUP ══ */
function SetupScreen({createRoom,joinRoom,showToast,toast}){
  const [myName,setMyName]=useState("");
  const [partnerName,setPartnerName]=useState("");
  const [startDate,setStartDate]=useState("");
  const [inputCode,setInputCode]=useState("");
  const [mode,setMode]=useState("");
  const [saving,setSaving]=useState(false);

  const handleCreate=async()=>{
    if(!myName.trim())return showToast("내 이름을 입력해주세요!");
    if(!partnerName.trim())return showToast("상대방 이름을 입력해주세요!");
    if(!startDate)return showToast("처음 만난 날을 입력해주세요!");
    setSaving(true);
    await createRoom(myName,partnerName,startDate);
    setSaving(false);
  };
  const handleJoin=async()=>{
    if(!inputCode.trim())return showToast("커플 코드를 입력해주세요!");
    setSaving(true);
    const ok=await joinRoom(inputCode.toUpperCase());
    if(!ok)showToast("코드가 맞지 않아요 😢 확인해주세요!");
    setSaving(false);
  };

  const INP={fontFamily:"inherit",border:"1.5px solid rgba(255,182,193,.25)",borderRadius:12,padding:"12px 16px",outline:"none",width:"100%",fontSize:15,background:"rgba(255,255,255,.06)",color:"white",marginBottom:12};
  const BTN={border:"none",borderRadius:50,cursor:"pointer",fontFamily:"inherit",fontWeight:800,padding:"15px",fontSize:16,width:"100%"};

  return (
    <div style={{fontFamily:"'Nanum Gothic',sans-serif",background:"#120810",minHeight:"100vh",maxWidth:420,margin:"0 auto",color:"white",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&family=Playfair+Display:wght@700&display=swap');*{box-sizing:border-box;margin:0;padding:0}input::placeholder{color:rgba(255,255,255,.25)}input[type=date]::-webkit-calendar-picker-indicator{filter:invert(1) opacity(.4)}.heart{animation:hb 1.4s infinite;display:inline-block}@keyframes hb{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}`}</style>
      {toast&&<div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:"#FF8FAB",color:"white",padding:"10px 22px",borderRadius:50,fontWeight:700,zIndex:999}}>{toast}</div>}
      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:340}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:52,marginBottom:14}} className="heart">💕</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:30,color:"#FFB6C1",marginBottom:6}}>Our Story</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.35)"}}>우리만의 모든 것을 기록해요</div>
        </div>
        {!mode&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <button onClick={()=>setMode("create")} style={{...BTN,background:"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white"}}>💑 커플 방 만들기</button>
            <button onClick={()=>setMode("join")}   style={{...BTN,background:"rgba(255,255,255,.05)",color:"rgba(255,255,255,.7)",border:"1.5px solid rgba(255,182,193,.25)"}}>🔗 커플 코드로 입장</button>
          </div>
        )}
        {mode==="create"&&<>
          <div style={{fontSize:13,color:"rgba(255,182,193,.6)",marginBottom:16,textAlign:"center"}}>새 커플 방 만들기 💕</div>
          <input style={INP} placeholder="내 이름 (예: 우링)" value={myName} onChange={e=>setMyName(e.target.value)}/>
          <input style={INP} placeholder="상대방 이름 (예: 혁이)" value={partnerName} onChange={e=>setPartnerName(e.target.value)}/>
          <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>처음 만난 날 💝</div>
          <input style={INP} type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}/>
          <button onClick={handleCreate} disabled={saving} style={{...BTN,background:saving?"rgba(255,143,171,.4)":"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white",marginTop:6}}>{saving?"만드는 중...":"방 만들기 🎉"}</button>
          <button onClick={()=>setMode("")} style={{background:"none",border:"none",color:"rgba(255,255,255,.35)",cursor:"pointer",width:"100%",marginTop:12,fontSize:13}}>← 뒤로</button>
        </>}
        {mode==="join"&&<>
          <div style={{fontSize:13,color:"rgba(255,182,193,.6)",marginBottom:8,textAlign:"center"}}>커플 코드로 입장 🔗</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginBottom:16,textAlign:"center",lineHeight:1.6}}>
            방 만든 사람의 코드를 입력하면<br/>모든 데이터가 자동으로 공유돼요 💕
          </div>
          <input style={{...INP,letterSpacing:8,textAlign:"center",fontSize:24,fontWeight:800}} placeholder="AB1C2D" value={inputCode} onChange={e=>setInputCode(e.target.value.toUpperCase())} maxLength={6}/>
          <button onClick={handleJoin} disabled={saving} style={{...BTN,background:saving?"rgba(255,143,171,.4)":"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white",marginTop:4}}>{saving?"확인 중...":"입장하기 💕"}</button>
          <button onClick={()=>setMode("")} style={{background:"none",border:"none",color:"rgba(255,255,255,.35)",cursor:"pointer",width:"100%",marginTop:12,fontSize:13}}>← 뒤로</button>
        </>}
      </div>
    </div>
  );
}

/* ══ HOME ══ */
function HomeTab({dDay,nextAnniv,daysToNext,startD,visitedCount,grandTotal,totalInc,meTotal,parTotal,monthExp,monthInc,coins}){
  const balance=totalInc-grandTotal;
  return (
    <div className="si">
      <div className="card" style={{background:"linear-gradient(135deg,rgba(255,143,171,.13),rgba(255,179,100,.06))",textAlign:"center",padding:"24px 20px"}}>
        <div style={{fontSize:11,color:"rgba(255,182,193,.5)",letterSpacing:3,marginBottom:6}}>LOVE COUNTER</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:58,color:"#FF8FAB",lineHeight:1,textShadow:"0 0 30px rgba(255,143,171,.35)"}}>D+{fmt(dDay)}</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.35)",margin:"6px 0 14px"}}>{startD&&`${startD.getFullYear()}년 ${startD.getMonth()+1}월 ${startD.getDate()}일부터`}</div>
        {nextAnniv&&(
          <div style={{background:"rgba(255,143,171,.1)",border:"1px solid rgba(255,143,171,.2)",borderRadius:14,padding:"10px 16px"}}>
            <div style={{fontSize:11,color:"rgba(255,182,193,.6)",marginBottom:2}}>다음 기념일</div>
            <div style={{fontSize:16,fontWeight:800,color:"#FFB6C1"}}>{nextAnniv.label} 🎉</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:2}}>D-{daysToNext}일 남았어요</div>
          </div>
        )}
      </div>
      <div className="card">
        <div style={{fontWeight:800,fontSize:14,color:"#FFB6C1",marginBottom:10}}>🪙 커플 코인</div>
        <div style={{textAlign:"center",fontSize:32,fontWeight:800,color:"#FFB347"}}>{fmt(coins)} 코인</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,.3)",textAlign:"center",marginTop:4}}>게임탭에서 코인을 모아보세요!</div>
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
              <div style={{width:30,height:30,borderRadius:"50%",background:passed?"rgba(255,143,171,.2)":"rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{passed?"✅":isCurrent?"⏳":"🔒"}</div>
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
          <button key={t.id} onClick={()=>setSubTab(t.id)} style={{borderRadius:50,padding:"6px 12px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer",background:subTab===t.id?"#FF8FAB":"rgba(255,255,255,.07)",color:subTab===t.id?"white":"rgba(255,255,255,.45)"}}>
            {t.label}
          </button>
        ))}
      </div>
      {subTab==="home" && <BudgetHome {...props}/>}
      {subTab==="add"  && <BudgetAdd  {...props}/>}
      {subTab==="list" && <BudgetList {...props}/>}
      {subTab==="chart"&& <BudgetChart {...props}/>}
    </div>
  );
}

function BudgetHome({meTotal,parTotal,grandTotal,mePct,totalInc,monthExp,monthInc,budgets,saveBudgets}){
  const [editBudget,setEditBudget]=useState(false);
  const [tempMe,setTempMe]=useState(fmt(budgets.me||300000));
  const [tempPa,setTempPa]=useState(fmt(budgets.partner||300000));
  const balance=totalInc-grandTotal;
  const handleInput=(uid,val)=>{const d=val.replace(/[^0-9]/g,""),n=Number(d)||0;if(uid==="me")setTempMe(d?fmt(n):"");else setTempPa(d?fmt(n):"");};
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
                :<><div style={{background:"rgba(255,255,255,.06)",borderRadius:20,height:14,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:over?"linear-gradient(90deg,#FF4D6D,#FF8FA3)":`linear-gradient(90deg,${u.color},${u.color}88)`,borderRadius:20,transition:"width .6s"}}/></div><div style={{fontSize:11,color:over?"#FF4D6D":"rgba(255,255,255,.3)",marginTop:3,textAlign:"right"}}>{over?`🚨 ₩${fmt(spent-budget)} 초과!`:`₩${fmt(budget-spent)} 남음`}</div></>
              }
            </div>
          );
        })}
        {editBudget&&<button onClick={()=>{saveBudgets({me:Number(tempMe.replace(/,/g,""))||0,partner:Number(tempPa.replace(/,/g,""))||0});setEditBudget(false);}} style={{width:"100%",padding:12,background:"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:14,cursor:"pointer"}}>저장 💾</button>}
      </div>
      <div className="card">
        <div style={{fontWeight:800,fontSize:14,color:"#FFB6C1",marginBottom:12}}>🗂️ 카테고리별</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {CATEGORIES.map(cat=>{const total=monthExp.filter(r=>r.category===cat.id).reduce((s,r)=>s+r.amount,0);if(!total)return null;return(<div key={cat.id} style={{background:cat.color+"22",borderRadius:14,padding:"10px 12px",border:`1px solid ${cat.color}44`}}><div style={{fontSize:16}}>{cat.label.split(" ")[0]}</div><div style={{fontSize:10,color:"rgba(255,255,255,.5)",marginTop:1}}>{cat.label.slice(cat.label.indexOf(" ")+1)}</div><div style={{fontSize:13,fontWeight:800,color:"white"}}>₩{fmt(total)}</div></div>);})}
        </div>
      </div>
      <div className="card">
        <div style={{fontWeight:800,fontSize:14,color:"#FFB6C1",marginBottom:10}}>🕐 최근 내역</div>
        {[...monthExp,...monthInc].length===0?<div style={{textAlign:"center",color:"rgba(255,255,255,.2)",padding:16}}>이번 달 내역이 없어요 🥲</div>:[...monthExp,...monthInc].sort((a,b)=>(b.date||"").localeCompare(a.date||"")).slice(0,5).map(r=><RecordRow key={r.id} r={r}/>)}
      </div>
    </div>
  );
}

function BudgetAdd({addRecord}){
  const today=new Date().toISOString().split("T")[0];
  const [form,setForm]=useState({type:"expense",user:"me",category:"food",pay:"credit",amount:"",memo:"",date:today});
  const [displayAmt,setDisplayAmt]=useState("");
  const [saving,setSaving]=useState(false);
  const isExp=form.type==="expense";
  const cats=isExp?CATEGORIES:INCOME_CATS;
  const handleAmt=(e)=>{const d=e.target.value.replace(/[^0-9]/g,"");setDisplayAmt(d?fmt(Number(d)):"");setForm(f=>({...f,amount:d}));};
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
          <button key={t.id} onClick={()=>setForm(f=>({...f,type:t.id,category:t.id==="expense"?"food":"salary"}))} style={{flex:1,padding:"9px",background:form.type===t.id?(t.id==="expense"?"#FF8FAB":"#4CAF82"):"transparent",color:form.type===t.id?"white":"rgba(255,255,255,.4)",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:14,cursor:"pointer"}}>{t.label}</button>
        ))}
      </div>
      <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>누가 {isExp?"썼나요?":"받았나요?"}</div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {USERS.map(u=>(<button key={u.id} onClick={()=>setForm(f=>({...f,user:u.id}))} style={{flex:1,padding:10,background:form.user===u.id?u.color:"rgba(255,255,255,.06)",color:form.user===u.id?"white":"rgba(255,255,255,.5)",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:"pointer"}}>{u.label}</button>))}
      </div>
      <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>카테고리</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
        {cats.map(c=>(<button key={c.id} onClick={()=>setForm(f=>({...f,category:c.id}))} style={{borderRadius:50,padding:"4px 10px",fontSize:11,fontWeight:700,border:`2px solid ${form.category===c.id?c.color:"transparent"}`,cursor:"pointer",background:form.category===c.id?c.color+"33":"rgba(255,255,255,.06)",color:form.category===c.id?"white":"rgba(255,255,255,.45)"}}>{c.label}</button>))}
      </div>
      {isExp&&<>
        <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>결제수단</div>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {PAY_METHODS.map(p=>(<button key={p.id} onClick={()=>setForm(f=>({...f,pay:p.id}))} style={{flex:1,padding:"7px 4px",borderRadius:50,fontSize:11,fontWeight:700,border:"none",cursor:"pointer",background:form.pay===p.id?"#FF8FAB":"rgba(255,255,255,.06)",color:form.pay===p.id?"white":"rgba(255,255,255,.45)"}}>{p.label}</button>))}
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
      <button onClick={handleAdd} disabled={saving} style={{width:"100%",padding:14,background:saving?"rgba(255,143,171,.4)":isExp?"linear-gradient(135deg,#FF8FAB,#FFB3C6)":"linear-gradient(135deg,#4CAF82,#81C784)",color:"white",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:15,cursor:saving?"not-allowed":"pointer"}}>
        {saving?"저장 중...":(isExp?"💸 지출 추가하기":"💰 수입 추가하기")}
      </button>
    </div>
  );
}

function BudgetList({monthExp,monthInc,deleteRecord}){
  const [filterType,setFilterType]=useState("all");
  const [filterUser,setFilterUser]=useState("all");
  const all=[...monthExp,...monthInc].sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const filtered=all.filter(r=>{if(filterType!=="all"&&r.type!==filterType)return false;if(filterUser!=="all"&&r.user!==filterUser)return false;return true;});
  const totalExp=filtered.filter(r=>r.type==="expense").reduce((s,r)=>s+r.amount,0);
  const totalInc=filtered.filter(r=>r.type==="income").reduce((s,r)=>s+r.amount,0);
  return (
    <div>
      <div className="card" style={{paddingBottom:10}}>
        <div style={{display:"flex",gap:5,marginBottom:7,flexWrap:"wrap"}}>
          {[{id:"all",label:"전체"},{id:"expense",label:"💸 지출"},{id:"income",label:"💰 수입"}].map(t=>(<button key={t.id} className="pill" onClick={()=>setFilterType(t.id)} style={{background:filterType===t.id?"#FF8FAB":"rgba(255,255,255,.07)",color:filterType===t.id?"white":"rgba(255,255,255,.45)"}}>{t.label}</button>))}
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {[{id:"all",label:"전체"},...USERS.map(u=>({id:u.id,label:u.label}))].map(u=>(<button key={u.id} className="pill" onClick={()=>setFilterUser(u.id)} style={{background:filterUser===u.id?"#FFB347":"rgba(255,255,255,.07)",color:filterUser===u.id?"white":"rgba(255,255,255,.45)"}}>{u.label}</button>))}
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",padding:"0 20px 4px"}}>
        <span style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>{filtered.length}건</span>
        <div style={{display:"flex",gap:10}}>{totalInc>0&&<span style={{fontWeight:800,color:"#4CAF82",fontSize:12}}>+₩{fmt(totalInc)}</span>}{totalExp>0&&<span style={{fontWeight:800,color:"#FF8FAB",fontSize:12}}>-₩{fmt(totalExp)}</span>}</div>
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
  const trendMonths=[];for(let i=5;i>=0;i--){let y=selYear,m=selMonth-i;while(m<=0){m+=12;y--;}trendMonths.push({label:`${m}월`,key:`${y}-${String(m).padStart(2,"0")}`});}
  const trendData=trendMonths.map(t=>({label:t.label,me:(records||[]).filter(r=>r.date?.startsWith(t.key)&&r.user==="me"&&r.type==="expense").reduce((s,r)=>s+r.amount,0),partner:(records||[]).filter(r=>r.date?.startsWith(t.key)&&r.user==="partner"&&r.type==="expense").reduce((s,r)=>s+r.amount,0)}));
  const maxTrend=Math.max(...trendData.map(d=>d.me+d.partner),1);
  return (
    <div>
      <div className="card">
        <div style={{fontWeight:800,fontSize:14,color:"#FFB6C1",marginBottom:14}}>📂 카테고리별</div>
        {catData.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,.2)",padding:20}}>데이터가 없어요</div>}
        {catData.map(c=>(<div key={c.id} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{fontWeight:700,color:"white"}}>{c.label}</span><span style={{color:"rgba(255,255,255,.5)"}}>₩{fmt(c.total)} · {grandTotal>0?Math.round(c.total/grandTotal*100):0}%</span></div><div style={{background:"rgba(255,255,255,.05)",borderRadius:20,height:20,overflow:"hidden"}}><div style={{width:`${(c.total/maxCat)*100}%`,height:"100%",background:c.color,borderRadius:20}}/></div></div>))}
      </div>
      <div className="card">
        <div style={{fontWeight:800,fontSize:14,color:"#FFB6C1",marginBottom:12}}>📈 6개월 트렌드</div>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-around",height:140,paddingTop:8}}>
          {trendData.map((d,i)=>{const mH=(d.me/maxTrend)*120,pH=(d.partner/maxTrend)*120,isSel=d.label===`${selMonth}월`;return(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flex:1}}><div style={{display:"flex",gap:2,alignItems:"flex-end"}}><div style={{width:11,height:Math.max(mH,2),background:"#FF8FAB",borderRadius:"4px 4px 0 0",opacity:isSel?1:.55}}/><div style={{width:11,height:Math.max(pH,2),background:"#FFB347",borderRadius:"4px 4px 0 0",opacity:isSel?1:.55}}/></div><span style={{fontSize:9,color:isSel?"#FF8FAB":"rgba(255,255,255,.3)",fontWeight:isSel?800:400}}>{d.label}</span></div>);})}
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:14,marginTop:8}}><span style={{fontSize:11,color:"#FF8FAB"}}>■ 우링</span><span style={{fontSize:11,color:"#FFB347"}}>■ 혁이</span></div>
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
  const handleSave=async()=>{setSaving(true);await saveVisits({...visits,[selRegion.id]:{memo,date:visitDate}});setSelRegion(null);setSaving(false);showToast(`${selRegion.name} 방문 기록 완료 📍`);};
  const handleRemove=async(id)=>{const v={...visits};delete v[id];await saveVisits(v);showToast("삭제됐어요 🗑️");};
  return (
    <div className="si">
      <div className="card" style={{padding:"14px 10px"}}>
        <div style={{fontWeight:800,fontSize:15,color:"#FFB6C1",marginBottom:2}}>🗺️ 대한민국 여행지도</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginBottom:10}}>지역을 눌러서 방문 기록을 추가해요</div>
        <div style={{background:"rgba(20,35,70,.3)",borderRadius:16,padding:"6px 4px",border:"1px solid rgba(255,182,193,.1)"}}>
          <svg viewBox="0 0 460 590" style={{width:"100%",height:"auto",display:"block"}}>
            <rect x="0" y="0" width="460" height="590" fill="rgba(20,35,70,.3)" rx="10"/>
            {REGIONS.filter(r=>!SMALL_REGIONS.includes(r.id)).map(r=>{
              const isVisited=!!visits[r.id],cnt=photoCount[r.id]||0,isHover=hoverId===r.id,lp=LABEL_POS[r.id],path=KOREA_PATHS[r.id];
              if(!path)return null;
              return(<g key={r.id} onClick={()=>openRegion(r)} onMouseEnter={()=>setHoverId(r.id)} onMouseLeave={()=>setHoverId(null)} style={{cursor:"pointer"}}>
                <path d={path} fill={isVisited?(isHover?"#e05070":"#FF8FAB"):(isHover?"rgba(255,182,193,.22)":"rgba(255,255,255,.07)")} stroke={isVisited?"rgba(255,230,240,.8)":"rgba(255,182,193,.3)"} strokeWidth={isVisited?1.5:0.8} strokeLinejoin="round" style={{transition:"fill .15s"}}/>
                {lp&&<text x={lp[0]} y={lp[1]} textAnchor="middle" fontSize={10} fill={isVisited?"#fff":"rgba(255,255,255,.6)"} fontWeight={isVisited?"700":"400"} fontFamily="sans-serif" style={{pointerEvents:"none",userSelect:"none"}}>{r.name}</text>}
                {cnt>0&&lp&&<g style={{pointerEvents:"none"}}><circle cx={lp[0]+12} cy={lp[1]-12} r={8} fill="#FFB347" stroke="#120810" strokeWidth="1"/><text x={lp[0]+12} y={lp[1]-12} textAnchor="middle" dominantBaseline="central" fontSize="7" fill="white" fontWeight="800" fontFamily="sans-serif">{cnt}</text></g>}
              </g>);
            })}
            {REGIONS.filter(r=>SMALL_REGIONS.includes(r.id)).map(r=>{
              const isVisited=!!visits[r.id],cnt=photoCount[r.id]||0,isHover=hoverId===r.id,lp=LABEL_POS[r.id],path=KOREA_PATHS[r.id];
              if(!path)return null;
              return(<g key={r.id} onClick={()=>openRegion(r)} onMouseEnter={()=>setHoverId(r.id)} onMouseLeave={()=>setHoverId(null)} style={{cursor:"pointer"}}>
                <path d={path} fill={isVisited?(isHover?"#e05070":"#FF8FAB"):(isHover?"rgba(255,182,193,.3)":"rgba(255,255,255,.13)")} stroke={isVisited?"rgba(255,230,240,.9)":"rgba(255,182,193,.5)"} strokeWidth={isVisited?1.5:1} strokeLinejoin="round" style={{transition:"fill .15s"}}/>
                {lp&&<text x={lp[0]} y={lp[1]} textAnchor="middle" fontSize={7.5} fill={isVisited?"#fff":"rgba(255,255,255,.7)"} fontWeight={isVisited?"700":"400"} fontFamily="sans-serif" style={{pointerEvents:"none",userSelect:"none"}}>{r.name}</text>}
                {cnt>0&&lp&&<g style={{pointerEvents:"none"}}><circle cx={lp[0]+10} cy={lp[1]-10} r={7} fill="#FFB347" stroke="#120810" strokeWidth="1"/><text x={lp[0]+10} y={lp[1]-10} textAnchor="middle" dominantBaseline="central" fontSize="6.5" fill="white" fontWeight="800" fontFamily="sans-serif">{cnt}</text></g>}
              </g>);
            })}
            <circle cx="443" cy="195" r="7" fill="rgba(255,255,255,.07)" stroke="rgba(255,182,193,.3)" strokeWidth="0.8"/>
            <text x="443" y="209" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,.4)" fontFamily="sans-serif">독도</text>
          </svg>
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:10}}>
          <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"rgba(255,255,255,.4)"}}><div style={{width:10,height:10,borderRadius:2,background:"#FF8FAB"}}/>방문완료</div>
          <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"rgba(255,255,255,.4)"}}><div style={{width:10,height:10,borderRadius:2,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,182,193,.3)"}}/>미방문</div>
        </div>
      </div>
      {Object.keys(visits).length>0&&(
        <div className="card">
          <div style={{fontWeight:800,fontSize:15,color:"#FFB6C1",marginBottom:12}}>📍 방문 기록</div>
          {Object.entries(visits).map(([id,v])=>{const r=REGIONS.find(x=>x.id===id),cnt=photoCount[id]||0;return(<div key={id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}><span style={{fontSize:18}}>{r?.emoji}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#FFB6C1"}}>{r?.name}</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{v.date}{v.memo&&` · ${v.memo}`}</div></div>{cnt>0&&<div style={{background:"#FFB347",borderRadius:50,padding:"2px 8px",fontSize:11,fontWeight:800,color:"white"}}>📸 {cnt}</div>}<button onClick={()=>handleRemove(id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,opacity:.35,color:"white"}}>🗑️</button></div>);})}
        </div>
      )}
      {selRegion&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setSelRegion(null)}>
          <div style={{background:"#1c0c14",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:420,maxHeight:"85vh",overflowY:"auto",paddingBottom:100}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}><div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,.2)"}}/></div>
            <div style={{padding:"0 24px 24px"}}>
              <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:36}}>{selRegion.emoji}</div><div style={{fontSize:18,fontWeight:800,color:"#FFB6C1",marginTop:6}}>{selRegion.name}</div>{visits[selRegion.id]&&<div style={{fontSize:11,color:"rgba(255,143,171,.6)",marginTop:3}}>✓ 방문한 지역이에요</div>}</div>
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
function AlbumTab({photos,addPhoto,deletePhoto,photoCount,showToast}){
  const [selRegion,setSelRegion]=useState("all");
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({regionId:"seoul",memo:"",date:new Date().toISOString().split("T")[0]});
  const [file,setFile]=useState(null);
  const [preview,setPreview]=useState(null);
  const [saving,setSaving]=useState(false);

  const handleFile=(e)=>{
    const f=e.target.files[0];
    if(!f)return;
    setFile(f);
    const reader=new FileReader();
    reader.onload=(ev)=>setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };
  const handleAdd=async()=>{
    if(!file){showToast("사진을 선택해주세요!");return;}
    setSaving(true);
    const ok=await addPhoto(file,form.regionId,form.memo,form.date);
    if(ok){setShowAdd(false);setFile(null);setPreview(null);setForm({regionId:"seoul",memo:"",date:new Date().toISOString().split("T")[0]});}
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
          {REGIONS.filter(r=>photoCount[r.id]>0).map(r=>(<button key={r.id} onClick={()=>setSelRegion(r.id)} style={{borderRadius:50,padding:"4px 10px",fontSize:11,fontWeight:700,border:"none",cursor:"pointer",background:selRegion===r.id?"#FF8FAB":"rgba(255,255,255,.07)",color:selRegion===r.id?"white":"rgba(255,255,255,.45)"}}>{r.emoji}{r.name} <span style={{background:selRegion===r.id?"rgba(255,255,255,.3)":"rgba(255,143,171,.4)",borderRadius:50,padding:"0 5px",color:"white",fontWeight:800}}>{photoCount[r.id]}</span></button>))}
        </div>
      </div>
      <div style={{padding:"0 16px 16px"}}>
        {filtered.length===0?(<div style={{textAlign:"center",color:"rgba(255,255,255,.2)",padding:40}}><div style={{fontSize:40,marginBottom:10}}>📷</div><div style={{fontSize:13}}>아직 사진이 없어요</div><div style={{fontSize:11,marginTop:4}}>+ 추가 버튼으로 갤러리에서 바로 올려요!</div></div>):(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {filtered.map(p=>{const r=REGIONS.find(x=>x.id===p.regionId);return(<div key={p.id} style={{borderRadius:16,overflow:"hidden",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)"}}><div style={{height:130,backgroundImage:`url(${p.url})`,backgroundSize:"cover",backgroundPosition:"center",backgroundColor:"rgba(255,255,255,.05)",position:"relative"}}><button onClick={()=>deletePhoto(p.id)} style={{position:"absolute",top:6,right:6,background:"rgba(0,0,0,.55)",border:"none",cursor:"pointer",fontSize:11,color:"white",borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button><div style={{position:"absolute",bottom:6,left:6,background:"rgba(0,0,0,.55)",borderRadius:8,padding:"2px 7px",fontSize:10,color:"white"}}>{r?.emoji}{r?.name}</div></div><div style={{padding:"8px 10px"}}><div style={{fontSize:10,color:"rgba(255,255,255,.25)",marginBottom:2}}>{p.date}</div><div style={{fontSize:12,color:"rgba(255,255,255,.65)"}}>{p.memo}</div></div></div>);})}
          </div>
        )}
      </div>
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowAdd(false)}>
          <div style={{background:"#1c0c14",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:420,maxHeight:"90vh",overflowY:"auto",paddingBottom:60}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}><div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,.2)"}}/></div>
            <div style={{padding:"0 24px 24px"}}>
              <div style={{fontWeight:800,fontSize:16,color:"#FFB6C1",marginBottom:18,textAlign:"center"}}>📸 사진 추가</div>

              {/* 사진 업로드 */}
              <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:8}}>사진 선택 (갤러리에서 바로 올려요)</div>
              <label style={{display:"block",width:"100%",marginBottom:12}}>
                <div style={{border:"2px dashed rgba(255,182,193,.3)",borderRadius:14,padding:"20px",textAlign:"center",cursor:"pointer",background:"rgba(255,255,255,.03)"}}>
                  {preview
                    ?<img src={preview} style={{width:"100%",borderRadius:10,maxHeight:160,objectFit:"cover"}} alt="preview"/>
                    :<><div style={{fontSize:32,marginBottom:8}}>📷</div><div style={{fontSize:13,color:"rgba(255,255,255,.4)"}}>여기를 눌러서 사진 선택</div><div style={{fontSize:11,color:"rgba(255,255,255,.25)",marginTop:4}}>갤러리에서 바로 선택할 수 있어요</div></>
                  }
                </div>
                <input type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
              </label>

              <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>지역</div>
              <select value={form.regionId} onChange={e=>setForm(f=>({...f,regionId:e.target.value}))} style={{marginBottom:12}}>{REGIONS.map(r=><option key={r.id} value={r.id}>{r.emoji} {r.name}</option>)}</select>
              <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>날짜</div>
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{marginBottom:12}}/>
              <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>메모</div>
              <input placeholder="이날의 추억 ✨" value={form.memo} onChange={e=>setForm(f=>({...f,memo:e.target.value}))} style={{marginBottom:20}}/>
              <button onClick={handleAdd} disabled={saving} style={{width:"100%",padding:14,background:saving?"rgba(255,143,171,.4)":"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:15,cursor:saving?"not-allowed":"pointer"}}>
                {saving?"업로드 중... ⏳":"추가하기 📸"}
              </button>
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
  const [error,setError]=useState(null);

  const fetchRecommend=async()=>{
    setLoading(true);setResult(null);setError(null);
    try{
      const res=await fetch("/api/date-recommend",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({region,type}),
      });
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const parsed=await res.json();
      if(parsed.error) throw new Error(parsed.error);
      setResult(parsed);
    }catch(e){
      setError(e.message);
      setResult({error:true});
    }
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
          {TYPE_LIST.map(t=>(<button key={t} onClick={()=>setType(t)} style={{borderRadius:50,padding:"5px 12px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer",background:type===t?"#FF8FAB":"rgba(255,255,255,.07)",color:type===t?"white":"rgba(255,255,255,.45)"}}>{t}</button>))}
        </div>
        <button onClick={fetchRecommend} disabled={loading} style={{width:"100%",padding:14,background:loading?"rgba(255,143,171,.3)":"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:15,cursor:loading?"not-allowed":"pointer"}}>
          {loading?"🔍 찾는 중...":"💝 데이트 장소 추천받기"}
        </button>
      </div>
      {loading&&<div className="card" style={{textAlign:"center",padding:"28px 20px"}}><div style={{fontSize:32,marginBottom:10,display:"inline-block",animation:"hb 1s infinite"}}>💕</div><div style={{fontSize:14,color:"rgba(255,255,255,.5)"}}>{region} 데이트 명소 찾는 중...</div></div>}
      {result?.error&&<div className="card" style={{textAlign:"center",padding:24}}><div style={{fontSize:28,marginBottom:8}}>😢</div><div style={{fontSize:14,color:"rgba(255,255,255,.5)"}}>다시 시도해주세요!</div>{error&&<div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:6}}>{error}</div>}</div>}
      {result?.places&&result.places.map((p,i)=>(
        <div key={i} className="card si" style={{padding:"16px 18px"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
            <div style={{width:44,height:44,borderRadius:14,background:"rgba(255,143,171,.15)",border:"1px solid rgba(255,143,171,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{ICONS[p.category]||"💕"}</div>
            <div style={{flex:1}}><div style={{fontSize:15,fontWeight:800,color:"#FFB6C1",marginBottom:4}}>{p.name}</div><div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:11,background:"rgba(255,143,171,.15)",border:"1px solid rgba(255,143,171,.2)",borderRadius:50,padding:"2px 9px",color:"#FF8FAB"}}>{p.category}</span><span style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>💰 {p.price}</span></div></div>
          </div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.65)",lineHeight:1.7,marginBottom:10}}>{p.description}</div>
          <div style={{background:"rgba(255,183,77,.08)",border:"1px solid rgba(255,183,77,.18)",borderRadius:12,padding:"10px 14px",display:"flex",gap:8,alignItems:"flex-start"}}><span style={{fontSize:16,flexShrink:0}}>💡</span><span style={{fontSize:12,color:"rgba(255,220,120,.9)",lineHeight:1.6}}>{p.tip}</span></div>
        </div>
      ))}
      {result?.places&&<div style={{textAlign:"center",padding:"4px 0 20px",fontSize:11,color:"rgba(255,255,255,.2)"}}>AI 추천 장소 · 방문 전 영업시간 확인 필수 📍</div>}
    </div>
  );
}

function GameTab({coins,addCoins,spendCoins,showToast,settings,updateSettings,roomCode,sendLetter}){
  const [activeGame,setActiveGame]=useState(null);
  const [shopTab,setShopTab]=useState(false);
  const [showLetterModal,setShowLetterModal]=useState(false);

  const today=new Date().toISOString().split("T")[0];
  const playedToday=settings?.gamePlayed||{};
  const canPlay=(id)=>playedToday[id]!==today;
  const isVIP=settings?.vip||false;

  const markPlayed=async(id)=>{
    await updateSettings({gamePlayed:{...(settings?.gamePlayed||{}),[id]:today}});
  };

  // VIP면 코인 1.5배
  const earnCoins=async(amount)=>{
    const final=isVIP?Math.floor(amount*1.5):amount;
    await addCoins(final);
    if(isVIP) showToast(`+${final} 🪙 (VIP 보너스!)`);
  };

  // VIP면 코인샵 10% 할인
  const shopPrice=(price)=>isVIP?Math.floor(price*0.9):price;

  const THEMES={
    pink:{name:"핑크",bg:"#120810",accent:"#FF8FAB",label:"기본"},
    purple:{name:"보라",bg:"#0d0820",accent:"#B388FF",label:"퍼플"},
    blue:{name:"블루",bg:"#081220",accent:"#64B5F6",label:"블루"},
    green:{name:"그린",bg:"#081410",accent:"#81C784",label:"그린"},
    gold:{name:"골드",bg:"#141008",accent:"#FFB347",label:"골드"},
  };
  const theme=settings?.theme||"pink";

  const TITLES=["🌸 봄날의 커플","💕 달달한 커플","⭐ 특별한 커플","🦋 나비 커플","🌈 무지개 커플","💎 다이아 커플","🔥 열정 커플","🌙 달빛 커플","🎀 러블리 커플","👑 황금 커플"];

  const GAMES=[
    {id:"quiz",name:"커플 퀴즈",emoji:"❓",desc:"매일 새로운 퀴즈!",reward:"최대 50🪙"},
    {id:"rps",name:"가위바위보",emoji:"✊",desc:"5판 대결!",reward:"최대 25🪙"},
    {id:"memory",name:"카드 뒤집기",emoji:"🃏",desc:"짝 맞추기!",reward:"최대 20🪙"},
    {id:"number",name:"숫자 맞추기",emoji:"🔢",desc:"1~100 숫자 맞추기",reward:"최대 30🪙"},
    {id:"emoji",name:"이모지 퀴즈",emoji:"😄",desc:"이모지 단어 맞추기",reward:"최대 40🪙"},
  ];

  return (
    <div className="si">
      <div className="card" style={{textAlign:"center",background:"linear-gradient(135deg,rgba(255,183,77,.1),rgba(255,143,171,.08))"}}>
        <div style={{fontSize:11,color:"rgba(255,183,77,.6)",letterSpacing:3,marginBottom:4}}>MY COINS</div>
        <div style={{fontSize:42,fontWeight:800,color:"#FFB347"}}>🪙 {fmt(coins)}</div>
        {settings?.title&&<div style={{fontSize:14,fontWeight:700,color:"#FFB6C1",marginTop:4}}>{settings.title}</div>}
        {isVIP&&<div style={{fontSize:11,color:"#FFB347",marginTop:2}}>💎 VIP · 코인 1.5배 · 10% 할인</div>}
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12}}>
          <button onClick={()=>setShopTab(false)} style={{borderRadius:50,padding:"6px 16px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer",background:!shopTab?"#FF8FAB":"rgba(255,255,255,.08)",color:!shopTab?"white":"rgba(255,255,255,.45)"}}>🎮 게임</button>
          <button onClick={()=>setShopTab(true)}  style={{borderRadius:50,padding:"6px 16px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer",background:shopTab?"#FFB347":"rgba(255,255,255,.08)",color:shopTab?"white":"rgba(255,255,255,.45)"}}>🏪 코인샵</button>
        </div>
      </div>

      {!shopTab&&!activeGame&&(
        <div>
          <div style={{padding:"4px 16px 8px",fontSize:13,fontWeight:700,color:"rgba(255,255,255,.5)"}}>🎮 오늘의 게임 (하루 1회){isVIP&&<span style={{color:"#FFB347",marginLeft:6}}>VIP: 코인 1.5배!</span>}</div>
          {GAMES.map(g=>{
            const played=!canPlay(g.id);
            return (
              <div key={g.id} onClick={()=>{if(!played)setActiveGame(g.id);else showToast("내일 다시 할 수 있어요! ⏰");}}
                style={{margin:"0 16px 10px",background:played?"rgba(255,255,255,.03)":"rgba(255,255,255,.05)",border:`1px solid ${played?"rgba(255,255,255,.06)":"rgba(255,182,193,.12)"}`,borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,cursor:played?"not-allowed":"pointer",opacity:played?.6:1}}>
                <div style={{fontSize:30}}>{g.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:14,color:played?"rgba(255,255,255,.3)":"#FFB6C1"}}>{g.name}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:2}}>{g.desc}</div>
                </div>
                <div style={{textAlign:"center"}}>
                  {played?<div style={{fontSize:11,color:"rgba(255,255,255,.3)"}}>✅ 완료</div>
                  :<><div style={{fontSize:12,fontWeight:800,color:"#FFB347"}}>{g.reward}</div></>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {shopTab&&(
        <div>
          {/* 💌 러브레터 */}
          <div className="card">
            <div style={{fontWeight:800,fontSize:14,color:"#FFB6C1",marginBottom:12}}>💌 러브레터 ({shopPrice(30)}🪙)</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:12}}>상대방에게 이펙트와 함께 편지를 보내요!</div>
            <button onClick={()=>setShowLetterModal(true)}
              style={{width:"100%",padding:12,background:"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:14,cursor:"pointer"}}>
              💌 편지 쓰기
            </button>
          </div>

          {/* 테마 */}
          <div className="card">
            <div style={{fontWeight:800,fontSize:14,color:"#FFB6C1",marginBottom:4}}>🎨 배경 테마 변경 ({shopPrice(50)}🪙)</div>
            {isVIP&&<div style={{fontSize:11,color:"#FFB347",marginBottom:10}}>💎 VIP 할인 적용!</div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
              {Object.entries(THEMES).map(([key,t])=>(
                <div key={key} onClick={async()=>{
                  if(theme===key){showToast("이미 적용된 테마예요!");return;}
                  const ok=await spendCoins(shopPrice(50));
                  if(ok){await updateSettings({theme:key});showToast(`${t.name} 테마로 변경됐어요 🎨`);}
                }} style={{borderRadius:12,padding:"10px 4px",textAlign:"center",cursor:"pointer",background:t.bg,border:`2px solid ${theme===key?t.accent:"rgba(255,255,255,.1)"}`,transition:"all .2s"}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:t.accent,margin:"0 auto 4px"}}/>
                  <div style={{fontSize:9,color:"white",fontWeight:700}}>{t.label}</div>
                  {theme===key&&<div style={{fontSize:8,color:t.accent,marginTop:2}}>적용중</div>}
                </div>
              ))}
            </div>
          </div>

          {/* 칭호 */}
          <div className="card">
            <div style={{fontWeight:800,fontSize:14,color:"#FFB6C1",marginBottom:4}}>🌸 커플 칭호 ({shopPrice(80)}🪙)</div>
            {isVIP&&<div style={{fontSize:11,color:"#FFB347",marginBottom:10}}>💎 VIP 할인 적용!</div>}
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {TITLES.map((t,i)=>(
                <button key={i} onClick={async()=>{
                  if(settings?.title===t){showToast("이미 사용 중인 칭호예요!");return;}
                  const ok=await spendCoins(shopPrice(80));
                  if(ok){await updateSettings({title:t});showToast(`${t} 칭호 획득! 🎉`);}
                }} style={{borderRadius:50,padding:"6px 12px",fontSize:11,fontWeight:700,border:`1px solid ${settings?.title===t?"#FF8FAB":"rgba(255,182,193,.2)"}`,cursor:"pointer",background:settings?.title===t?"rgba(255,143,171,.2)":"rgba(255,255,255,.05)",color:settings?.title===t?"#FF8FAB":"rgba(255,255,255,.6)"}}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 기타 아이템 */}
          <div className="card">
            <div style={{fontWeight:800,fontSize:14,color:"#FFB6C1",marginBottom:12}}>✨ 특별 아이템</div>
            {[
              {name:"🍀 행운 뽑기",cost:20,desc:"랜덤 코인 5~100 획득!",id:"lucky"},
              {name:"💎 VIP 뱃지",cost:300,desc:"코인 1.5배 · 10% 할인 · 영구혜택",id:"vip"},
              {name:"🎵 러브송 추천",cost:30,desc:"커플 맞춤 노래 추천",id:"song"},
              {name:"🌟 오늘의 운세",cost:15,desc:"커플 오늘의 운세 확인",id:"fortune"},
            ].map((item,i,arr)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 0",borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,.06)":"none"}}>
                <div style={{fontSize:26,flexShrink:0}}>{item.name.split(" ")[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"white"}}>{item.name}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:1}}>{item.desc}</div>
                  {item.id==="vip"&&isVIP&&<div style={{fontSize:10,color:"#FFB347",marginTop:2}}>✅ 보유중</div>}
                </div>
                <button onClick={async()=>{
                  if(item.id==="vip"&&isVIP){showToast("이미 VIP예요! 💎");return;}
                  const price=item.id==="vip"?shopPrice(300):shopPrice(item.cost);
                  const ok=await spendCoins(price);
                  if(!ok)return;
                  if(item.id==="lucky"){const r=Math.floor(Math.random()*96)+5;await earnCoins(r);showToast(`🍀 +${r} 코인!`);}
                  else if(item.id==="vip"){await updateSettings({vip:true});showToast("💎 VIP 획득! 코인 1.5배 적용!");}
                  else if(item.id==="song"){
                    const songs=["🎵 IU - 밤편지","🎵 볼빨간사춘기 - 우주를 줄게","🎵 폴킴 - 모든 날 모든 순간","🎵 헤이즈 - 저 별","🎵 멜로망스 - 선물","🎵 거미 - 바라보기","🎵 아이유 - 좋은 날"];
                    showToast(songs[Math.floor(Math.random()*songs.length)]);
                  } else if(item.id==="fortune"){
                    const f=["💕 오늘 데이트하면 대박!","🌸 서로 칭찬 한마디씩 해요","🍽️ 맛있는 거 먹으러 가요","📸 오늘 사진 찍어요","🤝 손 꼭 잡아줘요"];
                    showToast(f[Math.floor(Math.random()*f.length)]);
                  }
                }} style={{background:"rgba(255,183,77,.15)",border:"1px solid rgba(255,183,77,.3)",color:"#FFB347",borderRadius:50,padding:"6px 12px",fontFamily:"inherit",fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                  🪙 {item.id==="vip"?shopPrice(300):shopPrice(item.cost)}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 편지 작성 모달 */}
      {showLetterModal&&(
        <LetterWriteModal
          onClose={()=>setShowLetterModal(false)}
          onSend={async(content,effect)=>{
            const ok=await spendCoins(shopPrice(30));
            if(ok){await sendLetter(content,effect);setShowLetterModal(false);}
          }}
          partnerName={settings?.partnerName||"상대방"}
        />
      )}

      {activeGame==="quiz"   &&<QuizGame   addCoins={earnCoins} onBack={()=>setActiveGame(null)} onDone={()=>markPlayed("quiz")}/>}
      {activeGame==="rps"    &&<RPSGame    addCoins={earnCoins} onBack={()=>setActiveGame(null)} onDone={()=>markPlayed("rps")}/>}
      {activeGame==="memory" &&<MemoryGame addCoins={earnCoins} onBack={()=>setActiveGame(null)} onDone={()=>markPlayed("memory")}/>}
      {activeGame==="number" &&<NumberGame addCoins={earnCoins} onBack={()=>setActiveGame(null)} onDone={()=>markPlayed("number")}/>}
      {activeGame==="emoji"  &&<EmojiGame  addCoins={earnCoins} onBack={()=>setActiveGame(null)} onDone={()=>markPlayed("emoji")}/>}
    </div>
  );
}
/* ══ LETTER WRITE MODAL ══ */
function LetterWriteModal({onClose,onSend,partnerName}){
  const [content,setContent]=useState("");
  const [effect,setEffect]=useState("hearts");
  const [sending,setSending]=useState(false);
  const EFFECTS=[
    {id:"hearts",label:"💕 하트",preview:"💕💕💕"},
    {id:"stars",label:"⭐ 별",preview:"⭐⭐⭐"},
    {id:"flowers",label:"🌸 꽃",preview:"🌸🌸🌸"},
    {id:"sparkles",label:"✨ 반짝",preview:"✨✨✨"},
    {id:"rainbow",label:"🌈 무지개",preview:"🌈🌈🌈"},
  ];
  const handleSend=async()=>{
    if(!content.trim()){return;}
    setSending(true);
    await onSend(content,effect);
    setSending(false);
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#1c0c14",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:420,maxHeight:"90vh",overflowY:"auto",paddingBottom:60}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}><div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,.2)"}}/></div>
        <div style={{padding:"0 24px 24px"}}>
          <div style={{fontWeight:800,fontSize:16,color:"#FFB6C1",marginBottom:4,textAlign:"center"}}>💌 {partnerName}에게 편지 쓰기</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:16,textAlign:"center"}}>편지를 받으면 이펙트와 함께 팝업으로 나타나요!</div>

          {/* 이펙트 선택 */}
          <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:8}}>이펙트 선택</div>
          <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
            {EFFECTS.map(e=>(
              <button key={e.id} onClick={()=>setEffect(e.id)}
                style={{borderRadius:50,padding:"6px 12px",fontSize:12,fontWeight:700,border:`1px solid ${effect===e.id?"#FF8FAB":"rgba(255,182,193,.2)"}`,cursor:"pointer",background:effect===e.id?"rgba(255,143,171,.2)":"rgba(255,255,255,.05)",color:effect===e.id?"#FF8FAB":"rgba(255,255,255,.5)"}}>
                {e.label}
              </button>
            ))}
          </div>

          {/* 미리보기 */}
          <div style={{textAlign:"center",fontSize:24,marginBottom:16,padding:"12px",background:"rgba(255,255,255,.04)",borderRadius:12}}>
            {EFFECTS.find(e=>e.id===effect)?.preview}
          </div>

          {/* 편지 내용 */}
          <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6}}>편지 내용</div>
          <textarea value={content} onChange={e=>setContent(e.target.value)}
            placeholder={`${partnerName}에게 전하고 싶은 말을 적어요 💕`}
            rows={5}
            style={{fontFamily:"inherit",border:"1.5px solid rgba(255,182,193,.25)",borderRadius:12,padding:"12px 14px",outline:"none",width:"100%",fontSize:14,background:"rgba(255,255,255,.06)",color:"white",resize:"none",marginBottom:20,lineHeight:1.6}}
          />
          <button onClick={handleSend} disabled={sending||!content.trim()}
            style={{width:"100%",padding:14,background:!content.trim()?"rgba(255,143,171,.3)":"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:15,cursor:!content.trim()?"not-allowed":"pointer"}}>
            {sending?"전송 중... 💌":"💌 편지 보내기 (30🪙)"}
          </button>
          <button onClick={onClose} style={{width:"100%",padding:12,marginTop:10,background:"none",border:"none",color:"rgba(255,255,255,.35)",fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:"pointer"}}>취소</button>
        </div>
      </div>
    </div>
  );
}

/* 퀴즈 게임 */
function QuizGame({addCoins,onBack,onDone}){
  const ALL=[
    {q:"가위바위보에서 바위를 이기는 것은?",opts:["가위","바위","보","없음"],a:2},
    {q:"1년은 몇 개월?",opts:["10개월","11개월","12개월","13개월"],a:2},
    {q:"한국의 수도는?",opts:["부산","대구","인천","서울"],a:3},
    {q:"무지개는 몇 가지 색?",opts:["5가지","6가지","7가지","8가지"],a:2},
    {q:"하루는 몇 시간?",opts:["12시간","20시간","24시간","48시간"],a:2},
    {q:"봄 다음 계절은?",opts:["겨울","가을","여름","봄"],a:2},
    {q:"태양계에서 가장 큰 행성은?",opts:["토성","목성","지구","화성"],a:1},
    {q:"물의 끓는점은?",opts:["90도","95도","100도","110도"],a:2},
    {q:"대한민국 국화는?",opts:["장미","튤립","무궁화","벚꽃"],a:2},
    {q:"한국의 화폐 단위는?",opts:["엔","달러","원","위안"],a:2},
    {q:"1주일은 며칠?",opts:["5일","6일","7일","8일"],a:2},
    {q:"가장 큰 바다는?",opts:["대서양","인도양","태평양","북극해"],a:2},
    {q:"사람의 심장은 몇 개?",opts:["1개","2개","3개","4개"],a:0},
    {q:"피자의 발원지는?",opts:["미국","프랑스","이탈리아","스페인"],a:2},
    {q:"올림픽은 몇 년마다?",opts:["2년","3년","4년","5년"],a:2},
    {q:"지구에서 가장 높은 산은?",opts:["백두산","에베레스트","후지산","킬리만자로"],a:1},
    {q:"물의 화학식은?",opts:["CO2","H2O","O2","NaCl"],a:1},
    {q:"한글을 만든 왕은?",opts:["태조","세종대왕","태종","영조"],a:1},
    {q:"1+1+1은?",opts:["1","2","3","4"],a:2},
    {q:"봄에 피는 꽃은?",opts:["국화","장미","벚꽃","해바라기"],a:2},
  ];
  const [qs]=useState(()=>[...ALL].sort(()=>Math.random()-.5).slice(0,5));
  const [idx,setIdx]=useState(0);
  const [score,setScore]=useState(0);
  const [sel,setSel]=useState(null);
  const [correct,setCorrect]=useState(null);
  const [done,setDone]=useState(false);

  const pick=(i)=>{
    if(sel!==null)return;
    setSel(i);
    const ok=i===qs[idx].a;
    setCorrect(ok);
    if(ok)setScore(s=>s+1);
    setTimeout(()=>{
      if(idx<qs.length-1){setIdx(x=>x+1);setSel(null);setCorrect(null);}
      else setDone(true);
    },1000);
  };

  return (
    <div className="card si">
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:20}}>←</button>
        <div style={{fontWeight:800,fontSize:15,color:"#FFB6C1"}}>❓ 퀴즈</div>
        <div style={{marginLeft:"auto",fontSize:12,color:"#FFB347",fontWeight:700}}>{idx+1}/{qs.length}</div>
      </div>
      {!done?(
        <>
          <div style={{background:"rgba(255,143,171,.08)",borderRadius:14,padding:16,marginBottom:16,textAlign:"center"}}>
            <div style={{fontSize:11,color:"rgba(255,182,193,.5)",marginBottom:6}}>문제 {idx+1}</div>
            <div style={{fontSize:16,fontWeight:800,color:"#FFB6C1"}}>{qs[idx].q}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            {qs[idx].opts.map((opt,i)=>{
              let bg="rgba(255,255,255,.05)",border="rgba(255,182,193,.2)",col="rgba(255,255,255,.7)";
              if(sel!==null){
                if(i===qs[idx].a){bg="rgba(76,175,80,.2)";border="#4CAF82";col="#4CAF82";}
                else if(i===sel&&!correct){bg="rgba(255,77,109,.2)";border="#FF4D6D";col="#FF4D6D";}
              }
              return <button key={i} onClick={()=>pick(i)} style={{padding:12,borderRadius:12,border:`2px solid ${border}`,background:bg,color:col,fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:sel!==null?"default":"pointer",transition:"all .2s"}}>{opt}</button>;
            })}
          </div>
          {sel!==null&&<div style={{textAlign:"center",fontSize:14,fontWeight:800,color:correct?"#4CAF82":"#FF4D6D"}}>{correct?"✅ 정답! +10 🪙":"❌ 오답!"}</div>}
        </>
      ):(
        <div style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{fontSize:48,marginBottom:12}}>{score>=4?"🎉":score>=2?"😊":"😅"}</div>
          <div style={{fontSize:18,fontWeight:800,color:"#FFB6C1",marginBottom:6}}>퀴즈 완료!</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.5)",marginBottom:16}}>{score}/{qs.length} 정답 · 맞춘 문제당 10코인</div>
          <div style={{fontSize:32,fontWeight:800,color:"#FFB347",marginBottom:20}}>+{score*10} 🪙</div>
          <button onClick={()=>{addCoins(score*10);onDone&&onDone();onBack();}} style={{width:"100%",padding:14,background:"linear-gradient(135deg,#FFB347,#FF8FAB)",color:"white",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:15,cursor:"pointer"}}>코인 받기! 🪙</button>
        </div>
      )}
    </div>
  );
}

/* 가위바위보 */
function RPSGame({addCoins,onBack,onDone}){
  const [my,setMy]=useState(null);
  const [ai,setAi]=useState(null);
  const [res,setRes]=useState(null);
  const [wins,setWins]=useState(0);
  const [round,setRound]=useState(0);
  const C=["✊","✌️","🖐️"],N=["바위","가위","보"],TOTAL=5;

  const play=(i)=>{
    const a=Math.floor(Math.random()*3);
    setMy(i);setAi(a);
    const d=(i-a+3)%3;
    const r=d===0?"draw":d===1?"win":"lose";
    setRes(r);
    if(r==="win")setWins(w=>w+1);
    setRound(r=>r+1);
  };
  const next=()=>{setMy(null);setAi(null);setRes(null);};

  return (
    <div className="card si">
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:20}}>←</button>
        <div style={{fontWeight:800,fontSize:15,color:"#FFB6C1"}}>✊ 가위바위보</div>
        <div style={{marginLeft:"auto",fontSize:12,color:"#FFB347",fontWeight:700}}>{round}/{TOTAL}판</div>
      </div>
      {round>=TOTAL?(
        <div style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{fontSize:48,marginBottom:12}}>{wins>=4?"🏆":wins>=2?"😊":"😢"}</div>
          <div style={{fontSize:18,fontWeight:800,color:"#FFB6C1",marginBottom:6}}>{TOTAL}판 완료!</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.5)",marginBottom:16}}>{wins}승 {TOTAL-wins}패</div>
          <div style={{fontSize:32,fontWeight:800,color:"#FFB347",marginBottom:20}}>+{wins*5} 🪙</div>
          <button onClick={()=>{addCoins(wins*5);onDone&&onDone();onBack();}} style={{width:"100%",padding:14,background:"linear-gradient(135deg,#FFB347,#FF8FAB)",color:"white",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:15,cursor:"pointer"}}>코인 받기! 🪙</button>
        </div>
      ):res?(
        <div style={{textAlign:"center"}}>
          <div style={{display:"flex",justifyContent:"center",gap:40,fontSize:48,marginBottom:16}}>
            <div>{C[my]}<div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:4}}>나</div></div>
            <div style={{fontSize:22,color:"rgba(255,255,255,.3)",display:"flex",alignItems:"center"}}>VS</div>
            <div>{C[ai]}<div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:4}}>AI</div></div>
          </div>
          <div style={{fontSize:20,fontWeight:800,color:res==="win"?"#4CAF82":res==="lose"?"#FF4D6D":"#FFB347",marginBottom:20}}>
            {res==="win"?"🎉 이겼어요!":res==="lose"?"😢 졌어요...":"🤝 비겼어요!"}
          </div>
          <button onClick={next} style={{width:"100%",padding:14,background:"linear-gradient(135deg,#FF8FAB,#FFB3C6)",color:"white",border:"none",borderRadius:50,fontFamily:"inherit",fontWeight:800,fontSize:15,cursor:"pointer"}}>다음 판 →</button>
        </div>
      ):(
        <>
          <div style={{textAlign:"center",fontSize:13,color:"rgba(255,255,255,.4)",marginBottom:20}}>{round+1}번째 판 · 선택하세요!</div>
          <div style={{display:"flex",justifyContent:"space-around"}}>
            {C.map((c,i)=>(
              <button key={i} onClick={()=>play(i)} style={{fontSize:42,background:"rgba(255,255,255,.05)",border:"2px solid rgba(255,182,193,.2)",borderRadius:16,padding:"12px 16px",cursor:"pointer"}}>
                {c}<div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:4}}>{N[i]}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* 카드 뒤집기 */
function MemoryGame({addCoins,onBack,onDone}){
  const E=["💕","🌸","⭐","🎀","🌈","🦋","🍓","🎵"];
  const init=()=>[...E,...E].map((e,i)=>({id:i,e,f:false,m:false})).sort(()=>Math.random()-.5);
  const [cards,setCards]=useState(init);
  const [flipped,setFlipped]=useState([]);
  const [moves,setMoves]=useState(0);
  const [done,setDone]=useState(false);

  const flip=(id)=>{
    if(flipped.length===2)return;
    const card=cards.find(c=>c.id===id);
    if(card.f||card.m)return;
    const nc=cards.map(c=>c.id===id?{...c,f:true}:c);
    setCards(nc);
    const nf=[...flipped,id];
    setFlipped(nf);
    if(nf.length===2){
      setMoves(m=>m+1);
      const [a,b]=nf.map(fid=>nc.find(c=>c.id===fid));
      if(a.e===b.e){
        const mc=nc.map(c=>nf.includes(c.id)?{