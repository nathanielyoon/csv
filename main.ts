/** Current location - inside field, after field, or after delimiter. */
const enum State {
  FIELD = 1 << 16,
  AFTER = 1 << 17,
  LIMIT = 1 << 18,
}
/** Parses CSV. */
export const parser = (csv: string) => {
  const rows: (string | null)[][] = [];
  let len = csv.length, state = State.LIMIT, row = [], field;
  if (!len--) return rows; // empty string
  let z = 0, y = 0, x = 0, raw = false, fix = false;
  do switch (csv.charCodeAt(z) | state) {
    case 0x0a | State.FIELD:
    case 0x0d | State.FIELD:
      if (!raw) break;
      x++ || rows.push(row = []), row.push(csv.slice(y, z) || null);
      raw = fix = false;
    case 0x0a | State.LIMIT:
    case 0x0d | State.LIMIT:
      state === State.LIMIT && (x++ || rows.push(row = []), row.push(null));
    case 0x0d | State.AFTER:
      csv.charCodeAt(z) === 0x0d && z < len &&
        csv.charCodeAt(z + 1) === 0x0a && ++z;
    case 0x0a | State.AFTER:
      state = State.LIMIT, x = 0;
      break;
    case 0x22 | State.FIELD:
      if (!raw) {
        if (z < len && csv.charCodeAt(z + 1) === 0x22) fix = true, ++z;
        else {
          field = fix ? csv.slice(y, z).replace(/""/g, '"') : csv.slice(y, z);
          x++ || rows.push(row = []), row.push(field);
          state = State.AFTER, raw = fix = false;
        }
        break;
      }
    case 0x22 | State.AFTER:
      return null;
    case 0x22 | State.LIMIT:
      y = z + 1, state = State.FIELD, fix = false;
      break;
    case 0x2c | State.FIELD:
      if (!raw) break;
      x++ || rows.push(row = []), row.push(csv.slice(y, z) || null);
      raw = fix = false;
    case 0x2c | State.AFTER:
      state = State.LIMIT;
      break;
    case 0x2c | State.LIMIT:
      x++ || rows.push(row = []), row.push(null);
      break;
    default:
      if (state === State.LIMIT) {
        state = State.FIELD, y = z, raw = true, fix = false;
      }
  } while (z++ < len);
  if (state === State.FIELD) {
    if (!raw) return null;
    x && row.push(csv.slice(y) || null);
  }
};
