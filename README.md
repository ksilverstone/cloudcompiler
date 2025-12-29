# Cloud Compiler: Bulut Tabanlı Kod Derleme Sistemi

Bu proje, kullanıcıların yerel bilgisayarlarına herhangi bir derleyici veya geliştirme ortamı kurmadan, tarayıcı üzerinden kod yazıp çalıştırabilmelerini sağlayan bir SaaS (Software as a Service) çözümüdür. Sistem, kod güvenliğini ve kaynak izolasyonunu sağlamak amacıyla Docker konteyner teknolojisi üzerine inşa edilmiştir.

## Proje Hakkında

Cloud Compiler, özellikle eğitim ve hızlı prototipleme süreçleri için tasarlanmıştır. Kullanıcı tarafından gönderilen kodlar, sunucu tarafında anlık olarak oluşturulan sanal ortamlarda derlenir. Bu yaklaşım, "Bulut Bilişim" ve "Sanallaştırma" prensiplerini temel alarak, donanım bağımsız ve güvenli bir kodlama deneyimi sunar.

## Temel Özellikler

* **Çoklu Dil Desteği:** Python 3.9, C (GCC) ve Web (HTML/CSS/JS) dillerini destekler.
* **İzole Çalışma Ortamı:** Her kod parçacığı, ana sunucudan yalıtılmış geçici Docker konteynerlerinde çalıştırılır.
* **Web Önizleme:** Web teknolojileri için sunucu yükü oluşturmadan istemci taraflı (Client-Side) anlık render işlemi yapar.
* **Kullanıcı Yönetimi:** Üyelik sistemi ile kullanıcıların geçmiş kod çalıştırma kayıtları veritabanında saklanır.
* **Responsive Arayüz:** CodeMirror entegrasyonu ile mobil ve masaüstü cihazlarda tam uyumlu kod editörü deneyimi sunar.

## Kullanılan Teknolojiler

Proje mimarisi aşağıdaki teknoloji yığını (Tech Stack) kullanılarak geliştirilmiştir:

### Backend ve Sunucu
* **Node.js & Express:** Uygulamanın REST API altyapısını ve asenkron istek yönetimini sağlar.
* **Child Process:** Sunucu ile Docker motoru arasındaki komut iletişimini yönetir.

### Sanallaştırma ve Güvenlik
* **Docker:** Kodların çalıştırılması için gerekli sanal ortamı sağlar.
* **Alpine Linux:** Python ve C derleyicileri için minimum kaynak tüketen, hafif Linux dağıtımları tercih edilmiştir.
* **Güvenlik Protokolleri:**
    * Network Isolation: Konteynerlerin internet erişimi kapatılmıştır.
    * Resource Limiting: Her işlem için RAM ve CPU kullanımı sınırlandırılmıştır.
    * Auto-Destruction: İşlemi biten konteynerler otomatik olarak imha edilir.

### Veritabanı
* **SQLite:** Kullanıcı kimlik bilgileri ve işlem loglarının tutulması için dosya tabanlı, hafif ilişkisel veritabanı.

### Frontend
* **HTML5 / CSS3 / JavaScript:** Kullanıcı arayüzü ve API entegrasyonu.
* **CodeMirror:** Tarayıcı tabanlı gelişmiş kod editörü bileşeni.

## Kurulum ve Çalıştırma

Projeyi yerel ortamda çalıştırmak için sisteminizde Node.js ve Docker Desktop uygulamasının kurulu olması gerekmektedir.

1.  **Bağımlılıkları Yükleyin:**
    Proje dizininde terminali açarak gerekli paketleri indirin.
    ```bash
    npm install
    ```

2.  **Uygulamayı Başlatın:**
    Sunucuyu ayağa kaldırın.
    ```bash
    node server.js
    ```

3.  **Erişim:**
    Tarayıcınızdan aşağıdaki adrese giderek uygulamayı kullanabilirsiniz.
    `http://localhost:3000`

## Proje Sahibi

* **Geliştirici:** [Adınız Soyadınız]
* **Bölüm:** Bilişim Sistemleri Mühendisliği
