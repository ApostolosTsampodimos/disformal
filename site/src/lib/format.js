import { LAYERS } from "./layers.js";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Five-digit years, Long Now style: 14 Oct 02026.
export const longDate = (d) =>
  `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} 0${d.getUTCFullYear()}`;

export const readMinutes = (body = "") =>
  Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 220));

// A tag that names a pace layer is shown with the layer's capitalisation.
export const tagLabel = (tag) =>
  LAYERS.find((l) => l.name.toLowerCase() === tag.toLowerCase())?.name ?? tag;
