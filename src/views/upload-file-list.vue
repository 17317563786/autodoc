<template>
<!-- 此页用户为 normal -->
<div class="container">
  <div class="file-detail-header layout-header">
    <el-button size="small" type="primary" icon="upload2" @click.native="handleUploadDialog">上传新文档</el-button>
    <el-button v-if="!inIframe" class="fl-r ml10" type="danger" size="small" @click="logout">退出登录</el-button>
    <div v-if="!inIframe && showUserInfo" class="user-info fl-r mr20 ml10">
      <span class="user-image" v-bind:style="{ backgroundImage: 'url('+imageUrl+')' }"></span>
      <span class="user-name">{{name}}</span>
    </div>
  </div>
  <div class="layout-content no-footer">
    <div class="intro-img">
      <img width="750" src="../assets/img/intro.png">
    </div>
    <div class="file-list-wrapper" v-loading="loading">
      <el-table
        :data="docList"
        stripe
        border
        style="width: 100%">
        <el-table-column
          prop="id"
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
          label="创建时间"
          width="180">
          <span>
            {{row.created_utc | dateTimeFormatter('yyyy-MM-dd hh:mm:ss')}}
          </span>
        </el-table-column>
        <el-table-column
          inline-template
          width="250"
          label="文件状态">
          <span class="tag">
            {{row.status | fileStatusTextUser}}
          </span>
        </el-table-column>
         <el-table-column
          inline-template
          width="100"
          sortable="custom"
          label="版本">
          <span class="tag">
            {{ row.version }}
          </span>
        </el-table-column>
        <el-table-column
          inline-template
          align="right"
          label="发现冲突"
          width="100">
          <span>{{row.status >= 45 ? row.conflict_count + '个' : '计算中'}}</span>
        </el-table-column>
        <el-table-column
          inline-template
          label="操作"
          width="330">
          <span>
            <el-button class="w85" v-if="row.status === 10  || row.status === 12 || row.status === 20 ||row.status === 30 || row.status === 40 || row.status === 50" type="primary" size="mini" :loading="true">处理中...</el-button>
            <!-- <el-button class="w85" v-if="row.status === 20" type="primary" size="mini" @click.native="showDateDialog(row)" icon="date">确认日期</el-button> -->
            <el-button class="w85" v-if="row.status === 45" type="primary" size="mini" @click.native="routerToDocDetail(row.id, row.username)">查看分析结果</el-button>
            <el-button class="w85" v-if="row.status === 48" type="primary" size="mini" @click.native="routerToDocDetail(row.id, row.username)">查看分析结果</el-button>
            <el-button-group>
              <el-button class="w85" v-if="row.status === 60" type="success" size="mini" @click.native="routerToDocDetail(row.id, row.username, 'readonly')">查看分析结果</el-button>
              <el-button class="w85" v-if="row.status === 60 && row.internal !== 1" type="success" size="mini" @click.native="downloadDoc(row.id)">下载文档</el-button>
            </el-button-group>
            <el-button class="w85" @click.native="handleDelDoc(row.id)" type="danger" size="mini">移除</el-button>
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
    <div class="t-center mt20">
      <el-button class="ml10" size="large" type="primary" icon="upload2" @click.native="uploadDialog.visable = true">上传新文档</el-button>
    </div>
  </div>
  <el-dialog :title="uploadDialog.title" :lock-scroll="false" v-model="uploadDialog.visable">
    <div class="upload-dialog-wrapper">
      <p>目前支持上传 *.doc, *.docx文档</p>
    </div>
    <div slot="footer" class="upload-dialog-footer">
      <el-upload
        v-if="userInfo.balance > 0"
        id="uploader"
        ref="uploader"
        drag
        action="/api/v1/document/upload"
        accept=".docx, .doc"
        :before-upload="handleChargeClick"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">剩余次数: {{userInfo.balance}}</div>
      </el-upload>
    </div>
  </el-dialog>
  <el-dialog title="文档上传成功" v-model="QRcodeDialog.visable">
    <div class="qrcode-dialog-wrapper">
      <p>视文档复杂程度，处理大约需要15-60分钟，请您耐心等待。我们会在处理完成后，通过债有主公众号的微信消息通知您。</p>
      <p>请您用微信扫描下面的二维码关注债有主公众号，以及时获得通知。</p>
      <img src="../assets/img/bondowner_qrcode.jpg">
    </div>
  </el-dialog>
  <doc-date-confirm-dialog
    v-model="dateDialog.visable"
    :title="dateDialog.title"
    :doc-id="dateDialog.docId"
    :default-year="dateDialog.defaultYear"
    :default-month="dateDialog.defaultMonth"
    :default-period="dateDialog.defaultReportPeriod"
    @done="handleConfirmDate">
  </doc-date-confirm-dialog>
  <charge
    :dialog-visable="chargeVisable"
    @close="chargeVisable = false"
    class="fl-r ml10">
  </charge>
</div>
</template>
<script>
import { delCookie } from 'util/tools'
import charge from 'components/charge.vue'
import docDateConfirmDialog from 'components/doc-date-confirm-dialog.vue'
import { getSystemvVersion } from 'src/store/api'
export default {
  name: 'upload-file-list',
  components: {
    charge,
    docDateConfirmDialog
  },
  data () {
    return {
      loading: true,
      systemvVersion: null,
      chargeVisable: false,
      dateDialog: {
        visable: false,
        title: '',
        docId: 0,
        defaultYear: null,
        defaultMonth: null,
        defaultReportPeriod: null
      },
      uploadDialog: {
        visable: false,
        title: '说明'
      },
      QRcodeDialog: {
        visable: false
      }
    }
  },
  computed: {
    docList () {
      return this.$store.state.uploadFileList.list
    },
    pager () {
      return this.$store.state.uploadFileList.pager
    },
    name () {
      return this.$store.state.userInfo.name
    },
    imageUrl () {
      return this.$store.state.userInfo.imageUrl
    },
    showUserInfo () {
      if (this.$store.state.userInfo.name && this.$store.state.userInfo.imageUrl) {
        return true
      }
      return false
    },
    inIframe () {
      if (window.self === window.top) {
        return false
      } else {
        return true
      }
    },
    userInfo () {
      return this.$store.state.userInfo
    }
  },
  beforeMount () {
    this.$root.$on('userinfo-done', _ => {
      if (this.$store.state.userInfo.type !== 'normal') {
        this.$router.replace('/upload/file/list/all')
      }
    })
    this.$store.dispatch('uploadFileList/fetch_doc_list').then(() => {
      this.loading = false
    })
    getSystemvVersion().then(resp => {
      this.systemvVersion = resp.data.version
    })
  },
  methods: {
    routerToDocDetail (docId, username, type) {
      this.$store.commit('fileDetail/set_doc_owner', this.name)
      if (type) {
        this.$router.push('/file/detail/' + docId + '?tab=user_duplicate&type=' + type + '&owner=' + this.name)
      } else {
        this.$router.push('/file/detail/' + docId + '?tab=user_duplicate&owner=' + this.name)
      }
    },
    handleCurrentPageChange (page) {
      this.$store.commit('uploadFileList/set_pager', {
        page: page,
        size: this.pager.size,
        total: this.pager.total
      })
      this.loading = true
      this.$store.dispatch('uploadFileList/fetch_doc_list').then(() => {
        this.loading = false
      })
    },
    // 判断是否还有充值次数，如果有就打开上传，如果没有就打开充值
    handleUploadDialog() {
      this.userInfo.balance < 1 ? this.chargeVisable = true : this.uploadDialog.visable = true
    },
    handleChargeClick () {
      if (this.userInfo.type === 'normal') {
        if (this.userInfo.balance < 1) {
          this.$refs.uploader && this.$refs.uploader.clearFiles()
          this.chargeVisable = true
          return false
        }
      }
      return true
    },
    handleUploadSuccess (resp, file, fileList) {
      if (resp.status === 'ok') {
        this.$store.commit('uploadFileList/add_new_item', resp.data)
        this.uploadDialog.visable = false
        setTimeout(() => {
          this.$store.commit('userInfo/set_balance', this.$store.state.userInfo.balance - 1)
          this.QRcodeDialog.visable = true
        }, 1000)
      } else {
        this.$notify.error({
          title: '错误',
          message: '请检查您的文件类型是否受支持'
        })
        console.error(resp)
      }
      this.$refs.uploader && this.$refs.uploader.clearFiles()
    },
    handleUploadError (err, file, fileList) {
      console.log(err)
      this.$notify.error({
        title: '错误',
        message: '文件上传出错了'
      })
    },
    downloadDoc (docId) {
      window.open(`/api/v1/document/${docId}/download/output`)
    },
    showDateDialog (row) {
      this.$store.state.uploadFileList.list.forEach((item) => {
        if (item.id === row.id) {
          this.dateDialog.title = item.filename
        }
      })
      this.dateDialog.docId = row.id
      this.dateDialog.defaultYear = row.last_year ? new Date(row.last_year + '') : new Date()
      this.dateDialog.defaultMonth = row.last_month || 1
      this.dateDialog.defaultReportPeriod = row.report_period || null
      this.dateDialog.visable = true
    },
    handleConfirmDate (docId, yearObj, monthObj, period) {
      if (!yearObj || !monthObj) {
        this.$notify.warning({
          title: '错误',
          message: '请选择最近一年和最近一期'
        })
        return
      }
      this.$store.commit('uploadFileList/set_item_status', {
        docId: docId,
        itemStatus: 30
      })
      let year = yearObj.getFullYear()
      let month = monthObj
      let id = docId
      this.$store.dispatch('uploadFileList/push_recent_date', {
        id,
        year,
        month,
        period
      }).then((resp) => {
        this.dateDialog.visable = false
      }).catch(() => {
        this.dateDialog.visable = false
      })
    },
    handleDelDoc (docId) {
      this.$confirm('确认移除此文档？', '确认操作', {
        lockScroll: false,
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('uploadFileList/del_doc_by_id', { docId }).then((resp) => {
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
    reAnalysise(row) {
      row.isRestart = true
      let docId = row.id
      this.$store.dispatch('uploadFileList/restart_doc_by_id', { docId }).then(() => {
        this.$store.dispatch('uploadFileList/fetch_doc_list')
      })
    }
  }
}
</script>
<style lang="less">
@import "../assets/less/variables.less";
.file-list-wrapper{
  padding: 10px;
  overflow: hidden;
}
.file-detail-header{
  position: relative;
  overflow: hidden;
  .el-upload-list{
    width: 300px;
    position: absolute;
    left: 105px;
    top: 2.5px;
  }
}
.tag{
  background-color: #e4e8f1;
  border-color: #e4e8f1;
  color: #48576a;
  display: inline-block;
  padding: 0 5px;
  height: 24px;
  line-height: 22px;
  font-size: 12px;
  border-radius: 4px;
  box-sizing: border-box;
  border: 1px solid transparent;
  white-space: nowrap;
}
.step{
  margin-right: -8%;
}
.w85{
  width: 85px;
}
.user-info{
  display: inline-block;
}
.user-image{
  height:28px;
  width:28px;
  background-size: 28px 28px;
  display:inline-block;
  vertical-align: middle;
  border-radius: 50%;
  border: 2px solid @white-base;
}
.user-name{
  display: inline-block;
  vertical-align: middle;
}
.upload-dialog-footer{
  text-align: center;
}
.intro-img{
  text-align: center;
  margin: 10px 0;
}
.qrcode-dialog-wrapper{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  font-size: 14px;
  line-height: 1.66;
  img{
    height: 200px;
    margin-top: 10px;
    align-self: center;
  }
}
</style>
