/* client.js */

var net = require('net');
var util = require('util');
var _ = require('lodash');

var clients = [];
var cache = {
    agent_infos: {time: 0, data: []},
    ivr_infos: {time: 0, data: []},
    queue_infos: {time: 0, data: []},
    qm_infos: []
};

exports.Client = function (params) {
    this.tenantId = params.tenantId;
    this.agentId = params.agentId;
    this.password = params.password;
    this.ext = params.ext;
    this.host = params.host;
    this.sockets = [];

    this.left = "";
    this.timer = null;

    var self = this;

    this.send = function (action, msg) {
        console.log(action + ',' + self.tenantId + ',' + self.agentId + ',' + msg);
        self.netSocket.write(action + ',' + self.tenantId + ',' + self.agentId + ',' + msg + '\r\n');
    };
    this.init = function () {
        self.netSocket = net.connect({port: 14600, host: self.host}, function () {
            /*var md5 = require('crypto').createHash('md5');
            md5.update(self.password);md5.digest("hex")*/
            self.send('Login', self.password + ',' + self.ext);
            console.log(self.tenantId + '-' + self.agentId + ":客户端连接建立");
        });
        self.netSocket.on('data', function (data) {
            //console.log(self.tenantId + '-' + self.agentId + ":接收 " + data.toString());
            data = self.left + data;
            self.left = "";

            var i = data.indexOf("\r\n");
            var s = "";
            while (i > 0) {
                s = data.substr(0, i);
                self.handle(s.trim());
                data = data.substr(i + 2);
                i = data.indexOf("\r\n");
            }
            self.left = data;
        });
        self.netSocket.on('error', function (err) {
            console.log(self.tenantId + '-' + self.agentId + ":客户端连接异常" + err);
            self.broadcast(self.sockets, 'cti_error', {descr: 'CTI连接异常'});
            self.destroy();
        });
        self.netSocket.on('end', function () {
            console.log(self.tenantId + '-' + self.agentId + ":客户端连接断开 (" + self.sockets.length + ")");
            self.broadcast(self.sockets, 'cti_error', {descr: 'CTI连接断开'});
            self.destroy();
        });
    };

    this.handle = function (data) {
        console.log(self.tenantId + '-' + self.agentId + ':net接收 ' + data);
        var args = data.split(',');
        if (args[0] == 'Login') {
            if (args[1] == "1") {
                self.broadcast(self.sockets, 'login', {rtn: true, descr: '登录成功'});
                self.onScene({scene: "0", ctls: "9216"});

                clearInterval(self.timer);
                self.timer = setInterval(function () {
                    self.netSocket.write('KeepAlive,' + self.tenantId + "," + self.agentId + "\r\n");
                }, 3000);

            } else {
                self.broadcast(self.sockets, 'login', {rtn: false, descr: '登录失败'});
                self.destroy();
            }
        } else if (args[0] == 'AgentState') {
            self.state = args[1];
            self.stateDescr = translateState(self.state);
            if (args.length > 2) {
                self.subState = args[2];
            }
            self.broadcast(self.sockets, 'state', {
                state: self.state,
                subState: self.subState,
                stateDescr: self.stateDescr
            })
        } else if (args[0] == "InitAgent") {
            console.log(args);
            for (var i in args) {
                if (i == 0) continue;
                if (args.hasOwnProperty(i)) {
                    var kv = args[i].split('=');
                    if (kv[0] == 'agentname') {
                        self.agentName = kv[1];
                    } else if (kv[0] == 'typecode') {
                        self.typeCode = kv[1];
                    } else if (kv[0] == 'wrapupmode') {
                        self.wrapupMode = kv[1] == '1';
                    }
                }
            }
            self.adminMode = self.typeCode > 1;
            if (self.typeCode > 1)
                self.broadcast(self.sockets, 'admin_mode', {adminMode: self.adminMode});
            self.broadcast(self.sockets, 'wrapup_mode', {wrapupMode: self.wrapupMode});
            self.broadcast(self.sockets, 'info', {
                agentName: self.agentName,
                agentId: self.agentId,
                ext: self.ext,
                typeCode: self.typeCode
            })
        } else if (args[0] == "Scene") {
            self.onScene({scene: args[1], ctls: args[2]});
        } else if (args[0] == "Hangup") {
            self.onScene({scene: 0, ctls: 9216});
        } else if (args[0] == "Logout") {
            if (args[1] == 1) {
                self.broadcast(self.sockets, 'logout', {descr: '登出成功'});
            } else {
                self.broadcast(self.sockets, 'logout', {descr: '登出失败'});
            }
        } else if (args[0] == "AgentsInfo") {
            self.onAgentsInfo(args[1]);
        } else if (args[0] == "ServicesInfo") {
            self.onIvrsInfo(args[1]);
        } else if (args[0] == 'SkillGroupsInfo') {
            self.onQueuesInfo(args[1]);
        }
        var rtn = '';
        var descr = '';
        if (args[0] == "Dial") {
            rtn = (args[1] == "1");
            descr = "呼叫" + (rtn ? "成功" : "失败");
            self.broadcast(self.sockets, 'dial', {rtn: rtn, descr: descr});
            if (!rtn) {
                self.onScene({scene: 0, ctls: 9216});
            }
        } else if (args[0] == "Hold") {
            rtn = args[1] == "1";
            descr = "保持" + (rtn ? "成功" : "失败");
            self.broadcast(self.sockets, 'hold', {rtn: rtn, descr: descr});
        } else if (args[0] == "UnHold") {
            rtn = args[1] == "1";
            descr = "取消" + (rtn ? "成功" : "失败");
            self.broadcast(self.sockets, 'unhold', {rtn: rtn, descr: descr});
        } else if (args[0] == "Consult") {
            rtn = args[1] == "1";
            descr = "咨询" + (rtn ? "成功" : "失败");
            self.broadcast(self.sockets, 'consult', {rtn: rtn, descr: descr});
        } else if (args[0] == "ConsultCancel") {
            rtn = args[1] == "1";
            descr = "取消" + (rtn ? "成功" : "失败");
            self.broadcast(self.sockets, 'consult_cancel', {rtn: rtn, descr: descr});
        } else if (args[0] == "ConsultTransfer") {
            rtn = args[1] == "1";
            descr = "转移" + (rtn ? "成功" : "失败");
            self.broadcast(self.sockets, 'consult_transfer', {rtn: rtn, descr: descr});
        } else if (args[0] == "ConsultBridge") {
            rtn = args[1] == "1";
            descr = "三方" + (rtn ? "成功" : "失败");
            self.broadcast(self.sockets, 'consult_bridge', {rtn: rtn, descr: descr});
        } else if (args[0] == "Transfer") {
            rtn = args[1] == "1";
            descr = "转移" + (rtn ? "成功" : "失败");
            self.broadcast(self.sockets, 'transfer', {rtn: rtn, descr: descr});
        } else if (args[0] == "WrapupMode") {
            if (args[1] == "1") {
                self.wrapupMode = !self.wrapupMode;
            }
            self.broadcast(self.sockets, 'wrapup_mode', {wrapupMode: self.wrapupMode});
        } else if (args[0] == "AdminMode") {
            if (args[1] == "1") {
                self.adminMode = !self.adminMode;
            }
            self.broadcast(self.sockets, 'admin_mode', {adminMode: self.adminMode});
        } else if (args[0] == "UserIn") {
            var data = {};
            for (var i in args) {
                if (i == 0) continue;
                if (args.hasOwnProperty(i)) {
                    var kv = args[i].split('=');
                    if (kv[0] == 'Caller') {
                        data.caller = kv[1];
                    } else if (kv[0] == 'Callee') {
                        var arr = kv[1].split('#');
                        data.callee = arr[0];
                        data.sessionId = arr[1];
                        data.sessionType = arr[2];
                    }
                }
            }
            self.broadcast(self.sockets, 'userin', data);
        } else if (args[0] == "Listen") {
            rtn = args[1] == '1';
            descr = util.format("监听%s", rtn ? "成功" : "失败");
            if (!rtn) {
                self.onScene({scene: 0, ctls: 9216});
            } else {
                self.onScene({scene: 39, ctls: 135168});
            }
            self.broadcast(self.sockets, 'listen', {rtn: rtn, descr: descr});
        } else if (args[0] == "RopCall") {
            rtn = args[1] == "1";
            descr = "拦截" + (rtn ? "成功" : "失败");
            self.broadcast(self.sockets, 'ropcall', {rtn: rtn, descr: descr});
        } else if (args[0] == "Intrusion") {
            rtn = args[1] == "1";
            descr = "强插" + (rtn ? "成功" : "失败");
            self.broadcast(self.sockets, 'intrusion', {rtn: rtn, descr: descr});
        } else if (args[0] == "ForcedRelease") {
            rtn = args[1] == "1";
            descr = "强拆" + (rtn ? "成功" : "失败");
            self.broadcast(self.sockets, 'forced_release', {rtn: rtn, descr: descr});
        } else if (args[0] == "QueueMonitor") {
            var qis = [];
            var qs = args[1].split('&');
            qs.forEach(function (q) {
                var n = q.split(":");
                qis.push({id: n[0], name: n[1], agentNum: n[2], talkNum: n[3], waitNum: n[4]})
            });
            self.broadcast(self.sockets, 'queue_monitor', qis);
        }
    };

    this.onQueuesInfo = function (info) {
        var now = new Date().getTime();
        if (now - cache.queue_infos.time > 60000) {
            cache.queue_infos.data = [];
            var arr = info.split('&');
            for (var i in arr) {
                var line = arr[i];
                var arr1 = line.split(':');
                var queue = {queueId: arr1[0], name: arr1[1]};
                cache.queue_infos.data.push(queue);
            }
            cache.queue_infos.time = now;
        }
        self.broadcast(self.sockets, 'queues_info', cache.queue_infos.data);
    };

    this.onIvrsInfo = function (info) {
        var now = new Date().getTime();
        if (now - cache.ivr_infos.time > 60000) {
            cache.ivr_infos.data = [];
            var arr = info.split('&');
            for (var i in arr) {
                var line = arr[i];
                var arr1 = line.split(':');
                var ivr = {ivrId: arr1[0], name: arr1[1]};
                cache.ivr_infos.data.push(ivr);
            }
            cache.ivr_infos.time = now;
        }
        self.broadcast(self.sockets, 'ivrs_info', cache.ivr_infos.data);
    };

    this.onAgentsInfo = function (info) {
        var now = new Date().getTime();
        if (now - cache.agent_infos.time > 3000) {
            cache.agent_infos.data = [];
            var arr = info.split('&');
            for (var i in arr) {
                var line = arr[i];
                var arr1 = line.split(':');
                var agent = {
                    agentId: arr1[0],
                    state: arr1[1],
                    stateDescr: translateState(arr1[1]),
                    name: arr1[2],
                    ext: arr1[3]
                };
                cache.agent_infos.data.push(agent);
            }
            cache.agent_infos.time = now;
        }
        self.broadcast(self.sockets, 'agents_info', cache.agent_infos.data);
    };

    this.onScene = function (data) {
        self.scene = data.scene;
        self.ctls = data.ctls;
        self.broadcast(self.sockets, 'scene', {scene: self.scene, ctls: self.ctls})
    };

    this.status = function (socket) {
        var descr = translateState(self.state);
        this.emit(socket, 'login', {rtn: true, descr: '登录成功'});
        this.emit(socket, 'info', {
            agentName: self.agentName,
            agentId: self.agentId,
            typeCode: self.typeCode,
            ext: self.ext
        });
        this.emit(socket, 'state', {state: self.state, subState: self.subState, stateDescr: descr});
        this.emit(socket, 'scene', {scene: self.scene, ctls: self.ctls});
        this.emit(socket, 'admin_mode', {adminMode: self.adminMode});
        this.emit(socket, 'wrapup_mode', {wrapupMode: self.wrapupMode});
    };

    this.dial = function (data) {
        console.log(self.tenantId + '-' + self.agentId + ":呼叫 [" + data.type + "-" + data.target + "]");
        self.send('Dial', data.type + "," + data.target);
    };

    this.logout = function () {
        console.log(self.tenantId + '-' + self.agentId + ":登出");
        self.send('Logout', '');
    };

    this.hangup = function (data) {
        console.log(self.tenantId + '-' + self.agentId + ":挂机");
        self.send('HangupRequest', '');
    };
    this.transfer = function (data) {
        console.log(self.tenantId + '-' + self.agentId + ":转移 [" + data.type + "-" + data.target + "]");
        self.send('Transfer', data.type + ',' + data.target);
    };
    this.consult = function (data) {
        console.log(self.tenantId + '-' + self.agentId + ":咨询 [" + data.type + "-" + data.target + "]");
        self.send('Consult', data.type + ',' + data.target);
    };
    this.hold = function () {
        console.log(self.tenantId + '-' + self.agentId + ":保持");
        self.send('Hold', '');
    };
    this.unhold = function () {
        console.log(self.tenantId + '-' + self.agentId + ":取消保持");
        self.send('UnHold', '');
    };
    this.consultCancel = function () {
        console.log(self.tenantId + '-' + self.agentId + ":取消咨询");
        self.send('ConsultCancel', '');
    };

    this.consultBridge = function () {
        console.log(self.tenantId + '-' + self.agentId + ":咨询三方");
        self.send('ConsultBridge', '');
    };
    this.consultTransfer = function () {
        console.log(self.tenantId + '-' + self.agentId + ":咨询转移");
        self.send('ConsultTransfer', '');
    };
    this.ssi = function () {
        console.log(self.tenantId + '-' + self.agentId + ":保持");
        self.send('Transfer', '3,99');
    };
    this.changeState = function (data) {
        self.send('ChangeState', data.state);
    };
    this.endWrapup = function () {
        self.send('ChangeState', 0);
    };
    this.changeWrapupMode = function (data) {
        self.send('WrapupMode', data.mode);
    };

    this.changeAdminMode = function (data) {
        self.send('AdminMode', data.mode);
    };

    this.listen = function (data) {
        self.send('Listen', util.format("%s,%s", data.type, data.target));
    };

    this.ropcall = function () {
        self.send('RopCall');
    };

    this.intrusion = function () {
        self.send('Intrusion');
    };

    this.forcedRelease = function () {
        self.send('ForcedRelease');
    };

    this.agentsInfo = function (data) {
        self.send('AgentsInfo', '');
    };
    this.ivrsInfo = function (data) {
        self.send('ServicesInfo', '');
    };
    this.queuesInfo = function (data) {
        self.send('SkillGroupsInfo', '');
    };
    this.queueMonitor = function () {
        self.send('QueueMonitor', '');
    };

    this.destroy = function () {
        console.log(self.tenantId + '-' + self.agentId + ":销毁");
        remove(self.tenantId, self.agentId);
        clearInterval(self.timer);
    };

    this.broadcast = function (sockets, action, data) {
        console.log(self.tenantId + '-' + self.agentId + ':发送 (' + action + ')' + JSON.stringify(data));
        for (var i in sockets) {
            if (!sockets.hasOwnProperty(i)) continue;
            var socket = sockets[i];
            socket.emit(action, data);
        }
    };

    this.emit = function (socket, action, data) {
        console.log(self.tenantId + '-' + self.agentId + ':发送 (' + action + ')' + JSON.stringify(data));
        socket.emit(action, data);
    };

    this.countdown = function () {
        if (self.sockets.length <= 0) {
            console.log(self.tenantId + '-' + self.agentId + ':无客户端倒计时开始');
            clearTimeout(self.cdTimer);
            self.cdTimer = setTimeout(function () {
                if (self.sockets.length <= 0) {
                    console.log(self.tenantId + '-' + self.agentId + ':倒计时结束登出');
                    self.logout();
                }
            }, 300000);
        }
    };

    this.resetCountdown = function () {
        console.log(self.tenantId + '-' + self.agentId + ':重置倒计时开始');
        clearTimeout(self.cdTimer);
    }
};

function translateState(state) {
    if (state == 1) {
        return "空闲"
    } else if (state == 2) {
        return "忙"
    } else if (state == 3) {
        return "连接中"
    } else if (state == 4) {
        return "话后"
    } else if (state == 5) {
        return "通话中"
    } else if (state == 6) {
        return "外拨空闲"
    } else {
        return "未登录"
    }
}

exports.find = function (tenantId, agentId) {
    return _.find(clients, {tenantId: tenantId, agentId: agentId});
};

exports.add = function (client) {
    return clients.push(client);
};

exports.findBySocket = function (socket) {
    return _.find(clients, function (c) {
        var s = _.find(c.sockets, socket);
        return !_.isUndefined(s) && !_.isNull(s);
    })
};

var remove = exports.remove = function (tenantId, agentId) {
    _.remove(clients, {tenantId: tenantId, agentId: agentId});
};

