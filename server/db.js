var mysql = require("mysql");
var q = require("q"), util = require('util');

/** pooled mysql **/
var option = {
    host: '127.0.0.1',
    user: 'ccone',
    password: 'ccone',
    database: 'nti',
    connectionLimit: 10,
    dateStrings: true,
    multipleStatements: true
};

var pool = mysql.createPool(option);

exports.query = function (sql, args, lower) {
    if (arguments.length == 1) {
        args = [];
    }
    if (arguments.length == 2){

        if (!util.isArray(args)){
            lower = args;
        }
    }
    var deferred = q.defer();
    pool.getConnection(function (err, connection) {
        if (err) {
            deferred.reject(new Error('数据库异常'));
        } else {
            connection.query(sql, args, function (err, rows) {
                console.log('sql: ' + sql + ' ' + JSON.stringify(args));
                if (err) {
                    console.log('err: ' + err.message);
                    deferred.reject(err);
                } else {
                    if (lower){
                        var datas = [];
                        rows.forEach(function(row){
                            var data = {};
                            for (var key in row) {
                                data[key.toLowerCase()] = row[key];
                            }
                            datas.push(data);
                        });
                        deferred.resolve(datas);
                    }else
                        deferred.resolve(rows);
                }
                connection.release();
            })
        }
    });
    return deferred.promise;
};


exports.insert = function (table, obj) {
    if (typeof table == 'undefined') {
        throw new Error('表不存在');
    }
    if (typeof obj == 'undefined') {
        throw new Error('数据不存在');
    }
    var keys = [];
    var values = [];
    for (var key in obj) {
        keys.push('`' + key + '`');
        if (obj[key] == 'now()'){
            values.push("now()");
        }else{
            values.push("'" + obj[key] + "'");
        }
    }
    var sql = "insert into " + table + " (" + keys.join(',') + ") values (" + values.join(',') + ")";
    return exports.query(sql);
};

exports.update = function (table, obj, where) {
    if (typeof table == 'undefined') {
        throw new Error('表不存在');
    }
    if (typeof obj == 'undefined') {
        throw new Error('数据不存在');
    }
    where = where || '';
    var sets = [];
    for (var key in obj) {
        if (obj[key] == 'now()') {
            sets.push("`" + key + "`=now()");
        }else{
            sets.push("`" + key + "`='" + obj[key] + "'");
        }
    }
    var sql = "update " + table + " set " + sets.join(',') + " " + where;
    return exports.query(sql);
};