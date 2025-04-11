(function() {
    const SQLiteDatabase = android.database.sqlite.SQLiteDatabase;
    const ContentValues = android.content.ContentValues;

    function RhinoKV() {
        this.filename = null;
        this.currentCollection = "kv_pairs";
    };

    RhinoKV.prototype.open = function(filename) {
        this.filename = filename;
        this.db = SQLiteDatabase.openOrCreateDatabase(this.filename, null);
        this.db.execSQL("CREATE TABLE IF NOT EXISTS kv_pairs (key TEXT PRIMARY KEY, value TEXT)");
    };
    
    RhinoKV.prototype.close = function() {
        this.db.close();
    };

    RhinoKV.prototype.setCollection = function(collectionName) {
        if (collectionName === "default") {
            this.currentCollection = "kv_pairs";
        } else {
            this.currentCollection = collectionName;
        }

        // Create the table if it doesn't exist
        let tableName = this.currentCollection;
        this.db.execSQL("CREATE TABLE IF NOT EXISTS " + tableName + " (key TEXT PRIMARY KEY, value TEXT)");
    };

    RhinoKV.prototype.listCollections = function() {
        let results = [];
        let cursor = this.db.rawQuery("SELECT name FROM sqlite_master WHERE type='table'", []);
        if (cursor.moveToFirst()) {
            do {
                let name = cursor.getString(0)+"";
                if (name === "kv_pairs") {
                    results.push("default");
                } else {
                    results.push(name);
                }
            } while (cursor.moveToNext());
        }
        cursor.close();
        return results;
    };
    
    RhinoKV.prototype.get = function(key) {
        let cursor = this.db.rawQuery("SELECT * FROM " + this.currentCollection + " WHERE key = ?", [key]);
        try {
            if (cursor.moveToFirst()) {
                let value = cursor.getString(cursor.getColumnIndexOrThrow("value"))+"";
                return JSON.parse(value);
            } else {
                return false;
            }
        } finally {
            cursor.close();
        }
    };

    RhinoKV.prototype.getKV = function(key) {
        let cursor = this.db.rawQuery("SELECT * FROM " + this.currentCollection + " WHERE key = ?", [key]);
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
        this.db.insertWithOnConflict(this.currentCollection, null, contentValues, SQLiteDatabase.CONFLICT_REPLACE);
    };
    
    RhinoKV.prototype.search = function(searchString) {
        let results = [];
        let cursor = this.db.rawQuery("SELECT * FROM " + this.currentCollection + " WHERE value LIKE '%' || ? || '%'",[searchString]);
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
        let cursor = this.db.rawQuery("SELECT key, value FROM " + this.currentCollection + " WHERE value LIKE '%' || ? || '%'", [searchString]);
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
        let cursor = this.db.rawQuery("SELECT * FROM " + this.currentCollection + " WHERE key LIKE '%' || ? || '%'",[searchString]);
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
        let cursor = this.db.rawQuery("SELECT key FROM " + this.currentCollection,[]);
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
        this.db.delete(this.currentCollection, "key = ?", [key]);
    };
    
    RhinoKV.RhinoKV = function() {
        return RhinoKV;
    };

    module.exports = RhinoKV;
})();
