const bcrypt = require('bcryptjs');
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// --- VERİTABANI KURULUMU ---
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error("Veritabanı hatası:", err.message);
    } else {
        console.log('SQLite veritabanına bağlanıldı.');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS languages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        image TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS executions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        language_id INTEGER,
        code TEXT,
        output TEXT,
        device_id TEXT, 
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(language_id) REFERENCES languages(id)
    )`);

    const stmt = db.prepare("INSERT OR IGNORE INTO languages (name, image) VALUES (?, ?)");
    stmt.run("python", "python:3.9-alpine");
    stmt.run("c", "gcc:latest");
    stmt.run("html", "web-engine");
    stmt.finalize();
});

// ------------------- API YOLLARI -------------------

app.post('/calistir', (req, res) => {
    
    const { kod, dil, username } = req.body; 
    
    if (!kod || !dil) {
        return res.status(400).json({ sonuc: "Kod veya dil eksik." });
    }

    const userIdentifier = username || 'misafir';

    // --- HTML İÇİN KAYIT ---
    if (dil === 'html') {
        db.get("SELECT id FROM languages WHERE name = ?", ['html'], (err, row) => {
            if (row) {
                const stmt = db.prepare("INSERT INTO executions (language_id, code, output, device_id) VALUES (?, ?, ?, ?)");
                stmt.run(row.id, kod, "Web Önizleme (Görsel Çıktı)", userIdentifier);
                stmt.finalize();
                console.log(`Web projesi veritabanına kaydedildi. Kullanıcı: ${userIdentifier}`);
            }
        });
        return res.json({ sonuc: "Kaydedildi" });
    }

    // --- COMPILER İŞLEMLERİ ---
    const benzersizID = Date.now().toString();
    let dosyaAdi, dockerImage, dockerKomutu;
    const dockerSecurity = '--rm --network none -m 128m';

    if (dil === 'python') {
        dosyaAdi = `temp_${benzersizID}.py`;
        dockerImage = 'python:3.9-alpine';
        dockerKomutu = `python /app/${dosyaAdi}`;
    } else if (dil === 'c') {
        dosyaAdi = `temp_${benzersizID}.c`;
        dockerImage = 'gcc:latest';
        dockerKomutu = `sh -c "gcc /app/${dosyaAdi} -o /app/out && /app/out"`;
    } else {
        return res.json({ sonuc: "Desteklenmeyen dil!" });
    }

    const tamYol = path.join(tempDir, dosyaAdi);

    try {
        fs.writeFileSync(tamYol, kod);
    } catch (err) {
        return res.json({ sonuc: "Sunucu dosya hatası: " + err.message });
    }

    let volumePath = tamYol;
    if (process.platform === 'win32') {
        volumePath = volumePath.replace(/\\/g, '/');
    }

    const finalCommand = `docker run ${dockerSecurity} -v "${volumePath}:/app/${dosyaAdi}" -w /app ${dockerImage} ${dockerKomutu}`;

    console.log(`Çalıştırılıyor: ${dil} - ${benzersizID}. Kullanıcı: ${userIdentifier}`);

    exec(finalCommand, { timeout: 10000 }, (error, stdout, stderr) => {
        try { fs.unlinkSync(tamYol); } catch (e) {}

        let sonuc = stdout;
        if (error) {
            if (error.killed) {
                sonuc = "HATA: İşlem zaman aşımına uğradı.";
            } else {
                sonuc = stderr || error.message;
            }
        }

        // --- VERİTABANINA LOGLAMA ---
        db.get("SELECT id FROM languages WHERE name = ?", [dil], (err, row) => {
            if (row) {
                const logStmt = db.prepare("INSERT INTO executions (language_id, code, output, device_id) VALUES (?, ?, ?, ?)");
                logStmt.run(row.id, kod, sonuc, userIdentifier, (insertErr) => {
                    if (!insertErr) console.log(`İşlem kaydedildi. Kullanıcı: ${userIdentifier}`);
                });
                logStmt.finalize();
            }
        });

        res.json({ sonuc: sonuc });
    });
});

// --- KULLANICI KAYIT (REGISTER) ---
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: "Kullanıcı adı ve şifre gereklidir." });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    stmt.run(username, hashedPassword, function(err) {
        if (err) {
            return res.status(400).json({ error: "Bu kullanıcı adı zaten alınmış." });
        }
        res.json({ success: true, message: "Kayıt başarılı! Giriş yapabilirsiniz." });
    });
    stmt.finalize();
});

// --- KULLANICI GİRİŞ (LOGIN) ---
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: "Kullanıcı bulunamadı." });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ error: "Hatalı şifre!" });
        }

        res.json({ success: true, username: user.username, message: "Giriş başarılı." });
    });
});

// --- GEÇMİŞ KAYITLARI GETİRME API ---
app.get('/gecmis', (req, res) => {
    const reqUsername = req.query.username;

    const sql = `
        SELECT 
            executions.id, 
            languages.name as language, 
            executions.code, 
            executions.output, 
            executions.timestamp 
        FROM executions 
        JOIN languages ON executions.language_id = languages.id 
        WHERE executions.device_id = ? 
        ORDER BY executions.timestamp DESC 
        LIMIT 10
    `;

    db.all(sql, [reqUsername], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sunucu http://0.0.0.0:${PORT} adresinde çalışıyor.`);
});