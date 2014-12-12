var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var clientManage = require('./server/client');
var config = require('./server/config');
var port = 3100;
var q = require('q'), db = require('./server/db'), _ = require('lodash');

io.of('/nti').on('connection', function (socket) {
    socket.on('init_staff', function (data) {
        console.log('init_staff',data);
        var name = data.name;
        var cti_code = data.uid;
        var type = data.type == 'B' ? 'Y' : 'N';
        var user = {};

        q().then(function () {
            var sql = "select queue_id,queue_name from queue";
            return db.query(sql,true);
        }).then(function (rows) {
            console.log(rows);
            user.queues = rows;
            var sql = "select * from staff where cti_code=?";
            return db.query(sql, [cti_code], true)
        }).then(function (rows) {
            if (rows.length > 0) {
                if (rows[0].name != name || rows[0].ismanager != type) {
                    return db.query('update staff set ismanager=?,name=? where cti_code=?', [type, name, cti_code]);
                }
            } else {
                var sql = "insert into staff (wcode, warea_id,canton, cti_code, name, password, state_date, state, ismanager)  " +
                    " select 1 + IFNULL(MAX(wcode), 102),'','', ?, ?, 'e10adc3949ba59abbe56e057f20f883e', now(), 'Y', ? from staff";
                return db.query(sql, [cti_code, name, type]).then(function(rows){
                    var p = q();
                    user.queues.forEach(function(queue){
                        queue.queue_level = queue.queue_level || 10;
                        var sql = "insert into agent_queue (staff_id, queue_id, queue_level) values (?,?,?)";
                        p = p.then(function(){
                            return db.query(sql, [rows.insertId, queue.queue_id, 10]);
                        });
                        queue.checked = true;
                    });
                    return p;
                });
            }
        }).then(function () {
            var sql = "select * from staff where cti_code=?";
            return db.query(sql, [cti_code], true);
        }).then(function (rows) {
            user.staff_id = rows[0].staff_id;
            user.agent_id = rows[0].wcode;
            user.ext = rows[0].con_tel || '';
            user.name = name;
            var sql = "select staff_id,queue_id,queue_level from agent_queue where staff_id=?";
            return db.query(sql, [user.staff_id], true);
        }).then(function (rows) {
            rows.forEach(function (row) {
                _.find(user.queues, {queue_id: row.queue_id}).checked = true;
            })
        }).then(function (rows) {
            console.log(user);
            socket.emit('init_staff', {rtn: true, staff: user});
        }).catch(function (e) {
            console.log(e.stack);
            socket.emit('init_staff', {rtn: false, descr: e.message});
        })

    });

    socket.on('login', function (data) {
        console.log("用户登录: " + JSON.stringify(data));
        data.queues = data.queues || [];
        q().then(function () {
            if (data.tenantId == null || data.agentId == null || data.password == null || data.ext == null || data.staffId == null) {
                throw new Error('参数不完整');
            }
        }).then(function () {
            var sql = "delete from agent_queue where staff_id=?";
            return db.query(sql, [data.staffId]);
        }).then(function () {
            var p = q();
            console.log(data.queues);
            data.queues = _.where(data.queues, {checked: true});
            data.queues.forEach(function(queue){
                queue.queue_level = queue.queue_level || 10;
                var sql = "insert into agent_queue (staff_id, queue_id, queue_level) values (?,?,?)";
                p = p.then(function(){
                    return db.query(sql, [data.staffId, queue.queue_id, queue.queue_level]);
                })
            });
            return p;
        }).then(function () {
            var client = clientManage.find(data.tenantId, data.agentId);
            if (client) {
                client.status(socket);
                client.sockets.push(socket);
                client.resetCountdown();
                console.log('push ' + socket.id);
            } else {
                var host = config.agent_hosts[Number(Math.random() * (config.agent_hosts.length - 1)).toFixed(0)];
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
        }).catch(function (e) {
            socket.emit('login', {rtn: false, descr: e.message});
        })

    });

    socket.on('dial', function (data) {
        q().then(function(){
            socket.cconeClient.dial(data);
        }).catch(function(e){
            socket.emit('dial', {rtn: false, descr: e.message});
        })
    });
    socket.on('logout', function () {
        q().then(function(){
            socket.cconeClient.logout();
        }).catch(function(e){
            socket.emit('logout', {rtn: false, descr: e.message});
        })
    });
    socket.on('transfer', function (data) {
        q().then(function(){
            socket.cconeClient.transfer(data);
        }).catch(function(e){
            socket.emit('transfer', {rtn: false, descr: e.message});
        })
    });
    socket.on('consult', function (data) {
        q().then(function(){
            socket.cconeClient.consult(data);
        }).catch(function(e){
            socket.emit('consult', {rtn: false, descr: e.message});
        })
    });
    socket.on('hangup', function () {
        q().then(function(){
            socket.cconeClient.hangup();
        }).catch(function(e){
            socket.emit('hangup', {rtn: false, descr: e.message});
        })
    });
    socket.on('hold', function () {
        q().then(function(){
            socket.cconeClient.hold();
        }).catch(function(e){
            socket.emit('hold', {rtn: false, descr: e.message});
        })
    });
    socket.on('unhold', function () {
        q().then(function(){
            socket.cconeClient.unhold();
        }).catch(function(e){
            socket.emit('unhold', {rtn: false, descr: e.message});
        })
    });
    socket.on('consult_cancel', function () {
        q().then(function(){
            socket.cconeClient.consultCancel();
        }).catch(function(e){
            socket.emit('consult_cancel', {rtn: false, descr: e.message});
        })
    });
    socket.on('consult_bridge', function () {
        q().then(function(){
            socket.cconeClient.consultBridge();
        }).catch(function(e){
            socket.emit('consult_bridge', {rtn: false, descr: e.message});
        })
    });
    socket.on('consult_transfer', function () {
        q().then(function(){
            socket.cconeClient.consultTransfer();
        }).catch(function(e){
            socket.emit('consult_transfer', {rtn: false, descr: e.message});
        })
    });
    socket.on('ssi', function () {
        q().then(function(){
            socket.cconeClient.ssi();
        }).catch(function(e){
            socket.emit('ssi', {rtn: false, descr: e.message});
        })
    });
    socket.on('listen', function (data) {
        q().then(function(){
            socket.cconeClient.listen(data);
        }).catch(function(e){
            socket.emit('listen', {rtn: false, descr: e.message});
        })
    });
    socket.on('ropcall', function () {
        q().then(function(){
            socket.cconeClient.ropcall();
        }).catch(function(e){
            socket.emit('ropcall', {rtn: false, descr: e.message});
        })
    });
    socket.on('intrusion', function (data) {
        q().then(function(){
            socket.cconeClient.intrusion(data);
        }).catch(function(e){
            socket.emit('intrusion', {rtn: false, descr: e.message});
        })
    });
    socket.on('forced_release', function () {
        q().then(function(){
            socket.cconeClient.forcedRelease();
        }).catch(function(e){
            socket.emit('forced_release', {rtn: false, descr: e.message});
        })
    });
    socket.on('end_wrapup', function () {
        q().then(function(){
            socket.cconeClient.endWrapup();
        }).catch(function(e){
            socket.emit('end_wrapup', {rtn: false, descr: e.message});
        })
    });
    socket.on('change_state', function (data) {
        q().then(function(){
            socket.cconeClient.changeState(data);
        }).catch(function(e){
            socket.emit('change_state', {rtn: false, descr: e.message});
        })
    });
    socket.on('admin_mode', function (data) {
        q().then(function(){
            socket.cconeClient.changeAdminMode(data);
        }).catch(function(e){
            socket.emit('admin_mode', {rtn: false, descr: e.message});
        })
    });

    socket.on('wrapup_mode', function (data) {
        q().then(function(){
            socket.cconeClient.changeWrapupMode(data);
        }).catch(function(e){
            socket.emit('wrapup_mode', {rtn: false, descr: e.message});
        })
    });

    socket.on('agents_info', function (data) {
        q().then(function(){
            socket.cconeClient.agentsInfo(data);
        }).catch(function(e){
            socket.emit('agents_info', {rtn: false, descr: e.message});
        })
    });

    socket.on('ivrs_info', function (data) {
        q().then(function(){
            socket.cconeClient.ivrsInfo(data);
        }).catch(function(e){
            socket.emit('ivrs_info', {rtn: false, descr: e.message});
        })
    });

    socket.on('queues_info', function (data) {
        q().then(function(){
            socket.cconeClient.queuesInfo(data);
        }).catch(function(e){
            socket.emit('queues_info', {rtn: false, descr: e.message});
        })
    });

    socket.on('queue_monitor', function () {
        q().then(function(){
            socket.cconeClient.queueMonitor();
        }).catch(function(e){
            socket.emit('queue_monitor', {rtn: false, descr: e.message});
        })
    });

    socket.on('disconnect', function () {
        q().then(function(){
            if (socket.cconeClient == undefined) return;

            for (var i in socket.cconeClient.sockets) {
                if (socket == socket.cconeClient.sockets[i]) {
                    socket.cconeClient.sockets.splice(i, 1);
                    socket.cconeClient.countdown();
                    break;
                }
            }
        }).catch(function(e){
            console.log(e.stack);
        })
    });

    socket.on('error', function (e) {
        console.log('ws: ' + e.message);
    });
});


server.listen(port, function () {
    console.log('nti_ap server listening at port %d', port);
});

