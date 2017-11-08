<template>
  <div class="container">
    <div class="file-detail-header layout-header">
      <el-button type="primary" size="small" @click="closeWindow" icon="circle-cross">关闭本页</el-button>
    </div>
    <div class="p10" :style="{marginTop: sentenceHeight + 'px'}" v-loading="loading">
      <div class="sentence-search">
        <el-input
          placeholder="请输入句子id"
          v-model="sentenceId"
          class="search-text" @keydown.enter.native = "searchSentence()">
        </el-input>
        <el-button type="primary" icon="search" @click.native = "searchSentence()">搜索</el-button>
      </div>
      <div class="textarea-wrapper">
        <el-input type="textarea" :rows="2" placeholder="请输入句子" v-model="text">
        </el-input>
      </div>
      <div class="btn-wrapper">
        <el-button type="primary" @click="visable = visable ? false: true">添加最近一年最近一期</el-button>
        <el-button class="fl-r" type="primary" @click="handleSubmit">提交</el-button>
        <el-form v-if="visable" ref="form" :inline="true" class="inline-block v-top" label-width="90px">
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
      <div v-if="!isEmpty(backData)" class="result-wrapper">
        <div v-if="!isEmpty(backData.properties)" class="score-wrapper">
          <div class="score-item faulty-wrapper">总分：<span class="blue">{{backData.properties.score}}</span></div>
          <div class="score-item faulty-wrapper">四元组分数：<span class="blue">{{backData.properties.quadruple_score}}</span></div>
          <div class="score-item faulty-wrapper">关系分数：<span class="blue">{{backData.properties.relation_score}}</span></div>
        </div>
        <div v-if="!isEmpty(backData.faulty_wordings)" class="faulty-wrapper">
          <span>不完善信息： </span>
          <span v-for="(item, idx) in backData.faulty_wordings" @mouseover="faultyMessageHover(item)" @mouseout="faultyMessageHover({})"> {{idx != 0 ? '|' : ''}} {{item.tips}}</span>
        </div>
        <div class="sentence-wrapper" ref="sentenceWrapper">
          <sentence :sentence="backData.text" :quadruples="hoverQuadruples" :updateComp="dymaicHeight"></sentence>
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
              <div v-if="submitFlag && backData.quadruples.length > 0" v-for="(item, key) in backData.quadruples" class="row" @mouseover="rowHover(item, 'no')" @mouseout="rowHover({})">
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
              <div v-if="!submitFlag && backData.quadruples.length > 0" v-for="(item, key) in backData.quadruples" class="row" @mouseover="rowLoadHover(item, 'no')" @mouseout="rowLoadHover({})">
                <div class="item">
                  {{item.time.value}}
                </div>
                <div class="item">
                  <span v-for="restItem in item.preattributes">
                    [{{restItem.value}}]
                  </span>
                  <span v-if="item.preattributes.length === 0">-</span>
                </div>
                <div class="item">
                  {{item.attribute.value}}
                </div>
                <div class="item">
                  {{item.value.value}}
                </div>
                <div class="probability">
                  <!-- {{item.probability | toFixed}}-->
                </div>
              </div>
              <div v-if="backData.quadruples.length === 0" class="no-data">
                无四元组
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="reliaton-wrapper" v-if="!isEmpty(backData)">
        <h3>提取出的公式</h3>
        <relation-formula @hover-item="rowHover" :relations="backData.relations_over_tuple" :quadruples="quadruples"></relation-formula>
        <div id="reliaton-echart" class="reliaton-echart-wrapper"></div>
      </div>
    </div>
  </div>
</template>
<script>
import { isEmpty } from 'src/util/tools'
import sentence from 'components/sentence-show/sentence'
import relationFormula from 'components/sentence-show/relation-formula'
import { fetchSentenceById } from 'src/store/api'
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
      recentYearObj: null,
      recentMonth: null,
      reportPeriod: null,
      sentenceHeight: 0,
      hoverQuadruples: {},
      loading: false,
      sentenceId: null,
      submitFlag: false
    }
  },
  computed: {
    backData() {
      this.text = this.$store.state.sentenceTool.data.text
      return this.$store.state.sentenceTool.data
    },
    quadruples () {
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
  created () {
    if (this.$route.query.docId && this.$route.query.sid) {
      this.loading = true
      this.$store.dispatch('sentenceTool/fetch_detail_by_id', {
        docId: this.$route.query.docId,
        sid: this.$route.query.sid
      }).then(_ => {
        this.text = this.backData.text
        this.$nextTick(function() {
          /* let ele = document.getElementsByClassName('sentence-wrapper')[0]
          ele && (this.sentenceHeight = ele.offsetHeight - 30) */
        })
        this.loading = false
      })
    }
  },
  mounted() {
    this.submitFlag = false
  },
  methods: {
    isEmpty,
    closeWindow() {
      window.close()
    },
    handleSubmit() {
      if (this.text === '') {
        this.$notify.warning({
          title: '警告',
          message: '句子不能为空'
        })
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
        this.dragRelaiton()
        this.submitFlag = true
        this.$nextTick(_ => {
          document.querySelector('.sentence-wrapper') && (this.sentenceHeight = document.querySelector('.sentence-wrapper').offsetHeight - 30)
        })
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
    },
    rowLoadHover(item, type) {
      if (isEmpty(item)) {
        this.hoverQuadruples = {}
      } else {
        if (type === 'no') {
          this.hoverQuadruples = {
            attribute: item.attribute,
            time: item.time,
            value: item.value,
            preattributes: item.preattributes
          }
        } else {
          this.hoverQuadruples = item
        }
      }
    },
    faultyMessageHover (item) {
      if (isEmpty(item)) {
        this.hoverQuadruples = {}
      } else {
        this.hoverQuadruples = {
          value: {
            position: item.position[0],
            value: this.backData.text.substring(item.position[0], item.position[1])
          }
        }
      }
    },
    dragRelaiton() {
      var width = 1400
      var height = 600
      var xOffset = 0.05 * width
      var xFactor = 0.9 * width
      var yOffset = 0.1 * height
      var yFactor = 0.9 * height
      var myChart = window.echarts.init(document.getElementById('reliaton-echart'), { width: width, height: height })

      var nodes = this.backData.relations_for_drawing.nodes
      var links = this.backData.relations_for_drawing.links
      // 指定图表的配置项和数据
      var option = {
        title: {
          text: '四元组关系图',
          textStyle: { fontSize: 18 }
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        animation: false,
        series: [{
          type: 'graph',
          layout: 'none',
          symbol: 'rect',
          label: {
            normal: {
              show: true
            }
          },
          lineStyle: {
            normal: {
              width: 3,
              borderColor: 'black',
              borderWidth: 3
            }
          },
          data: nodes.map((node) => {
            var borderC
            var borderW
            if (node.horder === 0) {
              borderC = 'white'
              borderW = 1
            } else {
              borderC = 'black'
              borderW = 2
            }
            return {
              x: node.x * xFactor + xOffset,
              y: node.y * yFactor + yOffset,
              name: node.name,
              value: node.name + 'hello',
              symbol: node.symbol,
              symbolSize: [node.symbolSize[0] * 1.2, node.symbolSize[1]],
              itemStyle: {
                normal: {
                  color: node.color,
                  borderColor: borderC,
                  borderWidth: borderW,
                  border_color_bak: borderC,
                  bg_color_bak: node.color
                }
              }
            }
          }),
          links: links.map((link) => {
            return {
              source: link.source,
              target: link.target,
              lineStyle: {
                normal: {
                  color: link.color,
                  color_bak: link.color
                }
              }
            }
          })
        }]
      }
      myChart.setOption(option)
      let graph = {}
      myChart.on('mouseover', function (hoverItem) {
        graph = {}

        graph.nodes = option.series[0].data
        graph.links = option.series[0].links
        graph.nodes.forEach((nodeItem) => {
          nodeItem.itemStyle.normal.borderColor = '#f1f1f1'
          nodeItem.itemStyle.normal.color = '#f1f1f1'
        })
        graph.links.forEach((nodeItem) => {
          nodeItem.lineStyle.normal.color = '#f1f1f1'
        })

        if (hoverItem.dataType === 'node') {
          var targetNodes = []
          var boundary = hoverItem.data.y
          targetNodes.push(hoverItem.name)

          var flag = false
          do {
            flag = findAllNode(graph.links, graph.nodes, targetNodes, boundary)
          } while (flag)

          targetNodes.forEach((name) => {
            if (parseInt(name.split('|')[0], 10) <= boundary) {
              graph.nodes.forEach((nodeItem) => {
                if (nodeItem.name === name) {
                  if (nodeItem.itemStyle.normal.bg_color_bak === 'black') {
                    nodeItem.itemStyle.normal.color = '#353535'
                    nodeItem.itemStyle.normal.borderColor = '#f44336'
                  }
                  if (nodeItem.itemStyle.normal.bg_color_bak === 'gray') {
                    nodeItem.itemStyle.normal.color = '#999'
                    nodeItem.itemStyle.normal.borderColor = '#f44336'
                  }
                  if (nodeItem.itemStyle.normal.bg_color_bak === 'blue') {
                    nodeItem.itemStyle.normal.color = '#a300ff'
                    nodeItem.itemStyle.normal.borderColor = '#f44336'
                  }
                  if (nodeItem.itemStyle.normal.bg_color_bak === 'green') {
                    nodeItem.itemStyle.normal.color = '#1AAD16'
                    nodeItem.itemStyle.normal.borderColor = '#f44336'
                  }
                  if (nodeItem.itemStyle.normal.bg_color_bak === 'brown') {
                    nodeItem.itemStyle.normal.color = '#ff2f2f'
                    nodeItem.itemStyle.normal.borderColor = '#f44336'
                  }
                }
              })
            }
          })
          myChart.setOption(option)
        }
      })
      myChart.on('mouseout', () => {
        graph = {}
        graph.nodes = option.series[0].data
        graph.links = option.series[0].links
        graph.nodes.forEach((nodeItem) => {
          nodeItem.itemStyle.normal.borderColor = nodeItem.itemStyle.normal.border_color_bak
          nodeItem.itemStyle.normal.color = nodeItem.itemStyle.normal.bg_color_bak
        })
        graph.links.forEach((linkItem) => {
          linkItem.lineStyle.normal.color = linkItem.lineStyle.normal.color_bak
        })
        myChart.setOption(option)
      })

      const findAllNode = (links, nodes, nodesContainer, boundary) => {
        var flag = false
        var targetNode
        nodesContainer.forEach((name) => {
          links.forEach(function (item) {
            if (item.target === name) {
              targetNode = nodes.filter(function (nodeItem) {
                return nodeItem.name === item.source
              })
              if (targetNode[0].y < boundary) {
                if (nodesContainer.indexOf(item.source) === -1) {
                  nodesContainer.push(item.source)
                  flag = true
                }
                if (item.lineStyle.normal.color_bak === 'gray') {
                  item.lineStyle.normal.color = '#000'
                }
                if (item.lineStyle.normal.color_bak === 'yellow') {
                  item.lineStyle.normal.color = '#ffb700'
                }
              }
            }
          })
        })
        return flag
      }
    },
    async searchSentence() {
      if (!this.sentenceId) {
        return
      }
      this.loading = true
      try {
        var resp = await fetchSentenceById(this.sentenceId)
      } catch (err) {
        console.log(err)
      }
      this.loading = false
      if (resp) {
        this.text = resp.data.text
        this.handleSubmit()
      }
    },
    dymaicHeight() {
      this.$nextTick(function() {
        let ele = this.$refs.sentenceWrapper || document.getElementsByClassName('sentence-wrapper')[0]
        ele && (this.sentenceHeight = ele.offsetHeight - 30)
      })
    }
  }
}
</script>
<style lang="less">
@import "../assets/less/variables.less";
.btn-wrapper {
  height: 45px;
  margin: 10px 0;
  overflow: hidden;
}
.result-wrapper {
  .score-wrapper {
    display: flex;
    .score-item {
      margin-right: 10px;
    }
  }
  .blue {
    color: #4db3ff;
  }
}
.v-top {
  vertical-align: top;
}

.words-wrapper {
  margin: 20px 0;
  font-size: 15px;
  .word {
    display: inline-block;
    margin-top: 5px;
    margin-left: 5px;
    padding: 0 2px;
    border: 1px solid #99A9BF;
    background-color: #eff2f7;
  }
}

.item-table-wrapper {
  color: #1f2d3d;
  margin-top: 10px;
  border-top: 1px solid #e4ecf9;
  border-right: 1px solid #e4ecf9;
  border-left: 1px solid #e4ecf9;
  .tr {
    line-height: 30px;
    font-size: 14px;
    border-bottom: 1px solid #e4ecf9;
    overflow: hidden;
    .title {
      float: left;
      background-color: #eff2f7;
      text-align: center;
      font-weight: bold;
      width: 10%;
    }
    .td {
      width: 90%;
      float: left;
      span {
        display: inline-block;
        padding: 0 10px;
        min-width: 140px;
      }
    }
  }
}

.label-table {
  padding: 20px 0;
  font-size: 14px;
  .thead {
    overflow: hidden;
    background-color: #eff2f7;
    color: #1f2d3d;
    .thead-item {
      float: left;
      width: 25%;
      position: relative;
      line-height: 50px;
      text-align: center;
    }
    .time:after {
      content: "";
      display: block;
      width: 20px;
      height: 15px;
      position: absolute;
      top: 17px;
      right: 125px;
      background-color: @warning;
    }
    .restrict:after {
      content: "";
      display: block;
      width: 20px;
      height: 15px;
      position: absolute;
      top: 17px;
      right: 125px;
      background-color: @success;
    }
    .attribute:after {
      content: "";
      display: block;
      width: 20px;
      height: 15px;
      position: absolute;
      top: 17px;
      right: 125px;
      background-color: STEELBLUE;
    }
    .value:after {
      content: "";
      display: block;
      width: 20px;
      height: 15px;
      position: absolute;
      top: 17px;
      right: 130px;
      background-color: CRIMSON;
    }
  }
  .tbody {
    .row {
      overflow: hidden;
      border-bottom: 1px solid #e4ecf9;
      line-height: 40px;
      .item {
        float: left;
        width: 25%;
        position: relative;
        text-align: center;
      }
    }
    .no-data{
      padding: 10px;
      border: 1px solid #e4ecf9;
    }
  }
}

.no-data {
  text-align: center;
}

.sentence-wrapper {
  color: #1f2d3d;
  margin-bottom: 10px;
  font-size: 20px;
  box-sizing: border-box;
  background-color: #eff2f7;
  border-radius: 5px;
  border-bottom: 1px solid #c8d5ea;
  padding: 10px 15px 0;
  line-height: 1.8;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
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
.probability{
  position: absolute;
  left: 20px;
  color: #777;
}
.faulty-wrapper{
  font-weight: bold;
}
.sentence-search{
  .search-text{
    width:300px;
    margin-right:100px;
  }
  margin-bottom:20px;
}
</style>
