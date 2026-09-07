import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    // 1. Update journal post #1: title and French content (Akwa → Ange Raphael)
    await client.query(`
      UPDATE journal_posts SET 
        title = 'Inside our Ange Raphael atelier',
        slug = 'inside-our-ange-raphael-atelier',
        title_fr = 'Dans notre atelier d''Ange Raphael',
        body_fr = 'Notre atelier se trouve à une rue de la route principale à Ange Raphael, au-dessus d''une librairie.\n\nChaque pièce OSSZ commence sur une longue table partagée où quatre tailleurs travaillent au rythme qu''ils fixent eux-mêmes. Un ourlet de soie est roulé à la main — environ quarante minutes de travail que presque personne ne remarquera, et que tout le monde ressent lorsque la robe bouge.\n\nNous gardons volontairement de petites séries. Un modèle est coupé en vingt, parfois trente exemplaires, et lorsqu''il est terminé, il est terminé.'
      WHERE id = 1
    `);
    console.log("✅ Updated journal post #1 title and French body");

    // 2. Add cover images to journal posts using existing catalogue images
    await client.query(`
      UPDATE journal_posts SET cover_image = '/catalogue/editorial-a.jpg' WHERE id = 1 AND cover_image = '';
    `);
    await client.query(`
      UPDATE journal_posts SET cover_image = '/catalogue/sand-linen-look-1.jpg' WHERE id = 2 AND cover_image = '';
    `);
    await client.query(`
      UPDATE journal_posts SET cover_image = '/catalogue/camel-tailored-coat-1.jpg' WHERE id = 3 AND cover_image = '';
    `);
    console.log("✅ Added cover images to all 3 journal posts");

    // 3. Update lookbook items with richer fashion-advisory content
    const lookbookUpdates = [
      { id: 7, caption: "A floor-length column in midnight crepe. Clean lines, absolute presence.", caption_fr: "Une colonne longue en crêpe minuit. Lignes épurées, présence absolue." },
      { id: 8, caption: "Behind the scenes in our Ange Raphael atelier — where every OSSZ piece begins.", caption_fr: "Dans les coulisses de notre atelier d'Ange Raphael — là où chaque pièce OSSZ commence." },
      { id: 9, caption: "Hand-finished silk, cut for the most memorable evenings.", caption_fr: "Soie finie à la main, taillée pour les soirées les plus mémorables." },
      { id: 10, caption: "A structured wool blend for city evenings — warmth without bulk.", caption_fr: "Un mélange de laine structurée pour les soirées en ville — chaleur sans volume." },
      { id: 11, caption: "Relaxed safari tailoring for warm-weather ease. Pair with leather sandals.", caption_fr: "Tailleur safari décontracté pour l'aisance des temps chauds. Associez avec des sandales en cuir." },
      { id: 12, caption: "The same midnight crepe, reimagined as a cocktail-length dress.", caption_fr: "Le même crêpe minuit, réimaginé en robe longueur cocktail." },
      { id: 13, caption: "Hand-draped periwinkle — fluid movement that photographs beautifully.", caption_fr: "Julienne drapée à la main — mouvement fluide qui se sublime en photo." },
      { id: 14, caption: "Breathable sand linen for Douala humidity. Effortless, always.", caption_fr: "Lin sable respirant pour l'humidité de Douala. Sans effort, toujours." },
      { id: 15, caption: "A noir editorial: the power of masterfully cut black.", caption_fr: "Un éditorial noir : la puissance du noir taillé avec maîtrise." },
      { id: 16, caption: "The OSSZ signature colourway — mauve that speaks quietly and carries authority.", caption_fr: "La couleur signature OSSZ — une mauve qui parle bas et porte l'autorité." },
      { id: 17, caption: "Rich teal silk, made for occasion dressing and candlelit dinners.", caption_fr: "Soie sarcelle riche, faite pour les grandes occasions et les dîners aux bougies." },
      { id: 18, caption: "Bold burgundy with hand-finished edges — where confidence meets craft.", caption_fr: "Bordeaux audacieux avec finitions faites à la main — là où la confiance rencontre le savoir-faire." },
      { id: 19, caption: "Heritage tones in a contemporary silhouette — tradition worn forward.", caption_fr: "Tons patrimoniaux dans une silhouette contemporaine — la tradition portée vers l'avant." },
      { id: 20, caption: "Sculptural charcoal draping for the modern minimalist.", caption_fr: "Drapage charcoal sculptural pour le minimalist moderne." },
    ];

    for (const lb of lookbookUpdates) {
      await client.query(
        `UPDATE lookbook_items SET caption = $1, caption_fr = $2 WHERE id = $3`,
        [lb.caption, lb.caption_fr, lb.id]
      );
    }
    console.log("✅ Updated all 14 lookbook items with fashion-advisory captions");

    // 4. Update the lookbook intro in i18n via settings
    // (already done: look.intro = "Fashion inspiration — curated looks from the OSSZ atelier")

    console.log("\n🎉 All content updates applied successfully!");
  } finally {
    client.release();
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
