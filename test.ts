import { assert, assertEquals, assertThrows } from "@std/assert";
import { parser } from "./mod.ts";

const array = (csv: string, skip = false) => {
  let row: string[];
  const rows: string[][] = [];
  return parser((out, _, col_n) => {
    col_n || rows.push(row = []), row[col_n] = out;
  }, skip)(csv) || rows;
};
const object = (csv: string, skip = false) => {
  let row: { [key: string]: string };
  const header: string[] = [], rows: { [key: string]: string }[] = [];
  return parser((out, row_n, col_n) => {
    if (row_n) col_n || rows.push(row = {}), row[header[col_n]] = out;
    else header.push(out);
  }, skip)(csv) || { header, rows };
};
Deno.test(function rfc4180() {
  const csv = "aaa,bbb,ccc\r\nzzz,yyy,xxx\r\n";
  const json = [["aaa", "bbb", "ccc"], ["zzz", "yyy", "xxx"]];
  const names = ["field_name1", "field_name2", "field_name3"];
  assertEquals(array(csv), json, "2.1");
  assertEquals(array(csv.slice(0, -2)), json, "2.2");
  const out = object(`${names}\r\n${csv}`);
  assert(typeof out === "object");
  assertEquals(
    out.rows,
    json.map((row) =>
      row.reduce(
        (object, value, index) => ({ ...object, [names[index]]: value }),
        {},
      )
    ),
    "2.3",
  );
  assertEquals(array(csv.slice(0, csv.indexOf("\n"))), [json[0]], "2.4");
  assertEquals(array(csv.replace(/[abc]+/g, '"$&"').slice(0, -2)), json, "2.5");
  assertEquals(
    array('"aaa","b\r\nbb","ccc"\r\nzzz,yyy,xxx'),
    [["aaa", "b\r\nbb", "ccc"], json[1]],
    "2.6",
  );
  assertEquals(array('"aaa","b""bb","ccc"'), [["aaa", 'b"bb', "ccc"]], "2.7");
});
Deno.test(function special_cases() {
  assertEquals(array(""), [], "empty arrays");
  assertEquals(object(""), { header: [], rows: [] }, "empty objects");
  assertEquals(array('a"'), 1, "bad quote");
  assertEquals(array('"a'), 2, "bad ending");
});
