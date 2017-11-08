<template>
  <div id="app">
    <ws-center></ws-center>
    <router-view></router-view>
  </div>
</template>

<script>
import wsCenter from 'components/websocket-center'
import { getCookie } from './util/tools'
export default {
  name: 'app',
  components: {
    wsCenter
  },
  created () {
    if (getCookie('user_id')) {
      this.$store.dispatch('userInfo/fetch_userinfo').then(_ => {
        this.$root.$emit('userinfo-done')
        if (this.$store.state.userInfo.type === 'normal') {
          this.$store.dispatch('userInfo/fetch_balance')
        }
      })
      setTimeout(_ => {
        if (this.$store.state.userInfo.type === 'admin') {
          this.$store.dispatch('allRejectItems/fetch_all_tags')
        }
      }, 3000)
    }
  }
}
</script>

<style lang='less'>
@import "assets/less/variables.less";
</style>
