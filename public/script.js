/* =========================================
   1. GLOBAL DEĞİŞKENLER VE EDİTÖR AYARLARI
   ========================================= */

let currentUser = localStorage.getItem('compiler_username');

const commonOptions = {
    theme: 'dracula',
    lineNumbers: true,
    autoCloseBrackets: true,
    indentUnit: 4,
    tabSize: 4
};

// Editör Tanımları
const editor = CodeMirror.fromTextArea(document.getElementById('kodAlani'), { ...commonOptions, mode: 'python' });
const htmlEditor = CodeMirror.fromTextArea(document.getElementById('htmlEditor'), { ...commonOptions, mode: 'xml', htmlMode: true });
const cssEditor = CodeMirror.fromTextArea(document.getElementById('cssEditor'), { ...commonOptions, mode: 'css' });
const jsEditor = CodeMirror.fromTextArea(document.getElementById('jsEditor'), { ...commonOptions, mode: 'javascript' });

// UI Elementleri
const UI = {
    dilSecimi: document.getElementById('dilSecimi'),
    terminalKutusu: document.getElementById('terminalKutusu'),
    webOnizleme: document.getElementById('webOnizleme'),
    fileNameDisplay: document.getElementById('fileNameDisplay'),
    temizleBtn: document.getElementById('temizleBtn'),
    calistirBtn: document.getElementById('calistirBtn'),
    sidebar: document.getElementById('sidebar'),
    toggleSidebarBtn: document.getElementById('toggleSidebar'),
    singleEditorPanel: document.getElementById('singleEditorPanel'),
    webEditorsPanel: document.getElementById('webEditorsPanel'),
    openNewTabBtn: document.getElementById('openNewTabBtn'),
    outputPanel: document.getElementById('outputPanel'),
    resizer: document.getElementById('dragMe'),
    editorArea: document.querySelector('.editor-area'),
    gecmisBtn: document.getElementById('gecmisBtn'),
    historyTableBody: document.getElementById('historyTableBody'),
    
    // Auth Elementleri
    userInfoDisplay: document.getElementById('userInfoDisplay'),
    authButtons: document.getElementById('authButtons'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    // Modallar (ID ile seçim)
    historyModal: document.getElementById('historyModal'),
    loginModal: document.getElementById('loginModal'),
    registerModal: document.getElementById('registerModal'),
    
    // Açma Butonları
    openLoginBtn: document.getElementById('openLoginBtn'),
    openRegisterBtn: document.getElementById('openRegisterBtn'),
    
    // Kapatma Butonları (YENİ ID'ler)
    closeHistoryBtn: document.getElementById('closeHistoryModal'),
    closeLoginBtn: document.getElementById('closeLoginModal'),
    closeRegisterBtn: document.getElementById('closeRegisterModal')
};

/* =========================================
   2. TOAST BİLDİRİM SİSTEMİ (YENİ)
   ========================================= */

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    let iconClass = type === 'success' ? 'bx-check-circle' : 'bx-error-circle';
    
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class='bx ${iconClass}'></i>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}

/* =========================================
   3. AUTHENTICATION (GİRİŞ/ÇIKIŞ) SİSTEMİ
   ========================================= */

function updateAuthUI() {
    if (currentUser) {
        if (UI.userInfoDisplay) {
            UI.userInfoDisplay.innerHTML = `<i class='bx bxs-user-circle'></i> <span>${currentUser}</span>`;
            UI.userInfoDisplay.style.display = 'flex';
        }
        if (UI.authButtons) UI.authButtons.style.display = 'none';
        if (UI.logoutBtn) UI.logoutBtn.style.display = 'flex';
    } else {
        if (UI.userInfoDisplay) UI.userInfoDisplay.style.display = 'none';
        if (UI.authButtons) UI.authButtons.style.display = 'flex';
        if (UI.logoutBtn) UI.logoutBtn.style.display = 'none';
    }
}

if (UI.logoutBtn) {
    UI.logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('compiler_username');
        currentUser = null;
        updateAuthUI();
        showToast("Başarıyla çıkış yapıldı.", "success");
        resetTerminal();
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('loginUsername').value;
        const passwordInput = document.getElementById('loginPassword').value;

        try {
            const res = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameInput, password: passwordInput })
            });
            const data = await res.json();

            if (res.ok) {
                currentUser = data.username;
                localStorage.setItem('compiler_username', currentUser);
                updateAuthUI();
                
                UI.loginModal.style.display = 'none';
                loginForm.reset();
                showToast(data.message, "success");
            } else {
                showToast(data.error, "error");
            }
        } catch (err) {
            showToast("Bağlantı hatası!", "error");
        }
    });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('regUsername').value;
        const passwordInput = document.getElementById('regPassword').value;

        try {
            const res = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameInput, password: passwordInput })
            });
            const data = await res.json();

            if (res.ok) {
                UI.registerModal.style.display = 'none';
                registerForm.reset();
                showToast(data.message + " Lütfen giriş yapın.", "success");
                
                setTimeout(() => { UI.loginModal.style.display = 'block'; }, 500);
            } else {
                showToast(data.error, "error");
            }
        } catch (err) {
            showToast("Bağlantı hatası!", "error");
        }
    });
}

updateAuthUI();

/* =========================================
   4. MODAL YÖNETİMİ (AÇMA / KAPAMA)
   ========================================= */

UI.gecmisBtn.addEventListener('click', () => { 
    UI.historyModal.style.display = "block"; 
    fetchHistory(); 
});
if(UI.openLoginBtn) UI.openLoginBtn.addEventListener('click', () => UI.loginModal.style.display = "block");
if(UI.openRegisterBtn) UI.openRegisterBtn.addEventListener('click', () => UI.registerModal.style.display = "block");

if(UI.closeHistoryBtn) UI.closeHistoryBtn.addEventListener('click', () => UI.historyModal.style.display = "none");
if(UI.closeLoginBtn) UI.closeLoginBtn.addEventListener('click', () => UI.loginModal.style.display = "none");
if(UI.closeRegisterBtn) UI.closeRegisterBtn.addEventListener('click', () => UI.registerModal.style.display = "none");

window.addEventListener('click', (event) => {
    if (event.target == UI.historyModal) UI.historyModal.style.display = "none";
    if (event.target == UI.loginModal) UI.loginModal.style.display = "none";
    if (event.target == UI.registerModal) UI.registerModal.style.display = "none";
});


/* =========================================
   5. DİL VE EDİTÖR YÖNETİMİ
   ========================================= */

const snippets = {
    python: { mode: 'python', file: 'main.py', code: 'import time\n\nprint("Bulut Derleyici Başlatılıyor...")\ntime.sleep(1)\nprint("Merhaba Dünya! 🌍")' },
    c: { mode: 'text/x-csrc', file: 'main.c', code: '#include <stdio.h>\n\nint main() {\n    printf("Merhaba C Dili! 🚀\\n");\n    return 0;\n}' },
    html: { 
        isWeb: true,
        htmlCode: '<h1>Merhaba Web! 👋</h1>\n<p>Bu canlı bir önizlemedir.</p>',
        cssCode: 'body {\n    font-family: sans-serif;\n    background: #f0f2f5;\n    padding: 20px;\n}\nh1 {\n    color: #4f46e5;\n}',
        jsCode: 'console.log("Web sayfası yüklendi");' 
    }
};

function setLanguage(lang) {
    const config = snippets[lang];
    if (!config) return;
    resetTerminal();

    if (config.isWeb) {
        UI.singleEditorPanel.classList.add('hidden');
        UI.webEditorsPanel.classList.remove('hidden');
        setTimeout(() => { htmlEditor.refresh(); cssEditor.refresh(); jsEditor.refresh(); }, 10);
        if(htmlEditor.getValue() === '') htmlEditor.setValue(config.htmlCode);
        if(cssEditor.getValue() === '') cssEditor.setValue(config.cssCode);
        if(jsEditor.getValue() === '') jsEditor.setValue(config.jsCode);
        gosterimModu('web');
    } else {
        UI.singleEditorPanel.classList.remove('hidden');
        UI.webEditorsPanel.classList.add('hidden');
        setTimeout(() => editor.refresh(), 10);
        editor.setOption('mode', config.mode);
        editor.setValue(config.code);
        UI.fileNameDisplay.innerText = config.file;
        gosterimModu('terminal');
    }
}

UI.dilSecimi.addEventListener('change', () => setLanguage(UI.dilSecimi.value));

function gosterimModu(mod) {
    const outputTitle = document.getElementById('outputTitle');
    const outputIcon = document.getElementById('outputIcon');
    if (mod === 'web') {
        UI.terminalKutusu.style.display = 'none';
        UI.webOnizleme.classList.remove('hidden');
        outputTitle.innerText = "Canlı Önizleme";
        outputIcon.className = 'bx bx-globe';
        UI.openNewTabBtn.classList.remove('hidden');
    } else {
        UI.terminalKutusu.style.display = 'flex';
        UI.webOnizleme.classList.add('hidden');
        outputTitle.innerText = "Terminal / Çıktı";
        outputIcon.className = 'bx bx-terminal';
        UI.openNewTabBtn.classList.add('hidden');
    }
}

function resetTerminal() {
    UI.terminalKutusu.innerHTML = `<div class="terminal-welcome"><i class='bx bx-terminal'></i><p>Çıktı burada görüntülenecektir...</p></div>`;
}

setLanguage('python'); 

/* =========================================
   6. KOD ÇALIŞTIRMA (EXECUTION)
   ========================================= */

UI.temizleBtn.addEventListener('click', () => resetTerminal());

UI.openNewTabBtn.addEventListener('click', () => {
    const h = htmlEditor.getValue();
    const c = `<style>${cssEditor.getValue()}</style>`;
    const j = `<script>${jsEditor.getValue()}<\/script>`;
    const newWindow = window.open();
    if (newWindow) { newWindow.document.write(`${h}\n${c}\n${j}`); newWindow.document.close(); }
});

UI.calistirBtn.addEventListener('click', async () => {
    const dil = UI.dilSecimi.value;
    
    const requestBody = {
        dil: dil,
        username: currentUser
    };

    if (dil === 'html') {
        const h = htmlEditor.getValue();
        const c = cssEditor.getValue();
        const j = jsEditor.getValue();
        const jSafe = `<script>${j}<\/script>`; 
        const combinedPreview = `${h}\n<style>${c}</style>\n${jSafe}`;
        UI.webOnizleme.srcdoc = combinedPreview;

        const fullCodeLog = `\n${h}\n\n/* CSS KODU */\n${c}\n\n// JS KODU\n${j}`;
        
        requestBody.kod = fullCodeLog;
        requestBody.dil = 'html';

        fetch('/calistir', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        }).then(() => console.log("Web kodu kaydedildi.")).catch(err => console.error(err));
        return; 
    }

    requestBody.kod = editor.getValue();
    UI.terminalKutusu.innerHTML = '<div class="terminal-welcome"><i class="bx bx-loader-alt bx-spin"></i><p>Çalıştırılıyor...</p></div>';
    
    try {
        const response = await fetch('/calistir', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        
        if (data.sonuc) UI.terminalKutusu.innerText = data.sonuc;
        else if (data.hata) UI.terminalKutusu.innerHTML = `<span class="terminal-error">Hata: ${data.hata}</span>`;
        else if (data.error) UI.terminalKutusu.innerHTML = `<span class="terminal-error">Sistem Hatası: ${data.error}</span>`;

    } catch (error) {
        UI.terminalKutusu.innerHTML = `<div class="terminal-welcome"><i class="bx bx-error-circle" style="color:var(--terminal-error)"></i><p>Sunucu Hatası: ${error}</p></div>`;
    }
});

/* =========================================
   7. GEÇMİŞ (HISTORY) İŞLEMLERİ
   ========================================= */

async function fetchHistory() {
    UI.historyTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Yükleniyor...</td></tr>';
    
    if (!currentUser) {
        UI.historyTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:orange;">Geçmişinizi görmek için lütfen giriş yapın.</td></tr>';
        return;
    }

    try {
        const response = await fetch(`/gecmis?username=${currentUser}`);
        const data = await response.json();
        
        UI.historyTableBody.innerHTML = '';
        if(data.length === 0) {
            UI.historyTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Henüz kaydedilmiş kodunuz yok.</td></tr>';
            return;
        }

        data.forEach(row => {
            const trMain = document.createElement('tr');
            trMain.className = 'main-row';
            
            const utcDate = new Date(row.timestamp.replace(' ', 'T') + 'Z');
            const date = isNaN(utcDate.getTime()) 
                ? row.timestamp 
                : utcDate.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

            const firstLine = row.code.split('\n')[0].substring(0, 40);
            const safeFirstLine = firstLine.replace(/</g, "&lt;");
            const shortOutput = row.output && row.output.length > 30 ? row.output.substring(0, 30) + "..." : (row.output || '-');
            const safeOutput = shortOutput.replace(/</g, "&lt;");

            trMain.innerHTML = `<td><span style="color:var(--primary)">${row.language}</span></td><td>${date}</td><td><i class='bx bx-chevron-right toggle-icon'></i> <code class="code-snippet">${safeFirstLine}...</code></td><td>${safeOutput}</td>`;

            const trDetail = document.createElement('tr');
            trDetail.className = 'detail-row';
            const fullSafeCode = row.code.replace(/</g, "&lt;");
            const fullSafeOutput = row.output ? row.output.replace(/</g, "&lt;") : "Çıktı yok";

            trDetail.innerHTML = `<td colspan="4"><div class="detail-content"><div style="font-weight:bold; color:var(--text-muted); font-size:0.8rem;">Tam Kod:</div><div class="full-code-block">${fullSafeCode}</div><div class="copy-btn-wrapper"><button class="copy-code-btn" onclick="copyToClipboard(this, decodeURIComponent('${encodeURIComponent(row.code)}'))"><i class='bx bx-copy'></i> Kodu Kopyala</button></div><div style="font-weight:bold; color:var(--text-muted); font-size:0.8rem; margin-top:10px;">Tam Çıktı:</div><div class="full-code-block" style="max-height:100px; color:#fff;">${fullSafeOutput}</div></div></td>`;

            trMain.addEventListener('click', () => {
                trDetail.classList.toggle('show');
                trMain.classList.toggle('active');
            });
            UI.historyTableBody.appendChild(trMain);
            UI.historyTableBody.appendChild(trDetail);
        });
    } catch (error) {
        UI.historyTableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Hata: ${error}</td></tr>`;
    }
}

function copyToClipboard(btn, text) {
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = "<i class='bx bx-check'></i> Kopyalandı!";
        btn.classList.add('copied');
        setTimeout(() => { btn.innerHTML = originalHTML; btn.classList.remove('copied'); }, 2000);
    }).catch(err => { 
        showToast("Kopyalama başarısız", "error");
    });
    event.stopPropagation(); 
}

/* =========================================
   8. LAYOUT & RESIZING
   ========================================= */

const iframeOverlay = document.createElement('div');
iframeOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;display:none;cursor:row-resize;';
document.body.appendChild(iframeOverlay);

let isResizing = false;

UI.resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'row-resize';
    iframeOverlay.style.display = 'block'; 
    e.preventDefault(); 
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const containerRect = UI.editorArea.getBoundingClientRect();
    const mouseY = e.clientY;
    let newHeight = containerRect.bottom - mouseY - 12;
    const minHeight = 50;
    const maxHeight = containerRect.height - 100;
    if (newHeight >= minHeight && newHeight <= maxHeight) {
        UI.outputPanel.style.height = `${newHeight}px`;
    }
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
        iframeOverlay.style.display = 'none'; 
    }
});

UI.toggleSidebarBtn.addEventListener('click', () => {
    UI.sidebar.classList.toggle('collapsed');
    setTimeout(() => { editor.refresh(); htmlEditor.refresh(); }, 200);
});