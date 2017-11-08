<template>
  <div class="sentence-show-wrapper">
    <sentence class="p10"
      :sentence="sentenceData.text"
      :quadruples="hoverQuadruples">
    </sentence>
    <div class="label-table">
      <div class="thead">
        <div class="thead-item time">时间</div>
        <div class="thead-item restrict">定语</div>
        <div class="thead-item attribute">属性</div>
        <div class="thead-item value">值</div>
      </div>
      <div class="tbody">
        <div v-if="sentenceData.quadruples.length > 0" v-for="(item, key) in sentenceData.quadruples" class="row" @mouseover="rowHover(item, 'no')" @mouseout="rowHover({})">
          <div v-if="item.time > 0" class="item">
            {{sentenceData.times[item.time].value}}
          </div>
          <div v-else class="item"> ? </div>

          <div class="item">
            <span v-for="restItem in item.preattributes">
              [{{sentenceData.preattributes[restItem].value}}]
            </span>
            <span v-if="item.preattributes.length === 0">-</span>
          </div>

          <div v-if="item.attribute > 0" class="item">
            {{sentenceData.attributes[item.attribute].value}}
          </div>
          <div v-else class="item"> ? </div>

          <div v-if="item.value > 0" class="item">
            {{sentenceData.values[item.value].value}}
          </div>
          <div v-else class="item">?</div>
        </div>
        <div v-if="sentenceData.quadruples.length === 0" class="no-data">
          无四元组
        </div>
      </div>
    </div>
    <!-- <relation-formula
      @hover-item="rowHover"
      :relations="sentenceData.relations_over_tuple"
      :quadruples="quadruples">
    </relation-formula> -->
  </div>
</template>
<script>
import sentence from './sentence'
import relationFormula from './relation-formula.vue'

export default {
  name: 'sentence-show',
  props: {
    sentenceData: {
      type: Object,
      required: true
    }
  },
  components: {
    sentence,
    relationFormula
  },
  data () {
    return {
      hoverQuadruples: {}
    }
  },
  computed: {
    quadruples () {
      if (JSON.stringify(this.sentenceData) === '{}') {
        return {}
      }
      return {
        attributes: this.sentenceData.attributes,
        preattributes: this.sentenceData.preattributes,
        times: this.sentenceData.times,
        values: this.sentenceData.values
      }
    }
  },
  methods: {
    rowHover(item, type) {
      /*
      type 为item中是否有四元组的原始数据
       */
      if (JSON.stringify(item) === '{}') {
        this.hoverQuadruples = {}
      } else {
        if (type === 'no') {
          let preattributes = item.preattributes.map(preAttr => {
            return this.sentenceData.preattributes[preAttr]
          })
          this.hoverQuadruples = {
            attribute: this.sentenceData.attributes[item.attribute],
            time: this.sentenceData.times[item.time],
            value: this.sentenceData.values[item.value],
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
<style lang="less">
.sentence-show-wrapper{
  .label-table {
    padding: 10px 0;
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
        background-color: #F7BA2A;
      }
      .restrict:after {
        content: "";
        display: block;
        width: 20px;
        height: 15px;
        position: absolute;
        top: 17px;
        right: 125px;
        background-color: #13CE66;
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
        .item {
          float: left;
          width: 25%;
          height: auto;
          position: relative;
          text-align: center;
        }
      }
    }
  }
}
</style>