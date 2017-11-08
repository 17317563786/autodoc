<template>
    <div v-if="$store.state.fileDetail.relationItemList.length <= 0" class="empty-comments">数值变动和比例无数据</div>
    <div v-else class="tabs-wrapper mt10">
      <el-tabs type="card" :value="activeTabName" @tab-click="handleTabsClick">
        <el-tab-pane name="wrong">
          <span slot="label">
            错误 ({{AdminCommentList.wrong.length}})
          </span>
          <div v-if="AdminCommentList.wrong.length > 0" class="mb15 clearfloat">
            <el-button v-if="$store.state.userInfo.type !== 'normal'"  @click="hideCommentsByType('wrong')" type="warning" size="small" >一键隐藏</el-button>
          </div>
          <relation-items
            v-if="activeTabName === 'wrong'"
            :relations="AdminCommentList.wrong"
            :readonly="readonly"
            :proofread="proofread"
            storeName="fileDetail">
          </relation-items>
        </el-tab-pane>
        <el-tab-pane name="correct">
          <span slot="label">正确 ({{AdminCommentList.correct.length}})</span>
          <div v-if="AdminCommentList.correct.length > 0" class="mb15 clearfloat">
            <el-button v-if="$store.state.userInfo.type !== 'normal'"  @click="hideCommentsByType('correct')" type="warning" size="small" >一键隐藏</el-button>
          </div>
          <relation-items
            v-if="activeTabName === 'correct'"
            :relations="AdminCommentList.correct"
            :readonly="readonly"
            :proofread="proofread"
            storeName="fileDetail">
          </relation-items>
        </el-tab-pane>
        <el-tab-pane name="no_match">
          <span slot="label">数值缺失,无法计算 ({{AdminCommentList.noMatch.length}})</span>
          <div v-if="AdminCommentList.noMatch.length > 0" class="mb15 clearfloat">
            <el-button v-if="$store.state.userInfo.type !== 'normal'"  @click="hideCommentsByType('no_match')" type="warning" size="small" >一键隐藏</el-button>
          </div>
          <relation-items
            v-if="activeTabName === 'no_match'"
            :relations="AdminCommentList.noMatch"
            :readonly="readonly"
            :proofread="proofread"
            storeName="fileDetail">
          </relation-items>
        </el-tab-pane>
        <el-tab-pane v-if="AdminCommentList.hidden.length && $store.state.userInfo.type !== 'normal'" name="hidden">
          <span slot="label" class="red">已隐藏 ({{AdminCommentList.hidden.length}})</span>
          <relation-items
            v-if="activeTabName === 'hidden'"
            :relations="AdminCommentList.hidden"
            :readonly="readonly"
            :proofread="proofread"
            storeName="fileDetail">
          </relation-items>
      </el-tab-pane>
      </el-tabs>
    </div>
</template>
<script>
import relationItems from 'components/relation-items.vue'

export default {
  name: 'file-detail-relation',
  components: {
    relationItems
  },
  data () {
    return {
      activeTabName: 'wrong'
    }
  },
  computed: {
    docId () {
      return this.$route.params.id
    },
    owner () {
      return this.$route.query.owner || this.$store.state.fileDetail.owner
    },
    readonly () {
      return this.$route.query.type === 'readonly'
    },
    proofread () {
      return this.$route.query.type === 'proofread'
    },
    initialTabName () {
      return this.$route.query.tab || ''
    },
    AdminCommentList () {
      let temp = {
        correct: [],
        wrong: [],
        noMatch: [],
        hidden: []
      }
      if (this.$store.state.fileDetail.relationItemList.length === 0) {
        return temp
      }
      this.$store.state.fileDetail.relationItemList.forEach((item) => {
        if (item.type === 'correct') {
          temp.correct.push(item)
        } else if (item.type === 'wrong') {
          temp.wrong.push(item)
        } else if (item.type === 'no_match') {
          temp.noMatch.push(item)
        }
        if (item.internal_status) {
          temp.hidden.push(item)
        }
      })
      return temp
    }
  },
  created () {
    if (this.$route.query.navmenu === 'relation' && this.initialTabName) {
      this.activeTabName = this.initialTabName
    }
  },
  methods: {
    handleTabsClick  (tab) {
      this.activeTabName = tab.name
    },
    hideCommentsByType (typeName) {
      this.$confirm(`将所有${this.activeTabName}下的预审项都隐藏吗？`, '全部隐藏提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('fileDetail/push_all_proofread_result', {docId: this.docId, action: 'hide', type: typeName, contentType: 'relation'}).then(_ => {
          this.$notify.success({
            title: '成功',
            message: '已全部隐藏'
          })
        })
      })
    }
  }
}
</script>
<style lang="less">
@import "../../assets/less/variables.less";
</style>
