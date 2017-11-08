<template>
  <div class="container">
    <div class="file-detail-header layout-header">
      <el-button type="primary" size="small" @click="routerGoBack" icon="arrow-left">返回</el-button>
    </div>
    <div class="file-detail-content layout-content"
      v-loading="loading"
      :class="pager.total > 50 ? '' : 'no-footer'">
      <h3 class="mb10">所有待分流的句子</h3>
      <div class="tabs-wrapper">
        <el-tabs type="card" v-model="activeTabName" @tab-click="handleTabClick">
          <el-tab-pane :label="'预审隐藏'" name="proofread_hidden">
            <sentence-items
              v-if="sentenceList.proofreadHidden.length > 0"
              :sentences="sentenceList.proofreadHidden"
              tabsName="proofread_hidden"
              storeName="allSentences"></sentence-items>
            <div v-else class="no-data mt50">
              无数据
            </div>
          </el-tab-pane>
          <el-tab-pane :label="'预审未隐藏的冲突'" name="duplicate">
            <sentence-items
              v-if="sentenceList.displayedDuplicate.length > 0"
              :sentences="sentenceList.displayedDuplicate"
              tabsName="duplicate"
              storeName="allSentences"></sentence-items>
            <div v-else class="no-data mt50">
              无数据
            </div>
          </el-tab-pane>
          <el-tab-pane :label="'不匹配'" name="no_match">
            <sentence-items
              v-if="sentenceList.noMatch.length > 0"
              :sentences="sentenceList.noMatch"
              tabsName="no_match"
              storeName="allSentences"></sentence-items>
            <div v-else class="no-data mt50">
              无数据
            </div>
          </el-tab-pane>
          <el-tab-pane :label="'可能匹配'" name="possible_match">
            <sentence-items
              v-if="sentenceList.possibleMatch.length > 0"
              :sentences="sentenceList.possibleMatch"
              tabsName="possible_match"
              storeName="allSentences"></sentence-items>
            <div v-else class="no-data mt50">
              无数据
            </div>
          </el-tab-pane>
          <el-tab-pane :label="'不在四元组中的值'" name="other_value">
            <sentence-items
              v-if="sentenceList.otherValue.length > 0"
              :sentences="sentenceList.otherValue"
              tabsName="other_value"
              storeName="allSentences"></sentence-items>
            <div v-else class="no-data mt50">
              无数据
            </div>
          </el-tab-pane>
          <el-tab-pane :label="'不在四元组中的比例'" name="other_value_rate">
            <sentence-items
              v-if="sentenceList.otherValueRate.length > 0"
              :sentences="sentenceList.otherValueRate"
              tabsName="other_value_rate"
              storeName="allSentences"></sentence-items>
            <div v-else class="no-data mt50">
              无数据
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div v-if="pager.total > 50" class="file-detail-footer layout-footer">
      <el-pagination
        class="fl-r mr10 mt20"
        @current-change="handleCurrentPageChange"
        :page-size="pager.size"
        layout="total, prev, pager, next, jumper"
        :total="pager.total">
      </el-pagination>
    </div>
  </div>
</template>
<script>
import sentenceItems from 'components/sentence-items.vue'
export default {
  name: 'all-sentences',
  components: {
    sentenceItems
  },
  data () {
    return {
      title: '句子',
      loading: true,
      activeTabName: 'proofread_hidden'
    }
  },
  computed: {
    pager () {
      return this.$store.state.allSentences.pager
    },
    sentenceList () {
      let proofreadHidden = this.$store.state.allSentences.list.filter(item => {
        return ~item.types.indexOf('proofread_hidden')
      })
      let displayedDuplicate = this.$store.state.allSentences.list.filter(item => {
        return ~item.types.indexOf('duplicate')
      })
      let possibleMatch = this.$store.state.allSentences.list.filter(item => {
        return ~item.types.indexOf('possible_match')
      })
      let otherValue = this.$store.state.allSentences.list.filter(item => {
        return ~item.types.indexOf('other_value')
      })
      let otherValueRate = this.$store.state.allSentences.list.filter(item => {
        return ~item.types.indexOf('other_value_rate')
      })
      let noMatch = this.$store.state.allSentences.list.filter(item => {
        return ~item.types.indexOf('no_match')
      })

      return {
        proofreadHidden,
        otherValue,
        otherValueRate,
        possibleMatch,
        noMatch,
        displayedDuplicate
      }
    }
  },
  beforeMount () {
    this.loading = true
    this.$store.dispatch('allSentences/fetch_all_tags')
    this.$store.commit('allSentences/clear_tag_cur')
    this.$store.dispatch('allSentences/fetch_list', {type: this.activeTabName, status: 'unconfirmed'})
      .then(_ => {
        this.loading = false
      })
      .catch(error => {
        console.error(error)
        this.loading = false
      })
  },
  methods: {
    routerGoBack () {
      this.$store.commit('allSentences/set_sentences_list', [])
      this.$router.push('/upload/file/list/all')
    },
    handleCurrentPageChange (page) {
      this.$store.commit('allSentences/set_pager', {
        page: page,
        size: this.pager.size,
        total: this.pager.total
      })
      this.loading = true
      this.$store.dispatch('allSentences/fetch_list', {type: this.activeTabName, status: 'unconfirmed'})
        .then(_ => {
          this.loading = false
        })
        .catch(error => {
          console.error(error)
          this.loading = false
        })
    },
    handleTabClick (tab) {
      this.loading = true
      this.$store.dispatch('allSentences/fetch_list', {type: this.activeTabName, status: 'unconfirmed'})
        .then(_ => {
          this.loading = false
        })
        .catch(error => {
          console.error(error)
          this.loading = false
        })
    }
  }
}
</script>