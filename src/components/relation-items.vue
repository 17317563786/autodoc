<template>
  <div class="relation-revisions-wrapper" v-loading="loading">
    <el-collapse
      v-if="relations.length !== 0"
      v-model="activeCollapse"
      @change="showCommentDetail" accordion>
      <el-collapse-item
        v-for="(relation, index) in relations"
        :name="relation.doc_id + '_' + relation.id"
        :class="'relation_' + relation.doc_id + '_' + relation.id">
        <template slot="title">
          <span>{{index + 1}}：</span>
          <span >{{relation.comment.split('#@#')[0]}}</span>
          <span class="fl-r status-tag" v-if="$store.state.userInfo.type !== 'normal'">
            <el-tag v-if="relation.internal_status" type="danger">隐藏中</el-tag>
            <el-tag v-if="!relation.internal_status" type="success">显示中</el-tag>
          </span>
          <span class="fl-r status-tag">
            <el-tag v-if="relation.user_choice === 1" type="success">批注到文档中</el-tag>
            <el-tag
              v-if="relation.user_choice === 0
              || relation.user_choice === -1"
              type="primary">不批注到文档</el-tag>
          </span>
        </template>
        <div
          class="relation-collapse-item-wrapper"
          v-if="activeCollapse == (relation.doc_id + '_' + relation.id)"
          v-loading="relation.f_html_paragraph === ''">
          <div class="operating-bar">
            <div class="fl-r">
              <el-button
                v-if="$store.state.userInfo.type !== 'normal' && storeName === 'fileDetail' "
                type="warning" size="small" icon="information"
                @click="hideRevisionItemForUser(relation.id, relation.internal_status, index)">
                对用户{{relation.internal_status ? '显示' : '隐藏'}}
              </el-button>
              <el-button
                v-if="$store.state.userInfo.type === 'normal'
                && (relation.user_choice === 0 || relation.user_choice === -1)"
                type="success" icon="edit" size="small"
                @click="handleUserChoiceChange(relation.id, relation.user_choice, index)">
                批注到word文档中
              </el-button>
              <el-button
                v-if="$store.state.userInfo.type === 'normal'
                && relation.user_choice === 1"
                type="danger" size="small"
                @click="handleUserChoiceChange(relation.id, relation.user_choice, index)">
                <i class="fa fa-undo" aria-hidden="true"></i> 撤销批注
              </el-button>
            </div>
            <div v-if="$store.state.userInfo.type !== 'normal'" class="fl-r mr10">
              <el-button
                type="text"
                size="small"
                @click.native="copyUrl(relation)">复制链接地址</el-button>
            </div>
            <div class="fl-r mr10">
              <el-button
                type="text"
                size="small"
                @click.native="checkSpace(relation.para_index, relation.f_html_paragraph)">查看段落上下文</el-button>
            </div>
            <div v-if="$store.state.userInfo.type !== 'normal'" class="fl-r mr10">
              <el-button
                type="text"
                size="small"
                @click.native="checkRelationResult('/sentence/tool?docId=' + relation.doc_id + '&sid=' + relation.sid)">查看计算关系结果</el-button>
            </div>
          </div>
          <sentence-line-through
            v-if="relation.type == 'wrong'"
            :paragraph="relation.f_html_paragraph"
            :index-in-para="relation.index_in_para"
            :mark-word="selectedFormulaItemTpav"
            :line-through-value="wrongValue">
          </sentence-line-through>
          <div
            v-else
            class="paragraph"
            v-html="taggingWordsForHTML(relation.f_html_paragraph, selectedFormulaItemTpav, relation.index_in_para)">
          </div>
          <div class="relation-wrapper" v-if="relation.relations">
            <formula
              v-if="relation.type == 'no_match'"
              :data="relation.relations"
              :current="findRelationItem(relation.relations, relation.relations[0].index)"
              :storeName="storeName">
            </formula>
            <div v-else class="formula-wrapper">
              <formula
                :data="relation.relations"
                :current="findRelationItem(relation.relations, relation.relations[0].left)"
                :storeName="storeName">
              </formula>
              <span class="formula-operator">{{relation.relations[0].operator}}</span>
              <div class="formula-wrapper">
                <div class="formula-end-item">
                  <span class="value no">
                    <p class="fs-12">计算结果为</p>
                    <p class="fs-18">
                      {{
                        findRelationItem(relation.relations, relation.relations[0].left).value[allCombination.indexOf(currentTableIndexArr.join(''))]
                      }}
                      {{
                        findRelationItem(relation.relations, relation.relations[0].left).value_unit[allCombination.indexOf(currentTableIndexArr.join(''))]
                      }}
                    </p>
                  </span>
                </div>
              </div>
              <span v-if="relation.type == 'wrong'" class="formula-operator">≠</span>
              <span v-if="relation.type == 'correct'" class="formula-operator">=</span>
              <formula
                :data="relation.relations"
                :current="findRelationItem(relation.relations, relation.relations[0].right)"
                :storeName="storeName">
              </formula>
            </div>
          </div>
          <div class="formula-table-wrapper"
            v-if="activeCollapse == relation.doc_id + '_' + relation.id && !isEmpty(selectedFormulaItem) &&
            !isEmpty(selectedFormulaItem.table_triples)">
            <div
              class="table-wrapper"
              :class="'table_index_' + selectedFormulaItem.table_triples[selectedFormulaTableIndex].table_index"
              v-html="taggingWordsForHTMLTable(selectedFormulaItem.table_triples[selectedFormulaTableIndex].f_html_table, selectedFormulaItem.table_triples[selectedFormulaTableIndex].row, selectedFormulaItem.table_triples[selectedFormulaTableIndex].column)">
            </div>
          </div>
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
import formula from 'src/components/formula'
import sentenceLineThrough from 'src/components/relation-sentence-line-through'
import { isEmpty, taggingWordsForHTML, taggingWordsForHTMLTable } from 'src/util/tools'

import { fetchSpace } from 'src/store/api'

export default {
  name: 'relation-items',
  components: {
    formula,
    sentenceLineThrough
  },
  props: {
    relations: {
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
  created () {
    if (this.$route.query.navmenu === 'relation' && this.initialCollapse) {
      this.activeCollapse = this.initialCollapse
      this.showCommentDetail(this.initialCollapse)
    }
  },
  computed: {
    owner () {
      return this.$route.query.owner || this.$store.state[this.storeName].owner
    },
    docId () {
      return this.relations[0].doc_id
    },
    initialCollapse () {
      return this.$route.query.collapse || ''
    },
    selectedFormulaTableIndex () {
      return this.$store.state.fileDetail.formulaCurrentItem.current_table
    },
    selectedFormulaItem () {
      return this.$store.state.fileDetail.formulaCurrentItem
    },
    wrongValue () {
      let relationId = this.activeCollapse.split('_')[1]
      if (!relationId) {
        return {}
      }
      relationId = Number(relationId)
      let targetItem = {}
      this.relations.some(item => {
        if (item.id === relationId) {
          targetItem = item
          return true
        } else {
          return false
        }
      })
      if (isEmpty(targetItem)) {
        return {}
      }
      let current = this.findRelationItem(targetItem.relations, targetItem.relations[0].right)
      if (isEmpty(current)) {
        return {}
      } else {
        if (!isEmpty(current.text_quadruple)) {
          return current.text_quadruple
        }
        if (!isEmpty(current.text_word)) {
          return current.text_word
        }
      }
    },
    selectedFormulaItemTpav () {
      let current = this.$store.state.fileDetail.formulaCurrentItem
      if (isEmpty(current)) {
        return {}
      } else {
        if (!isEmpty(current.text_quadruple)) {
          return current.text_quadruple
        }
        if (!isEmpty(current.text_word)) {
          return current.text_word
        }
      }
    },
    currentTableIndexArr () {
      // 当前选择的表格，序号列表
      if (!this.activeCollapse) {
        return []
      }
      let currentRevisionId = Number(this.activeCollapse.split('_')[1])
      let indexArr = []
      this.relations.forEach(item => {
        if (currentRevisionId === item.id) {
          item.relations.forEach(relation => {
            if (typeof relation.current_table === 'number') {
              indexArr.push(relation.current_table)
            }
          })
        }
      })
      return indexArr
    },
    allCombination () {
      // 保存所有表格序号列表 的情况
      // 通过这个 序号列表的indexOf(当前选择表格的序号)，就可以确定计算结果是value[]中的第几个
      if (!this.activeCollapse) {
        return []
      }
      let currentRevisionId = Number(this.activeCollapse.split('_')[1])
      let total = 1
      let totalArr = []
      let temp = []
      this.relations.forEach(item => {
        if (currentRevisionId === item.id) {
          item.relations.forEach(relation => {
            if (relation.table_triples && relation.table_triples.length > 0) {
              totalArr.push(relation.table_triples.length)
            }
          })
        }
      })

      totalArr.forEach(item => {
        total = total * item
      })
      for (let i = 0; i < total; i++) {
        temp.push(findNode(i))
      }
      function findNode (index) {
        // 根据ID寻找对应元素
        // 例如公式中有两个带下箭头的块，他们俩的备选表格数量分别是[3,2]
        // 目的是拿到[00,01,10,11,20,21]当传入index 0:'00', 1:'01', 2:'10', 3: '11' ... 5:'21'
        let bit = []
        let ArrCopy = JSON.parse(JSON.stringify(totalArr))
        ArrCopy.reverse().forEach((item, idx) => {
          if (idx === 0) {
            bit.unshift(index % item)
            index = Math.floor(index / item)
          } else if ((idx + 1) === totalArr.length) {
            bit.unshift(index)
          } else {
            bit.unshift(index % item)
            index = Math.floor(index / item)
          }
        })
        return bit
      }
      return temp.map(item => item.join(''))
    }
  },
  methods: {
    isEmpty,
    taggingWordsForHTML,
    taggingWordsForHTMLTable,
    scrollTableToView () {
      let docIdAndId = this.activeCollapse
      this.$nextTick(() => {
        let tables = document.querySelectorAll('.relation_' + docIdAndId + ' .table-wrapper')
        let tablesArr = Array.prototype.slice.call(tables)
        let tableBody = null
        let tableHead = null
        // 此处滚动到表格标红位置代码，错误无用，静默吃掉
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
    showCommentDetail (ids) {
      if (!ids) {
        return
      }
      let [docId, relationId] = ids.split('_')
      docId = Number(docId)
      relationId = Number(relationId)
      // 找到value，并设置为当前选中
      let targetItem = {}
      this.relations.some(item => {
        if (item.id === relationId) {
          targetItem = item
          return true
        } else {
          return false
        }
      })
      if (isEmpty(targetItem)) {
        return
      }
      this.$store.commit(this.storeName + '/set_formula_current_item', this.findRelationItem(targetItem.relations, targetItem.relations[0].right))

      setTimeout(_ => {
        this.$store.dispatch(this.storeName + '/fetch_relation_html_segment', {
          docId: docId,
          revisionItemId: relationId
        })
      }, 500)
    },
    findRelationItem (data, index) {
      return data.filter(item => {
        return item.index === index
      })[0]
    },
    changeCollapse (index) {
      if (this.relations.length > index) {
        let name = this.relations[index].doc_id + '_' + this.relations[index].id
        this.activeCollapse = name
        this.showCommentDetail(name)
      }
    },
    hideRevisionItemForUser (revisionItemId, result, index) {
      // result: 0 show 1 hide
      if (result) {
        result = 0
      } else {
        result = 1
      }
      this.$store.dispatch(this.storeName + '/push_item_proofread_result', {
        type: 'relation',
        revisionItemId,
        result
      }).then(_ => {
        this.changeCollapse(index + 1)
      })
    },
    handleUserChoiceChange (revisionItemId, userChoice, index) {
      let params = {
        type: 'relation',
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
    copyUrl (relation) {
      let query = {
        navmenu: 'relation',
        tab: relation.type,
        collapse: this.docId + '_' + relation.id,
        owner: encodeURIComponent(this.owner)
      }
      let queryStr = ''
      Object.keys(query).forEach(key => {
        queryStr += `&${key}=${query[key]}`
      })
      queryStr = '?' + queryStr.substring(1, queryStr.length)

      clipboard.copy(window.location.href.split('#')[0] + '#/file/detail/' + this.docId + queryStr)
        .then(_ => {
          this.$message.success('复制成功')
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
    },
    checkRelationResult (url) {
      window.open(window.location.href.split('#')[0] + '#' + url)
    }
  },
  watch: {
    selectedFormulaItem () {
      this.scrollTableToView()
    },
    selectedFormulaTableIndex () {
      this.scrollTableToView()
    },
    activeCollapse () {
      // 同步当前打开的折叠面板名称
      this.$store.commit(this.storeName + '/set_active_collapse', this.activeCollapse)
    }
  }
}
</script>
<style lang="less">
@import "../assets/less/variables.less";
.relation-revisions-wrapper{
  .el-collapse-item__content{
    min-height: 170px;
  }
  .relation-collapse-item-wrapper{
    min-height: 150px;
  }
}
.relation-collapse-item-wrapper{
  .operating-bar{
    overflow: hidden;
    margin-bottom: 10px;
  }
  .paragraph{
    font-size: 15px;
  }
  .relation-wrapper{
    padding: 10px 0;
    text-align: center;
  }
  .warning-text{
    font-size: 14px;
    color: #FF4949;
    text-align: center;
    margin-bottom: 10px;
    font-style: italic;
  }
}
.formula-table-wrapper{
  overflow: hidden;
  position: relative;
  font-size: 13px;
  border-radius: 5px;
  border: 1px solid #333;
  margin-top: -1px;
  padding: 0 10px;
  .table-wrapper{
    margin: 10px 0;
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
    padding: 2px 0;
    word-wrap:break-word;
  }
}
</style>
