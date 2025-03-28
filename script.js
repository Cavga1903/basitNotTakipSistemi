


// Arama inputuna olay dinleyici
  document.addEventListener("DOMContentLoaded", () => {
    const aramaInput = document.getElementById("aramaInput");
    if (aramaInput) {
      aramaInput.addEventListener("input", listele);
    }
    });
    let aktifFiltre = "tum"; // Başlangıçta tüm öğrenciler gösterilir
    let grafik; // Chart.js instance'ı burada tutulacak


// öğrencileri kayıt eder
function kaydet(ad, soyad, ortalama, durum, notlar) {
    const adSoyad = `${ad} ${soyad}`;
    let ogrenciler = JSON.parse(localStorage.getItem("ogrenciler")) || [];
    const sinif = document.getElementById("sinif").value.trim();
  
    const mevcutIndex = ogrenciler.findIndex(
      o => o.adSoyad.toLowerCase() === adSoyad.toLowerCase()
    );
  
    const yeniOgrenci = {
        ad,
        soyad,
        adSoyad,
        notlar,
        ortalama,
        durum,
        sinif,
        tarih: new Date().toLocaleDateString("tr-TR") // 🇹🇷 örnek: 26.03.2025
      };
  
    if (mevcutIndex !== -1) {
      ogrenciler[mevcutIndex] = yeniOgrenci;
    } else {
      ogrenciler.push(yeniOgrenci);
    }
  
    localStorage.setItem("ogrenciler", JSON.stringify(ogrenciler));
  }
// Kayıtlı öğrencileri sayfada göster
function listele() {
    const liste = document.getElementById("ogrenciListesi");
    const arama = document.getElementById("aramaInput")?.value?.toLowerCase() || "";
    let ogrenciler = JSON.parse(localStorage.getItem("ogrenciler")) || [];
  
    liste.innerHTML = "";
  
    ogrenciler
      .filter(o => o.adSoyad.toLowerCase().includes(arama))
      .filter(o => {
        if (aktifFiltre === "tum") return true;
        if (aktifFiltre === "basarili") return o.durum === "Başarılı 🌟";
        if (aktifFiltre === "gecti") return o.durum === "Geçti ✅" || o.durum === "Başarılı 🌟";
        if (aktifFiltre === "kaldi") return o.durum === "Kaldı ❌";
      })
      .forEach((ogrenci, index) => {
        const li = document.createElement("li");
  
        let arkaPlanRenk = "bg-red-100 dark:bg-red-800";
        if (ogrenci.durum === "Geçti ✅") {
          arkaPlanRenk = "bg-green-100 dark:bg-green-800";
        } else if (ogrenci.durum === "Başarılı 🌟") {
          arkaPlanRenk = "bg-yellow-100 dark:bg-yellow-700 border-4 border-yellow-400";
        }

        let rozet = "";
        let rozetTitle = "";
        if (ogrenci.ortalama >= 85) {
          rozet = "🥇";
          rozetTitle = "Altın Rozet – Üstün Başarı";
        } else if (ogrenci.ortalama >= 70) {
          rozet = "🥈";
          rozetTitle = "Gümüş Rozet – Başarılı";
        } else {
          rozet = "💤";
          rozetTitle = "Geliştirmeye açık";
        }
  
        li.className = `px-4 py-2 border rounded flex justify-between items-center ${arkaPlanRenk}`;
  
        li.innerHTML = `
        <span><strong>${ogrenci.adSoyad}</strong> (${ogrenci.sinif || "Sınıfsız"}) - Ortalama: ${ogrenci.ortalama}</span>
       <!-- Sağda: Dropdown Menü -->
<div class="relative">
  <button onclick="toggleMenu(${index})"
    class="bg-gray-700 hover:bg-gray-800 text-white px-2 py-1 rounded" title="İşlemler">
    ⋮
  </button>
  <div id="menu-${index}" class="absolute right-0 mt-1 bg-white dark:bg-gray-800 border rounded shadow hidden z-10">
    <button onclick="duzenle(${index}); toggleMenu(${index})"
      class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left">Düzenle</button>
    <button onclick="sil(${index}); toggleMenu(${index})"
      class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left">Sil</button>
    <button onclick="pdfOlustur(${index}); toggleMenu(${index})"
      class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left">PDF Al</button>
  </div>
</div>
      `;
  
        liste.appendChild(li);
      });
  }

  function toggleMenu(index) {
    const menu = document.getElementById(`menu-${index}`);
    if (menu) {
      // Diğer açık menüleri kapat
      document.querySelectorAll("[id^='menu-']").forEach(m => {
        if (m !== menu) m.classList.add("hidden");
      });
  
      menu.classList.toggle("hidden");
    }
  }
  
  // Sayfa dışına tıklanınca menü kapansın
  document.addEventListener("click", (e) => {
    const isMenuButton = e.target.closest("button[onclick^='toggleMenu']");
    const isMenuContent = e.target.closest("div[id^='menu-']");
    if (!isMenuButton && !isMenuContent) {
      document.querySelectorAll("[id^='menu-']").forEach(m => m.classList.add("hidden"));
    }
  });

  function pdfOlustur(index) {
    const ogrenciler = JSON.parse(localStorage.getItem("ogrenciler")) || [];
    const ogrenci = ogrenciler[index];
  
    const doc = new window.jspdf.jsPDF();
    const notlar = ogrenci.notlar?.join(", ") || "-";
    const durum = ogrenci.durum || "-";
    const tarih = ogrenci.tarih || "-";
  
    const rozet =
      ogrenci.ortalama >= 85 ? "Altin Rozet, Üstün Basari" :
      ogrenci.ortalama >= 70 ? "Gumus Rozet, Basarili" : "Gelistirmeye Acik"
      ogrenci.ortalama <= 69 ? "Bok Rozet, Kaldi" : "Gelistirilebilir";
  
    doc.setFont("Roboto", "helvetica", "bold"); // Türkçe karakter destekleyen font
    doc.setFontSize(16);
    doc.text(`Ögrenci Raporu`, 10, 15);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Ad Soyad: ${ogrenci.adSoyad}`, 10, 30);
    doc.text(`Notlar: ${notlar}`, 10, 40);
    doc.text(`Ortalama: ${ogrenci.ortalama}`, 10, 50);
    doc.text(`Durum: ${durum}`, 10, 60);
    doc.text(`Eklenme Tarihi: ${tarih}`, 10, 70);
    doc.text(`Rozet: ${rozet}`, 10, 80);
  
    doc.save(`${ogrenci.adSoyad.replace(/\s+/g, "_")}_raporu.pdf`);
  }

// Ortalama hesapla ve kaydet
function hesapla() {
    const ad = document.getElementById("ad").value.trim();
    const soyad = document.getElementById("soyad").value.trim();
    const not1 = Number(document.getElementById("not1").value);
    const not2 = Number(document.getElementById("not2").value);
    const not3 = Number(document.getElementById("not3").value);
    const sonucDiv = document.getElementById("sonuc");
  
    if (
      !ad || !soyad ||
      !/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/.test(ad) ||
      !/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/.test(soyad)
    ) {
      sonucDiv.innerText = "⚠️ Lütfen geçerli bir ad ve soyad girin (sadece harf).";
      return;
    }
  
    if (
      isNaN(not1) || isNaN(not2) || isNaN(not3) ||
      not1 < 0 || not1 > 100 ||
      not2 < 0 || not2 > 100 ||
      not3 < 0 || not3 > 100
    ) {
      sonucDiv.innerText = "⚠️ Notlar 0 ile 100 arasında olmalıdır.";
      return;
    }
  
    const ortalama = ((not1 + not2 + not3) / 3).toFixed(2);
    let durum = "Kaldı ❌";
    if (ortalama >= 70 && ortalama < 85) durum = "Geçti ✅";
    else if (ortalama >= 85) durum = "Başarılı 🌟";
  
    const notlar = [not1, not2, not3];
    kaydet(ad, soyad, ortalama, durum, notlar);
    listele();
    guncelleGrafik();
    gosterToast("Öğrenci başarıyla eklendi ✅");
  }

function duzenle(index) {
    const ogrenciler = JSON.parse(localStorage.getItem("ogrenciler")) || [];
  const ogrenci = ogrenciler[index];

  const liste = document.getElementById("ogrenciListesi");
  const li = liste.children[index];

  li.innerHTML = `
  <div class="flex-1 flex flex-col gap-1">
    <input type="text" id="editAd${index}" value="${ogrenci.ad}" class="p-1 rounded border dark:bg-gray-700 dark:border-gray-600" />
    <input type="text" id="editSoyad${index}" value="${ogrenci.soyad}" class="p-1 rounded border dark:bg-gray-700 dark:border-gray-600" />
    <input type="number" id="editNot1${index}" value="${ogrenci.notlar?.[0] || ''}" placeholder="1. Not" class="p-1 rounded border dark:bg-gray-700 dark:border-gray-600" />
    <input type="number" id="editNot2${index}" value="${ogrenci.notlar?.[1] || ''}" placeholder="2. Not" class="p-1 rounded border dark:bg-gray-700 dark:border-gray-600" />
    <input type="number" id="editNot3${index}" value="${ogrenci.notlar?.[2] || ''}" placeholder="3. Not" class="p-1 rounded border dark:bg-gray-700 dark:border-gray-600" />
  </div>
  <div class="flex gap-2 items-start mt-2">
    <button onclick="kaydetGuncelle(${index})" class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded">💾</button>
    <button onclick="listele()" class="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded">❌</button>
  </div>
`;
  }



function kaydetGuncelle(index) {
    const ad = document.getElementById(`editAd${index}`).value.trim();
    const soyad = document.getElementById(`editSoyad${index}`).value.trim();
    const not1 = Number(document.getElementById(`editNot1${index}`).value);
    const not2 = Number(document.getElementById(`editNot2${index}`).value);
    const not3 = Number(document.getElementById(`editNot3${index}`).value);
  
    // 🛑 Geçerli ad ve soyad kontrolü
    if (
      !ad || !soyad ||
      !/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/.test(ad) ||
      !/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/.test(soyad)
    ) {
      alert("⚠️ Lütfen geçerli bir ad ve soyad girin (sadece harf).");
      return;
    }
  
    // 🛑 Not kontrolü
    if (
      isNaN(not1) || isNaN(not2) || isNaN(not3) ||
      not1 < 0 || not1 > 100 ||
      not2 < 0 || not2 > 100 ||
      not3 < 0 || not3 > 100
    ) {
      alert("⚠️ Notlar 0 ile 100 arasında olmalı.");
      return;
    }
  
    // ✅ Ortalama ve durum hesapla
    const ortalama = ((not1 + not2 + not3) / 3).toFixed(2);
    let durum = "Kaldı ❌";
    if (ortalama >= 70 && ortalama < 85) durum = "Geçti ✅";
    else if (ortalama >= 85) durum = "Başarılı 🌟";
  
    const tamAd = `${ad} ${soyad}`;
  
    // ✅ Güncelle
    let ogrenciler = JSON.parse(localStorage.getItem("ogrenciler")) || [];
  
    ogrenciler[index] = {
        ...ogrenciler[index], // eski tarih dahil
        ad,
        soyad,
        adSoyad: tamAd,
        notlar: [not1, not2, not3],
        ortalama,
        durum
      };
  
    localStorage.setItem("ogrenciler", JSON.stringify(ogrenciler));
  
    // ✅ Ekranı yenile
    listele();
    guncelleGrafik();
    gosterToast("Öğrenci bilgileri güncellendi ✏️", "bg-yellow-500");
  }

function verileriSifirla() {
    if (confirm("Tüm öğrenci verilerini silmek istiyor musun?")) {
      localStorage.removeItem("ogrenciler");
      listele();
      document.getElementById("sonuc").innerText = "";
    }
    gosterToast("Tüm öğrenciler silindi 🚫", "bg-purple-600");
  }

function filtreleSirala() {
    let ogrenciler = JSON.parse(localStorage.getItem("ogrenciler")) || [];
  
    // ortalamaya göre büyükten küçüğe sırala
    ogrenciler.sort((a, b) => b.ortalama - a.ortalama);
  
    // sadece ortalaması 50+ olanları filtrele (isteğe bağlı)
    // ogrenciler = ogrenciler.filter(o => o.ortalama >= 50);
    
  
    localStorage.setItem("ogrenciler", JSON.stringify(ogrenciler));
    listele();
  }
  
function toggleDarkMode() {
    document.documentElement.classList.toggle("dark");
    listele();
    guncelleGrafik(); // burası kritik ✔️
  }
  
function filtreyiAyarla(tip) {
    aktifFiltre = tip;
    listele();
  }

// chart.js ile grafik kısmı
// Grafik ortasına yazı yazmak için Chart.js custom plugin
const centerTextPlugin = {
    id: "centerText",
    beforeDraw(chart) {
      if (chart.config.options.plugins.centerText?.display) {
        const { ctx, chartArea: { width, height } } = chart;
        const text = chart.config.options.plugins.centerText.text;
  
        ctx.save();
        ctx.font = "bold 18px Arial";
        ctx.fillStyle = document.documentElement.classList.contains("dark") ? "#fff" : "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, chart.getDatasetMeta(0).data[0].x, chart.getDatasetMeta(0).data[0].y);
        
      }
    }
  };

  let grafikModu = "donut"; // varsayılan görünüm

function grafikModuAyarla(mod) {
  grafikModu = mod;
  guncelleGrafik();
}
  
function guncelleGrafik() {
    const ogrenciler = JSON.parse(localStorage.getItem("ogrenciler")) || [];
    const ctx = document.getElementById("grafik").getContext("2d");
  
    if (grafik) grafik.destroy();
  
    // Ortak sayılar (bir kere tanımla)
    const basarili = ogrenciler.filter(o => o.durum === "Başarılı 🌟").length;
    const gecti = ogrenciler.filter(o => o.durum === "Geçti ✅").length;
    const kaldi = ogrenciler.filter(o => o.durum === "Kaldı ❌").length;
    const toplam = ogrenciler.length;
    const oran = toplam > 0 ? Math.round(((basarili + gecti) / toplam) * 100) : 0;
  
    // 🎯 DONUT GRAFİK
    if (grafikModu === "donut") {
      grafik = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Başarılı 🌟", "Geçti ✅", "Kaldı ❌"],
          datasets: [{
            data: [basarili, gecti, kaldi],
            backgroundColor: ["#FACC15", "#22C55E", "#EF4444"],
            borderColor: "#fa9911",
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: getLegendColor(),
                font: { size: 14, weight: "bold" },
              },
            },
            centerText: {
              display: true,
              text: `%${oran}`
            },
          },
        },
        plugins: [centerTextPlugin],
      });
  
    // 📅 TARİH GRAFİĞİ
    } else if (grafikModu === "tarih") {
      const tarihMap = {};
  
      ogrenciler.forEach(o => {
        const tarih = o.tarih || "Bilinmiyor";
        if (!tarihMap[tarih]) {
          tarihMap[tarih] = { basarili: 0, gecti: 0, kaldi: 0 };
        }
        if (o.durum === "Başarılı 🌟") tarihMap[tarih].basarili++;
        else if (o.durum === "Geçti ✅") tarihMap[tarih].gecti++;
        else tarihMap[tarih].kaldi++;
      });
  
      const tarihEtiketleri = Object.keys(tarihMap);
      const dataBasarili = tarihEtiketleri.map(t => tarihMap[t].basarili);
      const dataGecti = tarihEtiketleri.map(t => tarihMap[t].gecti);
      const dataKaldi = tarihEtiketleri.map(t => tarihMap[t].kaldi);
  
      grafik = new Chart(ctx, {
        type: "bar",
        data: {
          labels: tarihEtiketleri,
          datasets: [
            { label: "Başarılı 🌟", data: dataBasarili, backgroundColor: "#FACC15" },
            { label: "Geçti ✅", data: dataGecti, backgroundColor: "#22C55E" },
            { label: "Kaldı ❌", data: dataKaldi, backgroundColor: "#EF4444" },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: getLegendColor(),
                font: { size: 12, weight: "bold" },
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: getLegendColor(),
                maxRotation: 45,
                minRotation: 45,
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
                color: getLegendColor(),
              }
            }
          }
        }
      });
    }
  
    // 🥇 İlk 3 Öğrenci
    const ilkUc = ogrenciler
      .filter(o => o.ortalama)
      .sort((a, b) => b.ortalama - a.ortalama)
      .slice(0, 3);
  
    const ilkUcDiv = document.getElementById("ilkUc");
    ilkUcDiv.innerHTML = ilkUc.map((o, i) => {
      const rozet = ["🥇", "🥈", "🥉"][i];
      return `
        <button onclick="acModal(${JSON.stringify(o).replace(/"/g, '&quot;')})"
          class="block w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1">
          ${rozet} ${i + 1}. <strong>${o.adSoyad}</strong> – ${o.ortalama}
        </button>
      `;
    }).join("");
  
    // 🏆 En Başarılı Öğrenci
    const enIyi = ogrenciler
      .filter(o => o.ortalama)
      .sort((a, b) => b.ortalama - a.ortalama)[0];
  
    const rozetOzetDiv = document.getElementById("rozetOzet");
    rozetOzetDiv.innerHTML = `
      ${enIyi ? `
        <p class="font-semibold text-yellow-600 dark:text-yellow-300 text-center mb-2">
          🏆 En Başarılı Öğrenci: <strong>${enIyi.adSoyad}</strong> (${enIyi.ortalama})
        </p>` : ""
      }
      <p><span class="text-yellow-500 text-xl">🥇</span> ${basarili} öğrenci – Başarılı</p>
      <p><span class="text-green-500 text-xl">🥈</span> ${gecti} öğrenci – Geçti</p>
      <p><span class="text-red-500 text-xl">💤</span> ${kaldi} öğrenci – Kaldı</p>
    `;
  }

  


  function acModal(ogrenci) {
    document.getElementById("modalAdSoyad").innerText = `👤 ${ogrenci.adSoyad}`;
    document.getElementById("modalOrtalama").innerText = `📊 Ortalama: ${ogrenci.ortalama}`;
    document.getElementById("modalNotlar").innerText = `📋 Notlar: ${ogrenci.notlar?.join(", ") || "-"}`;
    document.getElementById("modalDurum").innerText = `✅ Durum: ${ogrenci.durum}`;
    document.getElementById("modalTarih").innerText = `📅 Eklenme: ${ogrenci.tarih || "-"};`;
  
    document.getElementById("ogrenciModal").classList.remove("hidden");
  }
  
  function kapatModal() {
    document.getElementById("ogrenciModal").classList.add("hidden");
  }
  function getLegendColor() {
    return document.documentElement.classList.contains("dark") ? "#fff" : "#000";
  }





function copKutusunuAc() {
    const cop = JSON.parse(localStorage.getItem("copKutusu")) || [];
    const ul = document.getElementById("copListesi");
  
    if (cop.length === 0) {
      ul.innerHTML = "<p class='text-center text-gray-500'>Çöp kutusu boş.</p>";
    } else {
      ul.innerHTML = cop.map((o, i) => `
        <li class="p-2 border rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span>
            <strong>${o.adSoyad}</strong> – Ortalama: ${o.ortalama}  
            <br/><small class="text-sm text-gray-500">🗓️ ${o.silinmeTarihi}</small>
          </span>
          <div class="flex gap-2">
            <button onclick="coptenGeriAl(${i})" class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded">🔁 Geri Al</button>
            <button onclick="coptenKaliciSil(${i})" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">❌ Sil</button>
          </div>
        </li>
      `).join("");
    }
  
    document.getElementById("copModal").classList.remove("hidden");
  }

  function coptenGeriAl(index) {
    const cop = JSON.parse(localStorage.getItem("copKutusu")) || [];
    const ogrenciler = JSON.parse(localStorage.getItem("ogrenciler")) || [];
  
    const geriAlinan = cop.splice(index, 1)[0];
    delete geriAlinan.silinmeTarihi;
  
    ogrenciler.push(geriAlinan);
  
    localStorage.setItem("copKutusu", JSON.stringify(cop));
    localStorage.setItem("ogrenciler", JSON.stringify(ogrenciler));
  
    kapatCopModal();
    listele();
    guncelleGrafik();
    gosterToast("Öğrenci geri alındı ♻️", "bg-green-500");
  }

  function coptenKaliciSil(index) {
    const cop = JSON.parse(localStorage.getItem("copKutusu")) || [];
    cop.splice(index, 1);
    localStorage.setItem("copKutusu", JSON.stringify(cop));
    copKutusunuAc();
    gosterToast("Kalıcı olarak silindi 🧹", "bg-red-600");
  }
  
  function copuTemizle() {
    if (confirm("Tüm çöp kutusu verilerini kalıcı olarak silmek istiyor musun?")) {
      localStorage.removeItem("copKutusu");
      kapatCopModal();
      gosterToast("Çöp kutusu temizlendi 🚮", "bg-purple-600");
    }
  }
  function kapatCopModal() {
    document.getElementById("copModal").classList.add("hidden");
  }






  function sil(index) {
    const ogrenciler = JSON.parse(localStorage.getItem("ogrenciler")) || [];
    const cop = JSON.parse(localStorage.getItem("copKutusu")) || [];
  
    const silinen = ogrenciler.splice(index, 1)[0];
    const silinmeTarihi = new Date().toLocaleString("tr-TR");
  
    // Silinen öğrenciye silinme tarihi ekle
    cop.push({ ...silinen, silinmeTarihi });
  
    // Güncellenmiş verileri localStorage'a geri yaz
    localStorage.setItem("ogrenciler", JSON.stringify(ogrenciler));
    localStorage.setItem("copKutusu", JSON.stringify(cop));
  
    // Sayfayı güncelle
    listele();
    guncelleGrafik();
    gosterToast("Öğrenci çöp kutusuna taşındı 🗑️", "bg-red-500");
  }

function verileriSifirla() {
    if (confirm("Tüm öğrenci verilerini silmek istiyor musun?")) {
      localStorage.removeItem("ogrenciler");
      listele();
      guncelleGrafik();
      document.getElementById("sonuc").innerText = "";
    }
  }

function gosterToast(mesaj, renk = "bg-green-500") {
    const toast = document.getElementById("toast");
    toast.className = `fixed top-4 right-4 text-white px-4 py-2 rounded shadow-lg opacity-0 pointer-events-none transition duration-500 z-50 ${renk}`;
    toast.innerText = mesaj;
  
    // Göster
    toast.classList.add("opacity-100");
    toast.classList.remove("opacity-0");
  
    // 3 saniye sonra gizle
    setTimeout(() => {
      toast.classList.remove("opacity-100");
      toast.classList.add("opacity-0");
    }, 3000);
  }
  function toggleAktarMenu() {
    const menu = document.getElementById("aktarMenu");
    menu.classList.toggle("hidden");
  }
  
  function verileriDisariAktar(format) {
    const ogrenciler = JSON.parse(localStorage.getItem("ogrenciler")) || [];
  
    if (ogrenciler.length === 0) {
      gosterToast("Aktarılacak veri yok!", "bg-red-500");
      return;
    }
  
    if (format === "json") {
      const blob = new Blob([JSON.stringify(ogrenciler)], { type: "application/json" });
      downloadBlob(blob, "ogrenciler.json");
  
    } else if (format === "xml") {
      let xml = `<Ogrenciler>\n`;
      ogrenciler.forEach(o => {
        xml += `  <Ogrenci>\n`;
        for (let key in o) {
          xml += `    <${key}>${o[key]}</${key}>\n`;
        }
        xml += `  </Ogrenci>\n`;
      });
      xml += `</Ogrenciler>`;
      const blob = new Blob([xml], { type: "application/xml" });
      downloadBlob(blob, "ogrenciler.xml");
  
    } else if (format === "excel") {
      const rows = [Object.keys(ogrenciler[0]), ...ogrenciler.map(o => Object.values(o))];
      const csv = rows.map(r => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      downloadBlob(blob, "ogrenciler.csv");
  
    } else if (format === "pdf") {
      const doc = new window.jspdf.jsPDF();
      ogrenciler.forEach((o, i) => {
        doc.text(`${i + 1}. ${o.adSoyad} | Notlar: ${o.notlar?.join(", ")} | Ortalama: ${o.ortalama} | ${o.durum}`, 10, 10 + i * 10);
      });
      doc.save("ogrenciler.pdf");
    }
  
    toggleAktarMenu();
  }


  async function verileriZiple() {
    const zip = new JSZip();
  
    // 1. Öğrenci verisini al
    const ogrenciler = localStorage.getItem("ogrenciler") || "[]";
    zip.file("veri.json", ogrenciler);
  
    // 2. Grafik görselini al
    const canvas = document.getElementById("grafik");
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  
    zip.file("grafik.png", blob);
  
    // 3. Zip dosyasını oluştur ve indir
    zip.generateAsync({ type: "blob" }).then(zipBlob => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `yedek_${new Date().toLocaleDateString("tr-TR")}.zip`;
      link.click();
    });
  }

  async function ziptenVeriYukle(event) {
    const dosya = event.target.files[0];
    if (!dosya || !dosya.name.endsWith(".zip")) {
      gosterToast("Lütfen geçerli bir ZIP dosyası seçin", "bg-red-600");
      return;
    }
  
    const zip = await JSZip.loadAsync(dosya);
  
    if (!zip.files["veri.json"]) {
      gosterToast("ZIP içinde 'veri.json' bulunamadı ❌", "bg-red-600");
      return;
    }
  
    const jsonStr = await zip.files["veri.json"].async("string");
  
    try {
      const veriler = JSON.parse(jsonStr);
      localStorage.setItem("ogrenciler", JSON.stringify(veriler));
      gosterToast("Veriler yedekten yüklendi 📥");
      listele();
      guncelleGrafik();
    } catch (e) {
      gosterToast("Veriler yüklenirken hata oluştu ⚠️", "bg-red-600");
    }
  }

  
  function verileriIceriAktar(event) {
    const dosya = event.target.files[0];
    if (!dosya) return;
  
    const uzanti = dosya.name.split('.').pop().toLowerCase();
    const reader = new FileReader();
  
    reader.onload = function (e) {
      try {
        let veriler = [];
  
        if (uzanti === "json") {
          veriler = JSON.parse(e.target.result);
  
        } else if (uzanti === "xml") {
          const xmlDoc = new DOMParser().parseFromString(e.target.result, "text/xml");
          const ogrenciler = xmlDoc.getElementsByTagName("ogrenci");
  
          for (let o of ogrenciler) {
            const ad = o.getElementsByTagName("ad")[0].textContent;
            const soyad = o.getElementsByTagName("soyad")[0].textContent;
            const notlar = o.getElementsByTagName("notlar")[0].textContent.split(',').map(Number);
            const ortalama = Number(o.getElementsByTagName("ortalama")[0].textContent);
            const durum = o.getElementsByTagName("durum")[0].textContent;
            const tarih = o.getElementsByTagName("tarih")[0]?.textContent || "";
  
            veriler.push({ ad, soyad, notlar, ortalama, durum, adSoyad: `${ad} ${soyad}`, tarih });
          }
  
        } else if (uzanti === "csv") {
          const satirlar = e.target.result.split('\n').filter(s => s.trim());
          for (let i = 1; i < satirlar.length; i++) {
            const [ad, soyad, not1, not2, not3, ortalama, durum, tarih] = satirlar[i].split(',');
  
            veriler.push({
              ad,
              soyad,
              adSoyad: `${ad} ${soyad}`,
              notlar: [Number(not1), Number(not2), Number(not3)],
              ortalama: Number(ortalama),
              durum,
              tarih: tarih || ""
            });
          }
  
        } else {
          alert("Geçersiz dosya formatı! JSON, XML veya CSV desteklenir.");
          return;
        }
  
        if (!Array.isArray(veriler)) throw new Error("Veriler uygun değil");
  
        localStorage.setItem("ogrenciler", JSON.stringify(veriler));
        gosterToast("Veriler başarıyla içe aktarıldı 📥");
        listele();
        guncelleGrafik();
      } catch (err) {
        gosterToast("❌ Dosya işlenemedi. Lütfen kontrol edin.", "bg-red-600");
      }
    };
  
    reader.readAsText(dosya);
  }
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }


  const saat = new Date().getHours();
if (saat >= 20 || saat < 6) {
  document.documentElement.classList.add("dark");
}

  
    // Butonlar ve başlıklar
    document.getElementById("temaBtn").innerText = "🌗 " + ceviri.tema;
    document.getElementById("aramaInput").placeholder = ceviri.ogrenciArama;
    document.getElementById("listeBasligi").innerText = ceviri.listeBasligi;
    document.getElementById("grafikBasligi").innerText = ceviri.grafikBasligi;
  
    // Bayrak seçimi vurgusu
    document.querySelectorAll("[data-dil]").forEach(btn => {
      btn.classList.remove("ring-2", "ring-blue-500");
    });
    document.querySelector(`[data-dil="${lang}"]`)?.classList.add("ring-2", "ring-blue-500");

  // 🌐 Dil verisi
const diller = {
    tr: {
      ogrenciTakipBasligi: "Öğrenci Not Takip Sistemi",
      ortalama: "Ortalama Hesapla",
      studentList: "Öğrenci Listesi",
      ogrenciArama: "Öğrenci Ara...",
      tumu: "Tümü",
      basarili: "Başarılı 🌟",
      gecti: "Geçti ✅",
      kaldi: "Kaldı ❌",
      copKutusu: "Çöp Kutusu",
      tumVerileriSil: "🗑️ Tüm Verileri Sil",
      sirala: "📊 Sırala",
      disaAktar: "📤 Veri Dışa Aktar",
      iceAktar: "📥 Verileri İçe Aktar",
      grafikBasligi: "Başarı Grafiği",
      genelGrafik: "🎯 Genel Grafik",
      tarihliGrafik: "📆 Tarihli Grafik"
    },
    en: {
      ogrenciTakipBasligi: "Student Grade Tracker",
      ortalama: "Calculate Average",
      studentList: "Student List",
      ogrenciArama: "Search Student...",
      tumu: "All",
      basarili: "Successful 🌟",
      gecti: "Passed ✅",
      kaldi: "Failed ❌",
      copKutusu: "Trash",
      tumVerileriSil: "🗑️ Delete All",
      sirala: "📊 Sort",
      disaAktar: "📤 Export Data",
      iceAktar: "📥 Import Data",
      grafikBasligi: "Success Chart",
      genelGrafik: "🎯 General Chart",
      tarihliGrafik: "📆 Chart by Date"
    }
  };
  
  // 🌍 Uygula
  function dilleriUygula(lang) {
    const ceviri = diller[lang];
  
    if (!ceviri) return;
  
    document.getElementById("ogrenciTakipBasligi").innerText = ceviri.ogrenciTakipBasligi;
    document.getElementById("ortalama").innerText = ceviri.ortalama;
    document.getElementById("studentList").innerText = ceviri.studentList;
    document.getElementById("aramaInput").placeholder = ceviri.ogrenciArama;
    document.getElementById("tumu").innerText = ceviri.tumu;
    document.getElementById("basarili").innerText = ceviri.basarili;
    document.getElementById("gecti").innerText = ceviri.gecti;
    document.getElementById("kaldi").innerText = ceviri.kaldi;
    document.getElementById("grafikBasligi").innerText = ceviri.grafikBasligi;
    document.getElementById("genelGrafik").innerText = ceviri.genelGrafik;
    document.getElementById("tarihliGrafik").innerText = ceviri.tarihliGrafik;
    document.querySelector("button[onclick='copKutusunuAc()']").innerText = "♻️ " + ceviri.copKutusu;
    document.querySelector("button[onclick='verileriSifirla()']").innerText = ceviri.tumVerileriSil;
    document.querySelector("button[onclick='filtreleSirala()']").innerText = ceviri.sirala;
    document.getElementById("disaAktar").innerText = ceviri.disaAktar;
    document.getElementById("iceAktar").innerText = ceviri.iceAktar;
  }
  
  // 🌐 Butona tıklanınca çalışır
  function dilDegistir(lang) {
    localStorage.setItem("aktifDil", lang);
    dilleriUygula(lang);
  
    // Buton seçimi vurgusu
    document.querySelectorAll("[data-dil]").forEach(btn => {
      btn.classList.remove("ring-2", "ring-blue-500");
    });
    document.querySelector(`[data-dil="${lang}"]`)?.classList.add("ring-2", "ring-blue-500");
  }



  window.onload = () => {
    // 🕗 Saat kontrolü — Akşam 19:00'dan sabah 09:00'a kadar otomatik dark mode aktif edilir
    const saat = new Date().getHours();
    const html = document.documentElement;
  
    if (saat >= 19 || saat < 9) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark"); // Gündüz ise açık modda kal
    }
  
    // 📋 Sayfa verilerini başlat
    listele();
    guncelleGrafik();
  
    // 🔍 Arama çubuğu dinleyici
    const aramaInput = document.getElementById("aramaInput");
    if (aramaInput) {
      aramaInput.addEventListener("input", listele);
    }
  
    // 🌍 Varsayılan dili uygula
    const aktifDil = localStorage.getItem("aktifDil") || "tr";
  dilleriUygula(aktifDil);
  document.querySelector(`[data-dil="${aktifDil}"]`)?.classList.add("ring-2", "ring-blue-500");
  };