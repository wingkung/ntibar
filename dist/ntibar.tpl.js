angular.module('nti').run(['$templateCache', function($templateCache) {var fun = function() { /*<div class="ntibar">
    <form class="form-inline">
        <div class="form-group status text-center">
            <span>
                <i class="fa fa-phone fa-2x"
                   ng-class="{'green': ntiClient.state==1,'red': ntiClient.state==2,'pink':ntiClient.state==3,'cornflowerblue': ntiClient.state==4,'orange':ntiClient.state==5,'grey': ntiClient.status==-1,'black': ntiClient.status==0}"></i>
            </span>

            <p>{{ntiTranslateState(ntiClient.status, ntiClient.state)}}</p>
        </div>
        <div class="form-group">
            <form class="form-inline">
                <div class="form-group" ng-show="ntiClient.status==0">
                    <span class="form-control-static">分配工号:{{ntiClient.agentId}}</span>
                    <input class="form-control" ng-model="ntiClient.ext" placeholder="电话号码">

                    <div class="checkbox-inline">
                        <label ng-repeat="aq in ntiClient.aqs">
                            <input type="checkbox" ng-model="aq.checked"> {{aq.queue_name}}
                        </label>

                    </div>
                    <button class="btn btn-sm btn-info" ng-click="ntiLogin()">
                        <i class="fa fa-sign-in"></i>&nbsp;签入
                    </button>
                </div>
                <div class="form-group" ng-show="ntiClient.status==1">
                    <button class="btn btn-sm btn-warning" ng-click="ntiLogout()">
                        <i class="fa fa-sign-out"></i>&nbsp;签出
                    </button>
                </div>
                <div class="form-group" ng-show="ntiHas('hangup')">
                    <button class="btn btn-sm btn-primary" ng-click="ntiHangup()">
                        <i class="fa fa-times-circle"></i>&nbsp;挂机
                    </button>
                </div>
                <div class="form-group nti-func" ng-show="ntiHas(CTL_ODIAL)">
                    <input class="form-control" ng-model="ntidTarget" placeholder="输入外拨号码">
                    <button class="btn btn-sm btn-primary" ng-click="ntiDial()">
                        <i class="fa fa-phone"></i>&nbsp;外拨
                    </button>
                </div>
                <div class="form-group" ng-show="ntiHas(CTL_HOLD)">
                    <button class="btn btn-sm btn-primary" ng-click="ntiHold()">
                        <i class="fa fa-microphone-slash"></i>&nbsp;保持
                    </button>
                </div>
                <div class="form-group" ng-show="ntiHas(CTL_UNHOLD)">
                    <button class="btn btn-sm btn-primary" ng-click="ntiUnHold()">
                        <i class="fa fa-microphone"></i>&nbsp;取消
                    </button>
                </div>
                <div class="form-group" ng-show="ntiHas(CTL_TRANS)">
                    <input class="form-control" ng-model="ntitTarget" placeholder="请输入号码">
                    <button class="btn btn-sm btn-primary" ng-click="ntiTransfer()">
                        <i class="fa fa-share"></i>&nbsp;转移
                    </button>
                </div>
                <div class="form-group" ng-show="ntiHas(CTL_CONSULT)">
                    <input class="form-control" ng-model="nticTarget" placeholder="请输入号码">
                    <button class="btn btn-sm btn-primary" ng-click="ntiConsult()">
                        <i class="fa fa-share"></i>&nbsp;咨询
                    </button>
                </div>
                <div class="form-group" ng-show="ntiHas(CTL_CONSULT_CANCEL)">
                    <button class="btn btn-sm btn-primary" ng-click="ntiConsultCancel()">
                        <i class="fa fa-reply"></i>&nbsp;取消
                    </button>
                </div>
                <div class="form-group" ng-show="ntiHas(CTL_CONSULT_TRANS)">
                    <button class="btn btn-sm btn-primary" ng-click="ntiConsultTransfer()">
                        <i class="fa fa-share"></i>&nbsp;转移
                    </button>
                </div>
                <div class="form-group" ng-show="ntiHas(CTL_CONSULT_TRANS)">
                    <button class="btn btn-sm btn-primary" ng-click="ntiConsultBridge()">
                        <i class="fa fa-reply-all"></i>&nbsp;三方
                    </button>
                </div>
                <div class="form-group" ng-show="ntiClient.status==1">
                    <button class="btn btn-sm btn-info" ng-show="ntiClient.state==4" ng-click="ntiEndWrapup()">
                        <i class="fa fa-check-square"></i>&nbsp;就绪
                    </button>
                    <button class="btn btn-sm btn-info" ng-show="ntiClient.state==2"
                            ng-click="ntiChangeState(0)">
                        <i class="fa fa-coffee"></i>&nbsp;示闲
                    </button>
                    <button class="btn btn-sm btn-info" ng-show="ntiClient.state==1"
                            ng-click="ntiChangeState(1)">
                        <i class="fa fa-coffee"></i>&nbsp;示忙
                    </button>
                </div>
                <div class="form-group" ng-show="ntiClient.status==1">
                    <div class="checkbox-inline" ng-show="ntiClient.isAdmin">
                        <label>
                            <input type="checkbox" ng-model="ntiClient.adminMode" ng-change="ntiChangeAdminMode()">管理员模式
                        </label>
                    </div>
                    <div class="checkbox-inline">
                        <label>
                            <input type="checkbox" ng-model="ntiClient.wrapupMode" ng-change="ntiChangeWrapupMode()">话后模式
                        </label>
                    </div>
                </div>

            </form>
            <form class="form-inline" >
                <div class="form-group" ng-show="ntiClient.status==1">
                    <p class="form-control-static status-bar">姓名:{{ntiClient.name}} 绑定:{{ntiClient.ext}}</p>
                </div>
                <div class="form-group" ng-show="ntiClient.status==1">
                    <p class="form-control-static status-bar" ng-show="ntiClient.userin">用户号码:
                        {{ntiClient.userin.sessionType==1 ? ntiClient.userin.caller : ntiClient.userin.callee}}</p>
                </div>
                <div class="form-group" ng-show="ntiClient.status > -1">
                    <p class="form-control-static status-bar">{{ntiClient.error}}</p>
                </div>
            </form>
        </div>
    </form>

</div>*/};var lines = new String(fun);var tpl =  lines.substring(lines.indexOf('/*') + 2, lines.lastIndexOf('*/'));$templateCache.put('ntibar.tpl.html', tpl);}]);