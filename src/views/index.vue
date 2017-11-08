<template>
  <div class="home-container" v-loading="true">
  </div>
</template>
<script>
// 中转页，确定用户权限, 再打到相应页面
export default {
  name: 'index',
  created () {
    let timer = setTimeout(_ => {
      this.$router.replace('/upload/file/list')
    }, 6000)
    this.$root.$on('userinfo-done', _ => {
      clearTimeout(timer)
      if (this.$store.state.userInfo.type === 'normal') {
        this.$router.replace('/upload/file/list')
      } else {
        this.$router.replace('/upload/file/list/all')
      }
    })
  }
}
</script>
<style>
.home-container {
  height: 300px;
}
</style>