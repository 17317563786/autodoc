<template>
  <div class="container">
    <div class="file-detail-header layout-header">
      <el-button type="primary" size="small" @click="closeWindow" icon="circle-cross">关闭本页</el-button>
    </div>
    <div class="file-detail-content layout-content no-footer">
      <div class="tabs-wrapper mt10">
        <comment-items
          :proofread="false"
          :readonly="false"
          :comments="commentList"
          :tabsValue="'wrong'"
          storeName="revisionItems">
        </comment-items>
      </div>
    </div>
  </div>
</template>
<script>
import commentItems from 'components/comment-items.vue'
export default {
  name: 'revision-items',
  components: {
    commentItems
  },
  data () {
    return {
    }
  },
  computed: {
    commentList () {
      return this.$store.state.revisionItems.list
    }
  },
  created () {
    if (window.localStorage.revisionItems) {
      this.$store.commit('revisionItems/set_list', JSON.parse(window.localStorage.revisionItems))
    }
  },
  methods: {
    closeWindow () {
      window.localStorage.removeItem('revisionItems')
      window.close()
    }
  }
}
</script>
<style lang="less">
@import "../assets/less/variables.less";
</style>
