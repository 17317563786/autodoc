<template>
  <div v-if="$store.state.fileDetail.tupleItemList.length <= 0" class="empty-comments">您的文档写得很好，没发现冲突数据。您可以换个文档再看看～</div>
  <div v-else class="tabs-wrapper mt10">
    <el-tabs type="card" v-model="activeTabName" @tab-click="handleTabsClick">
      <el-tab-pane v-if="$store.state.userInfo.type !== 'normal'" name="wrong">
        <span slot="label">
          错误 ({{AdminCommentList.wrong.length}})
          <span class="fs-12">(用户:冲突)</span>
        </span>
        <div v-if="AdminCommentList.wrong.length > 0" class="mb15 clearfloat">
          <el-button @click="hideCommentsByType('wrong')" type="warning" size="small">一键隐藏</el-button>
        </div>
        <comment-items
          v-if="activeTabName === 'wrong'"
          :proofread="proofread"
          :readonly="readonly"
          :comments="AdminCommentList.wrong"
          storeName="fileDetail">
        </comment-items>
      </el-tab-pane>
      <el-tab-pane v-if="$store.state.userInfo.type !== 'normal'" name="duplicate">
        <span slot="label">冲突 ({{AdminCommentList.duplicate.length}}) <span class="fs-12">(用户:冲突)</span></span>
        <div v-if="AdminCommentList.duplicate.length > 0" class="mb15 clearfloat">
          <el-button @click="hideCommentsByType('duplicate')" type="warning" size="small" >一键隐藏</el-button>
        </div>
        <comment-items
          v-if="activeTabName === 'duplicate'"
          :proofread="proofread"
          :readonly="readonly"
          :comments="AdminCommentList.duplicate"
          storeName="fileDetail">
        </comment-items>
      </el-tab-pane>
      <el-tab-pane v-if="$store.state.userInfo.type !== 'normal'" name="multi_match">
        <span slot="label">多匹配 ({{AdminCommentList.multiMatch.length}}) <span class="fs-12">(用户:冲突)</span></span>
        <div v-if="AdminCommentList.multiMatch.length > 0" class="mb15 clearfloat">
          <el-button @click="hideCommentsByType('multi_match')" type="warning" size="small" >一键隐藏</el-button>
        </div>
        <comment-items
          v-if="activeTabName === 'multi_match'"
          :proofread="proofread"
          :readonly="readonly"
          :comments="AdminCommentList.multiMatch"
          storeName="fileDetail">
        </comment-items>
      </el-tab-pane>
      <el-tab-pane v-if="$store.state.userInfo.type !== 'normal'" name="possible_match">
        <span slot="label">不确定匹配 ({{AdminCommentList.possibleMatch.length}}) <span class="fs-12">(用户:可能正确)</span></span>
        <div v-if="AdminCommentList.possibleMatch.length > 0" class="mb15 clearfloat">
          <el-button @click="hideCommentsByType('possible_match')" type="warning" size="small" >一键隐藏</el-button>
        </div>
        <comment-items
          v-if="activeTabName === 'possible_match'"
          :proofread="proofread"
          :readonly="readonly"
          :comments="AdminCommentList.possibleMatch"
          storeName="fileDetail"
          no-accept-btn>
        </comment-items>
      </el-tab-pane>
      <el-tab-pane v-if="$store.state.userInfo.type !== 'normal'" name="correct">
        <span slot="label">正确 ({{AdminCommentList.correct.length}}) <span class="fs-12">(用户:正确)</span></span>
        <div v-if="AdminCommentList.correct.length > 0" class="mb15 clearfloat">
          <el-button @click="hideCommentsByType('correct')" type="warning" size="small" >一键隐藏</el-button>
        </div>
        <comment-items
          v-if="activeTabName === 'correct'"
          :proofread="proofread"
          :readonly="readonly"
          :comments="AdminCommentList.correct"
          storeName="fileDetail">
        </comment-items>
      </el-tab-pane>
      <el-tab-pane v-if="$store.state.userInfo.type !== 'normal'" name="no_match">
        <span slot="label">匹配缺失 ({{AdminCommentList.noMatch.length}}) <span class="fs-12">(用户:单次出现)</span></span>
        <div v-if="AdminCommentList.noMatch.length > 0" class="mb15 clearfloat">
          <el-button @click="hideCommentsByType('no_match')" type="warning" size="small" >一键隐藏</el-button>
        </div>
        <comment-items
          v-if="activeTabName === 'no_match'"
          :proofread="proofread"
          :readonly="readonly"
          :comments="AdminCommentList.noMatch"
          storeName="fileDetail">
        </comment-items>
      </el-tab-pane>
      <el-tab-pane v-if="$store.state.userInfo.type === 'normal'" name="user_duplicate">
        <span slot="label">
          冲突 ({{UserCommentList.duplicate.length}})
          <el-tooltip placement="bottom">
            <div slot="content">在文档中出现2次以上，且不一致，需要审核</div>
            <i class="fa fa-question-circle-o" aria-hidden="true"></i>
          </el-tooltip>
        </span>
        <comment-items
          v-if="activeTabName === 'user_duplicate'"
          :proofread="proofread"
          :readonly="readonly"
          :comments="UserCommentList.duplicate"
          storeName="fileDetail">
        </comment-items>
      </el-tab-pane>
      <el-tab-pane v-if="$store.state.userInfo.type === 'normal'" name="user_possible">
        <span slot="label">
          可能正确 ({{UserCommentList.possible.length}})
          <el-tooltip placement="bottom">
            <div slot="content">在文档中出现2次以上，且似乎一致，需要审核</div>
            <i class="fa fa-question-circle-o" aria-hidden="true"></i>
          </el-tooltip>
        </span>
        <comment-items
          v-if="activeTabName === 'user_possible'"
          :proofread="proofread"
          :readonly="readonly"
          :comments="UserCommentList.possible"
          storeName="fileDetail">
        </comment-items>
      </el-tab-pane>
      <el-tab-pane v-if="$store.state.userInfo.type === 'normal'"  name="user_correct">
        <span slot="label">
          正确  ({{UserCommentList.correct.length}})
          <el-tooltip placement="bottom">
            <div slot="content">在文档中出现2次以上，且一致</div>
            <i class="fa fa-question-circle-o" aria-hidden="true"></i>
          </el-tooltip>
        </span>
        <comment-items
          v-if="activeTabName === 'user_correct'"
          :proofread="proofread"
          :readonly="readonly"
          :comments="UserCommentList.correct"
          storeName="fileDetail">
        </comment-items>
      </el-tab-pane>
      <el-tab-pane v-if="$store.state.userInfo.type === 'normal'"  name="user_nomatch">
        <span slot="label">
          单次出现 ({{UserCommentList.noMatch.length}})
          <el-tooltip placement="bottom">
            <div slot="content">在文档中只出现1次</div>
            <i class="fa fa-question-circle-o" aria-hidden="true"></i>
          </el-tooltip>
        </span>
        <comment-items
          v-if="activeTabName === 'user_nomatch'"
          :proofread="proofread"
          :readonly="readonly"
          :comments="UserCommentList.noMatch"
          storeName="fileDetail">
        </comment-items>
      </el-tab-pane>
      <el-tab-pane v-if="AdminCommentList.hidden.length && $store.state.userInfo.type !== 'normal'" name="hidden">
        <span slot="label" class="red">已隐藏 ({{AdminCommentList.hidden.length}})</span>
        <comment-items
          v-if="activeTabName === 'hidden'"
          :proofread="proofread"
          :readonly="readonly"
          :comments="AdminCommentList.hidden"
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
  data () {
    return {
      activeTabName: 'wrong'
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
    AdminCommentList () {
      let temp = {
        correct: [],
        duplicate: [],
        multiMatch: [],
        wrong: [],
        noMatch: [],
        possibleMatch: [],
        hidden: []
      }
      if (this.$store.state.fileDetail.tupleItemList.length === 0) {
        return temp
      }
      this.$store.state.fileDetail.tupleItemList.forEach((item) => {
        if (item.type === 'correct') {
          temp.correct.push(item)
        } else if (item.type === 'duplicate') {
          temp.duplicate.push(item)
        } else if (item.type === 'multi_match') {
          temp.multiMatch.push(item)
        } else if (item.type === 'wrong') {
          temp.wrong.push(item)
        } else if (item.type === 'no_match') {
          temp.noMatch.push(item)
        } else if (item.type === 'possible_match') {
          temp.possibleMatch.push(item)
        }
        if (item.internal_status) {
          temp.hidden.push(item)
        }
      })
      return temp
    },
    UserCommentList () {
      // 错误＋冲突＋多匹配: 冲突
      // 不确定匹配：可能正确
      // 正确：正确
      // 匹配缺失：单次出现
      return {
        correct: this.AdminCommentList.correct,
        duplicate: this.AdminCommentList.duplicate.concat(this.AdminCommentList.wrong).concat(this.AdminCommentList.multiMatch),
        possible: this.AdminCommentList.possibleMatch,
        noMatch: this.AdminCommentList.noMatch
      }
    }
  },
  created () {
    if (this.$route.query.navmenu === 'tuple' && this.initialTabName) {
      this.activeTabName = this.initialTabName
    } else {
      if (this.$store.state.userInfo.type === 'normal') {
        this.activeTabName = 'user_duplicate'
      }
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
        this.$store.dispatch('fileDetail/push_all_proofread_result', {docId: this.docId, action: 'hide', type: typeName, contentType: 'quadruple'}).then(_ => {
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
