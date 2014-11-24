/**
 * Created by wing on 2014/11/24.
 */
'use strict';
var app = angular.module('nti',[]);
app.directive('ngNtiBar', function(){
    return {
        strict: 'AE',
        templateUrl: 'ntibar.tpl.html'
    }
});