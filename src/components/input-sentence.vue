<template>
  <div class="input-sentence-wrapper">
    <div class="item input-wrapper">
      <el-input class="textarea" type="textarea" :rows="3" placeholder="请输入句子，以句号结尾" v-model="sourceText">
      </el-input>
    </div>
    <div class="item add-desc">
      <div class="left-wrapper">
        <el-button type="primary" @click="showAddDesc = !showAddDesc">添加描述</el-button>
        <el-form v-show="showAddDesc" :inline="true"  label-width="90px">
          <el-form-item label="最近一年">
            <el-date-picker v-model="recentY" align="right" type="year" placeholder="最近一年">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="最近一期">
            <el-select v-model="recentM" placeholder="请选择">
              <el-option v-for="item in recentMonth" :label="item.titel" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="报告期">
            <el-select v-model="reportP">
              <el-option v-for="n in 4" :label="n" :value="n"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="right-wrapper">
        <el-button class="btn" @click="resetForm">重置</el-button>
        <el-button class="btn" type="primary" @click="handleSubmit">提交</el-button>
      </div>
    </div>
    <div class="item demo-desc">例子:</div>
    <div class="item demos">
      <el-table row-class-name="rowClass" @row-click="exampleRowClick" :data="demoSentence" height="600" style="width:100%">
        <el-table-column label="句子">
          <template scope="scope">
            <div class="demo-sentence">{{scope.row.source_text}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="recent_year" label="最近一年" width="80">
        </el-table-column>
        <el-table-column prop="recent_month" label="最近一期" width="80">
        </el-table-column>
        <el-table-column prop="report_period" label="报告期" width="80">
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'input-sentence',
  data() {
    return {
      // 输入的句子
      sourceText: '',
      // 是否显示添加描述
      showAddDesc: false,
      // 默认选中的最近一年
      recentY: new Date(new Date().getFullYear() - 1, 0, 1, 11, 0, 0),
      recentM: null,
      reportP: null,
      recentMonth: [{
        title: '无最近一期',
        value: 1
      }, {
        title: '1月-3月',
        value: 3
      }, {
        title: '1月-6月',
        value: 6
      }, {
        title: '1月-9月',
        value: 9
      }]
    }
  },
  computed: {
    ...mapGetters({
      demoSentence: 'getSentenceExample'
    })
  },
  created() {
    this.$store.dispatch('demo/sentence/example')
  },
  methods: {
    resetForm() {
      this.sourceText = ''
      this.recentY = new Date(new Date().getFullYear() - 1, 0, 1, 11, 0, 0)
      this.recentM = null
      this.reportP = null
    },
    handleSubmit() {
      var text = this.sourceText.trim()
      if (!text) {
        this.$message({ message: '请输入句子！', type: 'warning' })
        return
      }
      var commaText = text.replace(/。/g, '，')
      // 下面这里还能在优化
      var value = {
        source_text: commaText[commaText.length - 1] === '，' ? commaText.slice(0, -1) + '。' : commaText + '。',
        recent_month: this.recentM,
        recent_year: this.recentY ? this.recentY.getFullYear() : null,
        report_period: this.reportP
      }
      this.$store.dispatch('demo/AIAnalyse', value)
    },
    exampleRowClick(row) {
      this.showAddDesc = true
      this.sourceText = row.source_text
      this.recentY = row.recent_year ? new Date(row.recent_year, 0, 1, 11, 0, 0) : null
      this.recentM = row.recent_month || null
      this.reportP = row.report_period || null
    }
  }
}
</script>
<style lang="less">
.input-sentence-wrapper {
  padding: 20px;
  height: 100%;
  .item {
     margin-bottom: 20px;
  }
  .add-desc {
    display: flex;
    justify-content: space-between;
    .left-wrapper {
      display: flex;
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }
  .demos {
    height: ~'calc(100% - 200px)';
  }
}
</style>