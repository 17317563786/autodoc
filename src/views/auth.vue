<template>
  <div class="scan-container">
    <div id="wechat_scan"></div>
    <div v-if="isDummy" class="login-wrapper">
      <el-form class="login-form" :model="form" label-width="60px">
        <el-form-item label="用户名">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" @keyup.enter.native="login"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login">立即登录</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="hide-button" @click="handleHideButtonClick"></div>
  </div>
</template>
<script>
import { dummyLogin } from '../store/api'
let clickNum = 0
export default {
  name: 'auth',
  data () {
    return {
      isDummy: false,
      form: {
        username: '',
        password: ''
      },
      config: {
        id: 'wechat_scan',
        appid: 'wx8fdd975801b9e63e',
        scope: 'snsapi_login',
        redirect_uri: encodeURIComponent(window.location.protocol + '//bondowner.cn/pc'),
        state: 'autodoc/auth',
        href: ''
      }
    }
  },
  beforeMount () {
    if (window.location.host !== 'd.bondowner.cn') {
      // 非生产环境，切换测试appid和回调地址
      this.config.appid = 'wx0bbaaa624f3ad8fd'
      this.config.redirect_uri = window.location.protocol + '//t.bondowner.cn/pc'
    }
    /* eslint-disable no-new */
    this.$nextTick(() => {
      new window.WxLogin(this.config)
    })
  },
  methods: {
    login () {
      if (this.form.username === '' && this.form.password === '') {
        this.$notify.warning({
          title: '错误',
          message: '不能为空'
        })
        return null
      }
      dummyLogin(this.form.username, this.form.password).then((resp) => {
        if (resp.status) {
          window.location.reload()
        }
      })
    },
    handleHideButtonClick () {
      clickNum++
      if (clickNum > 5) {
        this.isDummy = true
      }
    }
  }
}
</script>
<style lang="less">
@import "../assets/less/variables.less";
.scan-container {
  height: 100%;
  position: relative;
}
#wechat_scan{
  position: absolute;
  left: 50%;
  top: 50%;
  margin-top: -201px;
  margin-left: -150px;
}
.login-wrapper {
  width: 300px;
  height: 400px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-top: -201px;
  margin-left: -150px;
  background-color: @white-base;
}
.hide-button{
  position: absolute;
  background-color: rgba(0,0,0,0);
  width: 200px;
  height: 100px;
}
</style>