<template>
	<div id="citationNum" v-loading="loading">
		<div class="search" v-if="permission.indexOf(50)!=-1">
			<el-form ref="citationNumForm" :model="citationNumForm" style="padding:9px 9px;">
				<el-form-item style="float: left;margin-left: 15px;">
					<span class="demonstration">引示号码：</span>
					<el-input v-model="citationNumForm.number" placeholder="请输入内容" size="mini" style="width:300px;"></el-input>
					<div style="display: inline-block; margin-left: 15px;">
						<span>状态：</span>
						<el-select v-model="citationNumForm.value1" placeholder="请选择" size="mini" @change="loadData">
							<el-option v-for="item in citationNumForm.options1" :key="item.value" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</div>
				</el-form-item>

				<el-form-item label="使用渠道：" style="clear: both;margin-left: 15px;">
					<el-checkbox-group v-model="citationNumForm.checkList" style=" float: left;margin-left: 15px">
						<el-checkbox label="自助直销"></el-checkbox>
						<el-checkbox label="渠道"></el-checkbox>
					</el-checkbox-group>
				</el-form-item>
				<el-form-item style="margin-left: 15px;">
					<el-button type="primary" size="mini" class="searchButton" @click="loadData(citationNumForm.number)">搜索</el-button>
					<el-button type="primary" plain size="mini" class="resetButton" @click="reset">重置</el-button>
				</el-form-item>
			</el-form>
		</div>

		<div class="buttonDiv">
			<div style="float: left;">
				<el-button type="primary" size="mini" v-if="permission.indexOf(54)!=-1">
					<i class="el-icon-plus" @click="showAddCitationNum">&nbsp;新增引示号码</i>
				</el-button>
				<el-button type="primary" plain size="mini" @click="batchDelete" v-if="permission.indexOf(53)!=-1">批量删除</el-button>
			</div>
			
            <div style="float: right;">
				<el-button type="text" size="mini" style="float:left;" @click="downloadTemplate">批量导入Excel 模板下载</el-button>
                <el-button type="primary" plain size="mini" @click="exportInfo" v-if="permission.indexOf(51)!=-1">导出</el-button>
				<el-upload class="upload-demo" style="float:left;margin-left:10px;" :show-file-list=false :with-credentials="true" action="/vos/excel/importGuideNumber" :on-success="uploaded" v-if="permission.indexOf(114)!=-1">
					<el-button type="primary" plain size="mini">批量导入</el-button>
				</el-upload>
			</div>
		</div>

		<div>
			<el-table :data="tableData" ref="multipleTable" tooltip-effect="dark" style="width: 100%;margin-bottom:15px;" @selection-change="handleSelectionChange">
				<el-table-column type="selection" min-width="100"></el-table-column>
				<el-table-column prop="number400" label="400号码" min-width="100"></el-table-column>
				<el-table-column prop="channel" label="使用渠道" min-width="100"></el-table-column>
				<el-table-column prop="guideNumber" label="引示号码" min-width="100"></el-table-column>
				<el-table-column prop="price" label="成本单价" min-width="100"></el-table-column>
				<el-table-column prop="status" label="状态" min-width="100"></el-table-column>
				<el-table-column label="操作" min-width="100">
					<template slot-scope="scope">
						<el-button size="mini" type="text" @click="handleEdit(scope.$index, scope.row)" v-if="tableData[scope.$index].status=='未绑定'&&permission.indexOf(52)!=-1">编辑</el-button>
						<el-button size="mini" type="text" @click="handleDelete(scope.$index, scope.row)" v-if="tableData[scope.$index].status=='未绑定'&&permission.indexOf(53)!=-1">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div style="margin-top: 10px">
				<el-pagination style="float:right;" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page.currentPage" :page-sizes="$global.pageSize" :page-size="page.size" layout="total, sizes, prev, pager, next, jumper" :total="page.total"></el-pagination>
			</div>
		</div>

		<div>
			<el-dialog title="新增/编辑引示号码" :visible.sync="addCitationNumberFormDialogVisible" width="30%">
				<div>
					<el-form ref="addCitationNumberForm" :model="addCitationNumberForm" label-width="100px">
						<el-form-item label="引示号码：">
							<el-input v-model="addCitationNumberForm.guideNumber" size="mini" class="el-input" style="float:left;width: 80%;"></el-input>
						</el-form-item>

						<el-form-item label="成本单价：">
							<el-input v-model="addCitationNumberForm.unitPrice" size="mini" class="el-input" style="float:left; width: 40%;"></el-input>
							<span style=" margin:0 5%;float:left;">元 /</span>
							<el-select v-model="addCitationNumberForm.value" placeholder="请选择" size="mini" style="width: 25%; float: left;">
								<el-option v-for="item in addCitationNumberForm.options" :key="item.value" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</el-form-item>

						<el-form-item label="使用渠道：">
							<el-checkbox-group v-model="addCitationNumberForm.checkList">
								<el-checkbox label="自助直销" class="el-checkbox" :disabled="this.disabledSelf"></el-checkbox>
								<el-checkbox label="渠道" :disabled="this.disabledChannel"></el-checkbox>
							</el-checkbox-group>
						</el-form-item>
					</el-form>
				</div>
				<span slot="footer" class="dialog-footer">
					<el-button @click="addCitationNumberFormDialogVisible = false" size="mini">取 消</el-button>
					<el-button type="primary" @click="addCitationNum" size="mini" :style="'display:'+submitData+';'">确 定</el-button>
					<el-button type="primary" @click="updateCitationNum" size="mini" :style="'display:'+updateData+';'">编 辑</el-button>
				</span>
			</el-dialog>
		</div>

        <div>
			<el-dialog title="引示导入校验" :visible.sync="importNumberFormDialogVisible" width="50%">
				<div>
					<el-form ref="addNumberForm" :model="importNumberForm" label-width="150px">
						<el-form-item label="校验比对结果：">
							<span style="float: left;">有{{importNumberForm.errorNum}}个号码有误</span>
						</el-form-item>
						<el-form-item label="有误号码列表：">
							<el-table :data="importNumberForm.tableData" border style="width: 100%">
								<el-table-column prop="guideNumber" label="引示号码" width="150"></el-table-column>
								<el-table-column prop="channel" label="可见渠道" width="120"></el-table-column>
								<el-table-column prop="errMsg" label="错误"></el-table-column>
							</el-table>
						</el-form-item>
					</el-form>
				</div>
				<span slot="footer" class="dialog-footer">
					<el-button @click="importNumberFormDialogVisible = false" size="mini">取 消</el-button>
					<el-button type="primary" @click="importNumberFormDialogVisible = false" size="mini">确 定</el-button>
				</span>
			</el-dialog>
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
                addCitationNumberFormDialogVisible: false,
                importNumberFormDialogVisible:false,
				multipleSelection: [],
				citationNumForm: {
					number: "",
					options1: [{
							value: "1",
							label: "已绑定"
						},
						{
							value: "2",
							label: "未绑定"
						},
						{
							value: "3",
							label: "全部"
						}
					],
					value1: "",
					checkList: []
				},
				tableData: [],
				page: {
					currentPage: 1,
					size: 10,
					total: 1
				},
				addCitationNumberForm: {
					guideNumber: "",
					unitPrice: "",
					second: "",
					checkList: [],
					options: [{
							value: "per6seconds",
							label: "6秒"
						},
						{
							value: "perMinute",
							label: "分钟"
						}
					],
					value: "",
					id: "" //  编辑时保存的id
				},

				selectedItems: [],
				ids: [],

				updateData: "none", // 编辑和新增公用一个弹窗控制按钮显示
				submitData: "inline-block",

				disabledSelf: false,
                disabledChannel: false,
                loading:false,
                importNumberForm: {
					errorNum: "1",
					tableData: []
                },
                permission:[]
			};
		},
		methods: {
			// 修改页面显示数据大小
			handleSizeChange(val) {
				this.page.size = val;
				this.loadData();
			},

			// 修改当前显示页面
			handleCurrentChange(val) {
				this.page.currentPage = val;
				this.loadData(this.page.currentPage);
			},

			reset() {
				this.citationNumForm.number = "";
				this.citationNumForm.value1 = "";
				this.citationNumForm.value2 = "";
				this.citationNumForm.checkList = [];
			},

			// 批量选择
			handleSelectionChange(val) {
				this.selectedItems = val;
			},

			batchDelete() {
				this.$confirm("此操作将永久删除这些信息, 是否继续?", "提示", {
						confirmButtonText: "确定",
						cancelButtonText: "取消"
					})
					.then(() => {
						for (let i = 0; i < this.selectedItems.length; i++) {
							this.ids.push(this.selectedItems[i].id);
						}
						let IDS = this.ids.join(",");
						this.$ajax
							.post("/vos/guideNumber/delete", {
								ids: IDS
							})
							.then(res => {
								if (res.code == 200) {
									this.$message({
										message: "删除成功!",
										type: "success"
									});
									this.loadData();
								}
								if (res.code == 4005) {
									this.$message.error("您无权操作!");
								}
							});
					})
					.catch(() => {
						this.$message({
							type: "info",
							message: "已取消删除!"
						});
					});
			},

			showAddCitationNum() {
				this.addCitationNumberFormDialogVisible = true;

				this.addCitationNumberForm.guideNumber = "";
				this.addCitationNumberForm.unitPrice = "";
				this.addCitationNumberForm.value = "";
				this.addCitationNumberForm.checkList = [];

				this.updateData = "none";
				this.submitData = "inline-block";

				this.disabledSelf = false;
				this.disabledChannel = false;
			},

			addCitationNum() {
				if (
					this.addCitationNumberForm.guideNumber == "" ||
					this.addCitationNumberForm.value == "" ||
					this.addCitationNumberForm.unitPrice == "" ||
					this.addCitationNumberForm.checkList.length == 0
				) {
					this.$message({
						message: "存在空字段!",
						type: "warning"
					});
				} else {
					let str = "";
					if (this.addCitationNumberForm.checkList.length == 2) {
						str = "self,channel";
					}
					if (
						this.addCitationNumberForm.checkList.length == 1 &&
						this.addCitationNumberForm.checkList[0] == "自助直销"
					) {
						str = "self";
					}
					if (
						this.addCitationNumberForm.checkList.length == 1 &&
						this.addCitationNumberForm.checkList[0] == "渠道"
					) {
						str = "channel";
					}

					this.$ajax
						.post("/vos/guideNumber/save", {
							guideNumber: {
								guideNumber: this.addCitationNumberForm.guideNumber,
								price: this.addCitationNumberForm.unitPrice,
								priceType: this.addCitationNumberForm.value,
								channel: str,

								line: "hangdian"
							}
						})
						.then(res => {
							if (res.code == 200) {
								this.$message({
									message: "新增成功!",
									type: "success"
								});
								this.loadData();
							}
							if (res.code == 4007) {
								this.$message({
									message: "该引示号已经存在!",
									type: "warning"
								});
								this.loadData();
							}
                        });
                        this.addCitationNumberFormDialogVisible = false;
				}

				
			},

			handleEdit(index, row) {
				this.addCitationNumberFormDialogVisible = true;
				this.updateData = "inline-block";
				this.submitData = "none";

				this.disabledSelf = true;
				this.disabledChannel = true;

				let channel = "";
				if (row.channel == "自助直销") {
					channel = ["自助直销"];
				}
				if (row.channel == "渠道") {
					channel = ["渠道"];
				}
				if (row.channel == "自助直销,渠道") {
					channel = ["自助直销", "渠道"];
				}

				this.addCitationNumberForm.guideNumber = row.guideNumber;
				this.addCitationNumberForm.unitPrice = row.price.split("元")[0];
				this.addCitationNumberForm.value = row.priceType;
				this.addCitationNumberForm.checkList = channel;
				this.addCitationNumberForm.id = row.id;
			},

			updateCitationNum() {
				if (
					this.addCitationNumberForm.guideNumber == "" ||
					this.addCitationNumberForm.value == "" ||
					this.addCitationNumberForm.unitPrice == ""
				) {
					this.$message({
						message: "存在空字段!",
						type: "warning"
					});
				} else {
					let str = "";
					if (this.addCitationNumberForm.checkList.length == 2) {
						str = "self,channel";
					}
					if (
						this.addCitationNumberForm.checkList.length == 1 &&
						this.addCitationNumberForm.checkList[0] == "自助直销"
					) {
						str = "self";
					}
					if (
						this.addCitationNumberForm.checkList.length == 1 &&
						this.addCitationNumberForm.checkList[0] == "渠道"
					) {
						str = "channel";
					}

					this.$ajax
						.post("/vos/guideNumber/update", {
							guideNumber: {
								id: this.addCitationNumberForm.id,
								guideNumber: this.addCitationNumberForm.guideNumber,
								channel: str,
								line: "xihu",
								price: this.addCitationNumberForm.unitPrice,
								priceType: this.addCitationNumberForm.value
							}
						})
						.then(res => {
							if (res.code == 200) {
								this.$message({
									message: "编辑成功!",
									type: "success"
								});
								this.loadData();
							}
                        });
                        this.addCitationNumberFormDialogVisible = false;
				}

				
			},

			handleDelete(index, row) {
				this.$confirm("此操作将永久删除该条信息, 是否继续?", "提示", {
						confirmButtonText: "确定",
						cancelButtonText: "取消"
					})
					.then(() => {
						this.$ajax
							.post("/vos/guideNumber/delete", {
								ids: row.id
							})
							.then(res => {
								if (res.code == 200) {
									this.$message({
										message: "删除成功!",
										type: "success"
									});
									this.loadData();
								}
							});
					})
					.catch(() => {
						this.$message({
							type: "info",
							message: "已取消删除!"
						});
					});
			},

			downloadTemplate() {
                // const url = "http://192.168.0.117:5480/vos/excel/guideNumberModel";
                const url = this.$global.serverSrc+'excel/guideNumberModel'
				window.open(url, "_blank");
			},

			uploaded(res, file, fileList) {
                if(res.code == 200 & res.data.duplicatedList == null){
                    this.$message({
							message: '导入成功!',
							type: 'success'
						});
                }else{
                    this.importNumberFormDialogVisible=true;
                    this.importNumberForm.errorNum=res.data.duplicatedList.length;
                    this.importNumberForm.tableData=res.data.duplicatedList;
                    
                }
                this.loadData();
                
			},

			exportInfo() {
				this.$emit("exportGuideNumber");
			},

			loadTable(res) {
				this.tableData = res.guideNumbers;
				this.page.total = res.totalCount;

				for (let i = 0; i < this.tableData.length; i++) {
					if (this.tableData[i].channel == "self") {
						this.tableData[i].channel = "自助直销";
					} else if (this.tableData[i].channel == "channel") {
						this.tableData[i].channel = "渠道";
					} else if (this.tableData[i].channel == "self,channel"){
						this.tableData[i].channel = "自助直销,渠道";
					}

					if (this.tableData[i].status == "Binded") {
						this.tableData[i].status = "已绑定";
					} else {
						this.tableData[i].status = "未绑定";
					}
					if (this.tableData[i].priceType == "per6seconds") {
						this.tableData[i].price = this.tableData[i].price + "元/6秒";
					} else {
						this.tableData[i].price = this.tableData[i].price + "元/分钟";
					}
				}
			},

			loadData(num,pageNum=1) {
                this.loading=true;
                this.page.currentPage=pageNum;
                let str = "";
				if (this.citationNumForm.checkList.length == 2) {
					str = "self,channel";
				}
				if (
					this.citationNumForm.checkList.length == 1 &&
					this.citationNumForm.checkList[0] == "自助直销"
				) {
					str = "self";
				}
				if (
					this.citationNumForm.checkList.length == 1 &&
					this.citationNumForm.checkList[0] == "渠道"
				) {
					str = "channel";
				}

				let status = "";
				if (this.citationNumForm.value1 == "1") {
					status = "Binded";
				}
				if (this.citationNumForm.value1 == "2") {
					status = "Unbind";
				}
				if (this.citationNumForm.value1 == "3") {
					status = "";
				}
				this.$ajax.post("/vos/guideNumber/search", {
					page: {
						pageNo: this.page.currentPage,
						pageSize: this.page.size
					},
					guideNumber: {
						status: status,
						channel: str,
						guideNumber: num
					}
				}).then(res => {
					if (res.code == 200) {
                        this.loadTable(res.data);
                        this.loading=false;
					}
				});
			}
		},

		created() {
            this.loadData();
			this.$store.getters.getPermission(location.hash.replace(/#/, '')).map(item => {
                this.permission.push(item.id);
            });
		}
	};
</script>

<style lang="scss" scoped>
	@import "./citationNum";
</style>