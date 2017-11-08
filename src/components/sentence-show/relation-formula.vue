<template>
  <div class="relaiton-show-wrapper">
    <div class="relaiton-item" v-for="item in relaitonsEnd">
      <relation-item :relations="relations" :quadruples="quadruples" :item="item" :operator="item.operator"></relation-item>
    </div>
    <div class="no-data" v-if="relaitonsEnd.length === 0">
      无关系
    </div>
  </div>
</template>
<script>
import relationItem from './relation-item.vue'

export default {
  name: 'relation-formula',
  components: {
    relationItem
  },
  props: {
    relations: {
      type: Array,
      required: true
    },
    quadruples: {
      type: Object,
      required: true
    }
  },
  computed: {
    relaitonsEnd () {
      return this.relations.filter(i => {
        return i.operator === '=' || i.operator === '≈' || i.operator === '>' || i.operator === '<' || i.operator === '>=' || i.operator === '<='
      })
    }
  },
  created () {
    this.$root.$on('relaiton-item-hover', (hoverData) => {
      this.$emit('hover-item', hoverData)
    })
  },
  beforeDestoroy () {
    this.$root.$off('relaiton-item-hover')
  }
}
</script>
<style lang="less">
.relaiton-show-wrapper {
  font-size: 16px;
  margin-bottom: 50px;
  .relaiton-item{
    margin: 0 0 30px 0;
    padding: 0 0 30px 0;
    text-align: center;
    border-bottom: 1px dashed gray;
  }
  .block{
    display: block;
    margin: 0 50px;
    text-align: center;
  }
  .inline-block{
    display: inline-block;
    vertical-align: middle;
  }
  .item {
    display: inline-block;
    vertical-align: middle;
    position: relative;
    &.rect{
      padding: 0px 10px 10px;
      width: 240px;
      text-align: center;
      background-color: #EFF2F7;
      border: 1px solid #C8D5EA;
    }
    &.op {
      margin-top: -8px;
      padding: 0 40px;
      width: 120px;
      text-align: center;
      font-size: 38px;
    }
    .time {
      color: #0AB572;
      font-size: 12px;
      font-weight: bold;
      position: absolute;
      bottom: 2px;
      left: 3px;
    }
    .preattribute {
      color: #A315AF;
      font-size: 12px;
      display: block;
    }
    .attribute {
      color: #3c81b3;
      display: block;
      margin: 2px 0 14px 0;
      font-weight: bold;
      font-size: 16px;
    }
    .value {
      color: #E6063D;
      font-size: 12px;
      font-weight: bold;
      position: absolute;
      bottom: 2px;
      right: 3px;
      &.no {
        position: relative;
        font-size: 16px;
        bottom: -2.5px;
        right: 0;
      }
    }
  }
  .line {
    margin: 10px 0;
    border-bottom: 1px solid #000;
  }
}

</style>