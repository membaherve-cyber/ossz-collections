import { formatXAF } from "@/lib/utils";

/**
 * §9.2 — a simple 14-day revenue trend. Rendered as inline SVG so it costs
 * no JavaScript and no charting dependency.
 */
export function SalesTrend({ points }: { points: Array<{ day: string; total: number }> }) {
  if (points.length === 0) {
    return <p className="mt-4 text-sm text-muted">No sales recorded yet.</p>;
  }

  const W = 560;
  const H = 140;
  const PAD = 6;
  const max = Math.max(...points.map((p) => p.total), 1);
  const step = points.length > 1 ? (W - PAD * 2) / (points.length - 1) : 0;

  const coords = points.map((p, i) => {
    const x = PAD + i * step;
    const y = H - PAD - (p.total / max) * (H - PAD * 2);
    return [x, y] as const;
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${H - PAD} L${coords[0][0].toFixed(1)},${H - PAD} Z`;
  const peak = points.reduce((a, b) => (b.total > a.total ? b : a), points[0]);
  const total = points.reduce((sum, p) => sum + p.total, 0);

  return (
    <figure>
      <figcaption className="sr-only">
        Revenue over the last {points.length} days. Total {formatXAF(total)}, best day {peak.day} at{" "}
        {formatXAF(peak.total)}.
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 h-36 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Revenue trend, total ${formatXAF(total)}`}
      >
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#trendFill)" />
        <path d={line} fill="none" stroke="var(--color-accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {coords.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill="var(--color-accent)" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[0.68rem] text-muted">
        <span>{points[0]?.day}</span>
        <span>Peak {formatXAF(peak.total)}</span>
        <span>{points[points.length - 1]?.day}</span>
      </div>
    </figure>
  );
}
