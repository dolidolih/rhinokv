(function() {
    const SQLiteDatabase = android.database.sqlite.SQLiteDatabase;
    const ContentValues = android.content.ContentValues;

    function RhinoKV() {
        this.filename = null;
    };

    RhinoKV.prototype.open = function(filename) {
        this.filename = filename;
        this.db = SQLiteDatabase.openOrCreateDatabase(this.filename, null);
        this.db.execSQL("CREATE TABLE IF NOT EXISTS kv_pairs (key TEXT PRIMARY KEY, value TEXT)");
    };
    
    RhinoKV.prototype.close = function() {
        this.db.close();
    };
    
    RhinoKV.prototype.get = function(key) {
        let cursor = this.db.rawQuery("SELECT * FROM kv_pairs WHERE key = ?", [key]);
        try {
            if (cursor.moveToFirst()) {
                let value = cursor.getString(cursor.getColumnIndexOrThrow("value"))+"";
                return { "key": key, "value": JSON.parse(value) };
            } else {
                return false;
            }
        } finally {
            cursor.close();
        }
    };
    
    RhinoKV.prototype.put = function(key, value) {
        let contentValues = new ContentValues();
        contentValues.put("key", key);
        contentValues.put("value", JSON.stringify(value));
        this.db.insertWithOnConflict("kv_pairs", null, contentValues, SQLiteDatabase.CONFLICT_REPLACE);
    };
    
    RhinoKV.prototype.search = function(searchString) {
        let results = [];
        let cursor = this.db.rawQuery("SELECT * FROM kv_pairs WHERE value LIKE '%' || ? || '%'",[searchString]);
        if (cursor.moveToFirst()) {
            do {
                let key = cursor.getString(0)+"";
                let value = cursor.getString(1)+"";
                results.push({key: key, value: JSON.parse(value)});
            } while (cursor.moveToNext());
        }
        cursor.close();
        return results;
    };
    
    RhinoKV.prototype.searchJson = function(valueKey, searchString) {
        let results = [];
        let cursor = this.db.rawQuery("SELECT key, value FROM kv_pairs WHERE value LIKE '%' || ? || '%'", [searchString]);
        if (cursor.moveToFirst()) {
            do {
                let key = cursor.getString(0)+"";
                let value = JSON.parse(cursor.getString(1)+"");
                let valueKeyComponents = valueKey.split('.');
                let currValue = value;
                for (let i = 0; i < valueKeyComponents.length; i++) {
                    let valueKeyComponent = valueKeyComponents[i];
                    if (!currValue.hasOwnProperty(valueKeyComponent)) {
                        break;
                    }
                    currValue = currValue[valueKeyComponent];
                }
                if (currValue.toString().includes(searchString)) {
                    results.push({key: key, value: value});
                }
            } while (cursor.moveToNext());
        }
        cursor.close();
        return results;
    };
    
    RhinoKV.prototype.searchKey = function(searchString) {
        let results = [];
        let cursor = this.db.rawQuery("SELECT * FROM kv_pairs WHERE key LIKE '%' || ? '%'",[searchString]);
        if (cursor.moveToFirst()) {
            do {
                let key = cursor.getString(0)+"";
                let value = cursor.getString(1)+"";
                results.push({key: key, value: JSON.parse(value)});
            } while (cursor.moveToNext());
        }
        cursor.close();
        return results;
    };

    RhinoKV.prototype.listKeys = function() {
        let results = [];
        let cursor = this.db.rawQuery("SELECT key FROM kv_pairs",[]);
        if (cursor.moveToFirst()) {
            do {
                let key = cursor.getString(0)+"";
                results.push(key);
            } while (cursor.moveToNext());
        }
        cursor.close();
        return results;
    };
    
    RhinoKV.prototype.del = function(key) {
        this.db.delete("kv_pairs", "key = ?", [key]);
    };
    
    RhinoKV.RhinoKV = function() {
        return RhinoKV;
    };

    module.exports = RhinoKV;
})();
