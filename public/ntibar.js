/**
 * Created by wing on 2014/11/24.
 */
'use strict';
var app = angular.module('nti',[]);

app.factory('CommonService', function(){
    var service = {};
    service.error = function(msg){
        $rootScope.$broadcast('message', {error: msg});
    };

    service.info = function(msg){
        $rootScope.$broadcast('message', {info: msg});
    };

    service.success = function(msg){
        $rootScope.$broadcast('message', {success: msg});
    };

    service.event = function(event, data){
        $rootScope.$broadcast('nti_' + event, data);
    };
    return service;
});

app.factory('ClientService', function(CommonService){
    var service = {};
    service.client = {
        status: -1,
        error: ''
    };
    service.init = function(url){
        $.getScript('http://' + url + '/socket.io/socket.io.js').done(function(){
            service.client.url = url;
            service._io = io('http://' + url + '/nti');
            service._io.on('connect', function(){
                service.client.status = 0;
                service.client.error = '连接成功';
            });
            service._io.on('error', function(){
                service.client.status = -1;
                service.client.error = '连接异常';
            });
            service._io.on('disconnect', function(){
                service.client.status = -1;
                service.client.error = '断开连接';
            });
            service._io.on('disconnect', function(){
                service.client.status = -1;
                service.client.error = '断开连接';
            });
            service.client.error = '读取脚本成功';
        }).fail(function(){
            service.client.error = '读取脚本失败';
        })
    };




    return service;
});

app.directive('ngNtiBar', function(){
    return {
        strict: 'AE',
        templateUrl: 'ntibar.tpl.html',
        controller: 'NtiBarCtrl'
    }
});

app.controller('NtiBarCtrl', function($scope){
    $scope.name = "管理员";
});