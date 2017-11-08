<template>
  <div class="container">
    <div class="file-detail-header layout-header">
      <el-button type="primary" size="small" @click="routerGoBack" icon="arrow-left">返回</el-button>
    </div>
    <div class="file-detail-content layout-content ps-container" :class="pager.total > 400 ? '' : 'no-footer'" v-loading="loading">
      <h3 class="mb10">已拒绝的修订-{{title}}</h3>
      <div class="tags-groups clearfloat">
        <div class="tags-group-wrapper">
          <span class="w135">知识库错误 (共{{knowledgeLibWrongTags | totalNum(knowledgeLibWrongTags)}}个):</span>
          <el-tag
            v-for="item in knowledgeLibWrongTags"
            class="ml10 mb10 pointer"
            :type="item.cur ? 'gray' : ''"
            @click.native="handleClickTag(item)">
            {{item.name}} ({{item.count}})
          </el-tag>
        </div>
        <div class="tags-group-wrapper">
          <span class="w135">文本错误 (共{{textWrongTags | totalNum(textWrongTags)}}个):</span>
          <el-tag
            v-for="item in textWrongTags"
            class="ml10 mb10 pointer"
            :type="item.cur ? 'gray' : ''"
            @click.native="handleClickTag(item)">
            {{item.name}} ({{item.count}})
          </el-tag>
        </div>
        <div class="tags-group-wrapper">
          <span class="w135">表格错误 (共{{tableWrongTags | totalNum(tableWrongTags)}}个):</span>
          <el-tag
            v-for="item in tableWrongTags"
            class="ml10 mb10 pointer"
            :type="item.cur ? 'gray' : ''"
            @click.native="handleClickTag(item)">
            {{item.name}} ({{item.count}})
          </el-tag>
        </div>
        <div class="tags-group-wrapper">
          <span class="w135">比对错误 (共{{compareWrongTags | totalNum(compareWrongTags)}}个):</span>
          <el-tag
            v-for="item in compareWrongTags"
            class="ml10 mb10 pointer"
            :type="item.cur ? 'gray' : ''"
            @click.native="handleClickTag(item)">
            {{item.name}} ({{item.count}})
          </el-tag>
        </div>
        <div class="tags-group-wrapper">
          <span class="w135">其他 (共{{anotherWrongTags | totalNum(anotherWrongTags)}}个):</span>
          <el-tag
            v-for="item in anotherWrongTags"
            class="ml10 mb10 pointer"
            :type="item.cur ? 'gray' : ''"
            @click.native="handleClickTag(item)">
            {{item.name}} ({{item.count}})
          </el-tag>
        </div>
      </div>
      <div v-if="docRevisionInfo.length" class="tabs-wrapper">
        <el-tabs type="card" value="wrong">
          <el-tab-pane :label="'错误 (' + wrongCommentList.length + ')'" name="wrong">
            <comment-items :comments="wrongCommentList" storeName="allRejectItems" :readonly="false"></comment-items>
          </el-tab-pane>
          <el-tab-pane :label="'冲突 (' + duplicateCommentList.length + ')'" name="duplicate">
            <comment-items :comments="duplicateCommentList" storeName="allRejectItems" :readonly="false"></comment-items>
          </el-tab-pane>
          <el-tab-pane :label="'多匹配 (' + multiMatchCommentList.length + ')'" name="multi_match">
            <comment-items :comments="multiMatchCommentList" storeName="allRejectItems" :readonly="false"></comment-items>
          </el-tab-pane>
          <el-tab-pane :label="'不确定匹配 (' + possibleMatchCommentList.length + ')'" name="possible_match">
            <comment-items :comments="possibleMatchCommentList" storeName="allRejectItems":readonly="false" no-accept-btn></comment-items>
          </el-tab-pane>
          <el-tab-pane :label="'正确 (' + correctCommentList.length + ')'" name="correct">
            <comment-items :comments="correctCommentList" storeName="allRejectItems" :readonly="false"></comment-items>
          </el-tab-pane>
          <el-tab-pane :label="'匹配缺失 (' + noMatchCommentList.length + ')'" name="no_match">
            <comment-items :comments="noMatchCommentList" storeName="allRejectItems" :readonly="false"></comment-items>
          </el-tab-pane>
          <el-tab-pane :label="'其他值 (' + valueCommentList.length + ')'" name="value">
            <comment-items :comments="valueCommentList" storeName="allRejectItems" :readonly="false"></comment-items>
          </el-tab-pane>
          <el-tab-pane :label="'其他比例 (' + valueRateCommentList.length + ')'" name="value_rate">
            <comment-items :comments="valueRateCommentList" storeName="allRejectItems" :readonly="false"></comment-items>
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
  name: 'all-reject-items',
  components: {
    commentItems
  },
  data () {
    return {
      title: '全部',
      loading: true
    }
  },
  computed: {
    pager () {
      return this.$store.state.allRejectItems.pager
    },
    correctCommentList () {
      return this.$store.getters['allRejectItems/correct_item_list']
    },
    duplicateCommentList () {
      return this.$store.getters['allRejectItems/duplicate_item_list']
    },
    multiMatchCommentList () {
      return this.$store.getters['allRejectItems/multi_match_item_list']
    },
    wrongCommentList () {
      return this.$store.getters['allRejectItems/wrong_item_list']
    },
    noMatchCommentList () {
      return this.$store.getters['allRejectItems/no_match_item_list']
    },
    possibleMatchCommentList () {
      return this.$store.getters['allRejectItems/possible_match_item_list']
    },
    valueCommentList () {
      return this.$store.getters['allRejectItems/value_item_list']
    },
    valueRateCommentList () {
      return this.$store.getters['allRejectItems/value_rate_item_list']
    },
    docRevisionInfo () {
      return this.$store.state.allRejectItems.list
    },
    knowledgeLibWrongTags () {
      return this.$store.state.allRejectItems.tags.filter((item) => {
        if (item.category === 1) {
          return true
        }
        return false
      })
    },
    textWrongTags () {
      return this.$store.state.allRejectItems.tags.filter((item) => {
        if (item.category === 2) {
          return true
        }
        return false
      })
    },
    tableWrongTags () {
      return this.$store.state.allRejectItems.tags.filter((item) => {
        if (item.category === 3) {
          return true
        }
        return false
      })
    },
    compareWrongTags () {
      return this.$store.state.allRejectItems.tags.filter((item) => {
        if (item.category === 4) {
          return true
        }
        return false
      })
    },
    anotherWrongTags () {
      return this.$store.state.allRejectItems.tags.filter((item) => {
        if (item.category === 5) {
          return true
        }
        return false
      })
    }
  },
  beforeMount () {
    this.$store.dispatch('allRejectItems/fetch_all_tags')
    this.$store.dispatch('allRejectItems/fetch_all_reject_items').then(() => {
      this.loading = false
    })
  },
  methods: {
    routerGoBack () {
      this.$store.commit('allRejectItems/set_doc_revision_list', [])
      this.$router.push('/upload/file/list/all')
    },
    handleCurrentPageChange (page) {
      let tagName = null
      this.$store.state.allRejectItems.tags.forEach((item) => {
        if (item.cur) {
          tagName = item.name
        }
      })
      this.$store.commit('allRejectItems/set_pager', {
        page: page,
        size: this.pager.size,
        total: this.pager.total
      })
      this.loading = true
      if (tagName === null) {
        this.$store.dispatch('allRejectItems/fetch_all_reject_items').then(() => {
          this.loading = false
        })
      } else {
        this.$store.dispatch('allRejectItems/fetch_all_reject_items', tagName).then(() => {
          this.loading = false
        })
      }
    },
    handleClickTag (tag) {
      this.loading = true
      this.$store.commit('allRejectItems/set_pager', {
        page: 1,
        size: this.pager.size,
        total: this.pager.total
      })
      this.$store.commit('allRejectItems/set_tag_cur', tag.id)
      this.$store.dispatch('allRejectItems/fetch_all_reject_items', tag.name).then(() => {
        this.loading = false
      })
      this.title = tag.name
    }
  }
}
</script>
<style lang="less">
.tags-group-wrapper{
  float: left;
  width: 48%;
}
.w135{
  display: inline-block;
  width: 135px;
  text-align: right
}
.w80{
  display: inline-block;
  width: 80px;
  text-align: right
}
</style>
