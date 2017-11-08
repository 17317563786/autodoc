<template>
  <div class="demo-sentence-wrapper">
    <span v-for="(word, index) in sentence" :key="index" class="word" :class="{'time-bg': word.time, 'attribute-bg': word.attribute, 'preattributes-bg': word.preattributes, 'value-bg': word.value}">{{word.text}}</span>
  </div>
</template>
<script>
export default {
  name: 'demo-sentence',
  props: {
    sentence: {
      type: Array
    }
  }
}
</script>
<style lang="less">
.demo-sentence-wrapper {
  color: #1f2d3d;
  margin-bottom: 10px;
  font-size: 16px;
  box-sizing: border-box;
  height: 150px;
  overflow-y: scroll;
  box-shadow: 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12), 0 2px 4px -1px rgba(0, 0, 0, .2);
  background-color: #fff;
  padding: 10px 15px 0;
  line-height: 1.8;
  .time-bg {
    background-color: rgba(247, 186, 42, 0.8);
  }
  .attribute-bg {
    background-color: rgba(32, 160, 255, 0.8);
  }
  .preattributes-bg {
    background-color: rgba(19, 206, 102, 0.8);
  }
  .value-bg {
    background-color: rgba(255, 73, 73, 0.8);
  }
}
</style>