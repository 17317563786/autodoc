<template>
  <div class="comment-items-wrapper" v-loading="loading">
    <el-collapse
      v-if="comments.length !== 0"
      v-model="activeCollapse"
      @change="showCommentDetail" accordion>
      <el-collapse-item
        v-for="(comment, index) in comments"
        :name="comment.doc_id + '_' + comment.id"
        :class="'comment_' + comment.doc_id + '_' + comment.id">
        <template slot="title">
          <span>{{index + 1}}：</span>
          <span v-if="storeName == 'revisionItems'">{{comment.type}}| </span>
          <span v-if="comment.txt_triples !== null">
            <span>{{comment.txt_triples.time.value}} , </span>
            <span v-for="item in comment.txt_triples.preattributes">{{item.value}} ,</span>
            <span>{{comment.txt_triples.attribute.value}} , </span>
            <span>{{comment.txt_triples.value.value}}</span>
          </span>
          <span v-if="comment.txt_value !== null">{{comment.txt_value.value}}</span>
          <span
            v-if="$store.state.userInfo.type !== 'normal'
            && storeName !== 'allShowComments'"
            class="fl-r status-tag">
            <el-tag v-if="comment.internal_status" type="danger">隐藏中</el-tag>
            <el-tag v-if="!comment.internal_status" type="success">显示中</el-tag>
          </span>
          <span class="fl-r status-tag">
            <el-tag v-if="comment.user_choice === 1" type="success">批注到文档中</el-tag>
            <el-tag
              v-if="comment.user_choice === 0
              || comment.user_choice === -1"
              type="primary">不批注到文档</el-tag>
          </span>
        </template>
        <div class="revision-content"
          v-loading="comment.f_html_paragraph == ''">
          <div class="clearfloat mb10">
            <div
              v-if="$store.state.userInfo.type !== 'normal'
              && comment.reject_tags.length !== 0" class="fl-l">
              <span class="mr10">Tags:</span>
              <el-tag v-for="tag in comment.reject_tags"
                type="danger"
                class="mr10">
                {{tag.name}}
              </el-tag>
            </div>
            <div v-if="!readonly" class="fl-r">
              <el-button
                v-if="$store.state.userInfo.type === 'normal'
                && (comment.user_choice === 0 || comment.user_choice === -1)"
                type="success" icon="edit"
                @click="handleUserChoiceChange(comment.id, comment.user_choice, index)">
                批注到word文档中
              </el-button>
              <el-button
                v-if="$store.state.userInfo.type === 'normal'
                && comment.user_choice === 1"
                type="danger"
                @click="handleUserChoiceChange(comment.id, comment.user_choice, index)">
                <i class="fa fa-undo" aria-hidden="true"></i> 撤销批注
              </el-button>
              <el-button
                v-if="$store.state.userInfo.type !== 'normal' && storeName === 'fileDetail' "
                type="warning" size="small" icon="information"
                @click="hideRevisionItemForUser(comment.id, comment.internal_status, index)">
                对用户{{comment.internal_status ? '显示' : '隐藏'}}
              </el-button>
            </div>
            <div v-if="$store.state.userInfo.type !== 'normal'" class="fl-r mr10">
              <el-button
                type="text"
                size="small"
                @click.native="copyUrl(comment, comment.doc_id)">复制链接地址</el-button>
            </div>
          </div>
          <div v-if="$store.state.userInfo.type !== 'normal'" class="comment">
            <span>{{comment.comment}}</span>
          </div>
          <div>
            <span>最近一年: {{comment.last_year}}</span>
            <span class="ml10">最近一期: {{comment.last_month | lastMonth}}</span>
            <span class="ml10">期数: {{comment.report_period}}</span>
          </div>
          <!-- 四元组 -->
          <div v-if="comment.txt_triples !== null" class="paragraph-item">
            <h3 class="txt-head" v-if="storeName !== 'fileDetail'">
              <span class="title">文档名:</span>
              <span>{{comment.doc_name}} [ doc_id: {{ comment.doc_id }} ]</span>
            </h3>
            <h3 class="txt-head clearfloat">
              <span class="title">段落:</span>
              <div class="quadruples">
                <span>{{comment.txt_triples.time.value}} , </span>
                <span v-for="item in comment.txt_triples.preattributes">
                  {{item.value}} ,
                </span>
                <span>{{comment.txt_triples.attribute.value}} , </span>
                <span>{{comment.txt_triples.value.value}}</span>
              </div>
              <el-button  class="fl-r ml10" type="text" @click="checkSpace(comment.para_index, comment.f_html_paragraph)">查看段落上下文</el-button>
              <el-button
                v-if="$store.state.userInfo.type !== 'normal'"
                type="text"
                class="fl-r"
                @click.native="checkQuadruples('/sentence/tool?docId=' + comment.doc_id + '&sid=' + comment.sid)">查看四元组</el-button>
            </h3>
            <p class="paragraph" v-html="comment.f_html_paragraph"></p>
          </div>
          <!-- 其他值 -->
          <div v-if="comment.txt_value !== null" class="paragraph-item">
            <h3 class="txt-head" v-if="storeName !== 'fileDetail'">
              <span class="title">文档名:</span>
              <span>{{comment.doc_name}} [ doc_id: {{ comment.doc_id }} ]</span>
            </h3>
            <h3 class="txt-head clearfloat">
              <span class="title">段落:</span>
              <el-button  class="fl-r ml10" type="text" @click="checkSpace(comment.para_index, comment.f_html_paragraph)">查看段落上下文</el-button>
              <el-button
                v-if="$store.state.userInfo.type !== 'normal'"
                type="text"
                class="fl-r"
                @click.native="checkQuadruples('/sentence/tool?docId=' + comment.doc_id + '&sid=' + comment.sid)">查看四元组</el-button>
            </h3>
            <p class="paragraph" v-html="comment.f_html_paragraph"></p>
          </div>
          <!-- 其他值的多个段落-->
          <div v-if="comment.matched_sentences.length !== 0"
            v-for="(matchedItem, index) in comment.matched_sentences"
            class="paragraph-item">
            <h3 class="txt-head clearfloat" v-if="comment.matched_txt_triples.length !== 0">
              <span class="title">匹配 {{index + 1}}:</span>
              <div class="quadruples">
                <span>{{comment.matched_txt_triples[index].time.value}} , </span>
                <span v-for="item in comment.matched_txt_triples[index].preattributes">
                  {{item.value}} ,
                </span>
                <span>{{comment.matched_txt_triples[index].attribute.value}} , </span>
                <span>{{comment.matched_txt_triples[index].value.value}}</span>
              </div>
              <el-button  class="fl-r ml10" type="text" @click="checkSpace(matchedItem.paragraph_index, matchedItem.f_matched_html_paragraph)">查看段落上下文</el-button>
              <el-button
                v-if="$store.state.userInfo.type !== 'normal'"
                type="text"
                class="fl-r"
                @click.native="checkQuadruples('/sentence/tool?docId=' + comment.doc_id + '&sid=' + matchedItem.sid)">查看四元组</el-button>
            </h3>
            <p class="paragraph" v-html="matchedItem.f_matched_html_paragraph"></p>
          </div>
          <!-- 冲突段落 -->
          <div v-if="comment.duplicate_sentences.length !== 0"
            v-for="(paraItem, index) in comment.duplicate_sentences"
            class="paragraph-item">
            <h3 class="txt-head clearfloat" v-if="comment.dup_txt_triples.length !== 0">
              <span class="title">冲突段落{{index + 1}}:</span>
              <div class="quadruples">
                <span>{{comment.dup_txt_triples[index].time.value}} , </span>
                <span v-for="item in comment.dup_txt_triples[index].preattributes">
                  {{item.value}} ,
                </span>
                <span>{{comment.dup_txt_triples[index].attribute.value}} , </span>
                <span>{{comment.dup_txt_triples[index].value.value}}</span>
              </div>
              <el-button  class="fl-r ml10" type="text" @click="checkSpace(paraItem.paragraph_index, paraItem.f_dup_html_paragraph)">查看段落上下文</el-button>
              <el-button
                v-if="$store.state.userInfo.type !== 'normal'"
                type="text"
                class="fl-r"
                @click.native="checkQuadruples('/sentence/tool?docId=' + comment.doc_id + '&sid=' + paraItem.sid)">查看四元组</el-button>
            </h3>
            <p class="paragraph" v-html="paraItem.f_dup_html_paragraph"></p>
          </div>
          <h3 v-if="comment.table_triples.length !== 0">相关表格:</h3>
          <el-tabs
            v-if="comment.table_triples.length !== 0"
            v-model="activeTableName"
            type="border-card"
            @tab-click="scrollTableToView(comment.doc_id + '_' + comment.id)">
            <el-tab-pane
              v-for="(tableItem, tableIndex) in comment.table_triples"
              :label="'表格 ' + (tableIndex + 1)"
              :name="'表格 ' + (tableIndex + 1)"
              class="revision-table-wrapper">
              <div class="c-hide" :class="'value-unit_' + tableIndex">{{tableItem.value_unit}}</div>
              <div
                class="table-wrapper"
                v-if="activeTableName == '表格 ' + (tableIndex + 1)"
                :class="'_' + comment.doc_id + '_' + comment.id"
                v-html="tableItem.f_html_table">
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-collapse-item>
    </el-collapse>
    <el-dialog title="段落上下文" v-model="spaceDialog.visible">
      <div class="space-dialog-content" v-loading="spaceDialog.loading">
        <div v-if="spaceDialog.data.above !== ''" >
          <div v-html="spaceDialog.data.above"></div>
          <div class="line"></div>
          <div v-html="spaceDialog.data.current"></div>
          <div  class="line"></div>
          <div v-html="spaceDialog.data.below"></div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="spaceDialog.visible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import clipboard from 'clipboard-js'
import { fetchSpace } from 'src/store/api'
// import strDiff from 'src/util/strDiff'

export default {
  name: 'comment-items',
  props: {
    comments: {
      type: Array,
      required: true
    },
    storeName: {
      type: String,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    proofread: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: false,
      activeCollapse: '',
      activeTableName: '表格 1',
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
    owner () {
      return this.$route.query.owner || this.$store.state[this.storeName].owner
    },
    docId () {
      if (this.comments.length !== 0) {
        return this.comments[0].doc_id
      }
      return 0
    },
    initialCollapse () {
      return this.$route.query.collapse || ''
    }
  },
  created () {
    if ((this.$route.query.navmenu === 'tuple' || this.$route.query.navmenu === 'other_value') && this.initialCollapse) {
      this.activeCollapse = this.initialCollapse
      this.showCommentDetail(this.initialCollapse)
    }
  },
  methods: {
    copyUrl (comment, docId) {
      let query = {
        navmenu: 'tuple',
        tab: comment.type,
        collapse: this.docId + '_' + comment.id,
        owner: encodeURIComponent(this.owner)
      }
      if (comment.type === 'value' || comment.type === 'value_rate') {
        query.navmenu = 'other_value'
      }
      let queryStr = ''
      Object.keys(query).forEach(key => {
        queryStr += `&${key}=${query[key]}`
      })
      queryStr = '?' + queryStr.substring(1, queryStr.length)

      clipboard.copy(window.location.href.split('#')[0] + '#/file/detail/' + docId + queryStr)
        .then(_ => {
          this.$message.success('复制成功')
        })
    },
    scrollTableToView (docIdAndId) {
      this.$nextTick(() => {
        let tables = document.querySelectorAll('._' + docIdAndId)
        let tablesArr = Array.prototype.slice.call(tables)
        let tableBody = null
        let tableHead = null
        // 此处滚动到表格标红位置代码，错误无用
        try {
          tablesArr.forEach((table) => {
            tableHead = table.querySelector('.table-head')
            tableBody = table.querySelector('.table-body')
            if (tableHead.style.marginRight === '' || tableHead.style.marginRight === '0px') {
              tableHead.style.marginRight = (tableHead.clientWidth - tableBody.clientWidth) + 'px'
            }
            if (tableBody === null) {
              tableBody = table
            }
            if (tableBody === null) {
              table.scrollTop = table.querySelector('.bg-red') && table.querySelector('.bg-red').offsetTop - 90
            } else {
              tableBody.scrollTop = table.querySelector('.bg-red') && table.querySelector('.bg-red').offsetTop - 90
            }
          })
        } catch (error) {

        }
      })
    },
    showCommentDetail (docIdAndId) {
      let idArr = docIdAndId.split('_')
      setTimeout(() => {
        this.$store.dispatch(this.storeName + '/fetch_item_html_segment', {
          docId: parseInt(idArr[0], 10),
          revisionItemId: parseInt(idArr[1], 10)
        }).then(() => {
          this.scrollTableToView(docIdAndId)
        }).then(() => {
          // let shouldRemoveUnit = false
          // let valuesDom = [...document.querySelectorAll(`.comment_${docIdAndId} .bg-red`)]
          // let unitDom = document.querySelector(`.comment_${docIdAndId} .value-unit_0`)
          // if (valuesDom.length < 2) {
          //   return
          // }
          // let values = valuesDom.map(item => {
          //   return item.innerText.replace(/\n/g, '')
          // })
          // if (unitDom && unitDom.innerText) {
          //   shouldRemoveUnit = true
          //   values[1] = values[1] + unitDom.innerText
          // }
          // let diffResult = strDiff(values[0], values[1])
          // diffResult.objA.arr = diffResult.objA.arr.map((item, index) => {
          //   if (!diffResult.objA.mark[index]) {
          //     return `<span class="f-yellow">${item}</span>`
          //   } else {
          //     return `<span class="f-gray">${item}</span>`
          //   }
          // })
          // diffResult.objB.arr = diffResult.objB.arr.map((item, index) => {
          //   if (!diffResult.objB.mark[index]) {
          //     return `<span class="f-yellow">${item}</span>`
          //   } else {
          //     return `<span class="f-gray">${item}</span>`
          //   }
          // })
          // if (shouldRemoveUnit) {
          //   diffResult.objB.arr.pop()
          // }
          // valuesDom[0].innerHTML = diffResult.objA.arr.join('')
          // valuesDom[1].innerHTML = diffResult.objB.arr.join('')
        })
      }, 500)
    },
    changeCollapse (index) {
      if (this.comments.length > index) {
        let name = this.comments[index].doc_id + '_' + this.comments[index].id
        this.activeCollapse = name
        this.showCommentDetail(name)
      }
    },
    checkQuadruples (url) {
      window.open(window.location.href.split('#')[0] + '#' + url)
    },
    hideRevisionItemForUser (revisionItemId, result, index) {
      if (result) {
        result = 0
      } else {
        result = 1
      }
      this.$store.dispatch('fileDetail/push_item_proofread_result', {
        type: 'tuple',
        revisionItemId,
        result
      }).then(_ => {
        this.changeCollapse(index + 1)
      })
    },
    handleUserChoiceChange (revisionItemId, userChoice, index) {
      let params = {
        type: 'tuple',
        revisionItemId
      }
      if (userChoice === 0 || userChoice === -1) {
        params.option = 1
      } else {
        params.option = 0
      }
      this.$store.dispatch('fileDetail/push_item_user_choice', params).then(_ => {
        this.changeCollapse(index + 1)
      })
    },
    checkSpace (entityIndex, current) {
      this.spaceDialog.visible = true
      this.spaceDialog.loading = true
      this.spaceDialog.data.current = ''
      this.spaceDialog.data.above = ''
      this.spaceDialog.data.below = ''

      fetchSpace(this.docId, entityIndex).then(resp => {
        this.spaceDialog.loading = false
        this.spaceDialog.data.current = current
        resp.data.above.forEach(item => {
          this.spaceDialog.data.above += `${item.html}<br>`
        })
        resp.data.below.forEach(item => {
          this.spaceDialog.data.below += `<br>${item.html}`
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
.revision-content{
  min-height: 300px;
  .comment{
    font-size: 14px;
    margin-bottom: 10px;
  }
  .paragraph-item{
    overflow: hidden;
    position: relative;
    margin-bottom: 10px;
    .paragraph{
      width: 100%;
      overflow: hidden;
    }
  }
}
.txt-head {
  height: 27px;
  margin-bottom: 2px;
  overflow: hidden;
  .quadruples{
    display: inline-block;
    font-style: italic;
    vertical-align: middle;
  }
  .title{
    display: inline-block;
    width: 80px;
    font-style: normal;
    vertical-align: middle;
  }
  .fl-r{
    font-weight: 400;
    font-weight: 13px;
  }
}
.revision-table-wrapper{
  overflow: hidden;
  position: relative;
  .table-wrapper{
    .table-title{
      &>p:nth-child(1){
        float: left;
      }
      &>p:nth-child(2){
        float: right;
      }
    }
    .table-head{
      background-color: @gray-lighter;
    }
    .table-body{
      max-height: 250px;
      position: relative;
      overflow: auto;
    }
  }
  table{
    table-layout: fixed;
    width: 100%;
    text-align: center;
    border-collapse: collapse;
  }
  th{
    border: 1px solid @silver-base;
  }
  td{
    border: 1px solid @silver-base;
    padding: 5px 0;
    word-wrap:break-word;
  }
}
.button-new-tag {
  height: 24px;
  line-height: 22px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 78px;
}
.tag-dialog-wrapper {
  min-width: 600px;
}
.space-dialog-content {
  min-width: 300px;
  min-height: 300px;
  line-height: 1.66;
  .line{
    border-bottom: 1px dashed @black-light;
    margin: 5px 0;
  }
}
</style>
