<template>
  <div class="container">
    <div class="file-detail-header layout-header">
      <el-button type="primary" size="small" @click="routerGoBack" icon="arrow-left">返回</el-button>
    </div>
    <div class="file-detail-content layout-content ps-container" :class="pager.total > 400 ? '' : 'no-footer'" v-loading="loading">
      <h3 class="mb10">所有已接受的修订</h3>
      <div v-if="docRevisionInfo.length" class="tabs-wrapper">
        <el-tabs type="card" value="wrong">
          <el-tab-pane :label="'错误 (' + wrongCommentList.length + ')'" name="wrong">
            <comment-items :comments="wrongCommentList" storeName="allAcceptItems" :readonly="false"></comment-items>
          </el-tab-pane>
          <el-tab-pane :label="'冲突 (' + duplicateCommentList.length + ')'" name="duplicate">
            <comment-items :comments="duplicateCommentList" storeName="allAcceptItems":readonly="false"></comment-items>
          </el-tab-pane>
          <el-tab-pane :label="'多匹配 (' + multiMatchCommentList.length + ')'" name="multi_match">
            <comment-items :comments="multiMatchCommentList" storeName="allAcceptItems":readonly="false"></comment-items>
          </el-tab-pane>
          <el-tab-pane :label="'不确定匹配 (' + possibleMatchCommentList.length + ')'" name="possible_match">
            <comment-items :comments="possibleMatchCommentList" storeName="allAcceptItems":readonly="false" no-accept-btn></comment-items>
          </el-tab-pane>
          <el-tab-pane :label="'正确 (' + correctCommentList.length + ')'" name="correct">
            <comment-items :comments="correctCommentList" storeName="allAcceptItems":readonly="false"></comment-items>
          </el-tab-pane>
          <el-tab-pane :label="'匹配缺失 (' + noMatchCommentList.length + ')'" name="no_match">
            <comment-items :comments="noMatchCommentList" storeName="allAcceptItems":readonly="false"></comment-items>
          </el-tab-pane>
          <el-tab-pane :label="'其他值 (' + valueCommentList.length + ')'" name="value">
            <comment-items :comments="valueCommentList" storeName="allAcceptItems" :readonly="false"></comment-items>
          </el-tab-pane>
          <el-tab-pane :label="'其他比例 (' + valueRateCommentList.length + ')'" name="value_rate">
            <comment-items :comments="valueRateCommentList" storeName="allAcceptItems" :readonly="false"></comment-items>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div v-if="pager.total > 400" class="file-detail-footer layout-footer">
      <el-pagination
        class="fl-r mr10 mt20"
        @current-change="handleCurrentPageChange"
        :page-size="pager.size"
        layout="total, prev, pager, next"
        :total="pager.total">
      </el-pagination>
    </div>
  </div>
</template>
<script>
import commentItems from 'components/comment-items.vue'
export default {
  name: 'all-accept-items',
  components: {
    commentItems
  },
  data () {
    return {
      loading: true,
      dialog: {
        visible: false,
        data: {
          id: null
        }
      }
    }
  },
  computed: {
    pager () {
      return this.$store.state.allAcceptItems.pager
    },
    correctCommentList () {
      return this.$store.getters['allAcceptItems/correct_item_list']
    },
    duplicateCommentList () {
      return this.$store.getters['allAcceptItems/duplicate_item_list']
    },
    multiMatchCommentList () {
      return this.$store.getters['allAcceptItems/multi_match_item_list']
    },
    wrongCommentList () {
      return this.$store.getters['allAcceptItems/wrong_item_list']
    },
    noMatchCommentList () {
      return this.$store.getters['allAcceptItems/no_match_item_list']
    },
    possibleMatchCommentList () {
      return this.$store.getters['allAcceptItems/possible_match_item_list']
    },
    valueCommentList () {
      return this.$store.getters['allAcceptItems/value_item_list']
    },
    valueRateCommentList () {
      return this.$store.getters['allAcceptItems/value_rate_item_list']
    },
    docRevisionInfo () {
      return this.$store.state.allAcceptItems.list
    }
  },
  beforeMount () {
    this.loading = true
    this.$store.dispatch('allAcceptItems/fetch_all_accept_items').then(() => {
      this.loading = false
    })
  },
  methods: {
    routerGoBack () {
      this.$store.commit('allAcceptItems/set_doc_revision_list', [])
      this.$router.push('/upload/file/list/all')
    },
    handleCurrentPageChange (page) {
      this.$store.commit('allAcceptItems/set_pager', {
        page: page,
        size: this.pager.size,
        total: this.pager.total
      })
      this.loading = true
      this.$store.dispatch('allAcceptItems/fetch_all_accept_items').then(() => {
        this.loading = false
      })
    }
  }
}
</script>
