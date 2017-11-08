<template>
  <div class="container">
    <div class="file-detail-header layout-header">
      <el-button type="primary" size="small" @click="routerGoBack" icon="arrow-left">返回</el-button>
    </div>
    <div class="file-detail-content layout-content" v-loading="loading">
      <el-input
        placeholder="请输入句子ID"
        icon="search"
        v-model="sentenceId"
        @keyup.enter.native="handleSearch"
        :on-icon-click="handleSearch">
      </el-input>

      <sentence-search-item
        :sentence="sentenceData"
        @reject-tags="handleTags"
        storeName="sentenceFactory"></sentence-search-item>
    </div>
  </div>
</template>
<script>
import sentenceSearchItem from 'components/sentence-search-item.vue'
import { fetchSentenceById, fetchSentenceQuadruple } from 'src/store/api'
export default {
  name: 'sentence-search',
  components: {
    sentenceSearchItem
  },
  data () {
    return {
      loading: false,
      sentenceId: null,
      sentenceData: {}
    }
  },
  methods: {
    routerGoBack () {
      this.$router.push('/upload/file/list/all')
    },
    handleTags (tags) {
      this.sentenceData.reject_tags = tags
    },
    async handleSearch () {
      if (!this.sentenceId) {
        return
      }
      this.loading = true
      try {
        var resp = await fetchSentenceById(this.sentenceId)
        var quadruples = await fetchSentenceQuadruple(resp.data.id)
      } catch (err) {
        console.error(err)
      }
      this.loading = false
      if (resp) {
        resp.data.quadruples = quadruples.data.items
        resp.data.reject_tags = resp.data.reject_tags || []
        this.sentenceData = resp.data
      }
    }
  }
}
</script>
<style lang="less">
.sentence-search-wrapper{

}
</style>