import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db", ssl: /@(localhost|127\.0\.0\.1)/.test(process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db") ? false : { rejectUnauthorized: false } });

const CATEGORIES = {
  "ready-to-wear": "Prêt-à-porter",
  evening: "Soirée",
  tailoring: "Tailleur",
  knitwear: "Maille",
  accessories: "Accessoires",
};

const COLLECTIONS = {
  "wouri-nights": {
    name: "Nuits du Wouri",
    season: "Saison 04",
    description:
      "Des pièces de soirée taillées pour les longues nuits chaudes du Wouri — soies fluides, coutures finies à la main et un éclat retenu.",
  },
  "atelier-essentials": {
    name: "Essentiels d'Atelier",
    season: "Permanente",
    description:
      "La colonne vertébrale discrète du vestiaire OSSZ : un tailleur précis, des cotons honnêtes et des pièces conçues pour durer une décennie.",
  },
  "sawa-sun": {
    name: "Soleil Sawa",
    season: "Saison 03",
    description:
      "Un vestiaire de jour léger et respirant, inspiré des matins de Douala — lin ample, détails en raphia et couleurs tirées du littoral.",
  },
};

const PRODUCTS = {
  "mbanga-silk-gown": {
    name: "Robe longue en soie Mbanga",
    description: "Une robe longue en soie balayant le sol, au drapé souple et à l'ourlet roulé main.",
    details: "100 % soie de mûrier. Coupe en biais. Fermeture éclair latérale invisible. Entièrement doublée.",
    care: "Nettoyage à sec uniquement. Conserver sur un cintre rembourré.",
  },
  "akwa-tailored-blazer": {
    name: "Blazer ajusté Akwa",
    description: "Un blazer croisé simple, à l'épaule nette et à la taille légèrement marquée.",
    details: "Laine mélangée tissée en Italie. Boutons en corne. Construction semi-entoilée.",
    care: "Nettoyage à sec. Brosser après le port.",
  },
  "wouri-wrap-dress": {
    name: "Robe portefeuille Wouri",
    description: "Une robe portefeuille en crêpe fluide, finie par une ceinture à nouer.",
    details: "Crêpe de viscose. Fermeture portefeuille ajustable. Longueur midi.",
    care: "Lavage à la main à froid. Séchage à l'ombre.",
  },
  "bonapriso-linen-shirt": {
    name: "Chemise en lin Bonapriso",
    description: "Une chemise en lin ample et facile, au col souple et à l'épaule tombante.",
    details: "Lin européen lavé. Boutons en nacre.",
    care: "Lavage machine à froid. Repassage tiède.",
  },
  "sanaga-wide-trouser": {
    name: "Pantalon large Sanaga",
    description: "Un pantalon large taille haute, au pli marqué et aux poches profondes.",
    details: "Mélange Tencel-laine. Fermeture agrafe. Non doublé.",
    care: "Nettoyage à sec recommandé.",
  },
  "douala-knit-column": {
    name: "Robe colonne en maille Douala",
    description: "Une robe colonne en maille fine qui effleure le corps sans le mouler.",
    details: "Mélange mérinos et coton. Encolure et poignets côtelés.",
    care: "Lavage à la main à froid. Séchage à plat.",
  },
  "limbe-raffia-tote": {
    name: "Cabas en raphia Limbé",
    description: "Un cabas en raphia tissé main, anses en cuir, réalisé avec des artisans de Limbé.",
    details: "Raphia naturel. Cuir à tannage végétal. Doublure en coton.",
    care: "Garder au sec. Nettoyage localisé uniquement.",
  },
  "kribi-beaded-slip": {
    name: "Robe nuisette perlée Kribi",
    description: "Une robe nuisette coupée en biais, bretelles perlées main, d'un poids à peine perceptible.",
    details: "Satin de soie et perles de verre. 48 heures de finition à la main.",
    care: "Nettoyage à sec spécialisé pour le perlage.",
  },
  "bali-cotton-boubou": {
    name: "Boubou en coton Bali",
    description: "Un boubou décontracté en popeline de coton, brodé ton sur ton à l'empiècement.",
    details: "Popeline de coton biologique. Broderie main. Fentes latérales.",
    care: "Lavage machine à froid, cycle délicat.",
  },
  "bonanjo-trench": {
    name: "Trench Bonanjo",
    description: "Un trench léger taillé pour la saison des pluies, avec patte de vent et ceinture.",
    details: "Gabardine de coton déperlante. Ceinture amovible. Dos aéré.",
    care: "Nettoyage à sec. Ne pas sécher en machine.",
  },
  "njoya-silk-scarf": {
    name: "Carré de soie Njoya",
    description: "Un carré de soie imprimé d'un motif inspiré de l'architecture bamoun.",
    details: "Twill de soie. Bords roulés main. 90 × 90 cm.",
    care: "Nettoyage à sec ou lavage main délicat.",
  },
  "deido-ribbed-knit": {
    name: "Haut côtelé Deido",
    description: "Un haut en maille côtelée près du corps, col montant et manches longues.",
    details: "Côte mérinos. Silhouette ajustée. S'arrête à la hanche.",
    care: "Lavage à la main à froid. Remettre en forme humide.",
  },
};

const BLOCKS = [
  {
    heading: "Bring Out The Class in You",
    eyebrowFr: "",
    headingFr: "Révélez la classe en vous",
    bodyFr:
      "Un service de couture sur mesure haut de gamme. Créés au sein de notre atelier de Douala et expédiés en toute sécurité dans toutes les régions du Cameroun.",
    ctaFr: "Découvrir nos collections",
  },
  {
    heading: "The pieces you will keep for a decade",
    eyebrowFr: "Essentiels d'Atelier",
    headingFr: "Les pièces que vous garderez dix ans",
    bodyFr: "Un tailleur précis dans une étoffe honnête — la colonne vertébrale discrète du vestiaire OSSZ.",
    ctaFr: "Voir les essentiels",
  },
  {
    heading: "Fitted in person, wherever you are",
    eyebrowFr: "Notre promesse",
    headingFr: "Essayée en personne, où que vous soyez",
    bodyFr:
      "Réservez un rendez-vous de style privé à notre boutique Ange Raphael, ou laissez notre concierge vous guider en ligne.",
    ctaFr: "Prendre rendez-vous",
  },
];

const JOURNAL = {
  "inside-the-akwa-atelier": {
    title: "Dans notre atelier Ange Raphael",
    excerpt: "Quatre tailleurs, une longue table, et la patience qu'exige un ourlet roulé main.",
    body: "Notre atelier se trouve à Ange Raphael, à Douala.\n\nChaque pièce OSSZ commence sur une longue table partagée où quatre tailleurs travaillent au rythme qu'ils fixent eux-mêmes. Un ourlet de soie est roulé à la main — environ quarante minutes de travail que presque personne ne remarquera, et que tout le monde ressent lorsque la robe bouge.\n\nNous gardons volontairement de petites séries. Un modèle est coupé en vingt, parfois trente exemplaires, et lorsqu'il est terminé, il est terminé.",
  },
  "how-to-wear-silk-in-the-humidity": {
    title: "Porter la soie sous l'humidité",
    excerpt: "Douala est chaude et humide une bonne partie de l'année. La soie y a toute sa place — avec un peu de soin.",
    body: "Tout est affaire de poids et de coupe, non d'évitement.\n\nChoisissez une coupe en biais qui s'écarte du corps plutôt qu'elle ne s'y colle. Réservez le perlage au soir, quand l'air se rafraîchit. Et aérez une pièce en soie toute une nuit avant de la ranger — ne la pliez jamais humide.\n\nNotre concierge peut vous conseiller sur le grammage de n'importe quelle pièce ; il suffit de demander.",
  },
  "a-guide-to-your-first-fitting": {
    title: "Guide de votre premier essayage",
    excerpt: "Quoi apporter, à quoi s'attendre, et pourquoi nous prenons quarante minutes plutôt que dix.",
    body: "Un premier essayage chez OSSZ dure environ quarante minutes.\n\nApportez les chaussures que vous comptez porter et, si possible, une photographie de l'occasion ou du lieu. Nous prendrons huit mesures, discuterons de l'aisance et du mouvement, et conviendrons d'une date de livraison avant votre départ.\n\nLes retouches sur les pièces OSSZ sont offertes dans les trente jours suivant l'achat.",
  },
};

const FAQ_FR = {
  "How long does delivery take in Douala?": [
    "Livraison",
    "Quels sont les délais de livraison ?",
    "L'expédition nationale atteint Douala (et tout le Cameroun) en deux à quatre jours ouvrés, avec un forfait indiqué à la commande. Le retrait en boutique à notre boutique Ange Raphael est offert et prêt sous 24 heures.",
  ],
  "Do you ship across Cameroon?": [
    "Livraison",
    "Livrez-vous partout au Cameroun ?",
    "Oui. L'expédition nationale via notre transporteur partenaire prend de deux à quatre jours ouvrés, avec un forfait indiqué à la commande.",
  ],
  "Can I collect in store?": [
    "Livraison",
    "Puis-je retirer en boutique ?",
    "Bien sûr. Choisissez le retrait en boutique à la commande et nous vous préviendrons dès que votre commande sera prête à notre boutique Ange Raphael — c'est offert.",
  ],
  "Which payment methods do you accept?": [
    "Paiement",
    "Quels moyens de paiement acceptez-vous ?",
    "MTN Mobile Money, Orange Money, ainsi que Visa et Mastercard. Le mobile money et la carte sont traités de la même façon à la commande.",
  ],
  "Is paying on delivery possible?": [
    "Paiement",
    "Le paiement à la livraison est-il possible ?",
    "Le paiement en espèces ou par mobile money à la livraison est disponible pour les commandes en retrait en boutique. Lorsqu'il est activé, il apparaît comme une option à la commande.",
  ],
  "What is your returns policy?": [
    "Retours",
    "Quelle est votre politique de retour ?",
    "Les pièces non portées peuvent être retournées sous quatorze jours, étiquettes attachées, pour échange ou avoir. Les pièces perlées et sur mesure sont en vente ferme.",
  ],
  "Do you offer alterations?": [
    "Retours",
    "Proposez-vous des retouches ?",
    "Oui — les retouches sur les pièces OSSZ sont offertes dans les trente jours suivant l'achat, sur rendez-vous en boutique.",
  ],
  "How do your sizes run?": [
    "Tailles",
    "Comment taillent vos pièces ?",
    "Notre prêt-à-porter taille normalement, avec une aisance généreuse à l'épaule. Si vous hésitez entre deux tailles, notre concierge ou un styliste vous conseillera volontiers.",
  ],
  "Where is the boutique?": [
    "Général",
    "Où se trouve la boutique ?",
    "Ange Raphael, Douala — Cameroun. Nous sommes ouverts du lundi au vendredi de 9h00 à 18h00, le samedi de 9h00 à 13h00, et le dimanche sur rendez-vous.",
  ],
};

const ZONES_FR = {
  "National shipping — Cameroon": ["Expédition nationale — Cameroun", "2 à 4 jours ouvrés"],
  "In-store pickup — Ange Raphael boutique": ["Retrait en boutique — Ange Raphael", "Prêt sous 24 heures"],
};

const LOOKS_FR = {
  "Look 01": "La robe Mbanga, portée épaules nues au crépuscule.",
  "Look 02": "Blazer Akwa sur la côte Deido, pantalon Sanaga en dessous.",
  "Look 03": "Le lin Bonapriso, déboutonné pour la brise du port.",
  "Look 04": "Le perlage Kribi captant les dernières lueurs.",
  "Look 05": "Le trench Bonanjo, taillé pour les pluies.",
  "Look 06": "Soleil Sawa, accompagné du cabas en raphia Limbé.",
};

async function main() {
  const c = await pool.connect();
  try {
    await c.query("begin");

    for (const [slug, name] of Object.entries(CATEGORIES)) {
      await c.query("update categories set name_fr=$1 where slug=$2", [name, slug]);
    }
    for (const [slug, v] of Object.entries(COLLECTIONS)) {
      await c.query(
        "update collections set name_fr=$1, description_fr=$2, season_fr=$3 where slug=$4",
        [v.name, v.description, v.season, slug],
      );
    }
    for (const [slug, v] of Object.entries(PRODUCTS)) {
      await c.query(
        "update products set name_fr=$1, description_fr=$2, details_fr=$3, care_instructions_fr=$4 where slug=$5",
        [v.name, v.description, v.details, v.care, slug],
      );
    }
    for (const b of BLOCKS) {
      await c.query(
        "update home_blocks set eyebrow_fr=$1, heading_fr=$2, body_fr=$3, cta_label_fr=$4 where heading=$5",
        [b.eyebrowFr, b.headingFr, b.bodyFr, b.ctaFr, b.heading],
      );
    }
    for (const [slug, v] of Object.entries(JOURNAL)) {
      await c.query(
        "update journal_posts set title_fr=$1, excerpt_fr=$2, body_fr=$3 where slug=$4",
        [v.title, v.excerpt, v.body, slug],
      );
    }
    for (const [q, [cat, qf, af]] of Object.entries(FAQ_FR)) {
      await c.query(
        "update faqs set category_fr=$1, question_fr=$2, answer_fr=$3 where question=$4",
        [cat, qf, af, q],
      );
    }
    for (const [name, [nf, ef]] of Object.entries(ZONES_FR)) {
      await c.query("update delivery_zones set name_fr=$1, eta_label_fr=$2 where name=$3", [nf, ef, name]);
    }
    for (const [title, caption] of Object.entries(LOOKS_FR)) {
      await c.query("update lookbook_items set caption_fr=$1 where title=$2", [caption, title]);
    }

    await c.query("commit");
    console.log("French content seeded.");
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
