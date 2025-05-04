const enum State {
  FIELD = 1 << 16, // inside field
  AFTER = 1 << 17, // after field
  LIMIT = 1 << 18, // after delimiter
}
/** Parses CSV, returns null if invalid. */
export const parse = (csv: string) => {
  const to: (string | null)[][] = [];
  let len = csv.length, add;
  if (!len--) return to; // empty string
  let z = 0, y = 0, x = 0, w = 0, $ = State.LIMIT, on = true, fix = false;
  do switch (csv.charCodeAt(z) | $) {
    case 10 | State.FIELD:
    case 13 | State.FIELD:
      if (on) break;
      w || to.push([]), to[x][w++] = csv.slice(y, z), on = true, fix = false;
    case 10 | State.LIMIT:
    case 13 | State.LIMIT:
      if ($ === State.LIMIT) w || to.push([]), to[x][w++] = null;
    case 13 | State.AFTER:
      csv.charCodeAt(z) === 13 && z < len && csv.charCodeAt(-~z) === 10 && ++z;
    case 10 | State.AFTER:
      $ = State.LIMIT, ++x, w = 0;
      break;
    case 34 | State.FIELD:
      if (on) {
        if (z < len && csv.charCodeAt(z + 1) === 34) fix = true, ++z;
        else {
          w || to.push([]), add = csv.slice(y, z), $ = State.AFTER, on = true;
          to[x][w++] = fix ? add.replaceAll('""', '"') : add, fix = false;
        }
        break;
      }
    case 34 | State.AFTER:
      return null; // trailing quote
    case 34 | State.LIMIT:
      y = z + 1, $ = State.FIELD, fix = false;
      break;
    case 44 | State.FIELD:
      if (on) break;
      w || to.push([]), to[x][w++] = csv.slice(y, z), on = true, fix = false;
    case 44 | State.AFTER:
      $ = State.LIMIT;
      break;
    case 44 | State.LIMIT:
      w || to.push([]), to[x][w++] = null;
      break;
    default:
      if ($ === State.LIMIT) $ = State.FIELD, y = z, on = fix = false;
  } while (z++ < len);
  if ($ === State.FIELD) {
    if (on) return null; // unmatched quote
    w || to.push([]), to[x][w] = csv.slice(y);
  }
  return to;
};
