/** Special CSV characters - line-feed, carriage-return, quote, comma. */
const enum Character {
  LF = 0x0a,
  CR = 0x0d,
  QT = 0x22,
  CM = 0x2c,
}
/** Current location - inside field, after field, or after delimiter. */
const enum State {
  FIELD = 1 << 16,
  AFTER = 1 << 17,
  LIMIT = 1 << 18,
}
/** Combined character code/state flags. */
const enum On {
  LF_FIELD = Character.LF | State.FIELD,
  LF_AFTER = Character.LF | State.AFTER,
  LF_LIMIT = Character.LF | State.LIMIT,
  CR_FIELD = Character.CR | State.FIELD,
  CR_AFTER = Character.CR | State.AFTER,
  CR_LIMIT = Character.CR | State.LIMIT,
  QT_FIELD = Character.QT | State.FIELD,
  QT_AFTER = Character.QT | State.AFTER,
  QT_LIMIT = Character.QT | State.LIMIT,
  CM_FIELD = Character.CM | State.FIELD,
  CM_AFTER = Character.CM | State.AFTER,
  CM_LIMIT = Character.CM | State.LIMIT,
}
/** Replaces quotes if necessary. */
const maybe = (value: string, fix: boolean) =>
  fix ? value.replaceAll('""', '"') : value;
/** Parses CSV with a row-using function, and on error returns the bad index. */
export const parser = (
  add: (out: string, row_num: number, col_num: number, raw: boolean) => void,
  optimistic: boolean,
) =>
(csv: string) => {
  let len = csv.length, state = State.LIMIT, raw = false, fix = false, size;
  if (!len--) return;
  const at = csv.charCodeAt.bind(csv), eol = /\r?\n|\r/.exec(csv)?.[0] ?? "\n";
  let z = 0, y = 0, x = 0, w = 0;
  do switch (at(z) | state) {
    case On.LF_FIELD:
    case On.CR_FIELD:
      if (!raw) break;
      add(csv.slice(y, z), x, w++, raw = fix = false);
    case On.LF_LIMIT:
    case On.CR_LIMIT:
      state === State.LIMIT && add("", x, w++, false);
    case On.CR_AFTER:
      at(z) === Character.CR && z < len && at(z + 1) === Character.LF && ++z;
    case On.LF_AFTER:
      state = State.LIMIT, ++x, size ??= w, w = 0;
      break;
    case On.QT_FIELD:
      if (!raw) {
        if (z < len && at(z + 1) === Character.QT) fix = true, ++z;
        else {
          add(maybe(csv.slice(y, z), fix), x, w++, true);
          state = State.AFTER, raw = fix = false;
        }
        break;
      }
    case On.QT_AFTER:
      return z;
    case On.QT_LIMIT:
      if (optimistic && size) {
        let v = z;
        do v = csv.indexOf('"', v + 1) + 1; while (
          v && z < len && at(v) === Character.QT && (fix = true)
        );
        if (~--v) {
          add(maybe(csv.slice(z + 1, z = v), fix), x, w, true);
          ++w < size || (++x, w = 0), state = State.AFTER, raw = fix = false;
          break;
        }
      }
      y = z + 1, state = State.FIELD, fix = false;
      break;
    case On.CM_FIELD:
      if (!raw) break;
      add(csv.slice(y, z), x, w++, raw = fix = false);
    case On.CM_AFTER:
      state = State.LIMIT;
      break;
    case On.CM_LIMIT:
      add("", x, w++, false);
      break;
    default:
      if (state === State.LIMIT) {
        if (optimistic && size) {
          const to = w === size - 1 ? eol : ",", end = csv.indexOf(to, z + 1);
          if (~end) {
            add(csv.slice(z, end), x, w, raw = fix = false);
            z = end + to.length - 1, ++w < size || (++x, w = 0);
            break;
          }
        }
        state = State.FIELD, y = z, raw = true, fix = false;
      }
  } while (z++ < len);
  if (state === State.FIELD) {
    if (!raw) return z;
    add(csv.slice(y), x, w, false);
  }
};
