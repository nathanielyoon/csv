# csv

Read and write CSV.

```ts
import { assertEquals } from "@std/assert";
import { csv_json, json_csv } from "@nyoon/csv";

const csv = `aaa,bbb,ccc
zzz,yyy,xxx
`;
const json = [["aaa", "bbb", "ccc"], ["zzz", "yyy", "xxx"]];

assertEquals(csv_json(csv), json);
assertEquals(json_csv(json), csv);
```
