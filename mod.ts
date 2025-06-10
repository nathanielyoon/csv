/** Array of fields, with empty strings parsed as `null`. */
export type Row = (string | null)[];
// [Javascript strings use UTF-16 code points](https://mdn.io/utf16), so flags
// outside the 16-bit range won't collide.
const enum State {
  FIELD = 1 << 16, // inside field
  AFTER = 1 << 17, // after field
  LIMIT = 1 << 18, // after delimiter
}
const enum On {
  LF_FIELD = 0x0a | State.FIELD, // '\n'
  LF_AFTER = 0x0a | State.AFTER,
  LF_LIMIT = 0x0a | State.LIMIT,
  CR_FIELD = 0x0d | State.FIELD, // '\r'
  CR_AFTER = 0x0d | State.AFTER,
  CR_LIMIT = 0x0d | State.LIMIT,
  QT_FIELD = 0x22 | State.FIELD, // '"'
  QT_AFTER = 0x22 | State.AFTER,
  QT_LIMIT = 0x22 | State.LIMIT,
  CM_FIELD = 0x2c | State.FIELD, // ','
  CM_AFTER = 0x2c | State.AFTER,
  CM_LIMIT = 0x2c | State.LIMIT,
}
/** Converts a CSV string to an array of rows. */
export const csv_json = (csv: string): Row[] | null => {
  // The empty string ("") must be a quoted field to differentiate from `null`.
  // Idea from [this blog post](https://archive.is/r00xC).
  const a: Row[] = [], b = csv.charCodeAt.bind(csv);
  // The actual length is only referenced in the empty-string check. Everywhere
  // else is to see if a character is second-to-last, where it's more convenient
  // to compare to `length` than to `length - 1`, so do that operation up front.
  let c = csv.length;
  if (!c--) return a; // postdecrement so 0-length resolves to `!0` not `!-1`
  let z = 0, y = 0, x = 0, w = 0, d = State.LIMIT, e = true, f = true, g;
  do switch (b(z) | d) {
    case On.LF_FIELD:
    case On.CR_FIELD:
      if (e) break;
      w || a.push([]), a[x][w++] = csv.slice(y, z), e = f = true; // falls through
    case On.LF_LIMIT:
    case On.CR_LIMIT:
      if (d === State.LIMIT) w || a.push([]), a[x][w++] = null; // falls through
    case On.CR_AFTER:
      b(z) === 13 && z < c && b(-~z) === 10 && ++z; // falls through
    case On.LF_AFTER:
      d = State.LIMIT, ++x, w = 0;
      break;
    case On.QT_FIELD:
      if (e) {
        if (z < c && b(z + 1) === 34) f = false, ++z;
        else {
          w || a.push([]), g = csv.slice(y, z), d = State.AFTER;
          a[x][w++] = f ? g : g.replaceAll('""', '"'), e = f = true;
        }
        break;
      } // falls through
    case On.QT_AFTER:
      return null; // misplaced quote
    case On.QT_LIMIT:
      y = z + 1, d = State.FIELD, f = true;
      break;
    case On.CM_FIELD:
      if (e) break;
      w || a.push([]), a[x][w++] = csv.slice(y, z), e = f = true; // falls through
    case On.CM_AFTER:
      d = State.LIMIT;
      break;
    case On.CM_LIMIT:
      w || a.push([]), a[x][w++] = null;
      break;
    default:
      if (d === State.LIMIT) d = State.FIELD, y = z, e = false, f = true;
  } while (z++ < c); // actual length is `len + 1` so compare then increment
  // Reading the end of the CSV string like this creates inconsistency in edge
  // cases, e.g. with non-EOL-terminated final rows, but those are probably the
  // result of an upstream error.
  return d === State.FIELD && (w || a.push([]), a[x][w] = csv.slice(y), e)
    ? null
    : a;
};
/** Converts an array of rows to a CSV string. */
export const json_csv = (json: (string | null)[][]): string => {
  let a = "";
  for (let z = 0; z < json.length; a = a.replace(/,?$/, "\n"), ++z) {
    for (let y = 0, b = json[z]; y < b.length; ++y) {
      const c = b[y];
      a += `${
        c == null
          ? ""
          : /^$|[\n\r",]/.test(c)
          ? `"${c.replaceAll('"', '""')}"`
          : c
      },`;
    }
  }
  return a;
};
