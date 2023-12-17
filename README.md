# rhinokv
simple key-value database for kakaotalk bot on Rhino Javascript environment.

```javascript
const RhinoKV = require('rhinokv');﻿

KV = new RhinoKV(); 

KV.open('/sdcard/msgbot/mydb.db'); // 없으면 새로 만듭니다. 있으면 있는거 씁니다.

KV.put("test","hi");

KV.put("test2",{"abc":{"def":"hij"}})

v = KV.get("test").value;

s = KV.search("hi");

sj = KV.searchJson("abc.def","hi");

KV.db.rawQuery("select * from kv_pairs",[]); // db는 android.database.sqlite.SQLiteDatabase 객체이므로 db를 날로 다룰수도 있음.

```
