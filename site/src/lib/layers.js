// The four pace layers, fastest first. Wavelength (lambda) grows as the layer slows;
// `dur` is how long one wavelength takes to travel, so motion speed encodes the layer.
export const LAYERS = [
  {
    id: "ai",
    name: "AI",
    tau: "months",
    exp: "−1",
    lambda: 11,
    amp: 5,
    dur: 0.45,
    blurb:
      "Models, agents and tools, and what they are doing to how knowledge gets made.",
    rooms: [
      {
        name: "frontier-models",
        blurb: "New models, papers and evals, read past the press release.",
      },
      {
        name: "ai-for-science",
        blurb:
          "Where models meet instruments, from protein folding to telescope pipelines.",
        bands: ["ai", "sci"],
      },
    ],
  },
  {
    id: "sci",
    name: "Science",
    tau: "decades",
    exp: "1",
    lambda: 26,
    amp: 7,
    dur: 1.6,
    blurb: "Instruments, paradigms, and the results that survive replication.",
    rooms: [
      {
        name: "lab-notes",
        blurb: "Work in progress from the bench, the cluster and the field.",
      },
      {
        name: "replication",
        blurb: "Results we tried to reproduce, and what happened when we did.",
        bands: ["sci", "acad"],
      },
    ],
  },
  {
    id: "acad",
    name: "Academia",
    tau: "centuries",
    exp: "2",
    lambda: 56,
    amp: 8,
    dur: 5,
    blurb:
      "Journals, tenure, peer review: the institutions, and the incentives they set.",
    rooms: [
      {
        name: "peer-review",
        blurb: "Bring a draft; leave with the review you wish you’d had.",
      },
      {
        name: "paper-economy",
        blurb: "Metrics, incentives and publishing. Home turf for the essays.",
        bands: ["acad", "ai"],
      },
    ],
  },
  {
    id: "space",
    name: "Space",
    tau: "eons",
    exp: "9",
    lambda: 120,
    amp: 8,
    dur: 16,
    blurb: "Cosmology, exploration, and the longest view anyone can take.",
    rooms: [
      {
        name: "cosmology",
        blurb: "Origins, structure, and the fate of the universe, argued fast.",
        bands: ["space", "sci"],
      },
      {
        name: "missions",
        blurb: "Launches, probes and telescopes, from proposal to first light.",
      },
    ],
  },
];

// A sine-like wave along the x axis from `from` to `to`, built from chained quadratic curves.
export function wavePath(lambda, amp, from, to, y = 0) {
  const half = lambda / 2;
  const n = Math.ceil((to - from) / half);
  return (
    `M${from},${y} q${lambda / 4},${-2 * amp} ${half},0` +
    ` t${half},0`.repeat(n - 1)
  );
}

// The pace layer a post tag names (case-insensitive), for colour; other tags use the accent.
export const layerForTag = (tag) =>
  LAYERS.find((l) => l.name.toLowerCase() === tag.toLowerCase())?.id ?? "accent";
