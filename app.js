/* =========================
   AIVORA shared app.js
   Replace SUPABASE_* and HF_* variables below to enable cloud features.
   ========================= */

// ----- CONFIG: replace these to enable Supabase / HuggingFace ----- //
const SUPABASE_URL = ""; // e.g. https://xyz.supabase.co
const SUPABASE_ANON_KEY = ""; // your anon key
const HF_API_KEY = ""; // HuggingFace inference API key (optional)
// ----------------------------------------------------------------- //

/* minimal supabase client only if keys provided */
let supabase = null;
if(SUPABASE_URL && SUPABASE_ANON_KEY){
  try{
    const s = document.createElement('script');
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js";
    s.onload = ()=>{ supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); };
    document.head.appendChild(s);
  }catch(e){ console.warn('Supabase script load failed',e); }
}

function SUPABASE_READY(){ return !!(supabase && SUPABASE_URL && SUPABASE_ANON_KEY); }

/* ---------------- Demo auth (localStorage) ------------------- */
function demoSignup(email,password){
  const users = JSON.parse(localStorage.getItem('aivora_users')||'{}');
  users[email] = { email, password, created:Date.now() };
  localStorage.setItem('aivora_users', JSON.stringify(users));
  localStorage.setItem('aivora_current', JSON.stringify({ email, mode:'demo' }));
}
function demoLogin(email,password){
  const users = JSON.parse(localStorage.getItem('aivora_users')||'{}');
  if(users[email] && users[email].password === password){
    localStorage.setItem('aivora_current', JSON.stringify({ email, mode:'demo' }));
    return true;
  }
  return false;
}
function getCurrentUser(){
  if(SUPABASE_READY() && supabase.auth){
    return supabase.auth.getSession().then(r=>{
      if(r?.data?.session?.user?.email) return { email: r.data.session.user.email, mode:'supabase' };
      const cur = JSON.parse(localStorage.getItem('aivora_current')||'null');
      return cur;
    }).catch(()=> JSON.parse(localStorage.getItem('aivora_current')||'null'));
  }
  return Promise.resolve(JSON.parse(localStorage.getItem('aivora_current')||'null'));
}

async function protectPage(){
  const u = await getCurrentUser();
  if(!u){ window.location.href = 'login.html'; }
  return u;
}

function updateNav(){
  return getCurrentUser().then(user=>{
    const nav = document.getElementById('nav-auth');
    if(!nav) return;
    if(user) nav.innerText = 'Dashboard';
    else nav.innerText = 'Login';
    nav.href = user ? 'dashboard.html' : 'login.html';
  });
}

async function signOut(){
  if(SUPABASE_READY() && supabase.auth){
    try{ await supabase.auth.signOut(); }catch(e){ console.warn(e); }
  }
  localStorage.removeItem('aivora_current');
  window.location.href = 'index.html';
}

/* Supabase auth helpers (email/password) */
async function supabaseAuthSignUp(email,password){
  if(!SUPABASE_READY()) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if(error) throw error;
  localStorage.setItem('aivora_current', JSON.stringify({ email, mode:'supabase' }));
  return data;
}
async function supabaseAuthSignIn(email,password){
  if(!SUPABASE_READY()) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if(error) throw error;
  localStorage.setItem('aivora_current', JSON.stringify({ email, mode:'supabase' }));
  return data;
}

/* ---------------- Roadmaps (saved to localStorage, extend to supabase table) ---------------- */
function loadRoadmaps(){
  return JSON.parse(localStorage.getItem('aivora_roadmaps')||'[]');
}
function addRoadmap(r){
  const arr = loadRoadmaps();
  arr.unshift(r);
  localStorage.setItem('aivora_roadmaps', JSON.stringify(arr));
}
function removeRoadmap(i){
  const arr = loadRoadmaps();
  arr.splice(i,1);
  localStorage.setItem('aivora_roadmaps', JSON.stringify(arr));
}

/* ---------------- Simple AI / HuggingFace bridge ---------------- */
async function getAIReply(prompt){
  if(HF_API_KEY){
    const url = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill";
    const res = await fetch(url, {
      method:'POST',
      headers:{ Authorization: `Bearer ${HF_API_KEY}`, "Content-Type":"application/json" },
      body: JSON.stringify({ inputs: prompt })
    });
    if(!res.ok) throw new Error('HF error: '+res.status);
    const data = await res.json();
    if(data && data.generated_text) return data.generated_text;
    if(Array.isArray(data) && data[0] && data[0].generated_text) return data[0].generated_text;
    if(typeof data === 'string') return data;
  }
  return localAssistantResponse(prompt);
}
function localAssistantResponse(q){
  q = q.toLowerCase();
  if(q.includes('sos')||q.includes('help')||q.includes('emergency')) return 'If you are in immediate danger call local emergency services. Use Safety → Send SOS to share your location.';
  if(q.includes('skills')||q.includes('roadmap')||q.includes('career')) return 'I can create a roadmap. Go to Skills page and add topics; I will suggest study order like: Basics → Intermediate → Projects → Apply.';
  if(q.includes('farmer')||q.includes('crop')||q.includes('pest')) return 'For farming: track local weather, use recommended planting calendar, and inspect leaves for yellowing — can send a picture in future updates.';
  return 'I am running in offline mode. Try simple queries like "suggest a study plan for web dev" or enable HuggingFace API key for richer replies.';
}

/* ---------------- Utilities ---------------- */
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ---------------- Supabase quick notes ---------------- */
// To store roadmaps in Supabase: create table "roadmaps" with id, user_email, title, items (json) and use supabase.from('roadmaps') ...
