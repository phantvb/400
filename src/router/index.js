import Vue from 'vue';
import Router from 'vue-router';
import login from '@/components/login/login';
import layout from '@/components/view/index';
import userCenter from '@/components/view/userCenter/userCenter';
import accountManage from '@/components/view/systemSetup/accountManage';
import systemLog from '@/components/view/systemSetup/systemLog';
import fourBusinessManage from '@/components/view/businessAccepted/400businessManage';

Vue.use(Router)

export default new Router({
  routes: [
    {
      path:'/',
      redirect:'/layout',
      hidden:true
    },
    {
      path: '/login',
      name: 'login',
      component: login,
      hidden:true
    },
    {
      path:'/layout',
      name:'layout',
      component:layout,
      hidden:true,
      children:[
        {
          path:'userCenter',
          name:'用户中心',
          component:userCenter
        },
      ],

    },
    {
      path:'/systemSetup',
      name:'系统设置',
      component:layout,
      children:[
        {
          path:'accountManage',
          name:'账号管理',
          component:accountManage
        },
        {
          path:'systemLog',
          name:'系统日志',
          component:systemLog
        },
      ]
    },
    {
      path:'/businessAccepted',
      name:'业务受理',
      component:layout,
      children:[
        {
          path:'400businessManage',
          name:'400业务管理',
          component:fourBusinessManage
        },
      ]
    },
  ]
})
