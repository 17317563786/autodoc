<template>
  <div class="demo-container">
    <div ref="sentence" class="mycss">
      <transition @after-leave="step2=true" name="slide-bottom">
        <div v-if="step1">
          <el-input class="textarea" type="textarea" :rows="2" placeholder="请输入句子" v-model="text">
          </el-input>
        </div>
      </transition>
      <transition @after-leave="step1=true" name="slide-top">
        <div class="my-sentence-wrapper" v-if="step2">
          <sentence v-if="!isEmpty(backData)" :sentence="backData.text" :quadruples="hoverQuadruples"></sentence>
        </div>
      </transition>
      <div class="btn-wrapper">
        <el-button type="primary" @click="visable = !visable">添加描述</el-button>
        <el-button class="fl-r" type="primary" v-if="step1" @click="handleSubmit">提交</el-button>
        <el-button class="fl-r" type="primary" v-if="step2" @click="showInput">重新提交</el-button>
        <el-form  ref="form" :inline="true" class="inline-block v-top" label-width="90px">
          <el-form-item label="最近一年">
            <el-date-picker v-model="recentYearObj" align="right" type="year" placeholder="最近一年">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="最近一期">
            <el-select v-model="recentMonth" placeholder="请选择">
              <el-option label="无最近一期" :value="1"></el-option>
              <el-option label="1月-3月" :value="3"></el-option>
              <el-option label="1月-6月" :value="6"></el-option>
              <el-option label="1月-9月" :value="9"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="报告期">
            <el-select v-model="reportPeriod">
              <el-option v-for="n in 4" :label="n" :value="n"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="p10" :style="{marginTop: sentenceHeight + 'px'}">
      <div v-if="!isEmpty(backData)" class="result-wrapper">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="四元组" name="table">
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
                </div>
                <div v-if="backData.quadruples.length === 0" class="no-data">
                  无四元组
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="关系公式" name="canvas">
            <relation-formula @hover-item="rowHover" :relations="backData.relations_over_tuple" :quadruples="quadruples"></relation-formula>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div v-show="exampleStatus" @click="fetchExampleSentence" class="example-tip">找一些例子看看？</div>
      <el-table v-if="exampleTableStatus" row-class-name="rowClass" @row-click="exampleRowClick" :data="exampleData" max-height="400" style="width: 100%">
        <el-table-column label="句子">
          <template scope="scope">
            <div class="example-sentence">{{scope.row.source_text}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="recent_year" label="最近一年" width="180">
        </el-table-column>
        <el-table-column prop="recent_month" label="最近一期" width="180">
        </el-table-column>
        <el-table-column prop="report_period" label="报告期" width="180">
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { isEmpty } from 'src/util/tools'
import sentence from 'components/sentence-show/sentence'
import relationFormula from 'components/sentence-show/relation-formula'
export default {
  name: 'sentence-tool',
  components: {
    sentence,
    relationFormula
  },
  data() {
    return {
      text: '',
      visable: false,
      recentMonth: null,
      recentYearObj: null,
      // 报告期
      reportPeriod: null,
      // 例子句子的数据
      exampleData: [],
      // 默认中的选项卡
      activeTab: 'table',
      // 例子的table状态
      exampleTableStatus: false,
      // 例子的状态
      exampleStatus: true,
      // 我的css特效的状态
      step1: true,
      step2: false,
      sentenceHeight: 0,
      hoverQuadruples: {}
    }
  },
  computed: {
    backData() {
      return this.$store.state.sentenceTool.data
    },
    quadruples() {
      if (isEmpty(this.$store.state.sentenceTool.data)) {
        return {}
      }
      return {
        attributes: this.$store.state.sentenceTool.data.attributes,
        preattributes: this.$store.state.sentenceTool.data.preattributes,
        times: this.$store.state.sentenceTool.data.times,
        values: this.$store.state.sentenceTool.data.values
      }
    }
  },
  mounted() {
    var curYear = new Date().getFullYear()
    this.recentYearObj = new Date(curYear - 1, 0, 1, 11, 0, 0)
    // 首次进入页面也要算一下高度
    this.sentenceHeight = this.$refs.sentence.offsetHeight
  },
  beforeDestroy() {
    // 取消监听，不知道能不能成功
    // off(window, 'scroll', this.handleScroll)
  },
  methods: {
    exampleRowClick(row) {
      this.text = row.source_text
      this.recentMonth = row.recent_month || null
      this.recentYearObj = row.recent_year ? new Date(row.recent_year, 0, 1, 11, 0, 0) : null
      this.reportPeriod = row.report_period || null
    },
    // 监听的滚动事件
    handleScroll() {
      // console.log('测试一下')
    },
    isEmpty,
    closeWindow() {
      window.close()
    },
    showInput() {
      this.step2 = false
      this.exampleStatus = true
      this.$store.commit('sentenceTool/clear_back_data')
    },
    // 获取句子样例, 异步请求先不放到store里面
    async fetchExampleSentence() {
      this.exampleStatus = false
      var { data } = await this.$fetch({ url: '/api/v1/adc/sentence_example' })
      // console.log(data)
      this.exampleData = data
      this.exampleTableStatus = true
    },
    handleSubmit() {
      this.exampleTableStatus = false
      if (this.text === '') {
        this.$message({ message: '句子不能为空', type: 'warning' })
        return
      }
      let params = {
        sentence: this.text
      }
      if (this.recentYearObj) {
        params.recentYear = this.recentYearObj.getFullYear()
      }
      if (this.recentMonth) {
        params.recentMonth = this.recentMonth
      }
      if (this.reportPeriod) {
        params.reportPeriod = this.reportPeriod
      }
      this.$store.dispatch('sentenceTool/fetch_quadruples', params).then(_ => {
        this.sentenceHeight = this.$refs.sentence.offsetHeight
        this.step1 = false
      })
    },
    rowHover(item, type) {
      if (isEmpty(item)) {
        this.hoverQuadruples = {}
      } else {
        if (type === 'no') {
          let preattributes = item.preattributes.map(preAttr => {
            return this.backData.preattributes[preAttr]
          })
          this.hoverQuadruples = {
            attribute: this.backData.attributes[item.attribute],
            time: this.backData.times[item.time],
            value: this.backData.values[item.value],
            preattributes
          }
        } else {
          this.hoverQuadruples = item
        }
      }
    }
  }
}
</script>
<style lang="less" scoped>
// 就是得加一个波浪号才可以
@import "~src/assets/less/variables.less";
.example-sentence {
  padding: 6px 0;
}

.rowClass {
  cursor: pointer
}

.my-sentence-wrapper {
  color: #1f2d3d;
  margin-bottom: 10px;
  font-size: 16px;
  box-sizing: border-box;
  background-color: #eff2f7;
  border-radius: 5px;
  border-bottom: 1px solid #c8d5ea;
  padding: 10px 15px 0;
  line-height: 1.8;
  overflow: hidden;
}

.reliaton-wrapper {
  margin-top: 10px;
  overflow-x: auto;
  .reliaton-echart-wrapper {
    width: 1500px;
    height: 800px;
    margin: 0 auto;
  }
}

.textarea {
  font-size: 16px;
  padding: 10px 15px 0;
}

.example-tip {
  cursor: pointer;
}

.example-tip:hover {
  color: #3182bd;
}

.mycss {
  position: fixed;
  border-bottom: 1px solid #d1dbe5;
  padding: 6px;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 11;
  background-color: #ffffff;
}

// 动画效果
.slide-top-enter-active,
.slide-bottom-enter-active,
.slide-top-leave-active,
.slide-bottom-leave-active {
  transition: all .2s ease;
}

.slide-top-enter,
.slide-top-leave-active {
  opacity: 0;
  transform: translate(0, 30px);
}

.slide-bottom-enter,
.slide-bottom-leave-active {
  opacity: 0;
  transform: translate(0, -30px);
}
</style>
