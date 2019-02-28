// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import '@/assets/css/main.css';
import store from '@/store';
import router from './router';
import axios from 'axios';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';


Vue.use(ElementUI);
Vue.prototype.$ajax = axios;
Vue.prototype.$clear = function (obj) {
	var toStr = Object.prototype.toString;
	for (let key in obj) {
		if (typeof obj[key] == 'object' && obj[key] !== null) {
			if (toStr.call(obj[key]) == '[object Array]') {
				obj[key] = [];
			} else {
				this.$clear(obj[key]);
			}
		} else if (typeof (obj[key]) == 'string') {
			obj[key] = '';
		} else if (typeof (obj[key]) == 'number') {
			obj[key] = 0;
		}
	}
	return obj;
};
Vue.prototype.$format = function (obj) {
	var toStr = Object.prototype.toString;
	for (let key in obj) {
		if (typeof obj[key] == 'object' && obj[key] !== null) {
			if (toStr.call(obj[key]) == '[object Array]' && obj[key] == []) {
				delete obj[key];
			} else {
				this.$format(obj[key]);
			}
		} else if (typeof (obj[key] == 'string') && obj[key] == '') {
			delete obj[key];
		}
	}
	return obj;
};
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json;charset=UTF-8';
axios.interceptors.response.use(res => {
	switch (res.data.code) {
	case 302:
		location.href = '#/login';
		location.reload();
		break
	case 530:
		//location.href='#/login?error_type=1'
		break
	}
	if (res.data.code != 200 && res.data.code !== undefined) {
		Vue.prototype.$message({
			message: res.data.message,
			type: 'warning'
		});
	}
	return res.data;
}, err => {
	console.log(2, err)
	//处理302
	if (typeof err.response === 'undefined') {
		location.href = '#/login';
		location.reload();
	}
	return err;
})

Vue.config.productionTip = false;
Vue.prototype.$global = {
	pageSize: [10, 20, 30, 50],
	uploadUrl: '/vos/common/uploadImg',
	// 阿里云
	// uploadUrl2: 'http://47.94.168.117/vos/',
	// serverSrc: 'http://47.94.168.117/vos/',
	// 将恩情
	uploadUrl2: 'http://192.168.0.104/vos/',
	serverSrc: 'http://192.168.0.104:5480/vos/',
	// 廖文
	// uploadUrl2: 'http://192.168.0.167/vos/',
	// serverSrc: 'http://192.168.0.167:5480/vos/',
};
router.beforeEach((to, from, next) => {
	var allPath = store.getters.getRoute;
	let currentPath = to.path;
	var isPass = false;
	if (currentPath.indexOf('/login') != -1) {
		isPass = true;
		next();
		return;
	};
	if (allPath.length == 0) {
		if (sessionStorage.getItem('roleId') != null) {
			axios.get('/vos/menu/getTreeMenu?roleId=' + sessionStorage.getItem('roleId')).then(res => {
				if (res.code == 200) {
					store.commit('addRoute', res.data.menuList);
					allPath = store.getters.getRoute;
					for (let i = 0; i < allPath.length; i++) {
						console.log(i, allPath[i], allPath[i].trim() == currentPath)
						if (allPath[i].trim() == currentPath) {
							isPass = true;
							next();
							return;
						}
					};
					if (!isPass) {
						Vue.prototype.$message({
							message: '权限错误',
							type: 'warning'
						});
					}
				}
			});
		} else {
			axios.get('/vos/user/getMe').then(resp => {
				for (let key in resp.data) {
					sessionStorage.setItem(key, resp.data[key]);
				};
				axios.get('/vos/menu/getTreeMenu?roleId=' + sessionStorage.getItem('roleId')).then(res => {
					if (res.code == 200) {
						store.commit('addRoute', res.data.menuList);
						allPath = store.getters.getRoute;
						for (let i = 0; i < allPath.length; i++) {
							if (allPath[i].trim() == currentPath) {
								isPass = true;
								next();
								return;
							}
						};
						if (!isPass) {
							Vue.prototype.$message({
								message: '权限错误',
								type: 'warning'
							});
						}
					}
				});
			});
		}

	} else {
		for (let i = 0; i < allPath.length; i++) {
			if (allPath[i].trim() == currentPath) {
				isPass = true;
				next();
				return;
			}
		};
		if (!isPass) {
			Vue.prototype.$message({
				message: '权限错误',
				type: 'warning'
			});
		}
	};

})
/* eslint-disable no-new */
new Vue({
	el: '#app',
	router,
	store,
	components: { App },
	template: '<App/>',
	render: h => h(App),
	data: {
		eventHub: new Vue()
	}
});