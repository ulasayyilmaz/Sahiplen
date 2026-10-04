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
    retry: "Tekrar dene",
  },
} as const;
