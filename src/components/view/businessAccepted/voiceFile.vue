<template>
	<div id="voiceFile">
		<!--搜索-->
		<div class="handlingForm">
			<el-form ref="form" :model="form" label-width="100px">
				<div class="searchInput">
					<el-form-item label="企业名称：">
						<el-input v-model="form.firmName" size="mini"></el-input>
					</el-form-item>

					<el-form-item label="400电话：">
						<el-input v-model="form.phoneNum" size="mini"></el-input>
					</el-form-item>

					<el-form-item label="时间：">
						<!--<el-date-picker-->
								<!--size="mini"-->
								<!--v-model="form.time"-->
								<!--type="daterange"-->
								<!--range-separator="至"-->
								<!--start-placeholder="开始日期"-->
								<!--end-placeholder="结束日期">-->
						<!--</el-date-picker>-->
						<el-date-picker
								v-model="form.time"
								size="mini"
								type="datetimerange"
								range-separator="至"
								start-placeholder="开始日期"
								end-placeholder="结束日期">
						</el-date-picker>
					</el-form-item>

					<el-form-item class="searchBtn">
						<el-button type="primary" size="mini" @click="voiceFileLists()">搜索</el-button>
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
					<el-button type="primary" size="mini" @click="voiceAdd()" v-if="authority.indexOf(109)!=-1">+新增语音文件</el-button>
				</div>
				<div class="accountSelect">
					<span style="font-size:12px">状态:</span>
					<el-select v-model="accountStatus" placeholder="请选择" size="mini" @change="statusChange">
						<el-option v-for="item in statusOptions" :key="item.dicKey" :label="item.dicValue" :value="item.dicKey"></el-option>
					</el-select>
					<el-button type="primary" plain size="mini" @click="exportList">导出</el-button>
				</div>
			</div>

			<el-table
					:data="tableData"
					style="width: 100%">
				<el-table-column
						prop="business.companyName"
						label="企业名称"
						width="250">
				</el-table-column>

				<el-table-column
						prop="business.number400"
						label="400电话">
				</el-table-column>

				<el-table-column
						prop="assignee"
						label="受理人">
				</el-table-column>

				<el-table-column
						prop="createTime"
						label="日期">
				</el-table-column>

				<el-table-column
						prop="busStatus"
						label="状态">
					<template slot-scope="scope">
						<span :style="{color:scope.row.color}" size="mini" type="text">{{scope.row.busStatus}}</span>
					</template>
				</el-table-column>

				<el-table-column
						width="250"
						label="操作">
					<template slot-scope="scope">
						<el-button size="mini" type="text" v-for="(item,index) in scope.row.btnList" :key="index" @click="voiceDetial(item.label,scope.row)">{{item.label}}</el-button>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<!--分页-->
		<el-pagination
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="currentPage"
				:page-sizes="[10, 20, 50, 100]"
				:page-size="10"
				layout="total, sizes, prev, pager, next, jumper"
				:total="pageObj.total">
		</el-pagination>
	</div>
</template>
<script>
	import DialogVoice from './dialogVoice';
    import {formatDate} from '../../../utils/screen';
	export default {
		name: 'voiceFile',
		data() {
			return {
                dialog1Visible:false,
                voiceIn:1,
                form:{
                    firmName:'',
                    phoneNum:'',
                    time:'',
                },
                tableData: [],
                statusOptions: [],
                pageObj:{
                    total:0,
                    page:1,
                    pageSize:10,
                },
                accountStatus:'',
                currentPage: 1,   //当前页
                baseData:{
                    roleName:'',
                    username:'',
                },
                voiceFlowId:'',        //语音列表对象id
				voiceCreator:'',       //语音列表对象creator
                voiceStatus:'',        //语音列表对象状态
                voiceAssigneeRole:'',  //语音列表对象assigneeRole
                authority:[],   //权限数组
			};
		},
		created(){
            console.log("权限",this.$store.getters.getPermission(location.hash.replace(/#/, '')));
            this.$store.getters.getPermission(location.hash.replace(/#/, '')).map((item)=>{
                this.authority.push(item.id);
            });
            this.baseData.roleName = sessionStorage.getItem("roleName");
            this.baseData.username = sessionStorage.getItem("username");
            console.log("roleName",this.baseData.roleName);
            console.log("username",this.baseData.username);
		    this.voiceFileLists();
		    this.statusList();
            this.$root.eventHub.$on('voiceList',(resp)=>{
                this.voiceFileLists();
			})
            this.$root.eventHub.$on('addAcceptSave', (resp) => {
                this.voiceFileLists();
            })
		},
		components: {
            DialogVoice
		},
		methods: {
            // 导出
            exportList(){
                const url = '/vos/excel/businessAll';
                window.open(url, '_blank');
            },
			//分页
            handleSizeChange(val) {
                this.pageObj.pageSize = val;
                this.voiceFileLists();
                console.log(`每页 ${val} 条`);
            },
            handleCurrentChange(val) {
                this.pageObj.page = val;
                this.voiceFileLists();
                console.log(`当前页: ${val}`);
            },
            //弹窗关闭按钮
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(_ => {
                        done();
                    })
                    .catch(_ => {
                    });
            },
            //状态列表
            statusList(){
                this.$ajax.post('/vos/dic/getDicsByType',{
                    "dicType":"flowType",
                    "status":this.accountStatus,
                }).then((res)=>{
                    console.log(res.data);
                    console.log(res.data.dicList);
                    console.log(res.data.totalCount);
                    this.statusOptions = res.data.dicList;
                    this.pageObj.total = res.data.totalCount;
                    console.log(this.pageObj.total);
                })
            },
            voiceAdd(){
                this.$root.eventHub.$emit('dialog1VisibleVoice',{visibleVoice:true,voiceIn:1});
			},
            resetForm(){
                this.form.firmName='';
                this.form.phoneNum='';
                this.form.time='';
                this.voiceFileLists();
            },
			// 语音列表
            voiceFileLists(){
                // console.log(this.form.time[0]);
                // console.log(this.form.time[1]);
                let dateStart = new Date(this.form.time[0]);
                let dateEnd = new Date(this.form.time[1]);
                // let dateStart_value=dateStart.getFullYear() + '-' + (dateStart.getMonth() + 1) + '-' + dateStart.getDate()+dateStart.getHours()+':'+dateStart.getMinutes()+':'+dateStart.getSeconds();
                // let dateEnd_value=dateEnd.getFullYear() + '-' + (dateEnd.getMonth() + 1) + '-' + dateEnd.getDate()+dateStart.getHours()+':'+dateStart.getMinutes()+':'+dateStart.getSeconds();
                let dateStart_value = formatDate(dateStart,"yyyy-MM-dd hh:mm:ss");
                let dateEnd_value = formatDate(dateEnd,"yyyy-MM-dd hh:mm:ss");
                // console.log(dateStart_value);
                // console.log(dateEnd_value);
                this.$ajax.post('/vos/business/getBusinessFlowList',{
                    "type":"Voice",
                    "dateStart":this.form.time[0]==undefined?'':dateStart_value,
                    "dateEnd":this.form.time[1]==undefined?'':dateEnd_value,
                    "companyName":this.form.firmName,
                    "status":this.accountStatus,
                    "number400":this.form.phoneNum,
                    "source":'',
                    "page":{
                        "pageNo":this.pageObj.page,
                        "pageSize":this.pageObj.pageSize,
                    }
                }).then((res)=>{
                    console.log(res.data.businessFlows);
                    this.tableData = res.data.businessFlows;
                    this.pageObj.total = res.data.totalCount;
                    this.tableData.map((item)=>{

                        //判断操作
                        if(item.status=='Wait_To_Audit'){
                            item.busStatus='等待送审';
                            item.color = '#F56C6C';
                            item.btnList=[];
                            if(this.baseData.roleName=='ROLE_admin' || this.baseData.roleName == item.assigneeRole){
                                if(this.authority.indexOf(104)!=-1){
                                   item.btnList.push({label:'送审'})
                                }
                                item.btnList.push({label:'详情'});
                                if(this.authority.indexOf(128)!=-1){
                                    item.btnList.push({label:'删除'})
                                }
                            }else{
                                item.btnList.push({label:'详情'});
                            }
                        }else if(item.status=='Audit_Success'){
                            item.busStatus='通过审核';
                            item.color = '#67C23A';
                            item.btnList=[];
                            if(this.baseData.roleName=='ROLE_admin' || this.baseData.roleName == item.assigneeRole){
                                item.btnList.push({label:'详情'});
                            }
                        }else if(item.status=='Voice_Auditing'){
                            item.busStatus='审核中';
                            item.color = '#F56C6C';
                            item.btnList=[];
                            if(this.baseData.roleName=='ROLE_admin' || this.baseData.roleName == item.assigneeRole){
                                if(this.authority.indexOf(105)!=-1){
                                    item.btnList.push({label:'通过审核'})
                                }
                                if(this.authority.indexOf(106)!=-1){
                                    item.btnList.push({label:'驳回'})
                                }
                                item.btnList.push({label:'详情'});
                            }else{
                                item.btnList.push({label:'详情'});
                            }
                        }else if(item.status=='Terminate_Flow'){
                            item.busStatus='受理终止';
                            item.btnList=[];
                            item.btnList.push({label:'详情'});
                        }
                    })
                })
            },
            //详情
            voiceDetial(val,data){
                console.log(val);
                console.log(data);
                console.log(data);
                let voiceMsg = data;
                this.voiceFlowId = voiceMsg.flowId;
                this.voiceStatus = voiceMsg.status;
                this.voiceCreator = voiceMsg.creator;
                this.voiceAssigneeRole = voiceMsg.assigneeRole;
                sessionStorage.setItem('voiceFlowId',this.voiceFlowId);
                // this.getCacheData(val);
                if(val=='详情'){
                    this.$router.push({
                        path:'/BusinessAccepted/voiceDetial',
                        query: {
                            flowId: this.voiceFlowId,
                            status:this.voiceStatus ,
                            assigneeRole:this.voiceAssigneeRole,
                            creators:this.voiceCreator,
                        }
                    });
                }else if(val=='送审'){
                    this.$root.eventHub.$emit('dialog1VisibleVoice',{visibleVoice:true,voiceIn:2,flowId:this.voiceFlowId});
                }else if(val=='通过审核'){
                    console.log("11111");
                    this.passCompany(val,data);
                }else if(val=='驳回'){
                    console.log("tttttttt");
                    this.backCompany(val,data);
				}else if(val=='变更'){
                    this.$root.eventHub.$emit('dialog1VisibleVoice',{visibleVoice:true,voiceIn:3,flowId:this.voiceFlowId});
				}else if(val=='删除'){
                    this.$confirm('此操作将永久删除该业务, 是否继续?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        });
                        this.$ajax.post('/vos/business/deleteFlow',{
                            "companyFlow": data
                        }).then((res)=>{
                            console.log(res);
                            this.voiceFileLists();
                        })
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '已取消删除'
                        });
                    });
                }
            },
            async passCompany(val,data) {
                var obj = {};
                var url;
                if (data.status == 'Voice_Auditing') {
                    url = '/vos/voice/auditPass';
                }
                obj.companyFlow = {
                    flowId: data.flowId,
                    creator: data.creator,
                    assigneeRole: data.assigneeRole
                };
                obj.message = await this.prompt(val);
                if (obj.message === false) {
                    return;
                }
                this.$ajax.post(url, obj).then(res => {
                    if (res.code == 200) {
                        this.$message.success('操作成功');
                        this.fetchData(this.page.num);
                    }
                });
            },
            async backCompany(val,data) {
                console.log(val);
                console.log(data);
                var obj = {};
                var url;
                //语音驳回
                url = '/vos/voice/auditReject';
                obj.companyFlow = {
                    flowId: data.flowId,
                    creator: data.creator,
                    assigneeRole: data.assigneeRole
                };
                obj.message = await this.prompt(val);
                if (obj.message === false) {
                    return;
                }
                this.$ajax.post(url, obj).then(res => {
                    if (res.code == 200) {
                        this.$message.success('操作成功');
                        this.fetchData(this.page.num);
                    }
                });
            },
            //通过审核和驳回弹窗
            prompt(data) {
                return this.$prompt('请输入审核意见', data, {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消'
                }).then(({ value }) => {
                    return value || '';
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '取消输入'
                    });
                    return false;
                });
            },
			voiceOperate(val,data){
                console.log(val);
                console.log(data);

			},
			// 状态改变
            statusChange(val){
                this.voiceFileLists();
			},
		},

		computed: {}
	}
</script>
<style lang="scss" scoped>
	@import './400businessManage.scss';
</style>
