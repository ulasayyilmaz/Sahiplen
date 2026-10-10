// All user-facing Turkish strings. Components must not hardcode UI text.

import type { AgeGroup } from "@/lib/dogs/age";
import type { DogSex, DogSize } from "@/lib/dogs/types";

export const tr = {
  site: {
    name: "Sahiplen",
    tagline: "Barınaklardaki köpeklere bir yuva bul",
    description:
      "Türkiye'deki belediye barınaklarında yuva bekleyen köpekleri şehir, boyut, cinsiyet ve yaşa göre ara.",
    skipToContent: "İçeriğe geç",
    demoNotice: "Bu sitedeki tüm barınak ve köpek bilgileri örnek verilerdir.",
  },

  gallery: {
    heading: "Yuva bekleyen köpekler",
    resultCount: (count: number) => `${count} köpek bulundu`,
    emptyTitle: "Bu kriterlere uyan köpek bulunamadı",
    emptyBody: "Filtreleri değiştirerek ya da temizleyerek yeniden deneyebilirsin.",
    pageOutOfRangeTitle: "Bu sayfada köpek yok",
    goToFirstPage: "İlk sayfaya dön",
    loading: "Köpekler yükleniyor…",
  },

  filters: {
    heading: "Filtreler",
    city: "Şehir",
    size: "Boyut",
    sex: "Cinsiyet",
    age: "Yaş",
    any: "Tümü",
    submit: "Filtrele",
    clear: "Filtreleri temizle",
  },

  pagination: {
    label: "Sayfalar",
    previous: "Önceki sayfa",
    next: "Sonraki sayfa",
    status: (page: number, totalPages: number) => `Sayfa ${page} / ${totalPages}`,
  },

  dog: {
    photoAlt: (name: string) => `${name} adlı köpeğin fotoğrafı`,
    noPhotoAlt: (name: string) => `${name} için henüz fotoğraf yok`,
    noPhoto: "Fotoğraf yok",
    shelter: "Barınak",
    sizes: {
      small: "Küçük",
      medium: "Orta",
      large: "Büyük",
    } satisfies Record<DogSize, string>,
    sexes: {
      male: "Erkek",
      female: "Dişi",
      unknown: "Cinsiyeti bilinmiyor",
    } satisfies Record<DogSex, string>,
    ageGroups: {
      puppy: "Yavru (1 yaş altı)",
      young: "Genç (1–3 yaş)",
      adult: "Yetişkin (3–8 yaş)",
      senior: "Yaşlı (8 yaş üstü)",
    } satisfies Record<AgeGroup, string>,
    age: {
      newborn: "1 aylıktan küçük",
      months: (months: number) => `${months} aylık`,
      years: (years: number) => `${years} yaşında`,
    },
  },

  error: {
    title: "Bir şeyler ters gitti",
    body: "Köpekleri yüklerken bir sorun oluştu. Lütfen biraz sonra tekrar dene.",
    genericBody: "Sayfa yüklenirken bir sorun oluştu. Lütfen biraz sonra tekrar dene.",
    retry: "Tekrar dene",
  },

  notFound: {
    title: "Sayfa bulunamadı",
    body: "Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.",
    home: "Ana sayfaya dön",
  },

  nav: {
    label: "Ana menü",
    staffLogin: "Barınak girişi",
    panel: "Panel",
    admin: "Yönetim",
    logout: "Çıkış yap",
  },

  form: {
    required: "Bu alan zorunlu.",
    saving: "Kaydediliyor…",
    sending: "Gönderiliyor…",
    genericError: "Bir sorun oluştu. Lütfen biraz sonra tekrar dene.",
    fixErrors: "Lütfen işaretli alanları düzelt.",
  },

  auth: {
    fields: {
      fullName: "Ad soyad",
      phone: "Telefon",
      email: "E-posta",
      password: "Şifre",
      newPassword: "Yeni şifre",
      shelter: "Çalıştığın barınak",
      chooseShelter: "Barınağını seç",
    },
    hints: {
      password: "En az 8 karakter.",
      phone: "Kaydını onaylamadan önce seni arayabiliriz.",
      shelterMissing:
        "Barınağın listede yoksa kayıt olmadan önce platform yöneticisiyle iletişime geç.",
    },
    errors: {
      fullName: "Adını ve soyadını yaz.",
      phone: "Geçerli bir telefon numarası yaz.",
      email: "Geçerli bir e-posta adresi yaz.",
      passwordTooShort: "Şifre en az 8 karakter olmalı.",
      passwordTooLong: "Şifre en fazla 72 karakter olabilir.",
      shelter: "Listeden barınağını seç.",
      invalidCredentials: "E-posta ya da şifre hatalı.",
      emailNotConfirmed:
        "E-posta adresin henüz doğrulanmadı. Kayıttan sonra gönderdiğimiz bağlantıya tıkla.",
      weakPassword: "Bu şifre çok zayıf ya da bilinen bir şifre. Başka bir şifre seç.",
      samePassword: "Yeni şifre eskisinden farklı olmalı.",
      rateLimit: "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar dene.",
      emailNotAuthorized:
        "Bu adrese şu an e-posta gönderilemiyor. Lütfen platform yöneticisiyle iletişime geç.",
      linkInvalid:
        "Bağlantı geçersiz ya da süresi dolmuş. Lütfen yeniden giriş yap ya da yeni bağlantı iste.",
    },
    login: {
      title: "Barınak personeli girişi",
      submit: "Giriş yap",
      forgotPassword: "Şifremi unuttum",
      noAccount: "Hesabın yok mu?",
      signUpLink: "Kayıt ol",
    },
    signUp: {
      title: "Barınak personeli kaydı",
      intro:
        "Barınağının köpeklerini sitede yayınlamak için kayıt ol. Kaydın, platform yöneticisi onayladıktan sonra aktif olur.",
      submit: "Kayıt ol",
      haveAccount: "Zaten hesabın var mı?",
      loginLink: "Giriş yap",
      checkEmail:
        "Kaydın alındı. E-posta adresine bir doğrulama bağlantısı gönderdik; hesabını etkinleştirmek için bağlantıya tıkla.",
    },
    forgot: {
      title: "Şifremi unuttum",
      intro: "E-posta adresini yaz, şifreni yenilemen için bir bağlantı gönderelim.",
      submit: "Bağlantı gönder",
      sent: "Bu adrese kayıtlı bir hesap varsa şifre yenileme bağlantısı gönderdik. E-postanı kontrol et.",
      backToLogin: "Girişe dön",
    },
    reset: {
      title: "Yeni şifre belirle",
      submit: "Şifreyi kaydet",
      noSession:
        "Şifre yenileme bağlantısı geçersiz ya da süresi dolmuş. Lütfen yeni bir bağlantı iste.",
      requestNew: "Yeni bağlantı iste",
    },
  },

  admin: {
    title: "Yönetim",
    pending: {
      heading: (count: number) => `Onay bekleyen kayıtlar (${count})`,
      empty: "Onay bekleyen kayıt yok.",
      signedUp: (date: string) => `Kayıt: ${date}`,
      emailUnconfirmed: "E-posta henüz doğrulanmadı",
      assignShelter: "Atanacak barınak",
      approve: "Onayla",
      reject: "Reddet ve sil",
      rejectConfirm: (name: string) =>
        `${name} adlı kişinin kaydı silinecek. Bu işlem geri alınamaz. Emin misin?`,
    },
    staff: {
      heading: (count: number) => `Personel (${count})`,
      empty: "Henüz onaylı personel yok.",
      shelter: "Barınak",
      saveShelter: "Barınağı değiştir",
      revoke: "Yetkiyi kaldır",
      revokeConfirm: (name: string) =>
        `${name} artık köpekleri düzenleyemeyecek ve onay bekleyenler listesine dönecek. Emin misin?`,
      adminBadge: "Platform yöneticisi",
      you: "(sen)",
    },
    shelters: {
      heading: (count: number) => `Barınaklar (${count})`,
      add: "Yeni barınak ekle",
      edit: "Düzenle",
      newTitle: "Yeni barınak",
      editTitle: "Barınağı düzenle",
      back: "Yönetime dön",
      save: "Kaydet",
      saved: "Barınak kaydedildi.",
      fields: {
        name: "Barınak adı",
        city: "Şehir",
        district: "İlçe",
        phone: "Telefon",
        address: "Adres",
        visitingHours: "Ziyaret saatleri",
        latitude: "Enlem",
        longitude: "Boylam",
      },
      hints: {
        city: "Mevcut bir şehri seçebilir ya da yenisini yazabilirsin. Filtrede bu ad görünür.",
        coordinates: "İsteğe bağlı. Ondalık derece, örn. 41.0082 / 28.9784.",
      },
      errors: {
        name: "Barınak adını yaz.",
        city: "Şehri yaz.",
        district: "İlçeyi yaz.",
        latitude: "Enlem -90 ile 90 arasında bir sayı olmalı.",
        longitude: "Boylam -180 ile 180 arasında bir sayı olmalı.",
        tooLong: "Çok uzun.",
      },
    },
    phone: "Telefon",
    email: "E-posta",
    actionFailed: "İşlem yapılamadı. Sayfayı yenileyip tekrar dene.",
  },

  panel: {
    title: "Panel",
    welcome: (name: string) => `Hoş geldin, ${name}`,
    shelterLabel: "Barınak",
    pendingTitle: "Kaydın onay bekliyor",
    pendingBody:
      "Platform yöneticisi kaydını onayladığında barınağının köpeklerini buradan yönetebileceksin. Bu genellikle birkaç gün sürer.",
    requestedShelter: (name: string) => `Seçtiğin barınak: ${name}`,
    noShelter: "Hesabına henüz bir barınak atanmamış.",
    adminHint:
      "Platform yöneticisi olarak personel onaylarını ve barınakları Yönetim sayfasından yönetebilirsin.",
  },
} as const;
