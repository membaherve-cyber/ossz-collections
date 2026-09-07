"use client";

/**
 * Last-resort boundary. If anything throws while rendering the root layout the
 * browser would otherwise show a blank page, which is indistinguishable from
 * "the site is down". This at least tells the visitor what happened and offers
 * a way out.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#f7f7f8",
          color: "#1b1917",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          margin: 0,
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <p style={{ letterSpacing: "0.22em", textTransform: "uppercase", fontSize: "1.5rem" }}>
            OSSZ<span style={{ color: "#9b5f2f" }}>.</span>
          </p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 300, marginTop: "1.5rem" }}>
            Something interrupted us
          </h1>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "#4a453f", marginTop: "0.75rem" }}>
            Our apologies — the page could not be displayed. Please try again.
          </p>
          {error.digest ? (
            <p style={{ fontSize: "0.7rem", color: "#8a8279", marginTop: "0.5rem" }}>
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              background: "#1b1917",
              color: "#fff",
              border: 0,
              padding: "0.9rem 1.6rem",
              fontSize: "0.78rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <p style={{ marginTop: "1rem" }}>
            <a href="/?sw=reset" style={{ fontSize: "0.75rem", color: "#9b5f2f" }}>
              Reset the app and reload
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}
