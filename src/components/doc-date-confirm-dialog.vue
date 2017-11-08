<template>
  <el-dialog :title="title" :lock-scroll="false" v-model="value" :close-on-press-escape="false" :show-close="false" :close-on-click-modal="false">
    <span>
      需要您确认文档中的‘最近一年’ ‘最近一期’ 和 ‘报告期数’
      <el-tooltip class="item" effect="dark" placement="bottom">
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
        <i aria-hidden="true" class="fa fa-question-circle-o ml10"></i>
      </el-tooltip>
    </span>
    <el-form ref="form" :inline="true" class="mt50" label-width="90px">
      <el-form-item label="最近一年">
        <el-date-picker
          v-model="yearObj"
          align="right"
          type="year"
          placeholder="最近一期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="最近一期">
        <el-select v-model="monthObj" placeholder="请选择" filterable allow-create>
          <el-option :label="'无最近一期'" :value="1"></el-option>
          <el-option :label="yearObj.getFullYear() + 1 + '年 1月-3月'" :value="3"></el-option>
          <el-option :label="yearObj.getFullYear() + 1 + '年 1月-6月'" :value="6"></el-option>
          <el-option :label="yearObj.getFullYear() + 1 + '年 1月-9月'" :value="9"></el-option>
          <el-option :label="yearObj.getFullYear() + 1 + '年 1月-12月'" :value="12"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="报告期数">
        <el-select v-model="reportPeriod" placeholder="请选择">
          <el-option label="1" :value="1"></el-option>
          <el-option label="2" :value="2"></el-option>
          <el-option label="3" :value="3"></el-option>
          <el-option label="4" :value="4"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="年份排序">
        <el-button type="primary" @click="sortReport">切换顺序</el-button>
      </el-form-item>
      <div v-if="!reversePeriod">
        <div v-if="reportPeriod !== null" class="period-text">
          <span class="label">报告期:</span>
        <span v-if="monthObj !== 1">
          <span v-if="reportPeriod >= 4">
            {{yearObj.getFullYear() - 2 + '年'}}，
          </span>
          <span v-if="reportPeriod >= 3">
            {{yearObj.getFullYear() - 1 + '年'}}，
          </span>
          <span v-if="reportPeriod >= 2">
            {{yearObj.getFullYear() + '年'}}，
          </span>
          <span v-if="reportPeriod >= 1">
            {{yearObj.getFullYear() + 1 + '年1月-' + monthObj + '月'}}
          </span>
        </span>
        <span v-else>
          <span v-if="reportPeriod >= 4">
            {{yearObj.getFullYear() - 3 + '年'}}，
          </span>
          <span v-if="reportPeriod >= 3">
            {{yearObj.getFullYear() - 2 + '年'}}，
          </span>
          <span v-if="reportPeriod >= 2">
            {{yearObj.getFullYear() - 1 + '年'}}，
          </span>
          <span v-if="reportPeriod >= 1">
            {{yearObj.getFullYear() + '年'}}
          </span>
        </span>
        </div>
      </div>
      <div v-if="reversePeriod">
        <div v-if="reportPeriod !== null" class="period-text">
          <span class="label">报告期:</span>
          <span v-if="monthObj !== 1">
            <span v-if="reportPeriod >= 1">
              {{yearObj.getFullYear() + 1 + '年1月-' + monthObj + '月'}}{{reportPeriod > 1 ? '，' : ''}}
            </span>
              <span v-if="reportPeriod >= 2">
              {{yearObj.getFullYear() + '年'}}{{reportPeriod > 2 ? '，' : ''}}
            </span>
              <span v-if="reportPeriod >= 3">
              {{yearObj.getFullYear() - 1 + '年'}}{{reportPeriod > 3 ? '，' : ''}}
            </span>
              <span v-if="reportPeriod >= 4">
              {{yearObj.getFullYear() - 2 + '年'}}
            </span>
          </span>
          <span v-else>
            <span v-if="reportPeriod >= 1">
              {{yearObj.getFullYear() + '年'}}{{reportPeriod > 1 ? '，' : ''}}
            </span>
            <span v-if="reportPeriod >= 2">
              {{yearObj.getFullYear() - 1 + '年'}}{{reportPeriod > 2 ? '，' : ''}}
            </span>
            <span v-if="reportPeriod >= 3">
              {{yearObj.getFullYear() - 2 + '年'}}{{reportPeriod > 3 ? '，' : ''}}
            </span>
            <span v-if="reportPeriod >= 4">
              {{yearObj.getFullYear() - 3 + '年'}}
            </span>
          </span>
        </div>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirmDate">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
let date = new Date()
export default {
  name: 'doc-date-confim-dialog',
  props: {
    value: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    docId: {
      type: Number,
      required: true
    },
    defaultYear: {
      type: Date
    },
    defaultMonth: {
      type: Number
    },
    defaultPeriod: {
      type: Number
    },
    defaultSorted: {
      type: Number
    }
  },
  data () {
    return {
      yearObj: date,
      monthObj: 1,
      reportPeriod: null,
      reversePeriod: this.defaultSorted || 0
    }
  },
  methods: {
    handleConfirmDate () {
      this.$emit('done', this.docId, this.yearObj, this.monthObj, this.reportPeriod, this.reversePeriod)
    },
    handleCancel () {
      this.$emit('input', false)
    },
    sortReport() {
      if (!this.reversePeriod) {
        this.reversePeriod = 1
      } else {
        this.reversePeriod = 0
      }
    }
  },
  watch: {
    value () {
      if (this.value) {
        if (this.defaultYear !== undefined) {
          this.yearObj = this.defaultYear
        }
        if (this.monthObj !== undefined) {
          this.monthObj = this.defaultMonth
        }
        if (this.defaultPeriod !== undefined) {
          this.reportPeriod = this.defaultPeriod
        }
      }
    }
  }
}
</script>
<style lang="less">
.period-text{
  color: #FF4949;
  .label{
    display: inline-block;
    box-sizing: border-box;
    padding-right: 10px;
    width: 90px;
    text-align: right;
  }
}
</style>
