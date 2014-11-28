/**
 * Created by wing on 2014/11/28.
 */
var fs = require('fs'), exec = require('child_process').exec;
var q = require('q');
q.nfcall(fs.readFile, 'dist/ntibar.tpl.html').then(function(data) {
    data = "angular.module('nti').run(['$templateCache', function($templateCache) {var fun = function() { /*" + String(data) + "" +
    "*/};var lines = new String(fun);var tpl =  lines.substring(lines.indexOf('/*') + 2, lines.lastIndexOf('*/'));$templateCache.put('ntibar.tpl.html', tpl);}]);";
    return q.nfcall(fs.writeFile, 'dist/ntibar.tpl.js', data);
}).then(function(){
    return q.nfcall(exec, 'cp dist/ntibar.js dist/ntibar.css dist/ntibar.tpl.js test/public/bower_components/ntibar/dist')
}).catch(function(e){
    console.log(e.stack);
});
