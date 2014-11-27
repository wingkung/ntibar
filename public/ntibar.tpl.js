/**
 * Created by wing on 2014/11/27.
 */

angular.module('nti').run(['$templateCache', function($templateCache) {

    var fun = function() {
        /*<div class="ntibar">
         <form class="form-inline">
         <div class="form-group status text-center">
         <i class="fa fa-wifi fa-2x "
         ng-class="{'green': client.status==1, 'grey': client.status==-1, 'red': client.status==0}"></i>
         </div>
         <div class="form-group" ng-show="client.status==0">
         <input class="form-control" ng-model="agentId" placeholder="工号">
         <input class="form-control" ng-model="ext" placeholder="电话号码">
         <button class="btn btn-sm btn-info" ng-click="login()">
         <i class="fa fa-sign-in"></i>&nbsp;签入
         </button>
         </div>
         <div class="form-group" ng-show="client.status==1">
         <button class="btn btn-sm btn-warning">
         <i class="fa fa-sign-out"></i>&nbsp;签出
         </button>
         </div>
         <div class="form-group" ng-show="has('hangup')">
         <button class="btn btn-sm btn-primary" ng-click="hangup()">
         <i class="fa fa-times-circle"></i>&nbsp;挂机
         </button>
         </div>
         <div class="form-group" ng-show="has(CTL_ODIAL)">
         <input class="form-control" ng-model="dTarget" placeholder="输入外拨号码">
         <button class="btn btn-sm btn-primary" ng-click="dial()">
         <i class="fa fa-phone"></i>&nbsp;外拨
         </button>
         </div>
         <div class="form-group" ng-show="has(CTL_HOLD)">
         <button class="btn btn-sm btn-primary" ng-click="hold()">
         <i class="fa fa-microphone-slash"></i>&nbsp;保持
         </button>
         </div>
         <div class="form-group" ng-show="has(CTL_UNHOLD)">
         <button class="btn btn-sm btn-primary" ng-click="unHold()">
         <i class="fa fa-microphone"></i>&nbsp;取消
         </button>
         </div>
         <div class="form-group" ng-show="has(CTL_TRANS)">
         <input class="form-control" ng-model="tTarget" placeholder="请输入号码">
         <button class="btn btn-sm btn-primary" ng-click="transfer()">
         <i class="fa fa-share"></i>&nbsp;转移
         </button>
         </div>
         <div class="form-group" ng-show="has(CTL_CONSULT)">
         <input class="form-control" ng-model="cTarget" placeholder="请输入号码">
         <button class="btn btn-sm btn-primary" ng-click="consult()">
         <i class="fa fa-share"></i>&nbsp;咨询
         </button>
         </div>
         <div class="form-group" ng-show="has(CTL_CONSULT_CANCEL)">
         <button class="btn btn-sm btn-primary" ng-click="consultCancel()">
         <i class="fa fa-reply"></i>&nbsp;取消
         </button>
         </div>
         <div class="form-group" ng-show="has(CTL_CONSULT_TRANS)">
         <button class="btn btn-sm btn-primary" ng-click="consultTransfer()">
         <i class="fa fa-share"></i>&nbsp;转移
         </button>
         </div>
         <div class="form-group" ng-show="has(CTL_CONSULT_TRANS)">
         <button class="btn btn-sm btn-primary" ng-click="consultBridge()">
         <i class="fa fa-reply-all"></i>&nbsp;三方
         </button>
         </div>
         <div class="form-group" ng-show="client.status==1">
         <button class="btn btn-sm btn-info" ng-disabled="client.state == 4" ng-click="endWrapup()">
         <i class="fa fa-check-square"></i>&nbsp;就绪
         </button>
         <button class="btn btn-sm btn-info" ng-disabled="client.state==1 || client.state==2"
         ng-click="changeState()">
         <i class="fa fa-coffee"></i>&nbsp;状态
         </button>
         <button class="btn btn-sm btn-info" ng-click="queueMonitor()">队列监控</button>
         </div>
         <div class="form-group" ng-show="client.status==1">
         <div class="checkbox-inline" ng-show="client.isAdmin">
         <label>
         <input type="checkbox" ng-model="client.adminMode" ng-change="changeAdminMode()">管理员模式
         </label>
         </div>
         <div class="checkbox-inline">
         <label>
         <input type="checkbox" ng-model="client.wrapupMode" ng-change="changeWrapupMode()">话后模式
         </label>
         </div>
         </div>
         </form>
         <form class="form-inline" ng-show="client.status==1">
         <div class="form-group">
         <p class="form-control-static status-bar">姓名:{{client.name}} 绑定:{{client.ext}}</p>
         </div>
         <div class="form-group">
         <p class="form-control-static status-bar">操作结果:{{client.error}}</p>
         </div>
         </form>
         </div>*/
    };
    var lines = new String(fun);
    var tpl =  lines.substring(lines.indexOf("/*") + 2, lines.lastIndexOf("*/"));
    $templateCache.put('ntibar.tpl.html', tpl);

}]);