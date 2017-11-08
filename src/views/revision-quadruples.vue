<template>
  <div class="container">
    <div class="file-detail-header layout-header">
      <el-button type="primary" size="small" @click="closeWindow" icon="circle-cross">关闭本页</el-button>
    </div>
    <div class="layout-content" v-loading="loading">
      <div class="sentence">
        <sentence :sentence="sentence" :quadruples="showQuadruples"></sentence>
      </div>
      <div class="quadruples-wrapper p10">
        <div class="label-table">
          <div class="thead">
            <div class="thead-item time">时间</div>
            <div class="thead-item restrict">定语</div>
            <div class="thead-item attribute">属性</div>
            <div class="thead-item value">值</div>
          </div>
          <div class="tbody">
            <div v-if="quadruples.length > 0" v-for="(comment, index) in quadruples" class="row" @mouseover="rowHover(comment)" @mouseout="rowHover({})">
              <div class="item">
                {{comment.time.value}}
              </div>
              <div class="item">
                <span v-for="restItem in comment.preattributes">
                  [{{restItem.value}}]
                </span>
                <span v-if="comment.preattributes.length === 0">-</span>
              </div>
              <div class="item">
                {{comment.attribute.value}}
              </div>
              <div class="item">
                {{comment.value.value}}
              </div>
            </div>
            <div v-else class="no-data">
              无四元组
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import sentence from 'components/sentence-show/sentence'
import { fetchSentenceQuadruples } from 'src/store/api.js'

export default {
  name: 'sentence-quadruples',
  components: {
    sentence
  },
  computed: {
    docId () {
      return this.$route.params.docId
    },
    sid () {
      return this.$route.params.sid
    }
  },
  data () {
    return {
      loading: true,
      showQuadruples: {},
      sentence: '',
      quadruples: {}
    }
  },
  beforeMount () {
    this.loading = true
    fetchSentenceQuadruples(this.docId, this.sid).then((resp) => {
      this.sentence = resp.data.text
      this.quadruples = resp.data.quadruples
      this.loading = false
    }).catch(() => {
      this.loading = false
    })
  },
  methods: {
    closeWindow () {
      window.close()
    },
    rowHover (item) {
      this.showQuadruples = item
    }
  }
}
</script>
<style lang="less">
@import "../assets/less/variables.less";
.sentence{
  font-size: 16px;
  margin: 20px 10px 0;
}
</style>