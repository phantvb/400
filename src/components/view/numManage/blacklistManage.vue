<template>
	<div id="blacklistManage" class="managerFormTitle" v-loading="loading">
		<el-tabs v-model="active">
			<el-tab-pane label="企业黑名单" name="one"></el-tab-pane>
			<el-tab-pane label="全局黑名单" name="all"></el-tab-pane>
			<div class="search" v-if="permission.indexOf(70)!=-1">
				<ul>
					<li>
						<span class="demonstration">企业名称：</span>
						<el-input v-model="form.companyName" placeholder="请输入内容" size="small">
						</el-input>
					</li>
					<li>
						<span class="demonstration">拉黑时间：</span>
						<el-date-picker style="margin-right:15px;" v-model="form.time" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" size="small" format="yyyy 年 MM 月 dd 日" value-format="yyyy-MM-dd 00:00:00" @change="fetchData()">
						</el-date-picker>
					</li>
				</ul>
				<div class="block left" :class="{'indent':active==2}">
					<div style="float:left;margin-right:15px;" v-if="active==1">
						<span class="demonstration">400号码：</span>
						<el-input v-model="form.number400" placeholder="请输入内容" size="small">
						</el-input>
					</div>
					<div style="float:left;margin-right:15px;" v-if="active==1">
						<span class="demonstration">拉黑号码：</span>
						<el-input v-model="form.blackNumber" placeholder="请输入内容" size="small">
						</el-input>
					</div>
					<el-button type="primary" size="small" style="width:80px;" @click="fetchData()">搜索</el-button>
					<el-button type="primary" plain size="small" style="width:80px;" @click="reset">重置</el-button>
				</div>
			</div>
			<section class="left block lineTop">
				<el-button type="primary" size="small" v-if="permission.indexOf(74)!=-1" @click="showblackEdit(true,{})"><i class="el-icon-plus"></i> {{active=='one'?'新增企业黑名单':'新增全局黑名单'}}</el-button>
				<el-button type="primary" plain size="small" @click="removeBlackEditSel">删除</el-button>
				<div style="float:right">
					<el-button type="primary" plain size="small" @click="outPut" v-if="permission.indexOf(71)!=-1">导出</el-button>
				</div>
			</section>
			<el-table :data="tableData" style="width: 100%;margin-bottom:15px;" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55">
				</el-table-column>
				<el-table-column prop="companyName" label="企业名称" min-width="100" v-if="active=='one'">
				</el-table-column>
				<el-table-column prop="number400" label="400号码" min-width="100" v-if="active=='one'">
				</el-table-column>
				<el-table-column prop="blackNumber" label="拉黑号码" min-width="120">
				</el-table-column>
				<el-table-column prop="blackTime" label="拉黑时间" min-width="120">
				</el-table-column>
				<el-table-column prop="name" label="操作" min-width="200">
					<template slot-scope="scope">
						<el-button size="small" type="text" @click="showblackEdit(true,scope.row)" v-if="permission.indexOf(72)!=-1">修改</el-button>
						<el-button size="small" type="text" @click="removeBlackEdit(scope.row)" v-if="permission.indexOf(73)!=-1">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page.num" :page-sizes="$global.pageSize" :page-size="page.size" layout="total, sizes, prev, pager, next, jumper" :total="page.total">
			</el-pagination>
		</el-tabs>
		<blackEdit :type="active" :data="editData" :show="blackEditShow" @close="close"></blackEdit>
	</div>
</template>
<style lang="scss" scoped>
	@import './common.scss';

	.indent {
		margin-left: 74px;
	}
</style>
<script>
	import blackEdit from './component/blackEdit.vue'
	export default {
		name: 'blacklistManage',
		components: {
			blackEdit
		},
		data() {
			return {
				active: 'one',
				form: {
					companyName: "",
					number400: "",
					time: [],
					blackNumber: ""
				},
				editData: {},
				multipleSelection: [],
				blackEditShow: false,
				loading: false,
				status: '',
				options: [{
					value: '',
					label: '全部'
				}, {
					value: '选项2',
					label: '启用'
				}, {
					value: '选项3',
					label: '停用'
				}],
				tableData: [],
				page: {
					num: 1,
					size: 10,
					total: 1
				},
				permission: []
			}
		},
		watch: {
			active(n, o) {
				this.fetchData();
			}
		},
		mounted() {
			this.fetchData();
			this.$store.getters.getPermission(location.hash.replace(/#/, '')).map(item => {
				this.permission.push(item.id);
			});
		},
		methods: {
			close(bol) {
				if (bol === true) {
					this.fetchData(this.page.num);
				};
				this.blackEditShow = false;
			},
			showblackEdit(bol, data) {
				this.editData = data;
				this.blackEditShow = bol;
			},
			handleSizeChange() {
				this.fetchData();
			},
			handleCurrentChange(val) {
				this.fetchData(val);
			},
			fetchData(pageNum) {
				this.loading = true;
				this.page.num = pageNum || 1;
				var data = {};
				data.page = {
					pageNo: this.page.num,
					pageSize: this.page.size
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
						this.page.total = res.data.totalCount;
					}
				});
			},
			handleSelectionChange(val) {
				this.multipleSelection = val;
			},
			removeBlackEdit(data) {
				this.remove(data.id);
			},
			removeBlackEditSel() {
				var arr = [];
				this.multipleSelection.map(item => {
					arr.push(item.id);
				});
				var ids = arr.join(',');
				this.remove(ids);
			},
			remove(ids) {
				this.$ajax.post('/vos/blacklist/delete', { ids: ids }).then(res => {
					if (res.code == 200) {
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.fetchData(this.page.num);
					}
				})
			},
			reset() {
				this.$clear(this.form);
				this.fetchData();
			},
			outPut() {
				if (this.active == 'all') {
					window.open('/vos/excel/blacklistAll');
				} else {
					window.open('/vos/excel/blacklistOne');
				};
			}
		}
	}
</script>