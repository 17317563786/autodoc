import './assets/less/ress.less'
import 'element-ui/lib/theme-default/index.css'
import './assets/less/common.less'
import './assets/less/layout.css'
import './assets/font-awesome/css/font-awesome.css'

import 'whatwg-fetch'
import 'babel-polyfill'
import Vue from 'vue'
import Element from 'element-ui'
import vueXlsxTable from 'vue-xlsx-table'

import * as filters from './util/filter'
import store from './store/index'
import router from './router/index'
import vueFetch from './util/vue-fetch'
import App from './App'

import ErrorReporter from './util/error-report'

// 生产环境关闭devtools和日志与警告,开启bugHD收集bug
if (window.location.host === 'd.bondowner.cn') {
  Vue.config.devtools = false
  Vue.config.silent = true
  ErrorReporter.config({
    reportUrl: 'http://sd.bondowner.cn/newbug',  // 错误上报地址
    reportPrefix: 'AutoDoc_front',    // 错误上报msg前缀，一般用于标识业务类型
    otherReport: {}           // 需要上报的其他信息
  })
}
Vue.config.productionTip = false

Vue.use(Element)
Vue.use(vueFetch)
Vue.use(vueXlsxTable, {rABS: false})
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})
// import { setCookie } from './util/tools'
// setCookie('op_user', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjg4ODgsInVwYyI6IjEwNzc3YzU2MTgzOGMyNzUxNmYxN2U4Y2Y0NzI5OWIzOWQzMDI4YWZmNDhlYThlYzg5MTAyMzUwZmYwYmY2YTUifQ.T7KRQwJyKVrSVrQJXEy3ZUkAkxvG1MCBbj7ZInJj_5A')
// setCookie('user_id', '2|1:0|10:1500543946|7:user_id|16:MTY4ODg4ODg4OQ==|eca101218d96c9d414344b2da1934e56bfb96d31a12a924de2633b8505015f8a')
// setCookie('username', 'admin')
// setCookie('beaker.session.id', 'a9553ee8a91b4e56b1f039481361831b')
// setCookie('user_sys', '2|1:0|10:1500543946|8:user_sys|4:MQ==|8fdd6f136dd6879ee83d69e987886c2ab9d1af17f86c8013c59a5a722b0164cf')
// setCookie('userinfo', '%7B%22id%22%3A8888%2C%22name%22%3A%22admin%22%2C%22type%22%3A%22SUPER%22%2C%22password%22%3A%2210777c561838c27516f17e8cf47299b39d3028aff48ea8ec89102350ff0bf6a5%22%2C%22rights%22%3A%22%22%2C%22status%22%3A1%2C%22created_utc%22%3A1472627900059%2C%22interview_result%22%3A%22%22%2C%22answer_power%22%3A40%7D')

new Vue({
  store,
  router,
  el: '#app',
  template: '<App/>',
  components: { App }
})

window.localStorage.getItem('viewedDoc') || window.localStorage.setItem('viewedDoc', '')

