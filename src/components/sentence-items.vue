<template>
  <div class="sentence-items-wrapper" v-loading="loading">
    <el-collapse ref="collapse"
      v-if="sentences.length !== 0"
      v-model="activeCollapse"
      @change="showCommentDetail" accordion>
      <el-collapse-item
        v-for="(sentence, index) in sentences"
        :key="sentence.id"
        :name="sentence.doc_id + '_' + sentence.id">
        <template slot="title">
            <span class="collapse-title">
              <!-- <span>{{index + 1 + '：'}}</span> -->
              <span>{{sentence.id}} :</span>
              <span>{{sentence.text}}</span>
            </span>
            <span class="fl-r status-tag">
              <el-tag v-if="sentence.status === 10" type="success">已接受</el-tag>
              <el-tag v-if="sentence.status === 20" type="danger">已拒绝</el-tag>
              <el-tag v-if="sentence.status === 0" type="primary">待处理</el-tag>
              <el-tag v-if="sentence.score !== null" type="primary">分数 {{sentence.score}}</el-tag>
            </span>
        </template>
        <div class="sentence-content"
          v-loading="sentence.f_html === '' ? true : false">
          <div class="clearfloat mb10">
            <div v-if="sentence.reject_tags.length" class="fl-l">
              <span class="mr10">Tags:</span>
              <el-tag v-for="tag in sentence.reject_tags" type="danger" class="mr10">{{tag.name}}</el-tag>
            </div>
            <div class="fl-r">
              <el-button
                type="success" size="small" icon="circle-check"
                @click="handleReviewItem(sentence.id, 'approve', index)">
                接受
              </el-button>
              <el-button
                type="danger" size="small" icon="circle-cross"
                @click="showRejectDialog(sentence.id, sentence.reject_tags, index)">
                拒绝
              </el-button>
              <el-button
                type="warning" size="small" icon="plus"
                @click="showRejectDialog(sentence.id, sentence.reject_tags, index)">
                编辑标签
              </el-button>
            </div>
            <div class="fl-r mr10">
              <el-button  class="ml10" type="text" size="small" @click="checkSpace(sentence.doc_id, sentence.paragraph_index)">查看段落上下文</el-button>
              <el-button
                type="text"
                size="small"
                @click.native="copyUrl(sentence.doc_id + '_' + sentence.id)">复制链接地址</el-button>
            </div>
          </div>
          <div>
            <span>句子ID: {{sentence.id}}</span>
            <span>最近一年: {{sentence.last_year}}</span>
            <span class="ml10">最近一期: {{sentence.last_month | lastMonth}}</span>
            <span class="ml10">期数: {{sentence.report_period ? sentence.report_period : '无'}}</span>
          </div>
          <div class="paragraph-item">
            <h3 class="txt-head">
              <span class="title">文档名:</span>
              <span>{{sentence.doc_name}} [ doc_id: {{ sentence.doc_id }} ]</span>
            </h3>
          </div>
          <div class="paragraph-item">
            <!-- :index-in-para="sentence.index_in_paragraph" -->
            <sentence class="sentence" :sentence="sentence.text" :quadruples="curQuadruples"></sentence>
          </div>
          <!-- <div class="paragraph-item mt10">
            原段落<p v-html="sentence.f_html"></p>
          </div> -->
          <div v-if="sentence.f_quadruples && sentence.f_quadruples.length > 0" class="paragraph-item">
            <div class="label-table">
              <div class="thead">
                <div class="thead-item time">时间</div>
                <div class="thead-item restrict">定语</div>
                <div class="thead-item attribute">属性</div>
                <div class="thead-item value">值</div>
              </div>
              <div class="tbody">
                <div v-for="(item, key) in sentence.f_quadruples" class="row" @mouseover="rowHover(item)" @mouseout="rowHover({})">
                  <div class="item">
                    {{item.time.value}}
                  </div>
                  <div class="item">
                    <span v-for="restItem in item.preattributes">
                      [{{restItem.value}}]
                    </span>
                    <span v-if="item.preattributes.length === 0">-</span>
                  </div>
                  <div class="item">
                    {{item.attribute.value}}
                  </div>
                  <div class="item">
                    {{item.value.value}}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
    <el-dialog title="拒绝原因" v-model="dialog.visible" size="tiny">
      <div class="body">
        <div class="wrapper lh36">
          <div v-for="tagRow in tags">
            <el-button v-for="tag in tagRow" type="" size="small" @click.native="handleAddTag(tag)">+ {{tag.name}}</el-button>
          </div>
        </div>
        <div class="wrapper mt10">
          <el-tag
            v-for="tag in dialog.data.selectedTags"
            :closable="true"
            :close-transition="true"
            type="danger"
            @close="handleDeleteTag(tag)"
            class="mt10 mr10">
            {{tag.name}}
          </el-tag>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click.native="handleReviewItem(dialog.data.id, 'reject', dialog.data.index)">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="段落上下文" v-model="spaceDialog.visible">
      <div class="space-dialog-content" v-loading="spaceDialog.loading">
        <div v-html="spaceDialog.data.above"></div>
        <div v-if="!spaceDialog.visible" class="line"></div>
        <div v-html="spaceDialog.data.current"></div>
        <div v-if="!spaceDialog.visible" class="line"></div>
        <div v-html="spaceDialog.data.below"></div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="spaceDialog.visible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import clipboard from 'clipboard-js'
import sentence from './sentence-show/sentence.vue'
import { fetchSpace } from 'src/store/api'

export default {
  name: 'sentence-items',
  components: { sentence },
  props: {
    sentences: {
      type: Array,
      required: true
    },
    storeName: {
      type: String,
      required: true
    },
    tabsName: {
      type: String
    },
    activeCollapseName: {
      type: String
    }
  },
  data () {
    return {
      loading: false,
      activeCollapse: '',
      curQuadruples: {},
      dialog: {
        visible: false,
        data: {
          id: null,
          index: null,
          selectedTags: [],
          type: 'reject'
        }
      },
      spaceDialog: {
        visible: false,
        loading: false,
        data: {
          current: '',
          above: '',
          below: ''
        }
      }
    }
  },
  beforeMount () {
    // this.loading = true
    if (this.$route.query.tab === this.tabsName) {
      // this.$route.query.collapseName
    }
  },
  computed: {
    owner () {
      return this.$route.query.owner || this.$store.state[this.storeName].owner
    },
    tags () {
      let tags = []
      tags.push(this.$store.state.allSentences.tags.filter((item) => {
        return item.category === 11
      }))
      tags.push(this.$store.state.allSentences.tags.filter((item) => {
        return item.category === 12
      }))
      tags.push(this.$store.state.allSentences.tags.filter((item) => {
        return item.category === 13
      }))
      tags.push(this.$store.state.allSentences.tags.filter((item) => {
        return item.category === 14
      }))
      return tags
    }
  },
  methods: {
    copyUrl (collapseName) {
      let query = {
        collapseName: collapseName,
        tab: this.tabsName
      }
      let queryStr = ''
      Object.keys(query).forEach(key => {
        queryStr += `&${key}=${query[key]}`
      })
      queryStr = '?' + queryStr.substring(1, queryStr.length)

      clipboard.copy(window.location.href.split('#')[0] + '#' + window.location.href.split('#')[1].split('?')[0] + queryStr)
        .then(_ => {
          this.$message.success('复制成功')
        })
    },
    showCommentDetail (docIdAndId) {
      if (docIdAndId === '') {
        return
      }
      let idArr = docIdAndId.split('_')
      setTimeout(() => {
        this.$store.dispatch(this.storeName + '/fetch_sentence_quadruple', parseInt(idArr[1], 10))
        this.$store.dispatch(this.storeName + '/fetch_sentence_f_html', {
          docId: parseInt(idArr[0], 10),
          sentenceId: parseInt(idArr[1], 10)
        })
      }, 500)
    },
    rowHover (item) {
      this.curQuadruples = item
    },
    handleReviewItem (id, action, index) {
      let params = {
        sentenceId: id,
        action,
        rejectTags: this.dialog.data.selectedTags
      }
      if (action === 'approve') {
        delete params.rejectTags
      }
      if (!params.rejectTags) {
        delete params.rejectTags
      }
      this.$store.dispatch(this.storeName + '/push_sentence_revision_status', params)
        .then((resp) => {
          this.changeCollapse(index + 1)
        })
      this.dialog.visible = false
    },
    showRejectDialog (id, tags, index, type = 'reject') {
      this.dialog.data.type = type
      this.$store.dispatch('allSentences/fetch_all_tags')
      this.dialog.visible = true
      this.dialog.data.id = id
      this.dialog.data.index = index
      this.dialog.data.selectedTags = JSON.parse(JSON.stringify(tags))
    },
    handleDeleteTag (tag) {
      this.dialog.data.selectedTags.splice(this.dialog.data.selectedTags.indexOf(tag), 1)
    },
    handleAddTag (tag) {
      let inputValue
      if (typeof tag.name === 'string') {
        inputValue = tag.name
      } else {
        inputValue = this.dialog.data.inputValue
      }
      if (this.dialog.data.selectedTags.filter(item => item.name === inputValue).length !== 0) {
        return
      }
      if (inputValue) {
        this.dialog.data.selectedTags.push({ name: inputValue })
      }
    },
    changeCollapse (index) {
      if (this.sentences.length > index) {
        let name = this.sentences[index].doc_id + '_' + this.sentences[index].id
        this.activeCollapse = name
        this.showCommentDetail(name)
      }
    },
    checkSpace (docId, entityIndex) {
      this.spaceDialog.visible = true
      this.spaceDialog.loading = true
      this.spaceDialog.data.current = ''
      this.spaceDialog.data.above = ''
      this.spaceDialog.data.below = ''

      fetchSpace(docId, entityIndex).then(resp => {
        this.spaceDialog.loading = false
        this.spaceDialog.data.current = resp.data.current.html + '<br>'
        resp.data.above.forEach(item => {
          this.spaceDialog.data.above += `${item.html}<br>`
        })
        resp.data.below.forEach(item => {
          this.spaceDialog.data.below += `${item.html}<br>`
        })
      }).catch(_ => {
        this.spaceDialog.loading = false
      })
    }
  }
}
</script>
<style lang="less">
@import "../assets/less/variables.less";
.comment-items-wrapper{
  .el-collapse-item__content{
    background-color: @white-dark;
  }
}
.paragraph-item{
  .sentence{
    margin-top: 10px;
    font-size: 14px;
  }
}
.sentence-content{
  min-height: 300px;
}
</style>