<template>
  <div class="container">
    <div class="file-detail-body" @click="handleDocumentClick">
      <el-menu class="body-left" :default-active="type" @select="switchType">
        <el-menu-item index="faulty_wording">
          <el-tooltip effect="dark" content="文档中存在的一些错别字" placement="right" :openDelay="600">
            <span><i class="fa fa-strikethrough" aria-hidden="true"></i> 笔误和错别字</span>
          </el-tooltip>
        </el-menu-item>
        <el-menu-item index="tuple">
          <el-tooltip effect="dark" content="表格中的数值和文本中数值不一致" placement="right" :openDelay="600">
            <span><i class="fa fa-list" aria-hidden="true"></i> 财务指标和数值</span>
          </el-tooltip>
        </el-menu-item>
        <el-menu-item index="relation">
          <el-tooltip effect="dark" content="文档中一些数值的计算关系" placement="right" :openDelay="600">
            <span><i class="fa fa-list-alt" aria-hidden="true"></i> 数值变动和比例</span>
          </el-tooltip>
        </el-menu-item>
        <el-menu-item index="other_value">
          <el-tooltip effect="dark" content="可能有意义的一些数值和比例" placement="right" :openDelay="600">
            <span><i class="fa fa-ellipsis-h" aria-hidden="true"></i> 其他数值</span>
          </el-tooltip>
        </el-menu-item>
      </el-menu>
      <div class="body-right" v-loading="loading">
        <div class="body-right-content">
          <h3>
            {{docName}}
            <el-popover
              v-if="type == 'tuple'"
              v-model="overviewVisable"
              placement="bottom-end"
              width="600"
              :visible-arrow="true"
              trigger="manual">
              <div class="overview-wrapper">
                <h3 class="mb10">文档概览</h3>
                <table class="overview-table">
                  <thead>
                    <tr>
                      <td>批注类型</td>
                      <td>条数</td>
                      <td>类型解释</td>
                      <td>是否需要审核</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>冲突</td>
                      <td>{{UserCommentList.duplicate.length}}</td>
                      <td>在文档中出现2次以上，且不一致</td>
                      <td>需要</td>
                    </tr>
                    <tr>
                      <td>可能正确</td>
                      <td>{{UserCommentList.possible.length}}</td>
                      <td>在文档中出现2次以上，且似乎一致</td>
                      <td>需要</td>
                    </tr>
                    <tr>
                      <td>正确</td>
                      <td>{{UserCommentList.correct.length}}</td>
                      <td>在文档中出现2次以上，且一致</td>
                      <td>建议</td>
                    </tr>
                    <tr>
                      <td>单次出现</td>
                      <td>{{UserCommentList.noMatch.length}}</td>
                      <td>在文档中只出现1次</td>
                      <td>建议</td>
                    </tr>
                    <tr>
                      <td>总计</td>
                      <td>{{UserCommentList.duplicate.length + UserCommentList.possible.length + UserCommentList.correct.length + UserCommentList.noMatch.length}}</td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <span class="overview-btn pointer" slot="reference" @click.stop="overviewTrigger"><i class="fa fa-table" aria-hidden="true"></i>概览</span>
            </el-popover>
            <el-button @click="downloadDoc('/api/v1/document/' + docId + '/download/origin')" type="text" size="small">下载原文档</el-button>
            <el-button type="primary" size="small" @click.native="showDateDialog(docId)" v-if="$store.state.userInfo.type !== 'normal'">修改日期并重新分析</el-button>
            <el-button type="primary" size="small" @click.native="showDataPump(docId)" v-if="$store.state.userInfo.type !== 'normal'">查看抽取</el-button>
            <span style="display:inline-block">
              <div v-if="dateDialog.defaultReportPeriod !== null" class="period-text">
                  <span class="label">报告期:</span>
                <span v-if="dateDialog.defaultMonth !== 1">
                  <span v-if="dateDialog.defaultReportPeriod >= 4">
                    {{dateDialog.defaultYear.getFullYear() - 2 + '年'}}，
                  </span>
                  <span v-if="dateDialog.defaultReportPeriod >= 3">
                    {{dateDialog.defaultYear.getFullYear() - 1 + '年'}}，
                  </span>
                  <span v-if="dateDialog.defaultReportPeriod >= 2">
                    {{dateDialog.defaultYear.getFullYear() + '年'}}，
                  </span>
                  <span v-if="dateDialog.defaultReportPeriod >= 1">
                    {{dateDialog.defaultYear.getFullYear() + 1 + '年1月-' + dateDialog.defaultMonth + '月'}}
                  </span>
                </span>
                <span v-else>
                  <span v-if="dateDialog.defaultReportPeriod >= 4">
                    {{dateDialog.defaultYear.getFullYear() - 3 + '年'}}，
                  </span>
                  <span v-if="dateDialog.defaultReportPeriod >= 3">
                    {{dateDialog.defaultYear.getFullYear() - 2 + '年'}}，
                  </span>
                  <span v-if="dateDialog.defaultReportPeriod >= 2">
                    {{dateDialog.defaultYear.getFullYear() - 1 + '年'}}，
                  </span>
                  <span v-if="dateDialog.defaultReportPeriod >= 1">
                    {{dateDialog.defaultYear.getFullYear() + '年'}}
                  </span>
                </span>
              </div>
            </span>
          </h3>
          <faulty-wording v-if="type == 'faulty_wording'" @toggle-loading="toggleLoading"></faulty-wording>
          <tuple v-if="type == 'tuple'" @toggle-loading="toggleLoading"></tuple>
          <relation v-if="type == 'relation'" @toggle-loading="toggleLoading"></relation>
          <other-value v-if="type == 'other_value'" @toggle-loading="toggleLoading" other></other-value>
        </div>
        <div v-if="!readonly" class="file-detail-footer layout-footer">
          <span class="spantxt">
            <div>
              <span v-if="docQuality === null"> 文档质量未确认 </span>
              <span v-if="docQuality === 1"> 文档质量高 </span>
              <span v-if="docQuality === 2"> 文档质量低 </span>
            </div>
          </span>
          <el-button
            v-if="$store.state.userInfo.type !== 'normal'"
            class="btn" type="primary" @click="qualityVisiable = true">
            设置文档质量
          </el-button>

          <el-button
            v-if="!proofread &&
                  (($store.state.userInfo.type === 'normal' && owner === $store.state.userInfo.name) ||
                  ($store.state.userInfo.type === 'admin' && owner === 'dummy'))"
            class="btn" type="primary" @click="handleFinishReview">
            确认完成，生成带批注的文档
          </el-button>
          <el-button v-if="$store.state.userInfo.type !== 'normal' && proofread" class="btn" type="danger" icon="close" @click="handleFinishProofread('reject')">预审拒绝</el-button>
          <el-button v-if="$store.state.userInfo.type !== 'normal' && proofread" class="btn" type="warning" icon="check" @click="handleFinishProofread('finish')">预审完成</el-button>
        </div>
      </div>
    </div>
  <doc-date-confirm-dialog
    v-model="dateDialog.visable"
    :title="dateDialog.title"
    :doc-id="dateDialog.docId"
    :default-year="dateDialog.defaultYear"
    :default-month="dateDialog.defaultMonth"
    :default-period="dateDialog.defaultReportPeriod"
    :default-sorted="dateDialog.defaultSort"
    @done="handleConfirmDate">
  </doc-date-confirm-dialog>
  <el-dialog
  :title="dateDialog.title"
  :visible.sync="visiable"
  size="small"
  >
  <div class="doc-pump">
      <doc-data-pump :docDataPump="pumpData"></doc-data-pump>
  </div>
  <div style="width:10px;height:10px;border-radius:50%;background-color:#56f1d4;display: inline-block;margin:20px 10px 0 20px;"></div><span>该颜色表示有效数据</span>
  <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="visiable = false">确 定</el-button>
  </span>
</el-dialog>

<el-dialog
    title="标识该文档质量"
    :visible="qualityVisiable"
    size="tiny"
    >
    <div style="width:300px;margin:0 auto">
      <el-radio class="radio" v-model="radio" label="good">质量高</el-radio>
      <el-radio class="radio" v-model="radio" label="bad">质量低</el-radio>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="qualityVisiable = false">取 消</el-button>
      <el-button type="primary" @click="qualityVisiable = false,logoQuality()">确 定</el-button>
    </span>
</el-dialog>
  </div>
</template>
<script>
import faultyWording from './faulty-wording.vue'
import tuple from './tuple.vue'
import otherValue from './other-value.vue'
import relation from './relation.vue'
import { removeEmptyItem, isEmpty } from 'src/util/tools'

import docDateConfirmDialog from 'components/doc-date-confirm-dialog.vue'
import docDataPump from 'components/doc-data-pump'

export default {
  name: 'file-detail',
  components: {
    faultyWording,
    tuple,
    relation,
    otherValue,
    docDateConfirmDialog,
    docDataPump
  },
  data () {
    return {
      loading: true,
      overviewVisable: false,
      type: '',
      shownOtherValue: false,
      shownFaulty: false,
      dateDialog: {
        visable: false,
        title: '',
        docId: 0,
        defaultYear: null,
        defaultMonth: null,
        defaultReportPeriod: null
      },
      pumpData: {},
      currentdocId: null,
      visiable: false,
      qualityVisiable: false,
      docQuality: null,
      radio: 'good'
    }
  },
  computed: {
    docId () {
      return this.$route.params.id
    },
    owner () {
      return this.$route.query.owner || this.$store.state.fileDetail.owner
    },
    docName () {
      if (this.$store.state.fileDetail.tupleItemList.length !== 0) {
        return this.$store.state.fileDetail.tupleItemList[0].doc_name
      }
      if (this.$store.state.fileDetail.faultyItemList.length !== 0) {
        return this.$store.state.fileDetail.faultyItemList[0].doc_name
      }
      if (this.$store.state.fileDetail.relationItemList.length !== 0) {
        return this.$store.state.fileDetail.relationItemList[0].doc_name
      }
      return ''
    },
    readonly () {
      return this.$route.query.type === 'readonly'
    },
    proofread () {
      return this.$route.query.type === 'proofread'
    },
    UserCommentList () {
      // 错误＋冲突＋多匹配: 冲突
      // 不确定匹配：可能正确
      // 正确：正确
      // 匹配缺失：单次出现
      let temp = {
        correct: [],
        duplicate: [],
        possible: [],
        noMatch: [],
        value: []
      }
      this.$store.state.fileDetail.tupleItemList.forEach((item) => {
        if (item.type === 'correct') {
          temp.correct.push(item)
        } else if (item.type === 'duplicate' || item.type === 'wrong' || item.type === 'multi_match') {
          temp.duplicate.push(item)
        } else if (item.type === 'no_match') {
          temp.noMatch.push(item)
        } else if (item.type === 'possible_match') {
          temp.possible.push(item)
        } else if (item.type === 'value') {
          temp.value.push(item)
        }
      })
      return temp
    }
  },
  created () {
    this.currentdocId = this.$route.params.id
    let docId = Number(this.currentdocId)
    this.switchType(this.$route.query.navmenu || 'faulty_wording')
    // 此处请求该数据
    this.$store.dispatch('fileDetail/fetch_doc_by_id', {docId}).then((resp) => {
      this.dateDialog.title = resp.data.filename
      this.dateDialog.docId = resp.data.id
      this.dateDialog.defaultYear = resp.data.last_year ? new Date(resp.data.last_year + '') : new Date()
      this.dateDialog.defaultMonth = resp.data.last_month || 1
      this.dateDialog.defaultReportPeriod = resp.data.report_period || null
      this.docQuality = resp.data.quality || null
      if (this.docQuality === 1) {
        this.radio = 'good'
      }
      if (this.docQuality === 2) {
        this.radio = 'bad'
      }
      // this.dateDialog.visable = true
    })
  },
  mounted () {
    this.overviewVisable = false
    this.$nextTick(_ => {
      if (this.$store.state.userInfo.type === 'normal') {
        let viewedArr = []
        window.localStorage.getItem('viewedDoc') && (viewedArr = window.localStorage.getItem('viewedDoc').split(','))
        if (viewedArr.indexOf(`${this.docId}`) === -1) {
          this.overviewVisable = true
          viewedArr.push(this.docId)
          viewedArr = removeEmptyItem(viewedArr)
          window.localStorage.setItem('viewedDoc', viewedArr.join(','))
        }
      }
    })
  },
  beforeRouteLeave (to, from, next) {
    // 离开之前把store清空，vuex改变几百行的数据需要的时间很久， 大概200毫秒
    this.$store.commit('fileDetail/set_doc_tuple_list', [])
    this.$store.commit('fileDetail/set_relaiton_list', [])
    this.$store.commit('fileDetail/set_faulty_list', [])
    next(true)
  },
  methods: {
    overviewTrigger () {
      if (this.overviewVisable) {
        this.overviewVisable = false
      } else {
        this.overviewVisable = true
      }
    },
    handleDocumentClick (e) {
      if (e.target.value !== 'overview-btn pointer') {
        this.overviewVisable = false
      }
    },
    downloadDoc (docUrl) {
      window.open(docUrl)
    },
    handleFinishReview () {
      let docId = this.docId
      this.$confirm('所有批注已完成？', '确认操作', {
        lockScroll: false,
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('fileDetail/doc_revision_finish', { docId }).then((resp) => {
          if (this.$store.state.userInfo.type !== 'normal') {
            this.$router.push('/upload/file/list/all')
          } else {
            this.$router.push('/upload/file/list')
          }
        })
      }).catch(() => {})
    },
    handleFinishProofread (result) {
      let docId = this.docId
      this.$confirm('确认操作吗？', '确认操作', {
        lockScroll: false,
        type: 'warning'
      }).then(() => {
        if (result === 'finish') {
          this.$store.dispatch('fileDetail/doc_proofread_finish', { docId }).then((resp) => {
            if (this.$store.state.userInfo.type !== 'normal') {
              this.$router.push('/upload/file/list/all')
            } else {
              this.$router.push('/upload/file/list')
            }
          })
        } else {
          this.$store.dispatch('fileDetail/doc_proofread_reject', { docId }).then((resp) => {
            if (this.$store.state.userInfo.type !== 'normal') {
              this.$router.push('/upload/file/list/all')
            } else {
              this.$router.push('/upload/file/list')
            }
          })
        }
      }).catch(() => {})
    },
    async switchType (indexName) {
      this.type = indexName
      if (this.type === 'tuple') {
        if (this.$store.state.fileDetail.tupleItemList.length <= 0) {
          this.loading = true
          this.$store.dispatch('fileDetail/fetch_doc_tuple_list', { docId: this.docId })
          .then(_ => {
            this.loading = false
          })
        }
      } else if (this.type === 'relation') {
        if (this.$store.state.fileDetail.relationItemList.length <= 0) {
          this.loading = true
          this.$store.dispatch('fileDetail/fetch_doc_relation_list', { docId: this.docId })
          .then(_ => {
            this.loading = false
          })
        }
      } else if (this.type === 'faulty_wording') {
        if (this.$store.state.fileDetail.faultyItemList.length <= 0) {
          this.loading = true
          this.$store.dispatch('fileDetail/fetch_doc_faulty_list', { docId: this.docId })
          .then(resp => {
            if (resp.data.items.length <= 0 && !this.shownFaulty) {
              this.shownFaulty = true
              this.switchType('tuple')
            } else {
              this.loading = false
            }
          })
        }
      } else if (this.type === 'other_value') {
        if (!this.shownOtherValue) {
          this.shownOtherValue = true
          this.loading = true
          if (this.$store.state.fileDetail.tupleItemList.length <= 0) {
            await this.$store.dispatch('fileDetail/fetch_doc_tuple_list', { docId: this.docId })
          }
          await this.$store.dispatch('fileDetail/fetch_doc_other_value_list', { docId: this.docId }).catch(_ => { this.loading = false })
          this.loading = false
        }
      }
    },
    toggleLoading (state) {
      this.loading = state
    },
    showDateDialog (docId) {
      this.dateDialog.visable = true
    },
    handleConfirmDate (docId, yearObj, monthObj, period, reversePeriod) {
      if (!yearObj || !monthObj) {
        this.$notify.warning({
          title: '错误',
          message: '请选择最近一年和最近一期'
        })
        return
      }
      this.$store.commit('uploadFileListAll/set_item_status', {
        docId: docId,
        itemStatus: 30
      })
      let year = yearObj.getFullYear()
      let month = monthObj
      this.$store.dispatch('uploadFileListAll/restart_doc_for_ref', {
        docId,
        year,
        month,
        period,
        reversePeriod
      }).then((resp) => {
        this.dateDialog.visable = false
      }).catch(() => {
        this.dateDialog.visable = false
      })
    },
    showDataPump(docId) {
      // 请求数据抽取的数据
      this.$store.dispatch('fileDetail/fetch_pump_by_id', {docId}).then((resp) => {
        if (!isEmpty(resp.data)) {
          this.pumpData = resp.data
          this.visiable = true
        } else {
          this.$notify.error({
            title: '错误',
            message: '无数据返回'
          })
        }
      })
    },
    logoQuality() {
      let docId = this.docId
      let quality = this.radio
      this.$store.dispatch('uploadFileListAll/logo_doc_quality_by_id', { docId, quality }).then((resp) => {
        if (this.radio === 'good') {
          this.docQuality = 1
        }
        if (this.radio === 'bad') {
          this.docQuality = 2
        }
      })
    }
  }
}
</script>
<style lang="less">
@import "../../assets/less/variables.less";
.empty-comments{
  padding: 10px;
}
.tabs-wrapper {
  .fa{
    position: relative;
    top: 1px;
  }
}
.file-detail-header {
  padding: 10px;
  background-color: @white-dark;
  border-bottom: 1px solid @gray-light;
}
.file-detail-content{
  padding: 10px;
  min-height: 400px;
  overflow: auto;
}
.file-detail-footer {
  position: relative;
  overflow: hidden;
  background-color: @white-base;
  box-shadow: 0 -2px 4px rgba(0,0,0,.1);
  .btn{
    float: right;
    margin: 15px 20px;
    padding: 10px 40px
  }
  .spantxt{
    float: right;
    margin: 15px 20px;
    padding: 10px 40px
  }

}
.file-detail-body{
  height: 100%;
  min-height: 400px;
  overflow: auto;
  .el-collapse-item__header{
    height: auto;
    line-height: 1.6;
    padding: 15px 10px;
  }
  .status-tag{
    margin-top: -2px;
    margin-right: 10px;
  }
}
.fix-top{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
}
.lh-28{
  line-height: 28px;
}
.overview-wrapper{
  padding: 10px;
  border-radius: 5px;
  background-color: #ffeded;
}
.overview-btn {
  margin-left: 10px;
  font-size: 13px;
  font-weight: 400;
}
.overview-table{
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 13px;
  thead{
    font-weight: bold;
  }
  td{
    border: 1px solid @silver-base;
    padding: 5px 10px;
  }
}
.body-left{
  float: left;
  min-width: 150px;
  height: 100%;
  background-color: #f2f5f7;
  border-right: 1px solid #dfe5e9;
  overflow-y: auto;
}
.body-right{
  min-width: 880px;
  height: 100%;
  position: relative;
  overflow-x: hidden;
  background-color: #fff;
  .body-right-content{
    height: ~'calc(100% - 70px)';
    overflow: auto;
    padding: 10px;
    box-sizing: border-box;
  }
}
.doc-pump{
  height:600px;
  overflow-y:auto;
  border: 1px solid #dfe6ec;
  padding:5px;
}
</style>
