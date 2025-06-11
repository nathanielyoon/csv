import { assertEquals } from "jsr:@std/assert@^1.0.13";
import { csv_json, json_csv } from "./mod.ts";

Deno.test("csv_json", () =>
  Promise.all([
    "all-empty",
    "empty-field",
    "empty-one-column",
    "leading-space",
    "one-column",
    "quotes-empty",
    "quotes-with-comma",
    "quotes-with-escaped-quote",
    "quotes-with-newline",
    "quotes-with-space",
    "simple-crlf",
    "simple-lf",
    "trailing-newline",
    "trailing-newline-one-field",
    "trailing-space",
    "utf8",
  ].map(($) =>
    Promise.all(["csv", "json"].map((type) =>
      fetch(
        `https://raw.githubusercontent.com/sineemore/csv-test-data/e4c25ebd65902671bc53eedc67275c2328067dbe/${type}/${$}.${type}`,
      ).then((response) => response.text())
    ))
  )).then(($) =>
    $.concat([["", "[]"], ['a"', "null"], ['"a', "null"]])
      .forEach(([csv, json]) =>
        assertEquals(
          csv_json(csv)?.map(($) => $.map(($) => $ ?? "")) ?? null,
          JSON.parse(json),
        )
      )
  ));
Deno.test("json_csv", () =>
  [
    [null, ""],
    ["", '""'],
    ["\n", '"\n"'],
    ["\r", '"\r"'],
    ['"', '""""'],
    [",", '","'],
    ["ok", "ok"],
  ].forEach(($) => assertEquals(json_csv([[$[0]]]), $[1] + "\n")));
