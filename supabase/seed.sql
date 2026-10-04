-- Fake seed data for development and the iteration-1 gallery.
-- All shelters, contacts and dogs are invented. Applied once to the remote
-- project with `npm run db:push` (supabase db push --include-seed).
--
-- Fixed IDs make the data easy to reference in tests:
--   shelters: a0000000-0000-4000-8000-0000000000NN (NN = 01..06)
--   dogs:     d0000000-0000-4000-8000-0000000000NN (NN = 01..50)
-- Dogs 01–42 are available. Dogs 43–50 are hidden from the public:
--   43–44 reserved, 45–47 adopted, 48–49 deceased, 50 transferred.
-- Birth dates are relative to current_date so every age group stays populated.

-- ---------------------------------------------------------------------------
-- Shelters
-- ---------------------------------------------------------------------------

insert into public.shelters (id, name, city, district, latitude, longitude, phone, address, visiting_hours)
values
  ('a0000000-0000-4000-8000-000000000001', 'Patili Dostlar Barınağı (Örnek)', 'İstanbul', 'Kadıköy',
   40.9906, 29.0286, '0216 555 01 01', 'Örnek Mah. Barınak Sok. No: 1, Kadıköy/İstanbul',
   'Hafta içi 10:00–16:00, Cumartesi 10:00–14:00'),
  ('a0000000-0000-4000-8000-000000000002', 'Umut Yuvası Hayvan Bakımevi (Örnek)', 'İstanbul', 'Sarıyer',
   41.1667, 29.0500, '0212 555 01 02', 'Örnek Mah. Orman Yolu No: 12, Sarıyer/İstanbul',
   'Her gün 11:00–17:00'),
  ('a0000000-0000-4000-8000-000000000003', 'Can Dostlar Barınağı (Örnek)', 'Ankara', 'Çankaya',
   39.9179, 32.8627, '0312 555 02 01', 'Örnek Mah. Park Cad. No: 5, Çankaya/Ankara',
   'Hafta içi 09:30–16:30'),
  ('a0000000-0000-4000-8000-000000000004', 'Mutlu Kuyruklar Bakımevi (Örnek)', 'Ankara', 'Yenimahalle',
   39.9667, 32.8000, '0312 555 02 02', 'Örnek Mah. Bahçe Sok. No: 8, Yenimahalle/Ankara',
   'Salı–Pazar 10:00–16:00'),
  ('a0000000-0000-4000-8000-000000000005', 'Ege Patiler Barınağı (Örnek)', 'İzmir', 'Bornova',
   38.4697, 27.2211, '0232 555 03 01', 'Örnek Mah. Zeytin Sok. No: 3, Bornova/İzmir',
   'Hafta içi 10:00–17:00, hafta sonu 11:00–15:00'),
  ('a0000000-0000-4000-8000-000000000006', 'Körfez Hayvan Yaşam Merkezi (Örnek)', 'İzmir', 'Karşıyaka',
   38.4561, 27.1104, '0232 555 03 02', 'Örnek Mah. Sahil Cad. No: 21, Karşıyaka/İzmir',
   'Her gün 10:00–16:00');

-- ---------------------------------------------------------------------------
-- Dogs
-- ---------------------------------------------------------------------------

insert into public.dogs (
  id, shelter_id, name, sex, size, color, estimated_birth_date, neutered, vaccinated,
  good_with_kids, good_with_dogs, good_with_cats, energy_level, health_notes, description,
  microchip_number, capture_district, status, created_at
)
select
  ('d0000000-0000-4000-8000-' || lpad(v.n::text, 12, '0'))::uuid,
  ('a0000000-0000-4000-8000-' || lpad(v.shelter::text, 12, '0'))::uuid,
  v.name,
  v.sex::public.dog_sex,
  v.size::public.dog_size,
  v.color,
  (current_date - v.age::interval)::date,
  v.neutered,
  v.vaccinated,
  v.kids::boolean,
  v.dogs::boolean,
  v.cats::boolean,
  v.energy::smallint,
  v.health,
  v.description,
  v.chip,
  v.capture,
  v.status::public.dog_status,
  now() - make_interval(hours => v.n * 7)
from (
  values
    -- n, shelter, name, sex, size, color, age, neutered, vaccinated, kids, dogs, cats, energy, health, description, chip, capture, status
    (1, 1, 'Karabaş', 'male', 'large', 'siyah-krem', '4 years', true, true, true, true, null, 2, null, 'Sakin ve sadık bir dev. Uzun yürüyüşleri çok seviyor.', '792000000000001', 'Kadıköy', 'available'),
    (2, 1, 'Pamuk', 'female', 'small', 'beyaz', '5 months', false, true, true, true, true, 3, null, 'Oyuncu ve meraklı bir yavru.', null, 'Üsküdar', 'available'),
    (3, 1, 'Zeytin', 'female', 'medium', 'siyah', '2 years', true, true, null, true, false, 2, null, 'İnsanlara çok düşkün, kedilerle arası yok.', '792000000000003', 'Kadıköy', 'available'),
    (4, 1, 'Boncuk', 'female', 'small', 'krem', '9 years', true, true, true, null, true, 1, 'Hafif katarakt başlangıcı var.', 'Kucakta uyumayı seven yaşlı bir hanım.', '792000000000004', 'Ataşehir', 'available'),
    (5, 1, 'Tarçın', 'male', 'medium', 'kızıl', '1 year 6 months', true, true, true, true, null, 3, null, 'Enerjisi bol, top oyunlarına bayılıyor.', '792000000000005', 'Maltepe', 'available'),
    (6, 1, 'Fındık', 'male', 'small', 'kahverengi', '3 months', false, false, null, null, null, 3, 'İlk aşıları planlandı.', 'Kardeşleriyle birlikte bulunmuş minik bir yavru.', null, 'Kadıköy', 'available'),
    (7, 1, 'Paşa', 'male', 'large', 'sarı', '6 years 2 months', true, true, false, true, null, 2, null, 'Yetişkinlerle daha rahat, bahçeli bir ev arıyor.', '792000000000007', 'Ümraniye', 'available'),
    (8, 2, 'Duman', 'male', 'large', 'gri', '3 years 4 months', true, true, true, true, true, 2, null, 'Herkesle iyi anlaşan uysal bir köpek.', '792000000000008', 'Sarıyer', 'available'),
    (9, 2, 'Bulut', 'female', 'medium', 'beyaz', '8 years 6 months', true, true, true, null, null, 1, 'Eklem desteği alıyor.', 'Sakin bir ev ortamında huzur bulacak.', '792000000000009', 'Beşiktaş', 'available'),
    (10, 2, 'Limon', 'female', 'small', 'sarı', '7 months', false, true, true, true, true, 3, null, 'Neşeli, herkesi kuyruk sallayarak karşılıyor.', null, 'Şişli', 'available'),
    (11, 2, 'Kömür', 'male', 'medium', 'siyah', '5 years', true, true, null, false, null, 2, null, 'Tek köpek olarak yaşamayı tercih ediyor.', '792000000000011', 'Sarıyer', 'available'),
    (12, 2, 'Badem', 'female', 'medium', 'kahverengi', '2 years 5 months', true, true, true, true, null, 2, null, 'Tasmayla yürümeyi biliyor, temel komutları tanıyor.', '792000000000012', 'Eyüpsultan', 'available'),
    (13, 2, 'Maya', 'female', 'large', 'siyah-beyaz', '11 years', true, true, true, true, true, 1, 'Kalp ilacı kullanıyor.', 'Yaşlı ama sevgi dolu, son yıllarını bir yuvada geçirmek istiyor.', '792000000000013', 'Sarıyer', 'available'),
    (14, 2, 'Lokum', 'female', 'small', 'krem', '1 year 2 months', true, true, true, true, true, 2, null, 'Apartman hayatına uygun, sessiz bir köpek.', '792000000000014', 'Kağıthane', 'available'),
    (15, 3, 'Şans', 'male', 'medium', 'alaca', '4 months', false, true, true, true, null, 3, null, 'Yol kenarında bulunan şanslı bir yavru.', null, 'Çankaya', 'available'),
    (16, 3, 'Çakıl', 'male', 'small', 'gri', '6 years', true, true, true, null, true, 2, null, 'Kedilerle büyümüş, evcil bir köpek.', '792000000000016', 'Çankaya', 'available'),
    (17, 3, 'Poyraz', 'male', 'large', 'beyaz', '2 years 8 months', true, true, null, true, false, 3, null, 'Koşmayı seven, aktif bir aile arıyor.', '792000000000017', 'Etimesgut', 'available'),
    (18, 3, 'Köpük', 'female', 'small', 'beyaz', '10 years', true, true, true, true, true, 1, 'Dişleri temizlendi, düzenli kontrol gerekiyor.', 'Sakin, kucak seven yaşlı bir köpek.', '792000000000018', 'Çankaya', 'available'),
    (19, 3, 'Leblebi', 'female', 'medium', 'sarı', '9 months', false, true, true, true, true, 3, null, 'Hızlı öğrenen, oyuncu bir yavru.', null, 'Keçiören', 'available'),
    (20, 3, 'Fıstık', 'male', 'small', 'kahverengi', '3 years 4 months', true, true, true, false, null, 2, null, 'İnsanlarla çok iyi, diğer köpeklerle seçici.', '792000000000020', 'Mamak', 'available'),
    (21, 3, 'Sütlaç', 'female', 'large', 'krem', '7 years 6 months', true, true, true, true, null, 1, null, 'Bahçede güneşlenmeyi seven uysal bir köpek.', '792000000000021', 'Çankaya', 'available'),
    (22, 4, 'Kurabiye', 'female', 'medium', 'kızıl', '1 year 9 months', true, true, true, true, true, 2, null, 'Her ortama kolay uyum sağlıyor.', '792000000000022', 'Yenimahalle', 'available'),
    (23, 4, 'Aslan', 'male', 'large', 'sarı', '5 years 8 months', true, true, false, false, false, 2, null, 'Deneyimli bir sahiplenici arıyor.', '792000000000023', 'Yenimahalle', 'available'),
    (24, 4, 'Benek', 'female', 'medium', 'alaca', '6 months', false, true, true, true, null, 3, null, 'Benekli tüyleriyle dikkat çeken tatlı bir yavru.', null, 'Sincan', 'available'),
    (25, 4, 'Çapkın', 'male', 'small', 'siyah', '4 years 6 months', true, true, true, true, true, 2, null, 'Çok sosyal, herkesle arkadaş oluyor.', '792000000000025', 'Yenimahalle', 'available'),
    (26, 4, 'Gofret', 'male', 'medium', 'kahverengi', '12 years', true, true, true, true, null, 1, 'Böbrek diyeti uyguluyor.', 'Yaşlı ama oyunbaz, kısa yürüyüşleri seviyor.', '792000000000026', 'Keçiören', 'available'),
    (27, 4, 'Bal', 'female', 'large', 'sarı', '2 years', true, true, true, true, true, 2, null, 'Çocuklarla çok iyi anlaşan sevecen bir köpek.', '792000000000027', 'Yenimahalle', 'available'),
    (28, 4, 'Tontiş', 'unknown', 'small', 'krem', '8 months', false, false, null, null, null, 2, 'Muayene ve aşıları bekleniyor.', 'Yeni gelen, kendini tanıtmayı bekleyen bir yavru.', null, 'Pursaklar', 'available'),
    (29, 5, 'Mercan', 'female', 'medium', 'kızıl', '3 years 4 months', true, true, true, true, true, 2, null, 'Sakin, uyumlu ve tasma eğitimi almış.', '792000000000029', 'Bornova', 'available'),
    (30, 5, 'Yıldız', 'female', 'small', 'siyah-beyaz', '10 months', false, true, true, true, true, 3, null, 'Alnındaki yıldız lekesiyle tanınıyor.', null, 'Bornova', 'available'),
    (31, 5, 'Ayaz', 'male', 'large', 'beyaz', '1 year 2 months', true, true, null, true, null, 3, null, 'Genç ve enerjik, aktif bir aileye uygun.', '792000000000031', 'Buca', 'available'),
    (32, 5, 'Rüzgar', 'male', 'medium', 'gri', '7 years', true, true, true, true, false, 2, null, 'Koşmayı hâlâ çok seviyor.', '792000000000032', 'Bornova', 'available'),
    (33, 5, 'Toprak', 'male', 'large', 'kahverengi', '9 years', true, true, true, true, null, 1, 'Kalça displazisi, ağrı kesici kullanıyor.', 'Yavaş tempolu yürüyüşlere uygun, çok uysal.', '792000000000033', 'Bayraklı', 'available'),
    (34, 5, 'Kartal', 'male', 'medium', 'siyah-krem', '2 years 5 months', true, true, true, null, null, 2, null, 'Dikkatli ve zeki, eğitime çok yatkın.', '792000000000034', 'Bornova', 'available'),
    (35, 5, 'Tombi', 'female', 'small', 'krem', '5 years', true, true, true, true, true, 1, 'Kilo kontrol diyetinde.', 'Tatlı, sakin ve biraz tombul.', '792000000000035', 'Buca', 'available'),
    (36, 6, 'Cesur', 'male', 'large', 'siyah', '4 years', true, true, false, true, null, 2, null, 'Koruyucu yapıda, deneyimli bir sahip arıyor.', '792000000000036', 'Karşıyaka', 'available'),
    (37, 6, 'Nazlı', 'female', 'small', 'beyaz', '1 year 6 months', true, true, true, true, true, 2, null, 'İlk başta çekingen, güvenince çok sevgi dolu.', '792000000000037', 'Karşıyaka', 'available'),
    (38, 6, 'Minnoş', 'female', 'small', 'kahverengi', '3 months', false, false, null, null, null, 3, 'İlk aşıları planlandı.', 'Minik ve çok sevimli bir yavru.', null, 'Çiğli', 'available'),
    (39, 6, 'Şeker', 'female', 'medium', 'sarı', '6 years 2 months', true, true, true, true, true, 2, null, 'Sevecen, herkesle kolayca kaynaşıyor.', '792000000000039', 'Karşıyaka', 'available'),
    (40, 6, 'Kiraz', 'female', 'medium', 'kızıl', '11 months', false, true, true, true, null, 3, null, 'Oyuncu ve meraklı, eğitime hazır.', null, 'Bayraklı', 'available'),
    (41, 6, 'Dost', 'male', 'large', 'alaca', '8 years 6 months', true, true, true, true, true, 1, null, 'Adı gibi gerçek bir dost.', '792000000000041', 'Karşıyaka', 'available'),
    (42, 6, 'Haydut', 'male', 'medium', 'siyah-beyaz', '2 years', true, true, null, false, false, 3, null, 'Yaramaz ama çok sevimli, tek köpek olmayı seviyor.', '792000000000042', 'Çiğli', 'available'),
    -- Hidden from the public gallery
    (43, 1, 'Çomar', 'male', 'large', 'krem', '3 years 4 months', true, true, true, true, null, 2, null, 'Bir aile ile tanışma süreci devam ediyor.', '792000000000043', 'Kadıköy', 'reserved'),
    (44, 4, 'Kınalı', 'female', 'medium', 'kızıl', '1 year 6 months', true, true, true, true, true, 2, null, 'Sahiplenme görüşmesi planlandı.', '792000000000044', 'Yenimahalle', 'reserved'),
    (45, 2, 'Kahve', 'male', 'medium', 'kahverengi', '4 years', true, true, true, true, null, 2, null, 'Yeni yuvasına kavuştu.', '792000000000045', 'Sarıyer', 'adopted'),
    (46, 3, 'Patron', 'male', 'large', 'siyah', '5 years', true, true, null, true, null, 2, null, 'Yeni yuvasına kavuştu.', '792000000000046', 'Çankaya', 'adopted'),
    (47, 5, 'Susam', 'female', 'small', 'sarı', '8 months', true, true, true, true, true, 3, null, 'Yeni yuvasına kavuştu.', null, 'Bornova', 'adopted'),
    (48, 2, 'Sarıkız', 'female', 'medium', 'sarı', '13 years', true, true, true, true, true, 1, 'Yaşlılığa bağlı hastalıklar.', 'Barınakta huzur içinde öldü.', '792000000000048', 'Beşiktaş', 'deceased'),
    (49, 6, 'Karamel', 'male', 'large', 'kızıl', '10 years', true, true, true, true, null, 1, 'Kronik böbrek yetmezliği.', 'Barınakta huzur içinde öldü.', '792000000000049', 'Karşıyaka', 'deceased'),
    (50, 3, 'Fırtına', 'female', 'medium', 'gri', '2 years 5 months', true, true, true, true, null, 3, null, 'Başka bir barınağa nakledildi.', '792000000000050', 'Keçiören', 'transferred')
) as v (
  n, shelter, name, sex, size, color, age, neutered, vaccinated, kids, dogs, cats, energy,
  health, description, chip, capture, status
);

-- ---------------------------------------------------------------------------
-- Photos: local placeholder SVGs. Dogs 07, 19 and 33 have no photo (tests the
-- card fallback); hidden dogs also get photos (tests the photo policy).
-- ---------------------------------------------------------------------------

insert into public.dog_photos (dog_id, url, sort_order)
select
  ('d0000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  '/placeholders/dog-' || ((n - 1) % 6 + 1) || '.svg',
  0
from generate_series(1, 50) as n
where n not in (7, 19, 33)
union all
select
  ('d0000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  '/placeholders/dog-' || (n % 6 + 1) || '.svg',
  1
from generate_series(1, 50) as n
where n % 3 = 0 and n not in (7, 19, 33);
