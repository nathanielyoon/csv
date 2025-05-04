import { assert, assertEquals, assertThrows } from "@std/assert";
import { parse } from "../main.ts";

const rfc4180 = {
  "2.1": {
    "csv": "aaa,bbb,ccc\r\nzzz,yyy,xxx\r\n",
    "json": [["aaa", "bbb", "ccc"], ["zzz", "yyy", "xxx"]],
  },
  "2.2": {
    "csv": "aaa,bbb,ccc\r\nzzz,yyy,xxx",
    "json": [["aaa", "bbb", "ccc"], ["zzz", "yyy", "xxx"]],
  },
  "2.4": {
    "csv": "aaa,bbb,ccc",
    "json": [["aaa", "bbb", "ccc"]],
  },
  "2.5": {
    "csv": '"aaa","bbb","ccc"\r\nzzz,yyy,xxx\r\n',
    "json": [["aaa", "bbb", "ccc"], ["zzz", "yyy", "xxx"]],
  },
  "2.6": {
    "csv": '"aaa","b\r\nbb","ccc"\r\nzzz,yyy,xxx',
    "json": [["aaa", "b\r\nbb", "ccc"], ["zzz", "yyy", "xxx"]],
  },
  "2.7": {
    "csv": '"aaa","b""bb","ccc"',
    "json": [["aaa", 'b"bb', "ccc"]],
  },
};
Deno.test("rfc4180", () => {
  for (const key of Object.keys(rfc4180) as (keyof typeof rfc4180 & string)[]) {
    const { csv, json } = rfc4180[key];
    assertEquals(parse(csv), json);
  }
});
Deno.test("bad", () => {
  assertEquals(parse(""), [], "empty");
  assertEquals(parse('a"'), null, "bad quote");
  assertEquals(parse('"a'), null, "bad ending");
});
