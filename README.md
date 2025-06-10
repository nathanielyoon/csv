# csv

Read and write CSV ([RFC 4180](https://rfc-editor.org/rfc/rfc4180)).

```ts
import { csv_json, json_csv } from "@nyoon/csv";
import { assertEquals } from "@std/assert";

const csv = `aaa,bbb,ccc
zzz,yyy,xxx
`;
const json = [["aaa", "bbb", "ccc"], ["zzz", "yyy", "xxx"]];

assertEquals(csv_json(csv), json);
assertEquals(json_csv(json), csv);
```
