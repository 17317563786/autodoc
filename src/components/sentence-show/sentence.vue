<template>
  <div class="quadruples-sentence-container">
    <div class="sentence-text" v-html="sentenceText"></div>
  </div>
</template>
<script>
/*
 四元组+句子 展示组建
 传入参数: sentence & quadruples
 根据传入markWord，标黄句子中相应部分
 */
function isEmpty (obj) {
  if (obj === null || obj === '' || obj === 'undefined' || obj === 'null') {
    return true
  }
  if (obj.length > 0) return false
  if (obj.length === 0) return true
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false
  }
  return true
}
import taggingWordsForHTML from 'src/util/taggingWordsForHTML.js'
export default {
  name: 'quadruples-sentence',
  props: {
    sentence: {
      type: String,
      required: true
    },
    quadruples: {
      type: Object,
      required: true
    },
    taggingWord: {
      type: Array
    },
    indexInPara: {
      type: Number
    },
    updateComp: {
      type: Function
    }
  },
  computed: {
    sentenceText () {
      if (this.sentence !== '') {
        if (isEmpty(this.quadruples)) {
          return this.sentence
        }
        if (this.indexInPara !== undefined) {
          return taggingWordsForHTML(this.sentence, this.quadruples, this.indexInPara)
        } else {
          return taggingWordsForHTML(this.sentence, this.quadruples)
        }
      }
      return ''
    }
  },
  mounted() {
    this.updateComp()
  }
}
</script>
<style lang="less">
@keyframes tada {
  from {
    transform: scale3d(1, 1, 1);
  }

  10%, 20% {
    transform: scale3d(1.05, 1.05, 1.05) rotate3d(0, 0, 1, -3deg);
  }

  30%, 50%, 70%, 90% {
    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);
  }

  40%, 60%, 80% {
    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);
  }

  to {
    transform: scale3d(1, 1, 1);
  }
}
.quadruples-sentence-container{
  position: relative;
  overflow: hidden;
  .sentence-text .red {
    display: none;
  }
}
.bg-red{
  background-color: #FF4949;
  .line-through{
    display: inline-block;
    background-color: #fff;
    animation: tada 1s;
  }
}
.bg-blue{
  background-color: #20A0FF;
}
.bg-yellow{
  background-color: #F7BA2A;
}
.bg-green{
  background-color: #13CE66;
}

</style>
