<template>
	<div id="usableNum">
		<div class="search" v-if="permission.indexOf(50)!=-1">
			<el-form ref="usableNumForm" :model="usableNumForm" style="padding:9px 9px;">
				<el-form-item style="float: left;margin-left: 15px;">
					<span class="demonstration">400号码：</span>
					<el-input v-model="usableNumForm.number" placeholder="请输入400号码" size="mini" style="width:300px;"></el-input>
				</el-form-item>

				<el-form-item label="可见渠道：" style=" clear: both;margin-left: 15px;">
					<el-checkbox-group v-model="usableNumForm.checkList" style="float: left;margin-left: 15px">
						<el-checkbox label="自助直销"></el-checkbox>
						<el-checkbox label="渠道"></el-checkbox>
					</el-checkbox-group>
				</el-form-item>
				<el-form-item style="margin-left: 15px;">
					<el-button type="primary" size="mini" class="searchButton" @click="loadData(usableNumForm.number)">搜索</el-button>
					<el-button type="primary" plain size="mini" class="resetButton" @click="reset">重置</el-button>
				</el-form-item>
			</el-form>
		</div>

		<div class="buttonDiv">
			<div style="float: left;">
				<el-button type="primary" size="mini" @click="showAddNum" v-if="permission.indexOf(54)!=-1">
					<i class="el-icon-plus">&nbsp;新增400号码</i>
				</el-button>
				<el-button type="primary" plain size="mini" @click="batchDelete" v-if="permission.indexOf(53)!=-1">批量删除</el-button>
			</div>
			<div style="float: right;">
				<el-button type="text" size="mini" style="float:left;" @click="downloadTemplate">批量导入Excel 模板下载</el-button>
				<el-button type="primary" plain size="mini" @click="exportInfo" v-if="permission.indexOf(51)!=-1">导出</el-button>
				<el-upload class="upload-demo" style="float:left;margin-left:10px;" :show-file-list=false :with-credentials="true" action="/vos/excel/importNumber400" :on-success="uploaded" v-if="permission.indexOf(114)!=-1">
					<el-button type="primary" plain size="mini">批量导入</el-button>
				</el-upload>
			</div>
		</div>

		<div>
			<el-table ref="multipleTable" tooltip-effect="dark" :data="tableData" style="width: 100%;margin-bottom:15px;" @selection-change="handleSelectionChange">
				<el-table-column type="selection" min-width="100"></el-table-column>
				<el-table-column prop="number400" label="400号码" min-width="60"></el-table-column>
				<el-table-column prop="channel" label="可见渠道" min-width="80"></el-table-column>
				<el-table-column prop="tariffName" label="关联套餐" min-width="200"></el-table-column>
				<el-table-column label="操作" min-width="80">
					<template slot-scope="scope">
						<el-button size="mini" type="text" @click="handleEdit(scope.$index, scope.row)" v-if="permission.indexOf(52)!=-1">编辑</el-button>
						<el-button size="mini" type="text" @click="handleDelete(scope.$index, scope.row)" v-if="permission.indexOf(53)!=-1">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div style="margin-top: 10px">
				<el-pagination style="float:right;" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page.currentPage" :page-sizes="$global.pageSize" :page-size="page.size" layout="total, sizes, prev, pager, next, jumper" :total="page.total"></el-pagination>
			</div>
		</div>

		<div>
			<el-dialog title="新增/编辑400号码" :visible.sync="addNumberFormDialogVisible" width="30%">
				<div>
					<el-form ref="addNumberForm" :model="addNumberForm" label-width="100px">
						<el-form-item label="400号码：">
							<el-input v-model="addNumberForm.number" size="mini" class="el-input"></el-input>
						</el-form-item>

						<el-form-item label="可见渠道：">
							<el-checkbox-group v-model="addNumberForm.checkList" :min="1" @change="changeCheckList">
								<el-checkbox label="自助直销" class="el-checkbox"></el-checkbox>
								<el-checkbox label="渠道"></el-checkbox>
							</el-checkbox-group>
						</el-form-item>

						<el-form-item label="引示号码：">
							<el-select v-model="addNumberForm.guideNumberValue" placeholder="请选择" size="mini" class="el-input" @focus="getCanUseCitationNum">
								<el-option v-for="item in addNumberForm.guideNumberOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</el-form-item>

						<el-form-item label="关联套餐：" style="margin-top: 15px;">
							<el-tabs v-model="addNumberForm.activeName" type="card">
								<el-tab-pane label="自助直销" name="first" v-if="addNumberForm.checkList.indexOf('自助直销')!=-1">
									<el-radio-group v-model="addNumberForm.selfIdValue" v-for="(item) in addNumberForm.selfTableData" :key="item.id" style="display:block;margin-top:10px;">
										<el-radio :label="item.id" style="float:left;">{{item.tariffName}}</el-radio>
										<br />
									</el-radio-group>
								</el-tab-pane>
								<el-tab-pane label="渠道" name="second" v-if="addNumberForm.checkList.indexOf('渠道')!=-1">
									<el-radio-group v-model="addNumberForm.channelIdValue" v-for="(item) in addNumberForm.channelTableData" :key="item.id" style="display:block;margin-top:10px;">
										<el-radio :label="item.id" style="float:left;">{{item.tariffName}}</el-radio>
										<br>
									</el-radio-group>
								</el-tab-pane>
							</el-tabs>
						</el-form-item>
					</el-form>
				</div>
				<span slot="footer" class="dialog-footer">
					<el-button @click="addNumberFormDialogVisible = false" size="mini">取 消</el-button>
					<el-button type="primary" @click="addUsableNum" size="mini" :style="'display:'+submitData+';'">确 定</el-button>
					<el-button type="primary" @click="updateUsableNum" size="mini" :style="'display:'+updateData+';'">编 辑</el-button>
				</span>
			</el-dialog>
		</div>

		<div>
			<el-dialog title="400号码导入校验" :visible.sync="importNumberFormDialogVisible" width="50%">
				<div>
					<el-form ref="addNumberForm" :model="importNumberForm" label-width="150px">
						<el-form-item label="校验比对结果：">
							<span style="float: left;">有{{importNumberForm.errorNum}}个号码有误</span>
						</el-form-item>
						<el-form-item label="有误号码列表：">
							<el-table :data="importNumberForm.tableData" border style="width: 100%">
								<el-table-column prop="number400" label="400号码" width="150"></el-table-column>
								<el-table-column prop="channel" label="可见渠道" width="120"></el-table-column>
								<el-table-column prop="packageIds" label="关联套餐" width="150"></el-table-column>
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
				addNumberFormDialogVisible: false,
				importNumberFormDialogVisible: false,

				radio1: 1,
				radio2: 1,
				usableNumForm: {
					number: "",
					checkList: []
				},
				tableData: [],
				page: {
					currentPage: 1,
					size: 10,
					total: 1
				},
				addNumberForm: {
					number: "",
					checkList: ["自助直销"],
					selfTableData: [],
					channelTableData: [],
					selfIdValue: '',
					channelIdValue: '',
					guideNumberOptions: [],
					guideNumberValue: "",
					activeName: "first"
				},
				importNumberForm: {
					errorNum: "1",
					tableData: []
				},
				packages: [], // 保存关联的套餐名 翻译用
				selectedItems: [],
				ids: [], // 批量删除时保存id
				getItemTariffNames: [],
				getItemIds: [],
				aTableData1: [],
				aTableData2: [],

				editContent: [], // 编辑的时候保存信息

				updateData: "none", // 编辑和新增公用一个弹窗控制按钮显示
				submitData: "inline-block",

                id: "", // 存放编辑时的id
                permission:[]
			};
		},
		// props:['status'],
		methods: {
			// 修改页面显示数据大小
			handleSizeChange(val) {
				this.page.size = val;
				this.loadData();
			},

			// 修改当前显示页面
			handleCurrentChange(val) {
                // console.log(val)
				this.page.currentPage = val;
				this.loadData(this.usableNumForm.number,this.page.currentPage);
			},

			reset() {
				this.usableNumForm.number = "";
				this.usableNumForm.checkList = [];
				this.addNumberForm.number = "";
				this.addNumberForm.checkList = ["自助直销"];
				this.addNumberForm.selfIdValue = '';
				this.addNumberForm.channelIdValue = '';
				this.addNumberForm.guideNumberValue = "";
				this.addNumberForm.guideNumberOptions = [];
			},

			// 显示新增400号码请求，并加载关联套餐
			showAddNum() {
				this.addNumberFormDialogVisible = true;
				this.reset();
				this.updateData = "none";
				this.submitData = "inline-block";
			},
			// 根据checklist改变关联套餐选项
			changeCheckList() {
				if (
					this.addNumberForm.checkList.length == 1 &&
					this.addNumberForm.checkList[0] == "自助直销"
				) {
					this.addNumberForm.activeName = "first";
				}
				if (
					this.addNumberForm.checkList.length == 1 &&
					this.addNumberForm.checkList[0] == "渠道"
				) {
					this.addNumberForm.activeName = "second"
				}
			},

			addUsableNum() {
				if (
					this.addNumberForm.number == "" ||
					this.addNumberForm.checkList.length == 0 ||
					(this.addNumberForm.selfIdValue == '') &
					(this.addNumberForm.channelIdValue == '')
				) {
					this.$message({
						message: "存在空字段!",
						type: "warning"
					});
				} else {
					let str = "";
					if (this.addNumberForm.checkList.length == 2) {
						str = "self,channel";
					}
					if (
						this.addNumberForm.checkList.length == 1 &&
						this.addNumberForm.checkList[0] == "自助直销"
					) {
						str = "self";
					}
					if (
						this.addNumberForm.checkList.length == 1 &&
						this.addNumberForm.checkList[0] == "渠道"
					) {
						str = "channel";
					}

					let ids = this.getIdsFunction();


					this.$ajax
						.post("/vos/number400/save", {
							number400: {
								number400: this.addNumberForm.number,
								guideNumber: this.addNumberForm.guideNumberValue,
								channel: str,
								packageIds: ids
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
									message: "该引示号已使用!",
									type: "warning"
								});
							}
						});
					this.addNumberFormDialogVisible = false;
				}


			},

			downloadTemplate() {
				// 下载导入模板
				const url = this.$global.serverSrc + '/excel/number400Model';
				window.open(url, "_blank");
			},

			uploaded(res, file, fileList) {
				if (res.code == 200 & res.data.duplicatedList == null) {
					this.$message({
						message: '导入成功!',
						type: 'success'
					});
				} else {
					this.importNumberFormDialogVisible = true;
					this.importNumberForm.errorNum = res.data.duplicatedList.length;
					this.importNumberForm.tableData = res.data.duplicatedList;

				}
				this.loadData();

			},

			exportInfo() {
				this.$emit("exportNumber400");
			},

			// 编辑
			handleEdit(index, row) {
				this.addNumberFormDialogVisible = true;

				this.updateData = "inline-block";
				this.submitData = "none";

				this.reset();

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

				let packageIds = row.packageIds.split(",");

				for (let i = 0; i < packageIds.length; i++) {
					for (let j = 0; j < this.aTableData1.length; j++) {
						if (packageIds[i] == this.aTableData1[j].id) {
							this.addNumberForm.selfIdValue = this.aTableData1[j].id;
							break;
						}
					}

					for (let j = 0; j < this.aTableData2.length; j++) {
						if (packageIds[i] == this.aTableData2[j].id) {
							this.addNumberForm.channelIdValue = this.aTableData2[j].id;
							break;
						}
					}


				}

				this.addNumberForm.number = row.number400;
				this.addNumberForm.checkList = channel;

				this.addNumberForm.guideNumberValue = row.guideNumber;
				this.id = row.id;

				this.changeCheckList();
			},

			updateUsableNum() {
				if (
					this.addNumberForm.number == "" ||
					this.addNumberForm.checkList.length == 0 ||
					(this.addNumberForm.selfIdValue == '') &
					(this.addNumberForm.channelIdValue == '')
				) {
					this.$message({
						message: "存在空字段!",
						type: "warning"
					});
				} else {
					let str = "";
					if (this.addNumberForm.checkList.length == 2) {
						str = "self,channel";
					}
					if (
						this.addNumberForm.checkList.length == 1 &&
						this.addNumberForm.checkList[0] == "自助直销"
					) {
						str = "self";
					}
					if (
						this.addNumberForm.checkList.length == 1 &&
						this.addNumberForm.checkList[0] == "渠道"
					) {
						str = "channel";
					}

					let ids = this.getIdsFunction();

					this.$ajax
						.post("/vos/number400/update", {
							number400: {
								id: this.id,
								number400: this.addNumberForm.number,
								guideNumber: this.addNumberForm.guideNumberValue,
								channel: str,
								packageIds: ids
							}
						})
						.then(res => {
							if (res.code == 200) {
								this.$message({
									message: "更新成功!",
									type: "success"
								});
								this.loadData();
							}
							if (res.code == 4005) {
								this.$message.error("您无权操作!");
							}
						});
					this.addNumberFormDialogVisible = false;
				}


			},

			// 单个删除
			handleDelete(index, row) {
				this.$confirm("此操作将永久删除该条信息, 是否继续?", "提示", {
						confirmButtonText: "确定",
						cancelButtonText: "取消"
					})
					.then(() => {
						this.$ajax
							.post("/vos/number400/delete", {
								number400: [{
									id: row.id,
									number400: row.number400,
									guideNumber: row.guideNumber
								}]
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

			// 批量删除
			handleSelectionChange(val) {
				this.selectedItems = val;
			},

			batchDelete() {
				this.$confirm("此操作将永久删除这些信息, 是否继续?", "提示", {
						confirmButtonText: "确定",
						cancelButtonText: "取消"
					})
					.then(() => {
						if (this.selectedItems.length == 0) {
							this.$message("您未选择!");
						} else {
							for (let i = 0; i < this.selectedItems.length; i++) {
								this.ids.push({
									id: this.selectedItems[i].id,
									number400: this.selectedItems[i].number400,
									guideNumber: this.selectedItems[i].guideNumber
								});
							}
							this.$ajax
								.post("/vos/number400/delete", {
									number400: this.ids
								})
								.then(resp => {
									if (resp.code == 200) {
										this.$message({
											message: "删除成功!",
											type: "success"
										});
										this.loadData();
									}
									if (resp.code == 4005) {
										this.$message.error("您无权操作!");
									}
								});
						}
					})
					.catch(() => {
						this.$message({
							type: "info",
							message: "已取消删除"
						});
					});
			},


			//翻译table中显示的数据
			translate(res) {
				this.tableData = res.number400s;
				this.page.total = res.totalCount;

				for (let i = 0; i < this.tableData.length; i++) {
					this.getItemIds = res.number400s[i].packageIds.split(","); //把接收到的id字符串转换成数组
					if (this.tableData[i].channel == "self") {
						this.tableData[i].channel = "自助直销";

						for (let n = 0; n < this.getItemIds.length; n++) {
							for (let j = 0; j < this.aTableData1.length; j++) {
								if (this.getItemIds[n] == this.aTableData1[j].id) {
									this.getItemTariffNames.push(
										this.aTableData1[j].tariffName
									);
								}
							}
						}
						res.number400s[i].tariffName = this.getItemTariffNames.join(
							","
						);
						this.getItemTariffNames = [];
					}
					if (this.tableData[i].channel == "channel") {
						this.tableData[i].channel = "渠道";
						for (let n = 0; n < this.getItemIds.length; n++) {
							for (let j = 0; j < this.aTableData2.length; j++) {
								if (this.getItemIds[n] == this.aTableData2[j].id) {
									this.getItemTariffNames.push(
										this.aTableData2[j].tariffName
									);
								}
							}
						}
						res.number400s[i].tariffName = this.getItemTariffNames.join(
							","
						);
						this.getItemTariffNames = [];
					}
					if (this.tableData[i].channel == "self,channel") {
						this.tableData[i].channel = "自助直销,渠道";
						for (let n = 0; n < this.getItemIds.length; n++) {
							for (let j = 0; j < this.aTableData1.length; j++) {
								if (this.getItemIds[n] == this.aTableData1[j].id) {
									this.getItemTariffNames.push(
										this.aTableData1[j].tariffName
									);
								}
							}
						}
						for (let n = 0; n < this.getItemIds.length; n++) {
							for (let j = 0; j < this.aTableData2.length; j++) {
								if (this.getItemIds[n] == this.aTableData2[j].id) {
									this.getItemTariffNames.push(
										this.aTableData2[j].tariffName
									);
								}
							}
						}
						res.number400s[i].tariffName = this.getItemTariffNames.join(
							","
						);
						this.getItemTariffNames = [];
					}
				}
			},

			//加载可用引示号
			getCanUseCitationNum() {
				this.addNumberForm.guideNumberOptions = [];
				this.addNumberForm.guideNumberOptions.push({
					value: '',
					label: '无'
				});
				let totalCount = 0;
				this.$ajax
					.post("/vos/guideNumber/getAll", {
						guideNumber: {
							status: "Unbind",
							channel: "",
							guideNumber: ""
						},
						page: {
							pageNo: "1",
							pageSize: "10"
						}
					})
					.then(res => {
						if (res.code == 200) {
							totalCount = res.data.totalCount;
							this.$ajax
								.post("/vos/guideNumber/getAll", {
									guideNumber: {
										status: "Unbind",
										channel: "",
										guideNumber: ""
									},
									page: {
										pageNo: "1",
										pageSize: totalCount
									}
								})
								.then(resp => {
									if (resp.code == 200) {
										for (
											let i = 0; i < resp.data.guideNumbers.length; i++
										) {
											if (
												(resp.data.guideNumbers[i].status =
													"Unbind")
											) {
												this.addNumberForm.guideNumberOptions.push({
													value: resp.data.guideNumbers[
														i
													].guideNumber,
													label: resp.data.guideNumbers[
														i
													].guideNumber
												});
											}
										}
									}
								});
						}
					});
			},

			// 得到新增dialog里面的关联套餐的列表
			getIdsFunction() {
				let ids = '';
				let selfId = this.addNumberForm.selfIdValue;
				let channelId = this.addNumberForm.channelIdValue;
				if (this.addNumberForm.checkList.indexOf('自助直销') != -1) {
					ids = ids + selfId + ',';
				};
				if (this.addNumberForm.checkList.indexOf('渠道') != -1) {
					ids = ids + channelId + ',';
				};
				return ids;
			},


			loadData(mess,pageNum=1) {
                this.page.currentPage=pageNum;
				this.$ajax
					.post("/vos/tariffPackage/getTariff", {
						tariff: {
							channel: "self"
						}
					})
					.then(res => {
						if (res.code == 200) {
							this.aTableData1 = res.data.tariffPackageList;
							this.addNumberForm.selfTableData = res.data.tariffPackageList;
						}
					});
				this.$ajax
					.post("/vos/tariffPackage/getTariff", {
						tariff: {
							channel: "channel"
						}
					})
					.then(res => {
						if (res.code == 200) {
							this.aTableData2 = res.data.tariffPackageList;
							this.addNumberForm.channelTableData = res.data.tariffPackageList;
						}
                    });
                
                let str = "";
				if (this.usableNumForm.checkList.length == 2) {
					str = "self,channel";
				}
				if (
					this.usableNumForm.checkList.length == 1 &&
					this.usableNumForm.checkList[0] == "自助直销"
				) {
					str = "self";
				}
				if (
					this.usableNumForm.checkList.length == 1 &&
					this.usableNumForm.checkList[0] == "渠道"
				) {
					str = "channel";
				}
				this.$ajax
					.post("/vos/number400/getAll", {
						page: {
							pageNo: this.page.currentPage || 1,
							pageSize: this.page.size
						},
						number400: {
							number400: mess,
							channel: str,
							status: "CanUse",
							companyName: "",
							guideNumber: ""
						}
					})
					.then(res => {
						if (res.code == 200) {
							this.translate(res.data);
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
	@import "./usableNum";
</style>