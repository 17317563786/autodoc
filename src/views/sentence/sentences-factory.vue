<template>
  <div class="container">
    <div class="file-detail-header layout-header">
      <el-button type="primary" size="small" @click="routerGoBack" icon="arrow-left">返回</el-button>
    </div>
    <div class="file-detail-content layout-content"
      v-loading="loading" ref="viewbox">
      <h3 class="mb10">单句分流</h3>
      <div class="tabs-wrapper">
        <el-tabs type="card" v-model="activeTabName" @tab-click="handleTabClick">
          <el-tab-pane :label="'预审隐藏'" name="proofread_hidden">
            <sentence-item
              :sentence="sentenceList.proofread_hidden"
              @finish="nextSentence('proofread_hidden')"
              storeName="sentenceFactory" :isfix="isfixed"></sentence-item>
          </el-tab-pane>
          <el-tab-pane :label="'预审未隐藏的冲突'" name="duplicate">
            <sentence-item
              :sentence="sentenceList.duplicate"
              @finish="nextSentence('duplicate')"
              storeName="sentenceFactory" :isfix="isfixed"></sentence-item>
          </el-tab-pane>
          <el-tab-pane :label="'不匹配'" name="no_match">
            <sentence-item
              :sentence="sentenceList.no_match"
              @finish="nextSentence('no_match')"
              storeName="sentenceFactory" :isfix="isfixed"></sentence-item>
          </el-tab-pane>
          <el-tab-pane :label="'其它值'" name="other_value">
            <sentence-item
              :sentence="sentenceList.other_value"
              @finish="nextSentence('other_value')"
              storeName="sentenceFactory" :isfix="isfixed"></sentence-item>
          </el-tab-pane>
          <el-tab-pane :label="'其它比例'" name="other_value_rate">
            <sentence-item
              :sentence="sentenceList.other_value_rate"
              @finish="nextSentence('other_value_rate')"
              storeName="sentenceFactory" :isfix="isfixed"></sentence-item>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import sentenceItem from 'components/sentence-item.vue'
import { isEmpty } from 'util/tools'
export default {
  name: 'sentence-factory',
  components: {
    sentenceItem
  },
  data () {
    return {
      loading: true,
      activeTabName: 'proofread_hidden',
      isfixed: false,
      scrollBox: ''
    }
  },
  computed: {
    sentenceList () {
      return this.$store.state.sentenceFactory.sentences
    }
  },
  beforeMount () {
    this.$route.query.tab && (this.activeTabName = this.$route.query.tab)
    this.loading = true
    this.$store.dispatch('sentenceFactory/fetch_sentence', {type: this.activeTabName, status: 'unconfirmed'})
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
      this.$router.push('/upload/file/list/all')
    },
    nextSentence (tabName) {
      this.loading = true
      this.$store.dispatch('sentenceFactory/fetch_sentence', {type: tabName, status: 'unconfirmed'})
      .then(_ => {
        this.loading = false
      })
      .catch(error => {
        console.error(error)
        this.loading = false
      })
    },
    handleTabClick (tab) {
      this.$router.replace('/sentence/factory?tab=' + tab.name)
      if (isEmpty(this.sentenceList[this.activeTabName])) {
        this.loading = true
        this.$store.dispatch('sentenceFactory/fetch_sentence', {type: this.activeTabName, status: 'unconfirmed'})
        .then(_ => {
          this.loading = false
        })
        .catch(error => {
          console.error(error)
          this.loading = false
        })
      }
    },
    fixTop() {
      if (this.scrollBox.scrollTop >= 200) {
        this.isfixed = true
      } else {
        this.isfixed = false
      }
    }
  },
  mounted() {
    this.scrollBox = this.$refs.viewbox
    this.scrollBox.addEventListener('scroll', this.fixTop)
  }
}
</script>
<style>
  .fixtop{
    position:fixed;
    top:49px;
    z-index: 100;
    width: 100%;
  }
</style>