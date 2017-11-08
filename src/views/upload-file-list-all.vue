<template>
<div class="container">
  <div class="file-detail-header layout-header">
    <div class="fl-l">
      <el-upload
        v-if="userInfo.type === 'admin'"
        ref="uploader"
        action="/api/v1/document/upload"
        accept=".docx"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError">
        <el-button size="small" type="primary" icon="upload2">开始上传</el-button>
      </el-upload>
    </div>
    <div class="fl-r">
      <el-dropdown>
        <el-button type="primary" size="small">
          Demo<i class="el-icon-caret-bottom el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="routerGo('/demo/sentence/tool', '_block')">句子 --> 四元组</el-dropdown-item>
          <el-dropdown-item @click.native="routerGo('/demo/sentence/update', '_block')">文档更新</el-dropdown-item>
          <el-dropdown-item @click.native="routerGo('/demo/sentence/autodoc', '_block')">文档AutoDoc</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button type="primary" size="small" @click.native="routerGo('/sentence/tool', '_block')"><i class="fa fa-microchip" aria-hidden="true"></i>句子=>四元组</el-button>
      <el-button type="primary" size="small" icon="search" @click.native="searchDialog.visable = true">文档搜索</el-button>
      <el-dropdown>
        <el-button type="primary" size="small">
          句子<i class="el-icon-caret-bottom el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="routerGo('/sentence/factory')">单句分流</el-dropdown-item>
          <el-dropdown-item @click.native="routerGo('/all/sentences')">待分流的句子</el-dropdown-item>
          <el-dropdown-item @click.native="routerGo('/all/sentences/reject')">拒绝的句子</el-dropdown-item>
          <el-dropdown-item @click.native="routerGo('/sentence/tool', '_block')">句子搜索</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown v-if="$store.state.userInfo.type === 'admin'">
        <el-button type="primary" size="small">
          修订<i class="el-icon-caret-bottom el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="routerGo('/all/comments/show')">未隐藏的冲突</el-dropdown-item>
          <el-dropdown-item @click.native="routerGo('/all/comments/reject')">已拒绝的修订</el-dropdown-item>
          <el-dropdown-item @click.native="routerGo('/all/comments/accept')">已接受的修订</el-dropdown-item>
          <el-dropdown-item @click.native="routerGo('/all/comments/reject/fixed')">已fixed的拒绝修订</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button class="ml10" type="danger" size="small" @click="logout">退出登录</el-button>
    </div>
    <div class="fl-r mr20">
      <span class="admin-name">{{name}}</span>
    </div>
  </div>
  <div class="layout-content no-footer">
    <h4 class="search-title" v-if="searchDialog.searched">
      搜索: {{searchDialog.searchType}} = {{searchDialog.inputValue}}
      <el-button size="mini" class="ml10" @click.native="clearSearch">清空搜索</el-button>
    </h4>
    <div class="file-list-wrapper" v-loading="loading">
      <el-table
        :data="docList"
        @sort-change="tableSortChange"
        stripe
        border
        style="width: 100%">
        <el-table-column
          prop="id"
          sortable="custom"
          label="ID"
          width="80">
        </el-table-column>
        <el-table-column
          inline-template
          label="文件名">
          <span>
            <a :href="`/api/v1/document/${row.id}/download/origin`" target="_blank">{{row.filename}}</a>
          </span>
        </el-table-column>
        <el-table-column
          inline-template
          width="350"
          sortable="custom"
          label="版本/文件状态/处理进度">
          <div>
          <span class="tag">
            {{ row.version }}/ {{row.status | fileStatusText}}/ {{row.status > 0 ? Math.floor(row.status/60*100) : 0 }} %
            <i v-if="showItemLoading(row.status)" class="el-icon-loading"></i>
          </span>
          <div style="margin-top: 10px">{{row.created_utc | dateTimeFormatter('yyyy-MM-dd hh:mm:ss')}}</div>
          </div>
        </el-table-column>
        <el-table-column
          label="所属用户"
          width="200">
          <template scope="scope">
            <span class="table-username">
              <el-button type="text" @click="routerToSerachByUserId(scope.row.user_id)" :class="{reanalysised:scope.row.need_restart}">
                {{scope.row.username}}
              </el-button>
                ({{ scope.row.user_docs}})
            </span>
            <el-button type="text" @click="showMessageDialog(scope.row.id, scope.row.username)">发消息</el-button>
          </template>
        </el-table-column>
        <el-table-column
          inline-template
          label="操作"
          width="400" class="operatebtns">
          <span>
            <el-button class="w75"
              v-if="row.status === 10 || row.status === 12 || row.status === 30 || row.status === 50"
              type="primary" size="mini" :loading="true">
              处理中...
            </el-button>
            <el-button class="w75"
              v-if="row.status === 20"
              type="primary" size="mini"
              @click.native="showDateDialog(row)" icon="date">
              确认日期
            </el-button>
            <el-button class="w75"
              v-if="row.status === 40" type="warning" size="mini"
              @click.native="routerToDocDetail(row.id, row.username, 'proofread')">
              预审
            </el-button>
            <el-button class="w75"
              v-if="row.status === 45 && $store.state.userInfo.type !== 'proofread'"
              type="primary" size="mini"
              @click.native="routerToDocDetail(row.id, row.username)">
              开始修订
            </el-button>
            <el-button class="w75"
              v-if="row.status === 45 && $store.state.userInfo.type !== 'proofread'"
              type="primary" size="mini"
              @click.native="routerToCauseRelation(row.id)">
              因果关系
            </el-button>
            <el-button class="w75"
              v-if="(row.status === 45 || row.status=== 60) && $store.state.userInfo.type !== 'proofread'"
              type="primary" size="mini"
              @click.native="routerToTables(row)">
              表格视图
            </el-button>
            <el-button class="w75"
              v-if="row.status === 48 && $store.state.userInfo.type !== 'proofread'"
              type="primary" size="mini"
              @click.native="routerToDocDetail(row.id, row.username)">
              继续修订
            </el-button>
            <el-button class="w75"
              v-if="row.status === 60 && $store.state.userInfo.type !== 'proofread'"
              type="success" size="mini"
              @click.native="routerToDocDetail(row.id, row.username, 'readonly')">
              修订信息
            </el-button>
            <el-button class="w75"
              v-if="row.status === 60 && $store.state.userInfo.type !== 'proofread'"
              type="success" size="mini" @click.native="downloadDoc(row.id)">
              下载文档
            </el-button>
            <el-button class="w75"
              v-if="($store.state.userInfo.type === 'admin' && row.internal === 1) || ($store.state.userInfo.type === 'admin' && row.user_id === $store.state.userInfo.id)"
              type="danger" size="mini"
              @click.native="handleDelDoc(row.id)">
              移除
            </el-button>
            <el-button class="w75"
              type="success" size="mini" @click.native="reAnalysise(row)" v-if="this.systemvVersion !== row.version" :loading="row.isRestart">
              重新分析
            </el-button>
          </span>
        </el-table-column>
      </el-table>
      <div class="mt10 fl-r mb10">
        <el-pagination
          v-if="pager.total !== 0"
          @current-change="handleCurrentPageChange"
          :current-page="pager.page"
          :page-size="pager.size"
          layout="total, prev, pager, next"
          :total="pager.total">
        </el-pagination>
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
  <el-dialog title="文档搜索" v-model="searchDialog.visable" size="tiny">
    <div class="search-type-radio-wrapper">
      <el-radio class="radio" v-model="searchDialog.searchType" label="doc_id">文档ID</el-radio>
      <el-radio class="radio" v-model="searchDialog.searchType" label="doc_name">文档名</el-radio>
      <el-radio class="radio" v-model="searchDialog.searchType" label="user_id">用户ID</el-radio>
      <el-radio class="radio" v-model="searchDialog.searchType" label="username">用户名</el-radio>
    </div>
    <div class="input-wrapper mt10">
      <el-input v-model="searchDialog.inputValue" :placeholder="'请输入' + searchDialog.searchType" @keyup.enter.native="searchDoc(searchDialog.searchType, searchDialog.inputValue)"></el-input>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="searchDialog.visable = false">取 消</el-button>
      <el-button type="primary" @click="searchDoc(searchDialog.searchType, searchDialog.inputValue)">搜 索</el-button>
    </span>
  </el-dialog>
  <el-dialog :title="messageDialog.title" v-model="messageDialog.visable" size="tiny">
    <div class="message-edit-wrapper">
      <el-input v-model="messageDialog.msgTitle" placeholder="请输入消息标题"></el-input>
      <el-input
        class="mt10"
        type="textarea"
        :rows="5"
        placeholder="请输入消息内容"
        v-model="messageDialog.msgContent">
      </el-input>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="messageDialog.visable = false">取 消</el-button>
      <el-button type="primary" @click="sendMassageTo(messageDialog.docId)">发 送</el-button>
    </span>
  </el-dialog>
</div>
</template>
<script>
import { delCookie } from 'util/tools'
import { sendMessageTo, getSystemvVersion } from 'src/store/api'
import docDateConfirmDialog from 'components/doc-date-confirm-dialog.vue'
export default {
  name: 'upload-file-list-all',
  components: {
    docDateConfirmDialog
  },
  data () {
    return {
      loading: true,
      dateDialog: {
        visable: false,
        title: '',
        docId: 0,
        defaultYear: null,
        defaultMonth: null,
        defaultReportPeriod: null,
        defaultSort: null
      },
      searchDialog: {
        visable: false,
        searched: false,
        searchType: 'doc_id',
        inputValue: null
      },
      messageDialog: {
        visable: false,
        title: '',
        docId: '',
        msgTitle: '',
        msgContent: ''
      },
      systemvVersion: null
    }
  },
  computed: {
    docList () {
      return this.$store.state.uploadFileListAll.list
    },
    pager () {
      return this.$store.state.uploadFileListAll.pager
    },
    name () {
      return this.$store.state.userInfo.name
    },
    userInfo () {
      return this.$store.state.userInfo
    }
  },
  beforeMount () {
    this.$root.$on('userinfo-done', _ => {
      if (this.$store.state.userInfo.type === 'normal') {
        this.$router.replace('/upload/file/list')
      }
    })

    this.$store.dispatch('uploadFileListAll/fetch_doc_list').then(() => {
      this.loading = false
    })
    getSystemvVersion().then(resp => {
      this.systemvVersion = resp.data.version
    })
  },
  methods: {
    searchDoc (searchType, value) {
      this.searchDialog.visable = false
      this.searchDialog.searched = true
      this.searchDialog.inputValue = value
      this.$store.commit('uploadFileListAll/set_pager', {
        page: 1,
        size: this.pager.size,
        total: 0
      })
      let params = {
        searchType,
        value
      }
      this.loading = true
      this.$store.dispatch('uploadFileListAll/search_doc_list', params).then(() => {
        this.loading = false
      })
    },
    clearSearch () {
      this.searchDialog.searched = false
      this.searchDialog.inputValue = ''
      this.$store.commit('uploadFileListAll/set_pager', {
        page: 1,
        size: this.pager.size,
        total: 0
      })
      this.loading = true
      this.$store.dispatch('uploadFileListAll/fetch_doc_list').then(() => {
        this.loading = false
      })
    },
    routerToDocDetail (docId, username, type) {
      // type: proofread || readonly
      this.$store.commit('fileDetail/set_doc_owner', username)
      if (type) {
        this.$router.push(`/file/detail/${docId}?navmenu=faulty_wording&type=${type}&owner=${username}`)
      } else {
        this.$router.push(`/file/detail/${docId}?navmenu=faulty_wording&owner=${username}`)
      }
    },
    routerToCauseRelation(docId) {
      this.$router.push(`/file/detail/cr/${docId}`)
    },
    routerToTables (row) {
      this.$router.push('/file/detail/table/' + row.id + '?filename=' + row.filename)
    },
    handleCurrentPageChange (page) {
      this.$store.commit('uploadFileListAll/set_pager', {
        page: page,
        size: this.pager.size,
        total: this.pager.total
      })
      if (this.searchDialog.searched) {
        let params = {
          searchType: this.searchDialog.searchType,
          value: this.searchDialog.inputValue
        }
        this.loading = true
        this.$store.dispatch('uploadFileListAll/search_doc_list', params).then(() => {
          this.loading = false
        })
      } else {
        this.loading = true
        this.$store.dispatch('uploadFileListAll/fetch_doc_list').then(() => {
          this.loading = false
        })
      }
    },
    handleUploadSuccess (resp, file, fileList) {
      if (resp.status === 'ok') {
        this.$store.commit('uploadFileListAll/add_new_item', resp.data)
      } else {
        this.$notify.error({
          title: '错误',
          message: resp.message
        })
      }
      setTimeout(() => {
        this.$refs.uploader && this.$refs.uploader.clearFiles()
      }, 1000)
    },
    handleUploadError (err, file, fileList) {
      console.log(err)
      this.$notify.error({
        title: '错误',
        message: '文件上传出错了'
      })
    },
    showDateDialog (row) {
      this.$store.state.uploadFileListAll.list.forEach((item) => {
        if (item.id === row.id) {
          this.dateDialog.title = item.filename
        }
      })
      this.dateDialog.docId = row.id
      this.dateDialog.defaultYear = row.last_year ? new Date(row.last_year + '') : new Date()
      this.dateDialog.defaultMonth = row.last_month || 1
      this.dateDialog.defaultReportPeriod = row.report_period || null
      this.dateDialog.visable = true
      this.dateDialog.defaultSort = row.reverse_period
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
      let id = docId
      this.$store.dispatch('uploadFileListAll/push_recent_date', {
        id,
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
    showItemLoading (status) {
      if (status > 0 && (status < 45 || status === 50)) {
        return true
      } else {
        return false
      }
    },
    handleDelDoc (docId) {
      this.$confirm('确认移除此文档？', '确认操作', {
        lockScroll: false,
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('uploadFileListAll/del_doc_by_id', { docId }).then((resp) => {
          this.$notify.success({
            title: '成功',
            message: '移除成功'
          })
        })
      }).catch(() => {})
    },
    logout () {
      delCookie('user_id')
      window.location.reload()
    },
    downloadDoc (docId) {
      window.open(`/api/v1/document/${docId}/download/output`)
    },
    routerGo (url, type) {
      if (type === '_block') {
        window.open(window.location.href.split('#')[0] + '#' + url)
      } else {
        this.$router.push(url)
      }
    },
    tableSortChange (columnProp) {
      if (columnProp.column !== null) {
        if (columnProp.order === 'ascending') {
          this.$store.commit('uploadFileListAll/set_listDesc', 0)
        } else {
          this.$store.commit('uploadFileListAll/set_listDesc', 1)
        }
        if (columnProp.column.label === 'ID') {
          this.$store.commit('uploadFileListAll/set_listOrderBy', 'id')
          if (this.searchDialog.searched) {
            let params = {
              searchType: this.searchDialog.searchType,
              value: this.searchDialog.inputValue
            }
            this.loading = true
            this.$store.dispatch('uploadFileListAll/search_doc_list', params).then(() => {
              this.loading = false
            })
          } else {
            this.loading = true
            this.$store.dispatch('uploadFileListAll/fetch_doc_list').then(() => {
              this.loading = false
            })
          }
        }
        if (columnProp.column.label === '文件状态') {
          this.$store.commit('uploadFileListAll/set_listOrderBy', 'status')
          if (this.searchDialog.searched) {
            let params = {
              searchType: this.searchDialog.searchType,
              value: this.searchDialog.inputValue
            }
            this.loading = true
            this.$store.dispatch('uploadFileListAll/search_doc_list', params).then(() => {
              this.loading = false
            })
          } else {
            this.loading = true
            this.$store.dispatch('uploadFileListAll/fetch_doc_list').then(() => {
              this.loading = false
            })
          }
        }
      } else {
        this.$store.commit('uploadFileListAll/set_listOrderBy', 'id')
        this.$store.commit('uploadFileListAll/set_listDesc', 1)
        if (this.searchDialog.searched) {
          let params = {
            searchType: this.searchDialog.searchType,
            value: this.searchDialog.inputValue
          }
          this.loading = true
          this.$store.dispatch('uploadFileListAll/search_doc_list', params).then(() => {
            this.loading = false
          })
        } else {
          this.loading = true
          this.$store.dispatch('uploadFileListAll/fetch_doc_list').then(() => {
            this.loading = false
          })
        }
      }
    },
    showMessageDialog (docId, name) {
      this.messageDialog.title = `发消息给${name}`
      this.messageDialog.docId = docId
      this.messageDialog.msgTitle = ''
      this.messageDialog.msgContent = ''
      this.messageDialog.visable = true
    },
    sendMassageTo(docId) {
      if (this.messageDialog.msgTitle && this.messageDialog.msgContent) {
        sendMessageTo(docId, this.messageDialog.msgTitle, this.messageDialog.msgContent).then(resp => {
          this.messageDialog.visable = false
        })
      } else {
        this.$notify.warning({
          title: '错误',
          message: '消息的标题和内容不能为空'
        })
      }
    },
    reAnalysise(row) {
      row.isRestart = true
      let docId = row.id
      this.$store.dispatch('uploadFileListAll/restart_doc_by_id', { docId }).then(() => {
        this.$store.dispatch('uploadFileListAll/fetch_doc_list')
      })
    },
    routerToSerachByUserId(userId) {
      this.searchDoc('user_id', userId)
    }
  }
}
</script>
<style lang="less">
.table-username{
  display: inline-block;
  vertical-align: middle;
  width: 80px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.search-title{
  padding: 10px 10px 0;
}
.admin-name{
  line-height: 28px;
}
.w75{
  width: 75px;
}
.reanalysised{
  color:red;
}
el-button:nth-of-type(1){
  margin-left: 0;
  color:red;
}
</style>
