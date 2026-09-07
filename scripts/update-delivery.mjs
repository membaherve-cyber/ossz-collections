import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const c = await pool.connect();
  try {
    await c.query("begin");

    // 1. Only two delivery options remain: in-store pickup at Ange Raphael + national shipping.
    const off = await c.query(`UPDATE delivery_zones SET is_active = false WHERE method = 'douala_local'`);
    console.log("Deactivated douala_local zones:", off.rowCount);

    const ren = await c.query(
      `UPDATE delivery_zones
       SET name = 'In-store pickup — Ange Raphael boutique', name_fr = 'Retrait en boutique — Ange Raphael'
       WHERE method = 'pickup'`
    );
    console.log("Renamed pickup zone:", ren.rowCount);

    // 2. Scrub FAQ copy that advertises Douala-only / same-day delivery or the old address.
    const faqRows = await c.query(`SELECT id, category, question, answer FROM faqs ORDER BY id`);
    let changed = 0;
    for (const row of faqRows.rows) {
      let category = row.category;
      let question = row.question;
      let answer = row.answer;
      let dirty = false;

      const enReplace = [
        ["Boulevard de la Liberté, Akwa", "Ange Raphael"],
        ["Same-day delivery in central Douala", "National shipping across Cameroon (2–4 days)"],
        ["Same-day Douala delivery", "National shipping"],
        ["Complimentary Douala delivery", "In-store pickup at Ange Raphael is free, and national shipping is available"],
        ["free in-store pickup", "free in-store pickup at Ange Raphael"],
        ["before 14:00", ""],
        ["Douala only", "at pickup"],
      ];
      for (const [from, to] of enReplace) {
        if (answer.includes(from)) {
          answer = answer.split(from).join(to);
          dirty = true;
        }
      }
      const frReplace = [
        ["Boulevard de la Liberté, Akwa", "Ange Raphael"],
        ["Livraison le jour même dans le centre de Douala", "Expédition nationale au Cameroun (2 à 4 jours)"],
        ["Livraison le jour même à Douala", "Expédition nationale"],
        ["Livraison offerte à Douala", "Le retrait en boutique à Ange Raphael est offert, et l'expédition nationale est disponible"],
        ["retrait en boutique offert", "retrait en boutique offert à Ange Raphael"],
        ["avant 14h00", ""],
        ["Douala uniquement", "au retrait"],
      ];
      for (const [from, to] of frReplace) {
        if (answer.includes(from)) {
          answer = answer.split(from).join(to);
          dirty = true;
        }
        if (category.includes(from)) {
          category = category.split(from).join(to);
          dirty = true;
        }
        if (question.includes(from)) {
          question = question.split(from).join(to);
          dirty = true;
        }
      }
      if (dirty) {
        await c.query(`UPDATE faqs SET category = $1, question = $2, answer = $3 WHERE id = $4`, [
          category,
          question,
          answer,
          row.id,
        ]);
        changed++;
      }
    }
    console.log("FAQ rows updated:", changed);

    await c.query("commit");

    const after = await c.query(
      `SELECT id, name, name_fr, method, fee, is_active FROM delivery_zones ORDER BY fee, id`
    );
    console.table(after.rows);
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
  }
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });