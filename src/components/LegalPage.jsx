import { useParams } from 'react-router-dom';

// Legal/info pages for AdSense compliance: Privacy Policy, Disclaimer, About.
const SHELL = {
  maxWidth: 720, margin: '0 auto', padding: '32px 16px 60px',
  color: 'var(--color-text)', lineHeight: 1.8, fontSize: 14.5,
};

function H({ children }) {
  return <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '26px 0 8px' }}>{children}</h2>;
}
function P({ children }) {
  return <p style={{ color: 'var(--color-text-muted)', marginBottom: 10 }}>{children}</p>;
}

export default function LegalPage() {
  const { page } = useParams();

  if (page === 'privacy') {
    return (
      <div style={SHELL}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Kebijakan Privasi</h1>
        <P>Terakhir diperbarui: 26 Oktober 2026</P>
        <P>
          Nusanime ("kami") menghargai privasi pengunjung. Kebijakan ini menjelaskan data apa yang
          dikumpulkan dan bagaimana penggunaannya saat kamu mengakses nusanime.web.id.
        </P>
        <H>Informasi yang Kami Kumpulkan</H>
        <P>
          Kami tidak meminta akun ataupun data pribadi untuk menggunakan situs ini. Data teknis
          standar (seperti jenis perangkat, browser, dan halaman yang dikunjungi) dapat dikumpulkan
          secara otomatis oleh server dan layanan analitik/iklan pihak ketiga.
        </P>
        <H>Cookie & Iklan Pihak Ketiga</H>
        <P>
          Situs ini menampilkan iklan yang disajikan oleh Google AdSense. Google, sebagai pihak
          ketiga, menggunakan cookie untuk menayangkan iklan berdasarkan kunjungan kamu ke situs
          ini dan situs lain. Kamu dapat menonaktifkan iklan yang dipersonalisasi melalui
          Pengaturan Iklan Google (google.com/settings/ads).
        </P>
        <H>Penyimpanan Lokal</H>
        <P>
          Riwayat tontonan dan preferensi tema disimpan di perangkat kamu (localStorage) dan tidak
          pernah dikirim ke server kami.
        </P>
        <H>Kontak</H>
        <P>Pertanyaan tentang kebijakan ini dapat disampaikan melalui halaman kontak kami.</P>
      </div>
    );
  }

  if (page === 'disclaimer') {
    return (
      <div style={SHELL}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Disclaimer</h1>
        <P>Terakhir diperbarui: 26 Oktober 2026</P>
        <H>Sumber Informasi</H>
        <P>
          Nusanime adalah ensiklopedia informasi anime. Data judul, skor, studio, sinopsis, dan
          daftar episode pada situs ini bersumber dari MyAnimeList (melalui API publik Jikan) serta
          penyedia metadata anime lain. Semua merek dagang dan hak cipta terkait anime adalah milik
          pemegang hak masing-masing.
        </P>
        <H>Tautan Eksternal</H>
        <P>
          Situs ini dapat mengarahkan pengunjung ke domain terpisah untuk fitur tertentu. Kami tidak
          bertanggung jawab atas konten, kebijakan, atau praktik situs pihak ketiga tersebut.
        </P>
        <H>Akurasi Informasi</H>
        <P>
          Kami berupaya menampilkan informasi yang akurat dan terkini, namun tidak menjamin
          kebenaran penuh dari seluruh data yang ditampilkan.
        </P>
      </div>
    );
  }

  // about
  return (
    <div style={SHELL}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Tentang Nusanime</h1>
      <P>
        Nusanime (nusanime.web.id) adalah situs ensiklopedia anime berbahasa Indonesia: daftar
        anime A-Z, skor, studio pembuat, sinopsis, dan informasi episode — disusun rapi agar mudah
        dijelajahi seperti situs database anime pada umumnya.
      </P>
      <H>Apa yang Bisa Kamu Lakukan di Sini</H>
      <P>
        Menjelajah ribuan judul anime berdasarkan huruf A-Z, membaca profil lengkap setiap anime
        (studio, skor, tanggal tayang, genre, sinopsis), dan melihat daftar episode lengkap 1 sampai
        selesai. Untuk menonton, tersedia tautan menuju situs streaming kami di
        anime.nusanime.web.id.
      </P>
      <H>Kontak</H>
      <P>
        Ada saran atau koreksi data? Hubungi kami melalui Telegram resmi Nusanime.
      </P>
    </div>
  );
}
