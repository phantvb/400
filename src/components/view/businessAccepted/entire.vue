<template>
    <div id="entire">
        <!--搜索-->
        <div class="entireForm">
            <el-form ref="form" :model="form" label-width="100px">
                <div class="searchInput">
                    <el-form-item label="企业名称：">
                        <el-input v-model="form.firmName" size="mini"></el-input>
                    </el-form-item>

                    <el-form-item label="400电话：">
                        <el-input v-model="form.phoneNum" size="mini"></el-input>
                    </el-form-item>

                    <el-form-item label="业务来源：">
                        <el-select v-model="form.source" placeholder="请选择" size="mini">
                            <el-option
                                    v-for="item in sourceList"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="时间：">
                        <div class="block">
                            <el-date-picker
                                    v-model="form.time"
                                    size="mini"
                                    type="datetimerange"
                                    range-separator="至"
                                    start-placeholder="开始日期"
                                    end-placeholder="结束日期">
                            </el-date-picker>
                        </div>
                    </el-form-item>

                    <el-form-item class="searchBtn">
                        <el-button type="primary" size="mini" @click="entireLists()" v-if="authority.indexOf(102)!=-1">
                            搜索
                        </el-button>
                        <el-button @click="resetForm()" size="mini">重置</el-button>
                    </el-form-item>
                </div>
            </el-form>
        </div>
        <!--表格-->
        <div class="entireTable">
            <!--表格按钮和下拉框-->
            <div class="BtnSelect">
                <div class="accountBtn">
                    <el-button type="primary" size="mini" @click="businessAdd()" v-if="authority.indexOf(108)!=-1">
                        +新增受理
                    </el-button>
                    <el-button type="primary" size="mini" @click="voiceAdd()" v-if="authority.indexOf(109)!=-1">
                        +新增语音文件
                    </el-button>
                    <el-button type="primary" size="mini" @click="addObjCodeBtn()" v-if="authority.indexOf(110)!=-1">
                        +新增目的码
                    </el-button>
                </div>
                <div class="accountSelect">
                    <span style="font-size:12px">状态:</span>
                    <el-select v-model="accountStatus" placeholder="请选择" size="mini" @change="statusChange">
                        <el-option v-for="item in statusOptions" :key="item.dicKey" :label="item.dicValue"
                                   :value="item.dicKey"></el-option>
                    </el-select>
                    <el-button type="primary" plain size="mini" v-if="authority.indexOf(103)!=-1" @click="exportList">导出</el-button>
                </div>
            </div>

            <el-table :data="tableData" style="width: 100%" :cell-class-name="cellClass">
                <el-table-column prop="type" label="类型" width="100">
                </el-table-column>

                <el-table-column prop="business.companyName" label="企业名称" width="250">
                </el-table-column>

                <el-table-column prop="business.number400" label="400电话">
                </el-table-column>

                <el-table-column prop="sourceCn" label="业务来源" width="100">
                </el-table-column>

                <el-table-column prop="createTime" label="日期">
                </el-table-column>

                <el-table-column
                        prop="busStatus"
                        width="120"
                        label="状态">
                    <template slot-scope="scope">
                        <span :style="{color:scope.row.color}" size="mini" type="text">{{scope.row.busStatus}}</span>
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="250">
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" v-for="(item,index) in scope.row.btnList" :key="index"
                                   @click="businessEdit(item.label,scope.row)">{{item.label}}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!--分页-->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
                       :page-sizes="[10, 20, 50, 100]" :page-size="10" layout="total, sizes, prev, pager, next, jumper"
                       :total="pageObj.total">
        </el-pagination>
    </div>
</template>
<script>
    import DialogObjCode from './dialogObjCode';
    import DialogVoice from './dialogVoice';
    import {mapState} from "vuex";
    import {formatDate} from '../../../utils/screen';

    export default {
        name: 'entire',
        data() {
            return {
                dialog1Visible: false,
                dialog1VisibleVoice: false,
                dialogVisibleBusiness: false,
                objCodeIn: 1,
                voiceIn: 1,
                form: {
                    firmName: '',
                    phoneNum: '',
                    time: '',
                    source: '',
                },
                sourceList: [
                    {
                        value: 'self',
                        label: '自营',
                    },
                    {
                        value: 'ali',
                        label: '阿里',
                    }
                ],
                entrance: 1, //新增，详情入口区分
                tableData: [],
                statusOptions: [],
                pageObj: {
                    total: 0,
                    page: 1,
                    pageSize: 10,
                },
                baseData: {
                    roleName: '',
                    username: '',
                },
                currentPage: 4, //分页
                accountStatus: '',
                entireFlowId: '', //表格的flowId
                entireStatus: '', //表格的状态
                entireAssigneeRole: '', //表格的角色
                entireCreator: '', //表格creator
                entireType: '', //表格业务类型
                authority: [],   //权限数组
            };
        },
        components: {
            DialogObjCode,
            DialogVoice,
        },
        created() {
            this.$store.getters.getPermission(location.hash.replace(/#/, '')).map((item) => {
                this.authority.push(item.id);
            });
            // console.log("this.authority",this.authority);
            this.statusList();
            this.baseData.roleName = sessionStorage.getItem("roleName");
            this.baseData.username = sessionStorage.getItem("username");
            console.log("roleName", this.baseData.roleName);
            console.log("username", this.baseData.username);
            this.entireLists();
            this.$root.eventHub.$on('addAcceptSave', (resp) => {
                this.entireLists();
            });
            this.$root.eventHub.$on('voiceList', (resp) => {
                this.entireLists();
            })

        },
        // businessIn  1:新增业务   2:送审   3:变更  4:详情
        //objCodeIn    1:目的码新增 2:送审   3:变更
        //voiceIn      1:语音新增   2:送审   3:变更
        methods: {
            // 导出
            exportList(){
                const url = '/vos/excel/businessAll';
                window.open(url, '_blank');
            },
            //分页
            handleSizeChange(val) {
                this.pageObj.pageSize = val;
                this.entireLists();
                // console.log(`每页 ${val} 条`);
            },
            handleCurrentChange(val) {
                this.pageObj.page = val;
                this.entireLists();
                // console.log(`当前页: ${val}`);
            },
            // 状态列表
            statusList() {
                this.$ajax.post('/vos/dic/getDicsByType', {
                    "dicType": "flowType",
                    "status": this.accountStatus,
                }).then((res) => {
                    console.log(res.data);
                    console.log(res.data.dicList);
                    console.log(res.data.totalCount);
                    this.statusOptions = res.data.dicList;
                    this.pageObj.total = res.data.totalCount;
                    console.log(this.pageObj.total);
                })
            },
            cellClass({row, column, rowIndex, columnIndex}) {
                if (rowIndex == 1 && columnIndex == 6) {
                    return 'fontColor';
                }
            },
            // 全部表格
            entireLists() {
                // console.log(this.form.time[0]);
                // console.log(this.form.time[1]);
                let dateStart = new Date(this.form.time[0]);
                let dateEnd = new Date(this.form.time[1]);
                // console.log(formatDate(dateStart,"yyyy-MM-dd hh:mm:ss"));
                // let dateStart_value = dateStart.getFullYear() + '-' + (dateStart.getMonth() + 1) + '-' + dateStart.getDate()+dateStart.getHours()+':'+dateStart.getMinutes()+':'+dateStart.getSeconds();
                let dateStart_value = formatDate(dateStart, "yyyy-MM-dd hh:mm:ss");
                // let dateEnd_value = dateEnd.getFullYear() + '-' + (dateEnd.getMonth() + 1) + '-' + dateEnd.getDate()+dateStart.getHours()+':'+dateStart.getMinutes()+':'+dateStart.getSeconds();
                let dateEnd_value = formatDate(dateEnd, "yyyy-MM-dd hh:mm:ss");
                // console.log(dateStart_value);
                // console.log(dateEnd_value);
                this.$ajax.post('/vos/business/getBusinessFlowList', {
                    "type": "",
                    "dateStart": this.form.time[0] == undefined ? '' : dateStart_value,
                    "dateEnd": this.form.time[1] == undefined ? '' : dateEnd_value,
                    "companyName": this.form.firmName,
                    "status": this.accountStatus,
                    "number400": this.form.phoneNum,
                    "source": this.form.source,
                    "page": {
                        "pageNo": this.pageObj.page,
                        "pageSize": this.pageObj.pageSize,
                    }
                }).then((res) => {
                    // console.log(res.data);
                    // console.log(res.data.businessFlows);
                    this.tableData = res.data.businessFlows;
                    this.pageObj.total = res.data.totalCount;
                    this.tableData.map((item) => {
                        //判断操作
                        if (item.status == 'Wait_To_Audit') {
                            item.busStatus = '等待送审';
                            item.color = '#F56C6C';
                            item.btnList = [];
                            if (this.baseData.roleName == 'ROLE_admin' || item.creator==this.baseData.username) {
                                if (this.authority.indexOf(104) != -1) {
                                    item.btnList.push({label: '送审'})
                                }
                                item.btnList.push({label: '详情'});
                                if (this.authority.indexOf(128) != -1) {
                                    item.btnList.push({label: '刪除'})
                                }
                            } else {
                                item.btnList.push({label: '详情'});
                            }
                        } else if (item.status == 'Audit_Success') {
                            item.busStatus = '通过审核';
                            item.color = '#67C23A';
                            item.btnList = [];
                            if (this.baseData.roleName == 'ROLE_admin' || this.baseData.roleName==item.assigneeRole) {
                                if (item.type == 'Business') {
                                    if (this.authority.indexOf(130) != -1) {
                                        item.btnList.push({label: '变更'})
                                    }
                                    if (this.authority.indexOf(107) != -1) {
                                        item.btnList.push({label: '注销'})
                                    }
                                    item.btnList.push({label: '详情'});
                                }else {
                                    item.btnList.push({label: '详情'});
                                }
                            }else {
                                item.btnList.push({label: '详情'});
                            }
                        } else if (item.status == 'Business_Auditing' || item.status == 'DestNum_Auditing' || item.status == 'Voice_Auditing') {
                            item.busStatus = '审核中';
                            item.color = '#F56C6C';
                            item.btnList = [];
                            if (this.baseData.roleName == 'ROLE_admin' || this.baseData.roleName == item.assigneeRole) {
                                if (this.authority.indexOf(105) != -1) {
                                    item.btnList.push({label: '通过审核'})
                                }
                                if (this.authority.indexOf(106) != -1) {
                                    item.btnList.push({label: '驳回'})
                                }
                                item.btnList.push({label: '详情'});
                            } else {
                                item.btnList.push({label: '详情'});
                            }
                        } else if (item.status == 'Modify_Auditing') {
                            item.busStatus = '变更审核中';
                            item.color = '#F56C6C';
                            item.btnList = [];
                            if (this.baseData.roleName == 'ROLE_admin' || this.baseData.roleName == item.assigneeRole) {
                                if (this.authority.indexOf(105) != -1) {
                                    item.btnList.push({label: '变更审核通过'})
                                }
                                if (this.authority.indexOf(106) != -1) {
                                    item.btnList.push({label: '驳回'})
                                }
                                if (this.authority.indexOf(129) != -1) {
                                    item.btnList.push({label: '终止'})
                                }
                                item.btnList.push({label: '详情'});
                            } else {
                                item.btnList.push({label: '详情'});
                            }
                        } else if (item.status == 'Modify_Rejected') {
                            item.busStatus = '变更审核驳回';
                            item.color = '#F56C6C';
                            item.btnList = [];
                            if (this.baseData.roleName == 'ROLE_admin' || this.baseData.roleName == item.assigneeRole) {
                                if (this.authority.indexOf(130) != -1) {
                                    item.btnList.push({label: '变更'})
                                }
                                if (this.authority.indexOf(107) != -1) {
                                    item.btnList.push({label: '注销'})
                                }
                                item.btnList.push({label: '详情'});
                            } else {
                                item.btnList.push({label: '详情'});
                            }
                        } else if (item.status == 'Canceling_Auditing') {
                            item.busStatus = '注销审核';
                            item.color = '#F56C6C';
                            item.btnList = [];
                            if (this.baseData.roleName == 'ROLE_admin' || this.baseData.roleName == item.assigneeRole) {
                                if (this.authority.indexOf(105) != -1) {
                                    item.btnList.push({label: '通过审核'})
                                }
                                if (this.authority.indexOf(106) != -1) {
                                    item.btnList.push({label: '驳回'})
                                }
                                if (this.authority.indexOf(129) != -1) {
                                    item.btnList.push({label: '终止'})
                                }
                                item.btnList.push({label: '详情'});
                            } else {
                                item.btnList.push({label: '详情'});
                            }
                        } else if (item.status == 'Cancelled') {
                            item.busStatus = '已注销';
                            item.color = '#F56C6C';
                            item.btnList = [];
                            item.btnList.push({label: '详情'});
                        } else if (item.status == 'Terminate_Flow') {
                            item.busStatus = '受理终止';
                            item.color = '#F56C6C';
                            item.btnList = [];
                            item.btnList.push({label: '详情'});
                        }

                        //判断类型
                        if (item.type == 'Voice') {
                            item.type = '语音'
                        } else if (item.type == 'Business') {
                            item.type = '业务'
                        } else if (item.type == 'Destnum') {
                            item.type = '目的码'
                        }

                        //业务来源
                        if (item.business.source && item.business.source == "self") {
                            item.sourceCn = "自营"
                        } else {
                            item.sourceCn = "阿里"
                        }
                    })
                })
            },
            //新增业务受理
            businessAdd() {
                sessionStorage.setItem("businessIn", 1);
                this.ChangeCompanyStatus(null);
                this.ChangeBusinessStatus(null);
                this.ChangeDestNumber(null);
                this.ChangeNumber400ValueAdded(null);
                this.ChangeNumber400Concession(null);
                this.changeMsgDisabled(false);
                this.$root.eventHub.$emit('dialogVisibleBusiness', {visibleBusiness: true, businessIn: 1});
                this.$root.eventHub.$emit('clearData');
                this.$root.eventHub.$on('active', (resp) => {
                    this.active = resp;
                })
            },
            //新增目的码按钮
            addObjCodeBtn() {
                this.$root.eventHub.$emit('dialog1Visible', {visible: true, objCodeIn: 1});
            },
            //新增语音
            voiceAdd() {
                this.$root.eventHub.$emit('dialog1VisibleVoice', {visibleVoice: true, voiceIn: 1});
            },
            // 状态改变
            statusChange() {
                this.entireLists();
            },
            // 编辑业务受理
            businessEdit(val, objData) {
                console.log(val);
                console.log(objData);
                let objMsg = objData;
                this.entireFlowId = objData.flowId;
                this.entireStatus = objData.status;
                this.entireCreator = objData.creator;
                this.entireAssigneeRole = objData.assigneeRole;
                this.entireType = objData.type;
                console.log(this.entireFlowId);
                sessionStorage.setItem('entireFlowId', this.entireFlowId);
                sessionStorage.setItem('objMsg', JSON.stringify(objMsg));
                if (val == '送审') {
                    sessionStorage.setItem("businessIn", 2);
                    this.getCacheData(val);
                } else if (val == '详情') {
                    console.log('详情入口');
                    sessionStorage.setItem("businessIn", 4);
                    console.log(this.entireStatus);
                    this.getCacheData(val);
                } else if (val == '通过审核' || val == '变更审核通过') {
                    console.log("11111");
                    this.passCompany(val, objMsg);
                } else if (val == '变更') {
                    sessionStorage.setItem("businessIn", 3);
                    this.getCacheData(val);
                } else if (val == '驳回') {
                    console.log("22222");
                    this.backCompany(val, objMsg);
                } else if (val == '注销') {
                    this.$confirm('确认注销业务吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: '注销成功!'
                        });

                        this.$ajax.post('/vos/business/sendToCancelAudit', {
                            "companyFlow": {
                                "flowId": objData.flowId,
                                "companyId": objData.companyId,
                                "assignee": objData.assignee,
                            }
                        }).then((res) => {
                            console.log(res);
                            if (res.code == 200) {
                                this.$message.success(res.data);
                                this.entireLists();
                                this.$root.eventHub.$emit('addAcceptSave');
                            }
                        });
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '已取消注销'
                        });
                    });
                } else if(val == '刪除') {
                    console.log("进来了");
                    this.$confirm('此操作将永久删除该业务, 是否继续?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.$ajax.post('/vos/business/deleteFlow', {
                            "companyFlow": objData
                        }).then((res) => {
                            console.log(res);
                            this.entireLists();
                        });
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        });
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '已取消删除'
                        });
                    });
                }
            },
            //“全部”表格详情
            getCacheData(val) {
                console.log(val);
                console.log("entireType", this.entireType);
                if (val == '送审') {
                    if (this.entireType == '业务') {
                        this.$ajax.get('/vos/business/getCacheData?flowId=' + this.entireFlowId).then((res) => {
                            console.log("详情信息", res);
                            if (res.data != null) {
                                this.ChangeCompanyStatus(res.data.company);
                                console.log(this.company);
                                this.ChangeBusinessStatus(res.data.business);
                                this.ChangeDestNumber(res.data.destNumber);
                                this.ChangeNumber400ValueAdded(res.data.number400ValueAdded);
                                this.ChangeNumber400Concession(res.data.number400Concession);
                                this.$root.eventHub.$emit('dialogVisibleBusiness', {
                                    visibleBusiness: true,
                                    businessIn: 2
                                });
                            }
                        });
                    } else if (this.entireType == '目的码') {
                        this.$root.eventHub.$emit('dialog1Visible', {visible: true, objCodeIn: 2});
                    } else if (this.entireType == '语音') {
                        console.log("语音送审显示弹窗");
                        this.$root.eventHub.$emit('dialog1VisibleVoice', {visibleVoice: true, voiceIn: 2});
                    }
                } else if (val == '变更') {
                    var url;
                    if (this.entireType == '业务') {
                        url = '/vos/business/getCacheData?flowId=';
                    }
                    // else if(this.entireType=='目的码'){
                    //     url = '/vos/destnum/getCacheData?flowId=';
                    // }else if(this.entireType=='语音'){
                    //     url = '/vos/voice/getCacheData?flowId=';
                    // }
                    console.log(url);
                    this.$ajax.get(url + this.entireFlowId).then((res) => {
                        console.log("详情信息", res);
                        if (res.data != null) {
                            this.ChangeCompanyStatus(res.data.company);
                            console.log(this.company);
                            this.ChangeBusinessStatus(res.data.business);
                            this.ChangeDestNumber(res.data.destNumber);
                            this.ChangeNumber400ValueAdded(res.data.number400ValueAdded);
                            this.ChangeNumber400Concession(res.data.number400Concession);
                            if (this.entireType == '业务') {
                                this.$root.eventHub.$emit('dialogVisibleBusiness', {
                                    visibleBusiness: true,
                                    businessIn: 3
                                });
                            }
                            // else if(this.entireType=='目的码'){
                            //     this.$root.eventHub.$emit('dialog1Visible',{visible:true,objCodeIn:3});
                            // }else if(this.entireType=='语音'){
                            //     console.log("语音送审显示弹窗");
                            //     this.$root.eventHub.$emit('dialog1VisibleVoice',{visibleVoice:true,voiceIn:3});
                            // }
                        }
                    });
                } else if (val == '详情') {
                    if (this.entireType == '业务') {
                        this.$ajax.get('/vos/business/getCacheData?flowId=' + this.entireFlowId).then((res) => {
                            console.log("详情信息", res);
                            if (res.code == 200 && res.data != null) {
                                // this.ChangeCompanyStatus(res.data.company);
                                // console.log(this.company);
                                // this.ChangeBusinessStatus(res.data.business);
                                // this.ChangeDestNumber(res.data.destNumber);
                                // this.ChangeNumber400ValueAdded(res.data.number400ValueAdded);
                                // this.ChangeNumber400Concession(res.data.number400Concession);
                                this.$router.push({
                                    path: '/BusinessAccepted/businessDetial',
                                    query: {
                                        flowId: this.entireFlowId,
                                        status: this.entireStatus,
                                        assigneeRole: this.entireAssigneeRole,
                                        creators: this.entireCreator,
                                        type: this.entireType,
                                    }
                                });
                            } else {
                                this.$message.error('res.code==' + res.code);
                            }
                        });

                    } else if (this.entireType == '目的码') {
                        this.$router.push({
                            path: '/BusinessAccepted/objCodeDetail',
                            query: {
                                flowId: this.entireFlowId,
                                status: this.entireStatus,
                                assigneeRole: this.entireAssigneeRole,
                                creators: this.entireCreator,
                                type: this.entireType,
                            }
                        });
                    } else if (this.entireType == '语音') {
                        this.$router.push({
                            path: '/BusinessAccepted/voiceDetial',
                            query: {
                                flowId: this.entireFlowId,
                                status: this.entireStatus,
                                assigneeRole: this.entireAssigneeRole,
                                creators: this.entireCreator,
                                type: this.entireType,
                            }
                        });
                    }
                }
                // }else{
                //     this.$message.warning("data为空null");
                // }
                // })
            },

            //通过审核和驳回弹窗
            prompt(data) {
                return this.$prompt('请输入审核意见', data, {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消'
                }).then(({value}) => {
                    return value || '';
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '取消输入'
                    });
                    return false;
                });
            },
            async passCompany(val, data) {
                console.log(data);
                var obj = {};
                var url;
                if (data.status == 'Business_Auditing') {
                    url = '/vos/business/businessAuditPass';
                } else if (data.status == 'Modify_Auditing') {
                    url = '/vos/business/modifyAuditPass';
                } else if (data.status == 'Canceling_Auditing') {
                    url = '/vos/business/cancelAuditPass';
                } else if (data.status == 'Voice_Auditing') {
                    url = '/vos/voice/auditPass';
                } else if (data.status == 'DestNum_Auditing') {
                    url = '/vos/destnum/auditPass';
                } else if (data.status == 'Canceling_Auditing') {  //注销审核通过
                    url = '/vos/business/cancelAuditPass';
                }
                ;
                console.log(url);
                obj.companyFlow = {
                    flowId: data.flowId,
                    creator: data.creator,
                    assigneeRole: data.assigneeRole
                };
                if (data.status == 'Canceling_Auditing') {
                    obj.business = {
                        id: data.business.id,
                        number400: data.business.number400,
                    };
                }
                obj.message = await this.prompt(val);
                if (obj.message === false) {
                    return;
                }
                this.$ajax.post(url, obj).then(res => {
                    if (res.code == 200) {
                        this.$message.success(res.data);
                        this.fetchData(this.pageObj.page);
                        this.entireLists();

                    }
                });
            },
            async backCompany(val, data) {
                console.log(val);
                console.log(data);
                var obj = {};
                var url;
                if (data.status == 'Business_Auditing' && data.type == '业务') {
                    //业务受理驳回
                    url = '/vos/business/businessAuditReject';
                } else if (data.status == 'DestNum_Auditing' && data.type == '目的码') {
                    //目的码驳回
                    url = '/vos/destnum/auditReject';
                } else if (data.status == 'Voice_Auditing' && data.type == '语音') {
                    //语音驳回
                    url = '/vos/voice/auditReject';
                } else if (data.status == 'Modify_Auditing') {
                    //变更审核驳回
                    url = '/vos/business/modifyAuditReject';
                } else if (data.status == 'Cancel_AuditReject') {
                    //注销审核驳回
                    url = '/vos/business/cancelAuditReject';
                }
                ;
                obj.companyFlow = {
                    flowId: data.flowId,
                    creator: data.creator,
                    assigneeRole: data.assigneeRole
                };
                if (data.status == 'Cancel_AuditReject') {   //注销审核被驳回才有的入参
                    obj.business = {
                        id: data.business.id,
                    };
                }
                obj.message = await this.prompt(val);
                if (obj.message === false) {
                    return;
                }
                this.$ajax.post(url, obj).then(res => {
                    if (res.code == 200) {
                        this.$message.success(res.data);
                        this.fetchData(this.pageObj.page);
                        // this.entireLists();
                    }
                });
            },
            fetchData(pageNum) {
                this.loading = true;
                this.pageObj.page = pageNum || 1;
                var data = {};
                data.page = {
                    pageNo: this.pageObj.page,
                    pageSize: this.pageObj.pageSize
                };
                data.blacklist = Object.assign({}, this.form);
                data.blacklist.blackType = this.active;
                delete data.blacklist["time"];
                data.beforeTime = this.form.time[0] || '';
                data.afterTime = this.form.time[1] || '';
                this.$ajax.post("/vos/blacklist/search", data).then(res => {
                    if (res.code == 200) {
                        this.loading = false;
                        this.tableData = res.data.blacklists;
                        this.pageObj.total = res.data.totalCount;
                        this.entireLists();
                    }
                });
            },
            resetForm() {
                this.form.firmName = '';
                this.form.phoneNum = '';
                this.form.time = '';
                this.form.source = '';
                this.entireLists();
            },
            cancelCompany(data) {
                var obj = {};
                var url;
                url = '/vos/company/sendToCancelAudit';
                obj.companyFlow = {
                    flowId: data.flowId,
                    creator: data.creator,
                    assigneeRole: data.assigneeRole,
                    assignee: data.assignee
                };
                obj.message = '';
                this.$ajax.post(url, obj).then(res => {
                    if (res.code == 200) {
                        this.$message.success('操作成功');
                        this.fetchData(this.pageObj.page);
                    }
                });
            },

            // 存vuex更新企业信息模块入参
            ChangeCompanyStatus(val) {
                return this.$store.dispatch("ChangeCompanyStatus", val);
            },
            ChangeBusinessStatus(val) {
                return this.$store.dispatch("ChangeBusinessStatus", val);
            },
            ChangeDestNumber(val) {
                return this.$store.dispatch("ChangeDestNumberStatus", val);
            },
            ChangeNumber400ValueAdded(val) {
                return this.$store.dispatch("ChangeNumber400ValueAddedStatus", val);
            },
            ChangeNumber400Concession(val) {
                return this.$store.dispatch("ChangeNumber400ConcessionStatus", val);
            },
            changeMsgDisabled(val) {
                return this.$store.dispatch("changeMsgDisabledStatus", val);
            },
        },
        computed: {
            ...mapState({
                company: state => state.createActivities.company,
                business: state => state.createActivities.business,
                destNumber: state => state.createActivities.destNumber,
                number400ValueAdded: state => state.createActivities.number400ValueAdded,
                number400Concession: state => state.createActivities.number400Concession,
                msgDisabled: state => state.createActivities.msgDisabled,
            })
        }
    }
</script>
<style lang="scss" scoped>
    @import './400businessManage.scss';
</style>
