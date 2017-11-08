<template>
  <div v-if="$store.state.fileDetail.tupleItemList.length <= 0" class="empty-comments">无其他数值～</div>
  <div v-else class="tabs-wrapper mt10">
    <el-tabs type="card" v-model="activeTabName" @tab-click="handleTabsClick">
      <el-tab-pane  name="value">
        <span slot="label">
          其他值 ({{UserCommentList.value.length}})
          <el-tooltip placement="bottom">
            <div slot="content">在文档中出现的值，但是没有在表格和数值变动中出现</div>
            <i class="fa fa-question-circle-o" aria-hidden="true"></i>
          </el-tooltip>
        </span>
        <comment-items
          v-if="activeTabName === 'value'"
          :proofread="proofread"
          :readonly="readonly"
          :comments="UserCommentList.value"
          storeName="fileDetail">
        </comment-items>
      </el-tab-pane>
      <el-tab-pane  name="value_rate">
        <span slot="label">
          其他比例 ({{UserCommentList.valueRate.length}})
          <el-tooltip placement="bottom">
            <div slot="content">在文档中出现的比例，但是没有在表格和数值变动中出现</div>
            <i class="fa fa-question-circle-o" aria-hidden="true"></i>
          </el-tooltip>
        </span>
        <comment-items
          v-if="activeTabName === 'value_rate'"
          :proofread="proofread"
          :readonly="readonly"
          :comments="UserCommentList.valueRate"
          storeName="fileDetail">
        </comment-items>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import commentItems from 'components/comment-items.vue'

export default {
  name: 'file-detail-tuple',
  components: {
    commentItems
  },
  props: {
    other: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      activeTabName: 'value'
    }
  },
  computed: {
    docId () {
      return this.$route.params.id
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
    UserCommentList () {
      let temp = {
        value: [],
        valueRate: []
      }
      if (this.$store.state.fileDetail.tupleItemList.length === 0) {
        return temp
      }
      this.$store.state.fileDetail.tupleItemList.forEach((item) => {
        if (item.type === 'value') {
          temp.value.push(item)
        } else if (item.type === 'value_rate') {
          temp.valueRate.push(item)
        }
      })
      return temp
    }
  },
  created () {
    if (this.$route.query.navmenu === 'other_value' && this.initialTabName) {
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
        this.$store.dispatch('fileDetail/push_all_proofread_result', {docId: this.docId, action: 'hide', type: typeName}).then(_ => {
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
