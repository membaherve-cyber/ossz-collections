const keys = {
  key1: process.env.GEMINI_API_KEY ?? "",
  key2: process.env.GEMINI_API_KEY2 ?? "",
};

const models = [
  "gemini-3.6-flash",
  "gemini-3-flash",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-flash-latest",
];

function tryOnce(label, key, model) {
  return new Promise((resolve) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => { ctrl.abort(); }, 5000);
    const started = Date.now();
    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Reply with the single word: ok" }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      },
    )
      .then(async (r) => {
        clearTimeout(t);
        const body = await r.text().catch(() => "");
        const ms = Date.now() - started;
        let snippet = body.slice(0, 160).replace(/\s+/g, " ");
        if (r.ok) {
          try {
            const j = JSON.parse(body);
            snippet = (j.candidates?.[0]?.content?.parts?.[0]?.text ?? "").slice(0, 60);
          } catch {}
        }
        resolve({ label, key, model, ok: r.ok, status: r.status, ms, snippet });
      })
      .catch(() => {
        clearTimeout(t);
        resolve({ label, key, model, ok: false, status: "ERR/ABORT", ms: Date.now() - started, snippet: "" });
      });
  });
}

(async () => {
  const tasks = [];
  for (const [label, key] of Object.entries(keys)) {
    if (!key) {
      console.log(`${label}: NOT SET`);
      continue;
    }
    // Only show a masked preview of the key, never the full secret.
    console.log(`${label}: ${key.slice(0, 4)}…${key.slice(-3)} (len ${key.length})`);
    for (const model of models) {
      tasks.push(tryOnce(label, key, model));
    }
  }
  const results = await Promise.all(tasks);
  for (const r of results) {
    console.log(
      `${r.label.padEnd(4)} | ${r.model.padEnd(20)} | ${r.ok ? "OK" : "FAIL"} | ${String(r.status).padEnd(6)} | ${r.ms}ms | ${r.snippet}`,
    );
  }
})();