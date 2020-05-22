let pg = require('pg');

let replaceReservedChar = function(inStr) {
    if (!inStr) {
        return inStr;
    }
    let outStr = inStr.replace(/'/g, "''");
    return outStr;
};

module.exports = {
    client: null,
    setLogger: function (logger) {
        this.logger = logger;
    },
    pgConnect: async function (reConnect) {
        reConnect = reConnect || false;
        if (this.client && !reConnect) {
            return this.client;
        }
        // logger.log('new connect,reConnect:' + reConnect);
        this.client = new pg.Client(__env__.dbConfig.conString);
        await this.client.connect();
        return this.client;
    },
    asyncFind: async function (sql) {
        if (!this.logger) this.logger = console;
        this.logger.log("exec sql:" + sql);
        let upperCaseSql = sql.toUpperCase();
        if ((upperCaseSql.indexOf("UPDATE ") !== -1 || upperCaseSql.indexOf("DELETE ") !== -1)
            && upperCaseSql.toUpperCase().indexOf("WHERE ") === -1) {
            throw new Error(sql + " sql is error");
        }
        let client = await this.pgConnect();
        let result = null;
        try {
            result = await client.query(sql);
            let items = upperCaseSql.indexOf("SELECT ") !== -1 ? result.rows : result;
            this.logger.log("exec sql complete.");
            return items;
        } catch (e) {
            if (client._ending) {
                await this.pgConnect(true);
            }
            throw e;
        }
    },
    asyncInsert: async function (tableName, data) {
        return (await this.asyncFind(this.buildInsertStatement(tableName, data, true))).rows;
    },
    asyncInsertReturnIdKey: async function (tableName, data, idKey) {
        return (await this.asyncFind(this.buildInsertStatementReturnIdkey(tableName, data, idKey))).rows;
    },
    asyncUpdate: async function (tableName, data, where) {
        return (await this.asyncFind(this.buildUpdateStatement(tableName, data, where))).rows;
    },
    buildInsertStatement: function (tableName, data, _return) {
        let keys = '';
        let values = '';
        for (let key in data) {
            keys += `${key},`;
            let val = data[key];
            if (typeof val === 'string') {
                values += `'${replaceReservedChar(val)}',`;
            } else if (typeof val === 'object') {
                values += `'${replaceReservedChar(JSON.stringify(val))}',`;
            } else {
                values += `${val},`;
            }
        }

        if (keys.length === 0 || values.length === 0) {
            throw new Error('buildInsertStatement failed for ' + tableName);
        }

        keys = keys.substr(0, keys.length - 1);
        values = values.substr(0, values.length - 1);

        _return = _return || false;
        let returnPart = _return ? ' returning id' : '';

        return `insert into ${tableName} (${keys}) values (${values})${returnPart};`
    },
    buildInsertStatementReturnIdkey: function (tableName, data, idKey) {
        let keys = '';
        let values = '';
        for (let key in data) {
            keys += `${key},`;
            let val = data[key];
            if (typeof val === 'string') {
                values += `'${replaceReservedChar(val)}',`;
            } else if (typeof val === 'object') {
                values += `'${replaceReservedChar(JSON.stringify(val))}',`;
            } else {
                values += `${val},`;
            }
        }

        if (keys.length === 0 || values.length === 0) {
            throw new Error('buildInsertStatementReturnIdkey failed for ' + tableName);
        }

        keys = keys.substr(0, keys.length - 1);
        values = values.substr(0, values.length - 1);

        return `insert into ${tableName} (${keys}) values (${values}) returning ${idKey};`
    },
    buildUpdateStatement: function (tableName, data, where) {
        let setValues = '';
        for (let key in data) {
            setValues += key + '=';
            let val = data[key];
            if (typeof val === 'string') {
                setValues += `'${replaceReservedChar(val)}',`;
            } else if (typeof val === 'object') {
                setValues += `'${replaceReservedChar(JSON.stringify(val))}',`;
            } else {
                setValues += `${val},`;
            }
        }
        if (setValues.length === 0) {
            throw new Error('buildUpdateStatement failed for ' + tableName);
        }
        setValues = setValues.substr(0, setValues.length - 1);

        let wheres = '';
        for (let key in where) {
            let val = where[key];
            if (typeof val === 'string') {
                wheres += `${key}='${val}' and `;
            } else {
                wheres += `${key}=${val} and `;
            }
        }
        if (wheres.length === 0) {
            throw new Error('buildUpdateStatement failed for ' + tableName);
        }
        wheres = wheres.substr(0, wheres.length - 5);

        return `update ${tableName} set ${setValues} where ${wheres};`
    }
};