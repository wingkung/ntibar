
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var clientManage = require('./server/client');
var config =require('./server/config');
var port = 3100;

io.of('/nti').on('connection', function (socket) {
    socket.on('login', function (data) {
        console.log("用户登录: " + JSON.stringify(data));
        if (data.tenantId == null || data.agentId == null || data.password == null || data.ext == null) {
            socket.emit('login', {rtn: false, descr: '参数不完整'});
        } else {
            var client = clientManage.find(data.tenantId, data.agentId);
            if (client) {
                client.status(socket);
                client.sockets.push(socket);
                client.resetCountdown();
                console.log('push ' + socket.id);
            } else {
                var host = config.agent_hosts[new Number(Math.random() * (config.agent_hosts.length - 1) ).toFixed(0)];
                var params = {
                    tenantId: data.tenantId,
                    agentId: data.agentId,
                    password: data.password,
                    ext: data.ext,
                    host: host
                };
                client = new clientManage.Client(params);
                client.sockets.push(socket);
                client.resetCountdown();
                console.log('push ' + socket.id);
                client.init();
                clientManage.add(client);
            }
            socket.cconeClient = client;
        }

    });

    socket.on('dial', function (data) {
        socket.cconeClient.dial(data);
    });
    socket.on('logout', function () {
        socket.cconeClient.logout();
    });
    socket.on('transfer', function (data) {
        socket.cconeClient.transfer(data);
    });
    socket.on('consult', function (data) {
        socket.cconeClient.consult(data);
    });
    socket.on('hangup', function (data) {
        socket.cconeClient.hangup();
    });
    socket.on('hold', function () {
        socket.cconeClient.hold();
    });
    socket.on('unhold', function () {
        socket.cconeClient.unhold();
    });
    socket.on('consult_cancel', function () {
        socket.cconeClient.consultCancel();
    });
    socket.on('consult_bridge', function () {
        socket.cconeClient.consultBridge();
    });
    socket.on('consult_transfer', function () {
        socket.cconeClient.consultTransfer();
    });
    socket.on('ssi', function () {
        socket.cconeClient.ssi();
    });
    socket.on('listen', function(data){
        socket.cconeClient.listen(data);
    });
    socket.on('ropcall', function(){
        socket.cconeClient.ropcall();
    });
    socket.on('intrusion', function(data){
        socket.cconeClient.intrusion(data);
    });
    socket.on('forced_release', function(){
        socket.cconeClient.forcedRelease();
    });
    socket.on('end_wrapup', function () {
        socket.cconeClient.endWrapup();
    });
    socket.on('change_state', function (data) {
        socket.cconeClient.changeState(data);
    });
    socket.on('admin_mode', function (data) {
        socket.cconeClient.changeAdminMode(data);
    });
    
    socket.on('wrapup_mode', function (data) {
        socket.cconeClient.changeWrapupMode(data);
    });

    socket.on('agents_info', function(data){
        socket.cconeClient.agentsInfo(data);
    });

    socket.on('ivrs_info', function(data){
        socket.cconeClient.ivrsInfo(data);
    });

    socket.on('queues_info', function(data){
        socket.cconeClient.queuesInfo(data);
    });

    socket.on('queue_monitor', function(){
        socket.cconeClient.queueMonitor();
    });

    socket.on('disconnect', function () {
        if (socket.cconeClient == undefined) return;

        for (var i in socket.cconeClient.sockets) {
            if (socket == socket.cconeClient.sockets[i]) {
                socket.cconeClient.sockets.splice(i, 1);
                socket.cconeClient.countdown();
                break;
            }
        }
    });

    socket.on('error', function(e){
        console.log('ws: ' + e.message);
    });
});


server.listen(port, function () {
    console.log('nti_ap server listening at port %d', port);
});

