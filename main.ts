const enum State {
  FIELD = 1 << 16, // inside field
  AFTER = 1 << 17, // after field
  LIMIT = 1 << 18, // after delimiter
}
/** Parses CSV, returns null if invalid. */
export const parse = (csv: string) => {
  const to: (string | null)[][] = [];
  let len = csv.length;
  if (!len--) return to; // empty string
  let z = 0, y = 0, x = 0, w = 0, $ = State.LIMIT, on = true, none = true, add;
  do switch (csv.charCodeAt(z) | $) {
    case 10 | State.FIELD:
    case 13 | State.FIELD:
      if (on) break;
      w || to.push([]), to[x][w++] = csv.slice(y, z), on = none = true;
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
        if (z < len && csv.charCodeAt(z + 1) === 34) none = false, ++z;
        else {
          w || to.push([]), add = csv.slice(y, z), $ = State.AFTER;
          to[x][w++] = none ? add : add.replaceAll('""', '"'), on = none = true;
        }
        break;
      }
    case 34 | State.AFTER:
      return null; // trailing quote
    case 34 | State.LIMIT:
      y = z + 1, $ = State.FIELD, none = true;
      break;
    case 44 | State.FIELD:
      if (on) break;
      w || to.push([]), to[x][w++] = csv.slice(y, z), on = none = true;
    case 44 | State.AFTER:
      $ = State.LIMIT;
      break;
    case 44 | State.LIMIT:
      w || to.push([]), to[x][w++] = null;
      break;
    default:
      if ($ === State.LIMIT) $ = State.FIELD, y = z, on = false, none = true;
  } while (z++ < len);
  if ($ === State.FIELD) {
    if (on) return null; // unmatched quote
    w || to.push([]), to[x][w] = csv.slice(y);
  }
  return to;
};
