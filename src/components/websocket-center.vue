<template>
<div class="wrapper">
  <el-dialog :title="dialog.title" v-model="dialog.visable" :close-on-press-escape="false"  :close-on-click-modal="false">
    <span>
      我们推测您文档中的‘最近一年’和‘最近一期’代表如下年月，请确认后继续
      <el-tooltip class="item" effect="dark" placement="bottom">
        <div slot="content">
          <div slot="content">
            <h3>您需要在文档里面找到类似下面的示例说明，然后选择对应的时间</h3>
            示例1：最近三年及一期 2013年，2014年，2015年和2016年1-3月<br>
            最近一年：2015年<br>
            最近一期：1-3月<br>

            示例2：最近三年 2013年，2014年和2015年<br>
            最近一年：2015年<br>
            最近一期：无最近一期<br><br>

            <h3>报告期数示例说明</h3>
            示例1：报告期 2013年、2014年、2015年和2016年1-3月<br>
            报告期数：4<br>

            示例2：报告期 2013年、2014年和2015年<br>
            报告期数：3
          </div>
        </div>
        <i aria-hidden="true" class="fa fa-question-circle-o ml10"></i>
      </el-tooltip>
    </span>
    <el-form ref="form" :inline="true" class="mt50" label-width="90px">
      <el-form-item label="最近一年">
        <el-date-picker
          v-model="dialog.yearObj"
          align="right"
          type="year"
          placeholder="最近一期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="最近一期">
        <el-select v-model="dialog.monthObj" placeholder="请选择">
          <el-option :label="'无最近一期'" :value="1"></el-option>
          <el-option :label="dialog.yearObj.getFullYear() + 1 + '年 1月-3月'" :value="3"></el-option>
          <el-option :label="dialog.yearObj.getFullYear() + 1 + '年 1月-6月'" :value="6"></el-option>
          <el-option :label="dialog.yearObj.getFullYear() + 1 + '年 1月-9月'" :value="9"></el-option>
          <el-option :label="dialog.yearObj.getFullYear() + 1 + '年 1月-12月'" :value="12"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="报告期数">
        <el-select v-model="dialog.period" placeholder="请选择">
          <el-option label="1" :value="1"></el-option>
          <el-option label="2" :value="2"></el-option>
          <el-option label="3" :value="3"></el-option>
          <el-option label="4" :value="4"></el-option>
        </el-select>
      </el-form-item>
      <div class="period-text">
        <span class="label">报告期:</span>
        <span v-if="dialog.monthObj !== 1">
          <span v-if="dialog.period >= 4">
            {{dialog.yearObj.getFullYear() - 2 + '年'}}，
          </span>
          <span v-if="dialog.period >= 3">
            {{dialog.yearObj.getFullYear() - 1 + '年'}}，
          </span>
          <span v-if="dialog.period >= 2">
            {{dialog.yearObj.getFullYear() + '年'}}，
          </span>
          <span v-if="dialog.period >= 1">
            {{dialog.yearObj.getFullYear() + 1 + '年1月-' + dialog.monthObj + '月'}}
          </span>
        </span>
        <span v-else>
          <span v-if="dialog.period >= 4">
            {{dialog.yearObj.getFullYear() - 3 + '年'}}，
          </span>
          <span v-if="dialog.period >= 3">
            {{dialog.yearObj.getFullYear() - 2 + '年'}}，
          </span>
          <span v-if="dialog.period >= 2">
            {{dialog.yearObj.getFullYear() - 1 + '年'}}，
          </span>
          <span v-if="dialog.period >= 1">
            {{dialog.yearObj.getFullYear() + '年'}}
          </span>
        </span>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleConfirmDate">确 定</el-button>
    </span>
  </el-dialog>
</div>
</template>
<script>
import { getCookie } from '../util/tools'

let date = new Date()
export default {
  name: 'websocket-center',
  data () {
    return {
      ws: null,
      dialog: {
        visable: false,
        title: '',
        yearObj: date,
        monthObj: null,
        period: null,
        docId: null
      }
    }
  },
  created () {
    if (getCookie('user_id')) {
      // this.createWS()
    }
  },
  methods: {
    createWS () {
      /* eslint-disable no-new */
      this.ws = new window.WebSocket('ws://' + window.location.host + '/notification/sock')
      this.ws.onmessage = (event) => {
        let payload = JSON.parse(event.data)
        let data = payload.data
        if (payload.type === 'notification') {
          this.notification(data)
        } else if (payload.type === 'command') {
          this.command(data)
        }
      }
    },
    notification (data) {
      if (data.type === 'doc_status_change') {
        let docId = data.doc_id
        this.$store.commit('uploadFileList/set_item_status', {
          docId,
          itemStatus: data.to
        })
      }
    },
    command (data) {
      if (data.type === 'doc_date_confirm') {
        this.$store.state.uploadFileList.list.forEach((item) => {
          if (item.id === data.doc_id) {
            this.dialog.title = item.filename
          }
        })
        this.dialog.yearObj = new Date(data.year + '')
        this.dialog.monthObj = data.month
        this.dialog.period = data.report_period
        this.dialog.docId = data.doc_id
        this.dialog.visable = true
      } else if (data.type === 'doc_revision_confirm') {
        // 文件需要修订
      }
    },
    handleConfirmDate () {
      if (!this.dialog.yearObj || !this.dialog.monthObj) {
        this.$notify.warning({
          title: '错误',
          message: '请选择最近一年和最近一期'
        })
        return
      }
      let year = this.dialog.yearObj.getFullYear()
      let month = this.dialog.monthObj
      let period = this.dialog.period
      let id = this.dialog.docId
      this.$store.dispatch('uploadFileList/push_recent_date', {
        id,
        year,
        month,
        period
      }).then((resp) => {
        this.dialog.visable = false
      }).catch(() => {
        this.dialog.visable = false
      })
      this.$store.commit('uploadFileList/set_item_status', {
        docId: id,
        itemStatus: 30
      })
    }
  }
}
</script>
<style lang="less">
@import "../assets/less/variables.less";
  .ws-notify{
    width: 400px;
    position: fixed;
    top: 0;
    left: 50%;
    z-index: 1000;
    padding: 15px 0;
    margin-left: -200px;
    text-align: center;
    background-color: @warning;
    color: @white-base;
    font-size: @fs-l;
    border-radius: 0 0 8px 8px;
    overflow: hidden;
  }
</style>