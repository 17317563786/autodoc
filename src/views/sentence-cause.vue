<template>
    <div>
      <div class="container" v-if="!loading">
        <div class="cr-tool-show">
          <div class="cr-tool-wrapper">
            <span>原因</span><span class="cr-cause"></span>
            <span>结果</span><span class="cr-result"></span>
            <el-tabs class="cr-tabShift" v-model="activeTabName" @tab-click="_handleClick">
              <el-tab-pane label="财务相关" name="valuable" style="{width: 100%; height: auto}">
              </el-tab-pane>
              <el-tab-pane label="其他" name="others">
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
        <el-row :gutter="20">
          <el-col :span="18" :offset="3"><div class="grid-content bg-purple">
            <el-collapse v-if="!emptyFlag" class="cr-list" id='cr-list' v-model="activeName" accordion>
              <el-collapse-item v-for="(item, index) in currentrItems" :data-sid="item.sid" :name="index">
                <template slot="title">
                  <span v-html="_addTupleColor(item.text, item.causality_segments, item.sid)"></span><i class="header-icon"></i>
                </template>
                <div class="cr-text"><span>文本：{{item.text}}</span></div>
                <div @mouseenter="_hoverRelationColor(segment.position, $event)"  @mouseout="_hoverOutRelationColor" v-for="segment in item.causality_segments" :class="[ segment.segment_type && segment.segment_type !== 'NONE' ? segment.segment_type : '']">{{segment.segment_text}}</div>
              </el-collapse-item>
            </el-collapse>
            <div v-else style="{text-align: center; margin-top: 60px;}">
                  暂无相关数据
            </div>
          </div></el-col>
        </el-row>
      </div>
      <el-table
        v-if="loading"
        v-loading.body="loading"
        style="width: 100%">
      </el-table>
    </div>
</template>

<script>
  import { fetchCauseRelation } from '../store/api'
  export default {
    name: 'mark-answer',
    data() {
      return {
        text: '',
        type: 'R',
        segments: [],
        items: [],
        currentrItems: [],
        ActiveC: false,
        ActiveR: false,
        ActiveNONE: false,
        activeName: '1',
        loading: true,
        mapId: [],
        activeTabName: 'valuable',
        emptyFlag: false
      }
    },
    props: {},
    computed: {
      classObject: function (type) {
        return {
          [type]: true
        }
      }
    },
    methods: {
      _hoverRelationColor(position, e) {
        let eleContent = e.target.innerHTML
        let tarEle = e.target.parentNode.getElementsByClassName('cr-text')[0]
        let className = e.target.className
        let color = className === 'C' ? '#5da0ff' : (className === 'R' ? 'red' : '#000')
        let reg = new RegExp(eleContent, 'g')
        tarEle.innerHTML = tarEle.innerHTML.replace(reg, function($0, posi) {
          return posi === (position + 3) ? `<span style="color: ${color}">${$0}</span>` : $0
        })
      },
      _hoverOutRelationColor(e) {
        let tarEle = e.target.parentNode.getElementsByClassName('cr-text')[0]
        tarEle.innerHTML = tarEle.innerText
      },
      _addTupleColor(text, segemnts, index) {
        let segmentsTmp = JSON.parse(JSON.stringify(segemnts)).reverse()
        segmentsTmp.forEach((segment) => {
          let color = segment.segment_type === 'C' ? '#5da0ff' : (segment.segment_type === 'R' ? 'red' : '#000')
          let reg = new RegExp(segment.segment_text, 'g')
          text = text.replace(reg, function($0, posi) {
            return posi === segment.position ? `<span style="color: ${color}">${$0}</span>` : $0
          })
        })
        return text
      },
      _handleClick(tab, event) {
        this.currentrItems = this.items.filter((item) => {
          return item.type === tab.name
        })
        this.emptyFlag = this.currentrItems.length === 0
      }
    },
    created() {
      let docId = this.$route.params.docId
      if (this.$route.params.docId) {
        fetchCauseRelation(docId).then(resp => {
          if (resp.data) {
            this.items = JSON.parse(JSON.stringify(resp.data.items))
            this.currentrItems = this.items.filter((item) => {
              return item.type === this.activeTabName
            })
            if (this.currentrItems.length === 0) {
              this.activeTabName = 'others'
              this.currentrItems = this.items
            }
            this.loading = false
          }
        })
      }
    },
    watch: {}
  }
  </script>
<style lang="less">
  .cr-tabShift{
    position: fixed;
    top: 0;
    left: 12.5%;
    z-index:5;
    background: #fff;
  }
  .cr-tool-show{
    position: fixed;
    top: 0px;
    left: 0;
    z-index: 9999;
    padding: 10px 30%;
    width: 100%;
    background: #fff;
    span{
      display:inline-block;
      vertical-align: top;
      width: 48px;
      height: 30px;
      line-height: 30px;
      &.cr-cause{
        margin-right:40px;
        background: #5da0ff;
      }
      &.cr-result{
        margin-right:40px;
        background: red;
      }
    }
  }
  .cr-list{
    margin: 60px 0;
    .el-collapse-item__header{
      width: 100%;
      height: auto;
      color: #333;
    }
    .C{
      color: #5da0ff;
    }
    .R{
      color: red;
    }
    .NONE{
      color: #ccc;
    }
  }
</style>

