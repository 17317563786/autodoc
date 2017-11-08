<template>
  <div class="sentence-items-wrapper" v-loading="loading">
    <div v-if="!isEmpty(sentence)" class="sentence-content"
      v-loading="loading">
      <!-- <el-tag v-if="sentence.status === 10" type="success">已接受</el-tag>
      <el-tag v-if="sentence.status === 20" type="danger">已拒绝</el-tag>
      <el-tag v-if="sentence.status === 0" type="primary">待处理</el-tag> -->
      <div class="clearfloat mb10">
        <div v-if="sentence.reject_tags.length" class="fl-l">
          <span class="mr10">Tags:</span>
          <el-tag v-for="tag in sentence.reject_tags" type="danger" class="mr10">{{tag.name}}</el-tag>
        </div>
        <div class="fl-r">
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
          <!-- <el-button
            type="warning" size="small" icon="plus"
            @click="showRejectDialog(sentence.id, sentence.reject_tags, 'edit')">
            编辑标签
          </el-button> -->
        </div>
        <div class="fl-r mr10">
          <el-button
            type="text" size="small"
            @click="showCommentDetail">
            重新获取详情
          </el-button>
          <el-button  class="ml10" type="text" size="small" @click="checkSpace(sentence.doc_id, sentence.paragraph_index)">查看段落上下文</el-button>
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
      <div class="sentence-item" :class="{fixtop:isfix}">
        <sentence class="sentence" :sentence="sentence.text" :quadruples="curQuadruples"></sentence>
      </div>
      <div v-if="isEmpty(backData)" class="no-data">未获取到句子详细数据</div>
      <div v-if="!isEmpty(backData)" class="result-wrapper">
        <div class="score-wrapper mt10">
          <div class="score-item faulty-wrapper">总分：<span class="blue">{{backData.properties.score}}</span></div>
          <div class="score-item faulty-wrapper">四元组分数：<span class="blue">{{backData.properties.quadruple_score}}</span></div>
          <div class="score-item faulty-wrapper">关系分数：<span class="blue">{{backData.properties.relation_score}}</span></div>
        </div>
        <div class="faulty-wrapper">
          <span v-if="backData.faulty_wordings && backData.faulty_wordings.length > 0">不完善信息： </span>
          <span v-for="(item, idx) in backData.faulty_wordings" @mouseover="faultyMessageHover(item)" @mouseout="faultyMessageHover({})"> {{idx != 0 ? '|' : ''}} {{item.tips}}</span>
        </div>
        <div class="words-wrapper">
          <span v-for="word in backData.words" class="word">{{word}}</span>
        </div>
        <div class="item-table-wrapper">
          <div class="tr">
            <div class="title">
              时间
            </div>
            <div class="td">
              <span v-for="time in backData.times" class="ml10" @mouseover="rowHover({time: time})" @mouseout="rowHover({})">{{time.value}}</span>
            </div>
          </div>
          <div class="tr">
            <div class="title">定语</div>
            <div class="td">
              <span v-for="preattribute in backData.preattributes" class="ml10" @mouseover="rowHover({preattributes: [preattribute]})" @mouseout="rowHover({})">{{preattribute.value}}</span>
            </div>
          </div>
          <div class="tr">
            <div class="title">属性</div>
            <div class="td">
              <span v-for="attribute in backData.attributes" class="ml10" @mouseover="rowHover({attribute: attribute})" @mouseout="rowHover({})">{{attribute.value}}</span>
            </div>
          </div>
          <div class="tr">
            <div class="title">值</div>
            <div class="td">
              <span v-for="value in backData.values" class="ml10" @mouseover="rowHover({value: value})" @mouseout="rowHover({})">{{value.value}}</span>
            </div>
          </div>
        </div>
        <div class="quadruples-wrapper">
          <div class="label-table">
            <div class="thead">
              <div class="thead-item time">时间</div>
              <div class="thead-item restrict">定语</div>
              <div class="thead-item attribute">属性</div>
              <div class="thead-item value">值</div>
            </div>
            <div class="tbody">
              <div v-if="backData.quadruples.length > 0" v-for="(item, key) in backData.quadruples" class="row" @mouseover="rowHover(item, 'no')" @mouseout="rowHover({})">
                <div class="item">
                  {{backData.times[item.time].value}}
                </div>
                <div class="item">
                  <span v-for="restItem in item.preattributes">
                    [{{backData.preattributes[restItem].value}}]
                  </span>
                  <span v-if="item.preattributes.length === 0">-</span>
                </div>
                <div class="item">
                  {{backData.attributes[item.attribute].value}}
                </div>
                <div class="item">
                  {{backData.values[item.value].value}}
                </div>
                <div class="probability">
                  {{item.probability | toFixed}}
                </div>
              </div>
              <div v-if="backData.quadruples.length === 0" class="no-data">
                无四元组
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!isEmpty(backData)" class="reliaton-wrapper">
        <h3>提取出的公式</h3>
        <relation-formula @hover-item="rowHover" :relations="backData.relations_over_tuple" :quadruples="quadruples"></relation-formula>
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
        <div v-if="!spaceDialog.loading" class="line"></div>
        <div v-html="spaceDialog.data.current"></div>
        <div v-if="!spaceDialog.loading" class="line"></div>
        <div v-html="spaceDialog.data.below"></div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="spaceDialog.visible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import sentence from 'components/sentence-show/sentence'
import relationFormula from 'components/sentence-show/relation-formula'
import { isEmpty } from 'util/tools'
import { fetchSpace } from 'src/store/api'

export default {
  name: 'sentence-item',
  components: { sentence, relationFormula },
  props: {
    sentence: {
      type: Object,
      required: true
    },
    storeName: {
      type: String,
      required: true
    },
    isfix: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: false,
      curQuadruples: {},
      hoverQuadruples: {},
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
    },
    backData() {
      let state = this.$store.state.sentenceFactory
      let typeName = ''
      Object.keys(state.sentences).forEach(name => {
        if (state.sentences[name].id === this.sentence.id) {
          typeName = name
        }
      })
      return state.sentences[typeName].data
    },
    quadruples () {
      if (isEmpty(this.backData)) {
        return {}
      }
      return {
        attributes: this.backData.attributes,
        preattributes: this.backData.preattributes,
        times: this.backData.times,
        values: this.backData.values
      }
    }
  },
  methods: {
    isEmpty,
    showCommentDetail () {
      if (!isEmpty(this.sentence)) {
        this.loading = true
        let params = {
          sentenceId: this.sentence.id,
          sentence: this.sentence.text,
          recentYear: this.sentence.last_year,
          recentMonth: this.sentence.last_month
        }
        if (this.sentence.report_period) {
          params.reportPeriod = this.sentence.report_period
        }
        this.$store.dispatch(this.storeName + '/fetch_quadruples', params).then(_ => {
          this.loading = false
        }).catch(_ => {
          this.loading = false
        })
      }
    },
    rowHover (item, type) {
      if (isEmpty(item)) {
        this.curQuadruples = {}
      } else {
        if (type === 'no') {
          let preattributes = item.preattributes.map(preAttr => {
            return this.backData.preattributes[preAttr]
          })
          this.curQuadruples = {
            attribute: this.backData.attributes[item.attribute],
            time: this.backData.times[item.time],
            value: this.backData.values[item.value],
            preattributes
          }
        } else {
          this.curQuadruples = item
        }
      }
    },
    handleReviewItem (id, action) {
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
        .then(_ => {
          if (this.dialog.data.type !== 'edit') {
            this.$emit('finish')
          }
        })
      this.dialog.visible = false
    },
    showRejectDialog (id, tags, type = 'reject') {
      this.$store.dispatch('allSentences/fetch_all_tags')
      this.dialog.data.type = type
      this.dialog.visible = true
      this.dialog.data.id = id
      this.dialog.data.selectedTags = JSON.parse(JSON.stringify(tags))
    },
    handleDeleteTag (tag) {
      this.dialog.data.selectedTags.splice(this.dialog.data.selectedTags.indexOf(tag), 1)
    },
    handleAddTag (tag) {
      this.dialog.data.selectedTags.push({ name: tag.name })
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
    faultyMessageHover (item) {
      if (isEmpty(item)) {
        this.curQuadruples = {}
      } else {
        this.curQuadruples = {
          value: {
            position: item.position[0],
            value: this.backData.text.substring(item.position[0], item.position[1])
          }
        }
      }
    }
    /* faultyMessageHover (item) {
      if (isEmpty(item)) {
        this.curQuadruples = {}
      } else {
        this.curQuadruples = {
          value: {
            position: item.position[0],
            value: this.backData.text.substring(item.position[0], item.position[1])
          }
        }
      }
    } */
  },
  watch: {
    sentence () {
      this.showCommentDetail()
      this.dialog.data = {
        id: null,
        selectedTags: [],
        type: 'reject'
      }
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
.sentence-item{
  color: #1f2d3d;
  margin-bottom: 10px;
  font-size: 20px;
  box-sizing: border-box;
  background-color: #eff2f7;
  border-radius: 5px;
  border-bottom: 1px solid #c8d5ea;
  line-height: 1.8;
}
.paragraph-item{
  .sentence{
    font-size: 16px;
  }
}
.sentence-content{
  min-height: 300px;
}
</style>
