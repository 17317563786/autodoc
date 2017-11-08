<template>
  <div class="sentence-items-wrapper mt20" v-loading="loading">
    <div v-if="!isEmpty(sentence)" class="sentence-content">
      <div class="clearfloat mb10">
        <div v-if="sentence.reject_tags.length" class="fl-l">
          <span class="mr10">Tags:</span>
          <el-tag v-for="tag in sentence.reject_tags" type="danger" class="mr10">{{tag.name}}</el-tag>
        </div>
        <div class="fl-r mr10">
          <el-button  class="ml10" type="text" size="small" @click="checkSpace(sentence.doc_id, sentence.paragraph_index)">查看段落上下文</el-button>
          <el-button
            type="success" size="small" icon="circle-check"
            @click="handleReviewItem(sentence.id, 'approve')">
            接受
          </el-button>
          <el-button
            type="danger" size="small" icon="circle-cross"
            @click="showRejectDialog(sentence.id, sentence.reject_tags)">
            拒绝
          </el-button>
        </div>
      </div>
      <div class="mb10">
        <span>句子ID: {{sentence.id}}</span>
        <span class="ml10">最近一年: {{sentence.last_year}}</span>
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
        <sentence class="sentence" :sentence="sentence.text" :quadruples="curQuadruples"></sentence>
      </div>
      <div v-if="sentence.quadruples && sentence.quadruples.length > 0" class="paragraph-item">
        <div class="label-table">
          <div class="thead">
            <div class="thead-item time">时间</div>
            <div class="thead-item restrict">定语</div>
            <div class="thead-item attribute">属性</div>
            <div class="thead-item value">值</div>
          </div>
          <div class="tbody">
            <div v-for="(item, key) in sentence.quadruples" class="row" @mouseover="rowHover(item)" @mouseout="rowHover({})">
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
        <el-button type="primary" @click.native="handleReviewItem(dialog.data.id, 'reject')">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="段落上下文" v-model="spaceDialog.visible">
      <div class="space-dialog-content" v-loading="spaceDialog.loading">
        <div v-html="spaceDialog.data.above"></div>
        <div class="line"></div>
        <div v-html="spaceDialog.data.current"></div>
        <div  class="line"></div>
        <div v-html="spaceDialog.data.below"></div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="spaceDialog.visible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import sentence from './sentence-show/sentence.vue'
import { isEmpty } from 'util/tools'
import { fetchSpace, pushSentenceStatus } from 'src/store/api'

export default {
  name: 'sentence-items',
  components: { sentence },
  props: {
    sentence: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      curQuadruples: {},
      dialog: {
        visible: false,
        data: {
          id: null,
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
  computed: {
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
    isEmpty,
    rowHover (item) {
      this.curQuadruples = item
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
    },
    handleReviewItem (senId, action) {
      let promise = null
      if (action === 'reject') {
        promise = pushSentenceStatus(senId, action, this.dialog.data.selectedTags.map(tag => tag.name).join(','))
      } else {
        promise = pushSentenceStatus(senId, action)
      }
      promise.then(_ => {
        this.dialog.visible = false
        if (action === 'reject') {
          this.$emit('reject-tags', this.dialog.data.selectedTags)
        }
      })
    },
    handleDeleteTag (tag) {
      this.dialog.data.selectedTags.splice(this.dialog.data.selectedTags.indexOf(tag), 1)
    },
    handleAddTag (tag) {
      this.dialog.data.selectedTags.push({ name: tag.name })
    },
    showRejectDialog (id, tags, type = 'reject') {
      this.$store.dispatch('allSentences/fetch_all_tags')
      this.dialog.data.type = type
      this.dialog.visible = true
      this.dialog.data.id = id
      this.dialog.data.selectedTags = JSON.parse(JSON.stringify(tags))
    }
  }
}
</script>
<style lang="less">
@import "../assets/less/variables.less";
</style>