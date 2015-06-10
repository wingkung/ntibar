/**
 * Created by wing on 2014/11/24.
 */
'use strict';
var app = angular.module('nti', []);
app.factory('$nti', function($rootScope){
    var service = {};
    service.client = {
        status: -1,
        error: ''
    };

    var cbs = [];

    service.observer = function (cb) {
        cbs.push(cb);
    };

    var setup = function (fn) {
        fn();
        console.log(service.client);
        angular.forEach(cbs, function (cb) {
            if (cb) {
                cb(service.client);
            }
        });
    };

    var defaultResult = function(data){
        console.log(data);
        setup(function () {
            service.client.error = data.descr;
        });
    };

    service.init = function(){

    };
    service.start = function (url, uid, name, type) {
        $.getScript('http://' + url + '/socket.io/socket.io.js').done(function () {
            service.client.url = url;
            service._io = io('http://' + url + '/nti');
            service._io.on('connect', function () {
                service._io.emit('init_staff', {uid: uid, name: name, type: type});
            });

            service._io.on('init_staff', function(data){
                console.log('init_staff', data);
                setup(function () {
                    service.client.staffId = data.staff.staff_id;
                    service.client.agentId = data.staff.agent_id;
                    service.client.ext = data.staff.ext;
                    service.client.name = data.staff.name;
                    service.client.aqs = data.staff.queues;
                    service.client.status = 0;
                    service.client.error = '连接成功';
                });
            });

            service._io.on('error', function () {
                setup(function () {
                    service.client.status = -1;
                    service.client.error = '连接异常';
                });
            });
            service._io.on('disconnect', function () {
                setup(function () {
                    service.client.status = -1;
                    service.client.error = '断开连接';
                });
            });
            service._io.on('cti_error', function () {
                setup(function () {
                    service.client.status = 0;
                    service.client.error = 'cti连接异常';
                });
            });

            service._io.on('login', function (data) {
                setup(function () {
                    if (data.rtn){
                        service.client.status = 1;
                    }
                    service.client.error = data.descr;
                });
            });
            service._io.on('logout', function (data) {
                defaultResult(data);
            });
            service._io.on('transfer', function (data) {
                defaultResult(data);
            });
            service._io.on('dial', function (data) {
                defaultResult(data);
            });
            service._io.on('hangup', function (data) {
                defaultResult(data);
            });
            service._io.on('hold', function (data) {
                defaultResult(data);
            });
            service._io.on('unhold', function (data) {
                defaultResult(data);
            });
            service._io.on('consult', function (data) {
                defaultResult(data);
            });
            service._io.on('consult_cancel', function (data) {
                defaultResult(data);
            });
            service._io.on('consult_transfer', function (data) {
                defaultResult(data);
            });
            service._io.on('consult_bridge', function (data) {
                defaultResult(data);
            });
            service._io.on('consult_bridge', function (data) {
                defaultResult(data);
            });
            service._io.on('listen', function (data) {
                defaultResult(data);
            });
            service._io.on('ropcall', function (data) {
                defaultResult(data);
            });
            service._io.on('intrusion', function (data) {
                defaultResult(data);
            });
            service._io.on('change_state', function (data) {
                defaultResult(data);
            });
            service._io.on('state', function (data) {
                setup(function(){
                    service.client.state = data.state;
                    service.client.subState = data.subState;
                    if (service.client.state == 3){
                        service.client.ctls = 0;
                    }
                })
            });
            service._io.on('info', function (data) {
                setup(function(){
                    service.client.name = data.agentName;
                    service.client.agentId = data.agentId;
                    service.client.ext = data.ext;
                    service.client.isAdmin = data.typeCode == 'B';
                })
            });
            service._io.on('admin_mode', function (data) {
                setup(function(){
                    service.client.adminMode = data.adminMode;
                })
            });
            service._io.on('wrapup_mode', function (data) {
                setup(function(){
                    service.client.wrapupMode = data.wrapupMode;
                })
            });
            service._io.on('agents_info', function (data) {
                setup(function(){
                    service.client.agents = data;
                })
            });
            service._io.on('ivrs_info', function (data) {
                setup(function(){
                    service.client.ivrs = data;
                })
            });
            service._io.on('queues_info', function (data) {
                setup(function(){
                    service.client.queues = data;
                })
            });
            service._io.on('queue_monitor', function(data){
                //TODO
            });
            service._io.on('scene', function (data) {
                setup(function(){
                    service.client.scene = data.scene;
                    service.client.ctls = data.ctls;
                });
            });
            service._io.on('userin', function (data) {
                setup(function(){
                    service.client.userin = data;
                    $rootScope.$broadcast('nti:userin', data);
                })
            });

            setup(function () {
                service.client.error = '读取脚本成功';
            });

            /*动作功能*/
            var _emit = function (e, data) {
                service._io.emit(e, data);
            };

            /**
             * 登录
             * @param params {Object}
             * @param params.agentId {String} 坐席id(必选)
             * @param params.password {String} 密码(必选)
             * @param params.ext {String} 分机(必选)
             */
            service.login = function (params) {
                service.client.tenantId = params.tenantId || "1";
                service.client.agentId = params.agentId;
                params.password = '89ba9fa0769dc0e83ff6d2c013f0795f';
                _emit('login', params);
            };

            /**
             * 登出
             */
            service.logout = function () {
                _emit('logout', {});
            };

            /**
             * 外拨
             * @param params {Object} 参数
             * @param params.type {int} 外拨类型 CCOne.TYPE_ 定义
             * @param params.target {String} 外拨目标
             */
            service.dial = function (params) {
                if (params.type == 3)
                    params.target = service.client.tenantId + '_' + params.target;
                _emit('dial', params);
            };

            /**
             * 保持
             */
            service.hold = function () {
                _emit('hold', {});
            };

            /**
             * 取消保持
             */
            service.unHold = function () {
                _emit('unhold', {});
            };

            /**
             * 转移
             * @param params {Object} 参数
             * @param params.type {int} 转移类型 CCOne.TYPE_ 定义
             * @param params.target {String}
             */
            service.transfer = function (params) {
                if (params.type == 3)
                    params.target = service.client.tenantId + '_' + params.target;
                _emit('transfer', params);
            };

            /**
             * 转满意度
             */
            service.ssi = function () {
                _emit('ssi', {});
            };

            /**
             * 咨询
             * @param params {Object} 参数
             * @param params.type {int} 咨询类型 CCOne.TYPE_ 定义
             * @param params.target {String} 咨询的目标
             */
            service.consult = function (params) {
                if (params.type == 3)
                    params.target = service.client.tenantId + '_' + params.target;
                _emit('consult', params);
            };

            /**
             * 咨询成功取消
             */
            service.consultCancel = function () {
                _emit('consult_cancel', {});
            };

            /**
             * 咨询成功后转移
             */
            service.consultTransfer = function (params) {
                _emit('consult_transfer', params);
            };

            /**
             * 咨询成功后三方通话
             */
            service.consultBridge = function () {
                _emit('consult_bridge', {});
            };

            /**
             * 挂机
             */
            service.hangup = function () {
                _emit('hangup', {});
            };

            /**
             * 监听
             * @param params {Object} 参数
             * @param params.target {String} 监听坐席
             */
            service.listen = function (params) {
                if (params.type == 3)
                    params.target = service.client.tenantId + '_' + params.target;
                _emit('listen', params);
            };

            /**
             * 监听成功后拦截
             */
            service.ropcall = function () {
                _emit('ropcall', {});
            };

            /**
             * 监听成功后强插
             */
            service.intrusion = function () {
                _emit('intrusion', {});
            };

            /**
             * 改变状态
             * @param params {Object} 参数
             * @param params.state {int} 状态值 0:空闲 1:忙 >1:自定义状态
             */
            service.changeState = function (params) {
                _emit('change_state', params);
            };

            /**
             * 管理员模式
             * @param params {Object}
             * @param params.mode {int}
             * @type {*|Function}
             */
            service.adminMode = function (params) {
                params.mode = params.mode ? '1' : '0';
                _emit('admin_mode', params);
            };

            /**
             * 话后模式
             * @param params {Object}  参数
             * @param params.mode {boolean} true: 打开话后模式, false: 关闭话后模式
             */
            service.wrapupMode = function (params) {
                params.mode = params.mode ? '1' : '0';
                _emit('wrapup_mode', params);
            };

            /**
             * 查询坐席列表
             */
            service.agentsInfo = function (params) {
                _emit('agents_info', params);
            };

            /**
             * 查询流程列表
             */
            service.ivrsInfo = function () {
                _emit('ivrs_info', {});
            };

            /**
             * 查询队列列表
             */
            service.queuesInfo = function () {
                _emit('queues_info', {});
            };

            /**
             * 查询队列情况
             */
            service.queueMonitor = function(){
                _emit('queue_monitor', {});
            };
        }).fail(function () {
            setup(function () {
                service.client.error = '读取脚本失败';
            });
        })
    };

    service.start();
    return service;
});

app.directive('ngNtiBar', function () {
    return {
        strict: 'AE',
        templateUrl: 'ntibar.tpl.html',
        controller: 'NtiBarCtrl'
    }
});

app.controller('NtiBarCtrl', function ($scope, $nti) {
    $scope.CTL_TRANS = 1 << 1;
    $scope.CTL_HOLD = 1 << 2;
    $scope.CTL_UNHOLD = 1 << 3;
    $scope.CTL_CONSULT = 1 << 4;
    $scope.CTL_CONSULT_TRANS = 1 << 5;
    $scope.CTL_CONSULT_CANCEL = 1 << 6;
    $scope.CTL_ODIAL = 1 << 10;
    $scope.CTL_LISTEN = 1 << 13;
    $scope.CTL_ROPCALL = 1 << 17;

    $scope.ntiTranslateState = function(status, state){
        if (status == -1){
            return "未连接";
        }else if(status == 0){
            return "未登录";
        }else if(state == 1){
            return '空闲';
        }else if(state == 2){
            return '忙';
        }else if (state == 3){
            return '连接中';
        }else if (state == 4){
            return '话后';
        }else if (state == 5){
            return '通话';
        }else{
            return '其他';
        }
    };

    $scope.ntiClient = $nti.client;


    $nti.observer(function (client) {
        $scope.$apply(function () {
            $scope.ntiClient = client;
        });
    });

    $scope.ntiHas = function (ctl) {
        if ($scope.ntiClient.status < 1)
            return false;
        if (ctl == 'hangup'){
            return ($scope.ntiClient.state == 3 || $scope.ntiClient.state == 5);
        }
        return ($scope.ntiClient.ctls & ctl) != 0;
    };

    $scope.ntiLogin = function(){
        $nti.login({
            tenantId:1,
            agentId: $scope.ntiClient.agentId,
            password: 'e10adc3949ba59abbe56e057f20f883e',
            ext: $scope.ntiClient.ext,
            queues: $scope.ntiClient.aqs,
            staffId: $scope.ntiClient.staffId
        });
    };

    $scope.ntiDial = function(){
        $nti.dial({type: 2, target: $scope.ntidTarget});
    };

    $scope.ntiLogout = function(){
        $nti.logout();
    };

    $scope.ntiHold = function(){
        $nti.hold();
    };

    $scope.ntiUnHold = function(){
        $nti.unHold();
    };

    $scope.ntiConsult = function(){
        $nti.consult({type:2, target: $scope.nticTarget});
    };

    $scope.ntiConsultBridge = function(){
        $nti.consultBridge();
    };

    $scope.ntiConsultCancel = function(){
        $nti.consultCancel();
    };

    $scope.ntiConsultTransfer = function(){
        $nti.consultTransfer();
    };

    $scope.ntiTransfer = function(){
        $nti.transfer({type:2, target: $scope.ntitTarget});
    };

    $scope.ntiHangup = function(){
        $nti.hangup();
    };

    $scope.ntiEndWrapup = function(){
        $nti.changeState({state: 0})
    };

    $scope.ntiChangeState = function(state){
        $nti.changeState({state: state});
    };

    $scope.ntiChangeAdminMode = function(){
        $nti.adminMode({mode: $scope.ntiClient.adminMode});
    };


    $scope.ntiChangeWrapupMode = function(){
        $nti.wrapupMode({mode: $scope.ntiClient.wrapupMode});
    };

});
