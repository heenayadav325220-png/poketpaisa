# --- 1. DARK INDUSTRIAL THEME CSS ---
st.markdown("""
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0" rel="stylesheet" />
    
    <style>
    /* Full Dark Mode with Boltshift Gradient */
    .stApp {
        background: radial-gradient(circle at top right, #07191e 0%, #000000 100%);
        color: #acb2b1;
    }

    /* Standard Grid Boxes (Inspired by Boltshift) */
    .feature-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        transition: 0.4s ease;
    }
    .feature-card:hover {
        border-color: #00f2ff;
        background: rgba(0, 242, 255, 0.05);
        box-shadow: 0 0 20px rgba(0, 242, 255, 0.1);
    }

    /* Standard Classic Icons (No Emoji) */
    .material-symbols-rounded {
        font-size: 32px !important;
        color: #00f2ff;
    }

    /* Jarvas Style Orb */
    .orb-box { display: flex; justify-content: center; margin: 30px 0; }
    .orb {
        width: 130px; height: 130px;
        background: radial-gradient(circle, #00f2ff, #005f73, transparent);
        border-radius: 50%;
        box-shadow: 0 0 50px rgba(0, 242, 255, 0.3);
        animation: breathe 6s infinite ease-in-out;
    }
    @keyframes breathe { 0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.05); opacity: 1; } }

    /* Custom Input Bar (Like the one with Mic in your photo) */
    .stChatInputContainer {
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 20px !important;
        background: rgba(10, 10, 10, 0.6) !important;
    }
    </style>
    """, unsafe_allow_html=True)

# --- 2. THE UI LAYOUT ---

# Top Orb (Jarvas Vibe)
st.markdown('<div class="orb-box"><div class="orb"></div></div>', unsafe_allow_html=True)
st.markdown("<h2 style='text-align: center; letter-spacing: 5px; font-weight: 200;'>CORE AI</h2>", unsafe_allow_html=True)

# The 4 Feature Boxes (Standard Icons)
st.write("##")
col1, col2 = st.columns(2)

with col1:
    st.markdown('<div class="feature-card"><span class="material-symbols-rounded">psychology</span><p style="font-size:11px; margin-top:10px; color:#666;">NEURAL LINK</p></div>', unsafe_allow_html=True)
    if st.button("ACTIVATE OPUS", use_container_width=True): pass

    st.markdown('<div class="feature-card"><span class="material-symbols-rounded">visibility</span><p style="font-size:11px; margin-top:10px; color:#666;">VISUAL CORE</p></div>', unsafe_allow_html=True)
    if st.button("ACTIVATE VISION", use_container_width=True): pass

with col2:
    st.markdown('<div class="feature-card"><span class="material-symbols-rounded">videocam</span><p style="font-size:11px; margin-top:10px; color:#666;">CINEMA GEN</p></div>', unsafe_allow_html=True)
    if st.button("ACTIVATE VIDEO", use_container_width=True): pass

    st.markdown('<div class="feature-card"><span class="material-symbols-rounded">mic</span><p style="font-size:11px; margin-top:10px; color:#666;">VOICE LINK</p></div>', unsafe_allow_html=True)
    if st.button("ACTIVATE NICK", use_container_width=True): pass

# Input Section (The "Standard" way)
st.write("---")
DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CORE AI | Neural Interface</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=JetBrains+Mono&display=swap');
        
        :root {
            --bg: #050505;
            --accent: #3b82f6;
            --glass: rgba(255, 255, 255, 0.03);
            --border: rgba(255, 255, 255, 0.1);
        }

        body {
            background-color: var(--bg);
            color: #fff;
            font-family: 'Inter', sans-serif;
            overflow: hidden;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .neural-grid {
            background-image: radial-gradient(var(--border) 1px, transparent 1px);
            background-size: 30px 30px;
        }

        .glass-panel {
            background: var(--glass);
            backdrop-filter: blur(12px);
            border: 1px solid var(--border);
        }

        .sidebar-transition { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }

        .mic-active {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
            transform: scale(1.05);
            border-color: rgba(59, 130, 246, 0.5) !important;
        }

        .dashboard-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.9);
            backdrop-filter: blur(20px);
            z-index: 100;
            transform: translateY(100%);
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dashboard-overlay.open { transform: translateY(0); }

        @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.5); opacity: 0; } }
        .pulse-ring { position: absolute; width: 100%; height: 100%; border: 2px solid var(--accent); border-radius: 50%; animation: pulse-ring 2s infinite; }

        /* Custom Scrollbar */
        #chat-area::-webkit-scrollbar { width: 4px; }
        #chat-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
    </style>
</head>
<body class="neural-grid">

    <aside id="sidebar" class="fixed lg:relative inset-y-0 left-0 w-72 glass-panel border-r border-white/10 z-50 sidebar-transition -translate-x-full lg:translate-x-0 flex flex-col">
        <div class="p-6 border-b border-white/10 flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                <i data-lucide="zap" class="w-5 h-5 text-white"></i>
            </div>
            <h1 class="text-xl font-black tracking-tighter uppercase">CORE <span class="text-blue-500">AI</span></h1>
        </div>
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
            <button onclick="setMode('chat')" class="nav-item active w-full flex items-center gap-3 p-3 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
                <i data-lucide="message-square" class="w-5 h-5"></i> <span class="text-sm font-bold uppercase tracking-widest">Chat</span>
            </button>
            <button onclick="setMode('image')" class="nav-item w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all">
                <i data-lucide="image" class="w-5 h-5"></i> <span class="text-sm font-bold uppercase tracking-widest">Image Gen</span>
            </button>
            <button onclick="setMode('video')" class="nav-item w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all">
                <i data-lucide="video" class="w-5 h-5"></i> <span class="text-sm font-bold uppercase tracking-widest">Video Gen</span>
            </button>
            <button onclick="setMode('voice')" class="nav-item w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all">
                <i data-lucide="mic-2" class="w-5 h-5"></i> <span class="text-sm font-bold uppercase tracking-widest">Voice</span>
            </button>
            <button onclick="setMode('mood')" class="nav-item w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all">
                <i data-lucide="heart" class="w-5 h-5"></i> <span class="text-sm font-bold uppercase tracking-widest">Mood</span>
            </button>
        </nav>
        <div class="p-6 border-t border-white/10 text-center text-xs text-zinc-500">Rohit Yadav • Neural Link</div>
    </aside>

    <header class="p-6 glass-panel border-b border-white/10 flex justify-between items-center z-40">
        <button id="menu-toggle" class="lg:hidden p-2 rounded-lg bg-white/5"> <i data-lucide="menu" class="w-6 h-6"></i> </button>
        <div class="flex items-center gap-3">
            <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span id="mode-indicator" class="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Neural Chat Active</span>
        </div>
        <button id="dashboard-toggle" class="p-2 rounded-lg bg-white/5"> <i data-lucide="layout-grid" class="w-5 h-5 text-zinc-400"></i> </button>
    </header>

    <main id="chat-area" class="flex-1 overflow-y-auto p-6 space-y-6 pb-40">
        <div class="flex flex-col items-start max-w-[85%]">
            <div class="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 ml-1">CORE AI • System</div>
            <div class="p-4 rounded-2xl rounded-tl-none glass-panel text-sm leading-relaxed">
                Namaste. I am Core AI, founded by Rohit Yadav. How can I assist you?
            </div>
        </div>
    </main>

    <footer class="fixed bottom-0 left-0 right-0 p-8 glass-panel border-t border-white/10 flex flex-col items-center gap-6 z-30">
        <div id="status-text" class="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.3em] animate-pulse">Ready for Input</div>
        <button id="mic-btn" class="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 hover:bg-white/10 active:scale-95 group">
            <div id="mic-icon-container" class="relative">
                <div id="pulse" class="hidden pulse-ring"></div>
                <i data-lucide="mic" id="mic-icon" class="w-8 h-8 text-zinc-400 group-hover:text-white transition-colors"></i>
                <i data-lucide="square" id="stop-icon" class="w-8 h-8 text-blue-400 hidden"></i>
            </div>
        </button>
    </footer>

    <div id="dashboard" class="dashboard-overlay p-6 overflow-y-auto z-50">
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-2xl font-black uppercase tracking-tighter">Neural <span class="text-blue-500">Dashboard</span></h2>
            <button id="close-dashboard" class="p-2 rounded-full bg-white/10"><i data-lucide="x" class="w-6 h-6"></i></button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="glass-panel p-6 rounded-3xl border-blue-500/20">
                <div class="flex justify-between items-center mb-4"><span class="text-[10px] font-mono text-blue-400 uppercase tracking-widest">Live Cricket</span><div class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div></div>
                <div class="flex justify-between items-center"><div class="text-center"><div class="text-2xl font-black">IND 245/4</div></div><div class="text-zinc-500 font-mono text-xs">vs</div><div class="text-center"><div class="text-2xl font-black text-zinc-500">AUS</div></div></div>
            </div>
            <div class="glass-panel p-6 rounded-3xl">
                <span class="text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-4 block">Neural Memory</span>
                <ul class="space-y-2 text-[11px] text-zinc-400">
                    <li>✓ Dark mode active</li>
                    <li>✓ Project: CORE AI</li>
                </ul>
            </div>
        </div>
    </div>

    <script>
        lucide.createIcons();

        // --- CONFIGURATION ---
        const GEMINI_API_KEY = "AIzaSyAu_a17XYn3WStXjmfEeTH-hcUW_CDYDkg";
        const MODEL_NAME = "gemini-1.5-flash";
        // ---------------------

        let isActive = false;
        let currentMode = 'chat';
        const chatArea = document.getElementById('chat-area');
        const micBtn = document.getElementById('mic-btn');
        const micIcon = document.getElementById('mic-icon');
        const stopIcon = document.getElementById('stop-icon');
        const pulse = document.getElementById('pulse');
        const statusText = document.getElementById('status-text');
        const dashboard = document.getElementById('dashboard');

        // Sidebar Toggles
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        menuToggle.onclick = () => sidebar.classList.toggle('-translate-x-full');

        // Dashboard Toggles
        document.getElementById('dashboard-toggle').onclick = () => dashboard.classList.add('open');
        document.getElementById('close-dashboard').onclick = () => dashboard.classList.remove('open');

        // Speech Recognition Setup
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = SpeechRecognition ? new SpeechRecognition() : null;

        if (recognition) {
            recognition.continuous = false;
            recognition.onresult = (e) => {
                const text = e.results[0][0].transcript;
                addMessage('user', text);
                processAI(text);
            };
        }

        micBtn.addEventListener('click', () => {
            if (isActive) stopAll();
            else startInteraction();
        });

        function startInteraction() {
            isActive = true;
            window.speechSynthesis.cancel();
            updateUI(true, "Listening...");
            if (recognition) recognition.start();
        }

        function stopAll() {
            isActive = false;
            window.speechSynthesis.cancel();
            if (recognition) recognition.stop();
            updateUI(false, "Ready for Input");
        }

        function updateUI(active, text) {
            statusText.innerText = text;
            if (active) {
                micBtn.classList.add('mic-active');
                pulse.classList.remove('hidden');
                micIcon.classList.add('hidden');
                stopIcon.classList.remove('hidden');
            } else {
                micBtn.classList.remove('mic-active');
                pulse.classList.add('hidden');
                micIcon.classList.remove('hidden');
                stopIcon.classList.add('hidden');
            }
        }

        function addMessage(role, text) {
            const div = document.createElement('div');
            div.className = `flex flex-col ${role === 'user' ? 'items-end ml-auto' : 'items-start'} max-w-[85%] animate-in fade-in slide-in-from-bottom-2`;
            div.innerHTML = `
                <div class="text-[9px] text-zinc-500 uppercase tracking-widest mb-1 mx-1">${role === 'user' ? 'You' : 'CORE AI'}</div>
                <div class="p-4 rounded-2xl ${role === 'user' ? 'rounded-tr-none bg-blue-600' : 'rounded-tl-none glass-panel'} text-sm leading-relaxed">
                    ${text}
                </div>
            `;
            chatArea.appendChild(div);
            chatArea.scrollTop = chatArea.scrollHeight;
        }

        // --- AI API CALL ---
        async function processAI(input) {
            updateUI(true, "Thinking...");
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: input }] }] })
                });
                const data = await response.json();
                const aiText = data.candidates[0].content.parts[0].text;
                addMessage('model', aiText);
                speak(aiText);
            } catch (error) {
                addMessage('model', "Neural Error: " + error.message);
                stopAll();
            }
        }

        function speak(text) {
            updateUI(true, "Speaking...");
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => stopAll();
            window.speechSynthesis.speak(utterance);
        }

        function setMode(mode) {
            // Functionality to be added
            console.log("Mode set to: " + mode);
        }
    </script>
</body>
</html>
<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>CORE AI • Ultimate Refined Edition</title>
<script src="https://unpkg.com/lucide@latest"></script>

<style>
:root{
    --bg:#020617;
    --glass:rgba(15,23,42,.85);
    --border:rgba(255,255,255,.1);
    --blue:#00d2ff;
    --blue2:#3b82f6;
    --green:#4ade80;
    --text:#f8fafc;
    --muted:#94a3b8;
}

*{ margin:0; padding:0; box-sizing:border-box; }
html,body{ width:100%; height:100%; overflow:hidden; background:var(--bg); font-family:'Segoe UI',sans-serif; color:white; }

/* ========= AURA & STARS ========= */
.bg-stars{ position:fixed; inset:0; overflow:hidden; z-index:-2; }
.star{ position:absolute; width:2px; height:2px; background:white; border-radius:50%; opacity:.5; animation:floatStar linear infinite; }
@keyframes floatStar{ from{ transform:translateY(0); } to{ transform:translateY(-100vh); } }

.aura{ position:fixed; inset:0; pointer-events:none; border:5px solid transparent; z-index:99; transition:.4s; }
.aura.active-space{ border-color:var(--blue); box-shadow: inset 0 0 50px rgba(0,210,255,.4); animation:pulse 1.5s infinite; }
.aura.active-cricket{ border-color:var(--green); box-shadow: inset 0 0 50px rgba(74,222,128,.4); animation:pulse 1.5s infinite; }
@keyframes pulse{ 0%,100%{opacity:.4;} 50%{opacity:1;} }

/* ========= SLIDER & SCREENS ========= */
.slider{ width:200vw; height:100vh; display:flex; transition:transform .8s cubic-bezier(.85,0,.15,1); }
.screen{ width:100vw; height:100vh; display:flex; flex-direction:column; padding:20px; }
.voyager{ background: radial-gradient(circle at center,#0c1425 0%,#020617 100%); }
.stadium{ background: radial-gradient(circle at center,#062c1b 0%,#020617 100%); }

header{ display:flex; align-items:center; justify-content:space-between; padding-bottom:15px; border-bottom:1px solid var(--border); }
.logo{ font-size:24px; font-weight:900; letter-spacing:3px; text-transform:uppercase; }
.logo.space{ color:var(--blue); text-shadow:0 0 15px var(--blue); }
.logo.cricket{ color:var(--green); text-shadow:0 0 15px var(--green); }

/* ========= CHAT BOX ========= */
.chat{ flex:1; overflow-y:auto; padding:20px 5px 150px; display:flex; flex-direction:column; gap:16px; scroll-behavior: smooth; }
.chat::-webkit-scrollbar{ width:0; }
.msg{ max-width:85%; padding:15px; border-radius:20px; line-height:1.6; animation:slideUp .4s ease; font-size: 15px; }
@keyframes slideUp{ from{ transform:translateY(20px); opacity:0; } to{ transform:translateY(0); opacity:1; } }

.ai{ align-self:flex-start; background:var(--glass); border:1px solid var(--border); border-left:5px solid var(--blue); backdrop-filter:blur(20px); }
.user{ align-self:flex-end; background:linear-gradient(135deg,var(--blue),var(--blue2)); color:black; font-weight:700; box-shadow: 0 4px 15px rgba(0,210,255,0.3); }

/* ========= INPUT PANEL ========= */
.control-area{ position:fixed; bottom:85px; left:0; width:100%; padding:0 15px; z-index:100; }
.input-box{ background:rgba(15,23,42,0.9); border:1px solid var(--border); border-radius:35px; display:flex; align-items:center; gap:10px; padding:8px 15px; backdrop-filter:blur(25px); }
input{ flex:1; background:none; border:none; outline:none; color:white; font-size:16px; }

.btn-circle{ width:45px; height:45px; border-radius:50%; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.3s; color:white; }
.btn-send{ background:var(--blue); box-shadow: 0 0 15px var(--blue); }
.btn-tool{ background:rgba(255,255,255,0.05); }

/* ========= NAV ========= */
nav{ position:fixed; bottom:0; width:100%; height:75px; background:rgba(0,0,0,0.95); display:flex; justify-content:space-around; align-items:center; border-top:1px solid var(--border); }
.nav-tab{ display:flex; flex-direction:column; align-items:center; gap:5px; color:#64748b; cursor:pointer; font-size:11px; font-weight:600; }
.nav-tab.active{ color:var(--blue); text-shadow:0 0 10px var(--blue); }

.typing-dot{ width:6px; height:6px; background:var(--blue); border-radius:50%; animation:bounce 1.4s infinite; }
@keyframes bounce{ 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
</style>
</head>
<body>

<div class="bg-stars" id="stars"></div>
<div class="aura" id="aura"></div>

<div class="slider" id="slider">
    <section class="screen voyager">
        <header>
            <i data-lucide="menu"></i>
            <div class="logo space">VOYAGER X</div>
            <i data-lucide="bell"></i>
        </header>
        <div class="chat" id="spaceChat">
            <div class="msg ai">🚀 स्वागत है अर्जुन भाई! Space Mode तैयार है। ब्रह्मांड का कौन सा रहस्य सुलझाना है?</div>
        </div>
    </section>

    <section class="screen stadium">
        <header>
            <i data-lucide="user"></i>
            <div class="logo cricket">STADIUM PULSE</div>
            <i data-lucide="settings"></i>
        </header>
        <div class="chat" id="cricketChat">
            <div class="msg ai" style="border-left-color:var(--green)">🏏 Stadium Pulse एक्टिव है। आज कौन से शॉट का बायोमैकेनिक्स चेक करें?</div>
        </div>
    </section>
</div>

<div class="control-area">
    <div class="input-box">
        <button class="btn-circle btn-tool" onclick="startVoice()"><i data-lucide="mic"></i></button>
        <input id="userInput" type="text" placeholder="CORE AI से बात करें...">
        <button class="btn-circle btn-tool" onclick="document.getElementById('imageInput').click()"><i data-lucide="image"></i></button>
        <input type="file" id="imageInput" hidden accept="image/*" onchange="previewImage(event)">
        <button class="btn-circle btn-send" onclick="handleInput()"><i data-lucide="send"></i></button>
    </div>
    <img id="preview" style="width:100%; border-radius:15px; margin-top:10px; display:none; border:2px solid var(--blue)"/>
</div>

<nav>
    <div class="nav-tab active" onclick="switchMode(0)"><i data-lucide="rocket"></i><span>VOYAGER</span></div>
    <div class="nav-tab" onclick="switchMode(1)"><i data-lucide="trophy"></i><span>STADIUM</span></div>
    <div class="nav-tab" onclick="clearChat()"><i data-lucide="trash-2"></i><span>CLEAR</span></div>
</nav>

<script>
lucide.createIcons();

// यहाँ तेरी API Key फिट कर दी गई है
const API_KEY = "AIzaSyANQi4P1th4sWNdYR3RujfD7wOuC8QhRn8";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY;

let currentMode = parseInt(localStorage.getItem("core_mode")) || 0;
switchMode(currentMode);
generateStars();

function generateStars(){
    const stars = document.getElementById("stars");
    for(let i=0; i<100; i++){
        const s = document.createElement("div");
        s.className = "star";
        s.style.left = Math.random()*100 + "%";
        s.style.top = Math.random()*100 + "%";
        s.style.animationDuration = (5 + Math.random()*10) + "s";
        stars.appendChild(s);
    }
}

function switchMode(index){
    currentMode = index;
    localStorage.setItem("core_mode", index);
    document.getElementById("slider").style.transform = `translateX(-${index * 100}vw)`;
    document.querySelectorAll(".nav-tab").forEach((tab, i) => tab.classList.toggle("active", i === index));
}

function getCurrentChat() { return currentMode === 0 ? document.getElementById("spaceChat") : document.getElementById("cricketChat"); }

function addMessage(text, type){
    const chat = getCurrentChat();
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    div.innerText = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // अच्छी हिंदी आवाज़ चुनना
    utter.voice = voices.find(v => v.lang.includes("hi-IN") && v.name.includes("Google")) || voices.find(v => v.lang.includes("hi")) || voices[0];
    utter.pitch = 1.1; utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
}

async function handleInput(){
    const input = document.getElementById("userInput");
    const text = input.value.trim();
    if(!text) return;

    addMessage(text, "user");
    input.value = "";
    
    const aura = document.getElementById("aura");
    aura.className = currentMode === 0 ? "aura active-space" : "aura active-cricket";

    // Voice Commands for Modes
    if(text.toLowerCase().includes("space mode") || text.toLowerCase().includes("स्पेस मोड")){
        switchMode(0);
        aiResponse("जी भाई, Voyager X मोड एक्टिव कर दिया है।");
        aura.className = "aura"; return;
    }
    if(text.toLowerCase().includes("cricket mode") || text.toLowerCase().includes("क्रिकेट मोड")){
        switchMode(1);
        aiResponse("Stadium Pulse मोड ऑन है, चलिए प्रैक्टिस शुरू करते हैं।");
        aura.className = "aura"; return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: text }] }] })
        });
        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "भाई, सिग्नल थोड़े कमज़ोर हैं।";
        aiResponse(reply);
    } catch(err) {
        aiResponse("नेटवर्क में कुछ गड़बड़ लग रही है भाई।");
    } finally {
        aura.className = "aura";
    }
}

function aiResponse(text) {
    addMessage(text, "ai");
    speak(text);
}

function startVoice(){
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'hi-IN';
    recognition.start();
    document.getElementById("aura").className = currentMode === 0 ? "aura active-space" : "aura active-cricket";
    
    recognition.onresult = (e) => {
        document.getElementById("userInput").value = e.results[0][0].transcript;
        handleInput();
    };
    recognition.onend = () => document.getElementById("aura").className = "aura";
}

function clearChat() {
    getCurrentChat().innerHTML = `<div class="msg ai">🧠 Chat साफ़ कर दी गई है, नया क्या है?</div>`;
}

document.getElementById("userInput").addEventListener("keydown", (e) => { if(e.key === "Enter") handleInput(); });

</script>
</body>
</html>
