Cloud Compiler: Bulut Tabanlı Kod Derleme Sistemi
Bu proje, kullanıcıların herhangi bir yerel kurulum yapmadan tarayıcı üzerinden kod yazıp derleyebilmelerini sağlayan SaaS (Software as a Service) tabanlı bir web uygulamasıdır. Sistem, kodları güvenli ve izole bir ortamda çalıştırmak için sanallaştırma teknolojilerini kullanır.

Temel Özellikler
Çoklu Dil Desteği: Python 3.9, C (GCC) ve Web Teknolojileri (HTML/CSS/JS) desteği.

Güvenli Yürütme: Sunucu tarafında çalıştırılan kodlar (Python ve C), Docker konteynerleri içerisinde ana sistemden tamamen izole edilir.

Web Önizleme: HTML, CSS ve JavaScript kodları için sunucuya yük bindirmeden tarayıcı tabanlı (Client-Side) anlık önizleme sunar.

Kullanıcı Yönetimi: Üyelik sistemi sayesinde kullanıcılar giriş yapabilir ve geçmişte çalıştırdıkları kodları kayıt altında tutabilir.

Mobil Uyumluluk: Responsive tasarım sayesinde mobil cihazlardan da kod yazımı ve derleme işlemi yapılabilir.

Kullanılan Teknolojiler ve Mimari
Proje, modern web teknolojileri ve konteynerizasyon altyapısı üzerine inşa edilmiştir.

Backend (Sunucu Tarafı)
Node.js & Express: REST API yapısı ve asenkron sunucu yönetimi.

Child Process: Sistem komutlarını yürüterek Docker ile iletişim kurma.

Sanallaştırma (Virtualization)
Docker: Kodların çalıştırılması için geçici ve izole ortamlar (Container) sağlar.

Alpine Linux: Python ve GCC imajları için minimum boyutlu Linux dağıtımı kullanılarak performans optimize edilmiştir.

Güvenlik: Konteynerler internet erişimi kısıtlanmış (--network none) ve bellek limitli (-m 128m) olarak çalıştırılır.

Veritabanı
SQLite: Kullanıcı bilgileri (hashlenmiş parolalar) ve kod çalışma geçmişini (Logs) saklamak için dosya tabanlı ilişkisel veritabanı.

Frontend (İstemci Tarafı)
HTML5, CSS3, JavaScript: Arayüz tasarımı ve API iletişimi.

CodeMirror: Tarayıcı içinde sözdizimi vurgulama (syntax highlighting) ve kod düzenleme özellikleri sağlayan editör kütüphanesi.

Kurulum ve Çalıştırma (Local)
Projeyi kendi bilgisayarınızda çalıştırmak için Node.js ve Docker Desktop kurulu olmalıdır.

Proje dosyalarını indirin ve terminali proje dizininde açın.

Gerekli Node.js paketlerini yükleyin: npm install

Uygulamayı başlatın: node server.js

Tarayıcıdan şu adrese gidin: http://localhost:3000
