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
