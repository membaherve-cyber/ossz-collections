#!/bin/bash
# Restore collections — run via psql
PGPASSWORD="npg_q2JfTOnZY4oh" psql -h ep-shiny-smoke-asvvjgmv-pooler.c-4.eu-central-1.aws.neon.tech -U neondb_owner -d "la maison bibi" <<'SQL'

-- 1. Check Moves
UPDATE collections SET
  name = 'Check Moves',
  name_fr = 'Check Moves',
  description = 'Geometric precision meets bold pattern — the Check Moves collection reimagines the classic check through the lens of contemporary African tailoring.',
  description_fr = 'Précision géométrique et motifs audacieux — la collection Check Moves réinvente le carreau classique à travers le prisme de la couture africaine contemporaine.',
  season = '2023',
  season_fr = '2023',
  cover_image = '/catalogue/ossz-sky-blue-suit-1.jpg'
WHERE slug = 'check-moves';

-- 2. Freeme
UPDATE collections SET
  name = 'Freeme',
  name_fr = 'Freeme',
  description = 'Freedom expressed in fabric — loose silhouettes, saturated colour, and hand-finished details that celebrate the joy of dressing without constraint.',
  description_fr = 'La liberté exprimée en tissu — silhouettes fluides, couleurs saturées et finitions artisanales qui célèbrent le plaisir de s''habiller sans contrainte.',
  season = '2021',
  season_fr = '2021',
  cover_image = '/catalogue/ossz-velvet-embroidered-1.png'
WHERE slug = 'freeme';

-- 3. 95 VIVS Element
UPDATE collections SET
  name = '95 VIVS Element',
  name_fr = '95 VIVS Element',
  description = 'A tribute to the raw energy of Douala''s streets circa 1995 — structured shoulders, wide trousers, and the unapologetic confidence of the early OSSZ era.',
  description_fr = 'Un hommage à l''énergie brute des rues de Douala vers 1995 — épaules structurées, pantalons larges et l''assurance sans concession de la première ère OSSZ.',
  season = '2022',
  season_fr = '2022',
  cover_image = '/catalogue/ossz-indigo-agbada-1.jpg'
WHERE slug = '95-vivs-element';

-- 4. Cultural Canvas
UPDATE collections SET
  name = 'Cultural Canvas',
  name_fr = 'Toile Culturelle',
  description = 'Every garment is a canvas — hand-dyed indigo, artisanal embroidery, and ceremonial silhouettes that honour Cameroonian textile traditions.',
  description_fr = 'Chaque vêtement est une toile — indigo teint à la main, broderies artisanales et silhouettes cérémonielles qui honorent les traditions textiles camerounaises.',
  season = '2024',
  season_fr = '2024',
  cover_image = '/catalogue/ossz-royal-blue-agbada-1.jpg'
WHERE slug = 'cultural-canvas';

-- 5. Cultural Heritage
UPDATE collections SET
  name = 'Cultural Heritage',
  name_fr = 'Patrimoine Culturel',
  description = 'The pieces that outlast seasons — timeless agbada, ceremonial boubou, and investment tailoring crafted to be passed down through generations.',
  description_fr = 'Les pièces qui survivent aux saisons — agbada intemporel, boubou cérémoniel et tailleur d''investissement conçu pour se transmettre de génération en génération.',
  season = '2024',
  season_fr = '2024',
  cover_image = '/catalogue/ossz-indigo-agbada-2.jpg'
WHERE slug = 'cultural-heritage';

-- Link products to collections
UPDATE products SET collection_id = (SELECT id FROM collections WHERE slug = 'check-moves') WHERE slug = 'camel-tailored-coat';
UPDATE products SET collection_id = (SELECT id FROM collections WHERE slug = 'check-moves') WHERE slug = 'charcoal-draped-look';
UPDATE products SET collection_id = (SELECT id FROM collections WHERE slug = 'freeme') WHERE slug = 'periwinkle-drape-gown';
UPDATE products SET collection_id = (SELECT id FROM collections WHERE slug = 'freeme') WHERE slug = 'mauve-signature-set';
UPDATE products SET collection_id = (SELECT id FROM collections WHERE slug = 'freeme') WHERE slug = 'sand-linen-look';
UPDATE products SET collection_id = (SELECT id FROM collections WHERE slug = '95-vivs-element') WHERE slug = 'ivoire-occasion-gown';
UPDATE products SET collection_id = (SELECT id FROM collections WHERE slug = '95-vivs-element') WHERE slug = 'burgundy-statement-gown';
UPDATE products SET collection_id = (SELECT id FROM collections WHERE slug = 'cultural-canvas') WHERE slug = 'amber-heritage-look';
UPDATE products SET collection_id = (SELECT id FROM collections WHERE slug = 'cultural-canvas') WHERE slug = 'olive-safari-set';
UPDATE products SET collection_id = (SELECT id FROM collections WHERE slug = 'cultural-canvas') WHERE slug = 'wouri-teal-evening-piece';
UPDATE products SET collection_id = (SELECT id FROM collections WHERE slug = 'cultural-heritage') WHERE slug = 'midnight-column-dress';
UPDATE products SET collection_id = (SELECT id FROM collections WHERE slug = 'cultural-heritage') WHERE slug = 'noir-editorial-piece';

SQL

echo "✅ Collections restored!"
