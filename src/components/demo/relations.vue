<template>
  <div class="relation-wrapper">
    <div v-if="relations.length">
      <div v-for="relation in relations" class="relation-item">
        <div class="el" v-for="el in relation">
          <div v-if="el.operator" class="formula-item operator">{{el.operator}}</div>
          <div v-else @mouseover="hoverTpav(el)" class="formula-item tpav">
            <div class="preat" v-for="pre in el.preattributes">
              [{{pre.preattributes ? pre.preattributes.value : ''}}]
            </div>
            <div class="attr inline">{{el.attribute ? el.attribute.value : ''}}</div>
            <div class="inline">
              <span v-if="el.time" class="time">{{el.time ? el.time.value : ''}}</span>
              <span v-if="el.value" class="value">{{el.value.value || el.value}}</span>
              <span v-else class="value">?</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-data">无</div>
  </div>
</template>
<script>
export default {
  name: 'demo-relations',
  props: {
    relations: {
      type: Array
    }
  },
  methods: {
    hoverTpav(item) {
      this.$emit('hoverTpav', item)
    }
  }
}
</script>
<style lang="less">
.relation-wrapper {
  overflow-x: auto;
  overflow-y: hidden;
  .relation-item {
    text-align: center;
    margin-bottom: 20px;
    padding: 5px 0;
    // box-sizing: border-box;
    white-space: nowrap;
    border-bottom: 1px dashed gray;
  }
  .tp {
    justify-content: center;
  }
  .operator {
    font-weight: 400;
    font-size: 32px;
  }
  .el {
    display: inline-block;
    vertical-align: middle;
  }
  .formula-item {
    margin: 0 6px;
  }
  .tpav {
    font-size: 14px;
    padding: 4px;
    background-color: #EFF2F7;
    border: 1px solid #C8D5EA;
    border-radius: 4px;
  }
  .time {
    color: #0ab572;
    margin-right: 10px;
    text-align: left;
  }
  .preat {
    color: #a315af;
    text-align: center;
  }
  .attr {
    color: #3c81b3;
  }
  .value {
    color: #e6063d;
    text-align: right;
  }
  .inline {
    margin: 3px 0;
    text-align: center;
    white-space: nowrap;
  }
}
</style>