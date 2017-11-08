<template>
  <div v-if="paragraph !== ''" ref="para" class="paragraph" v-html="taggingWordsForHTML(paragraph, markWord, indexInPara)"></div>
</template>
<script>
import { taggingWordsForHTML } from 'src/util/tools'

export default {
  name: 'relation-sentence-line-through',
  props: {
    paragraph: {
      type: String,
      require: true
    },
    indexInPara: {
      type: Number
    },
    markWord: {
      type: Object
    },
    lineThroughValue: {
      type: Object
    }
  },
  mounted () {
    this.replaceValue()
  },
  methods: {
    taggingWordsForHTML,
    replaceValue () {
      this.$nextTick(_ => {
        if (this.$refs.para) {
          this.$refs.para.innerHTML = this.$refs.para.innerHTML.replace(this.lineThroughValue.value, '<span class="line-through">' + this.lineThroughValue.value + '</span>')
        }
      })
    }
  },
  watch: {
    paragraph () {
      this.replaceValue()
    },
    markWord () {
      this.replaceValue()
    }
  }
}
</script>
<style>
.line-through{
  text-decoration: line-through;
  color: red;
}
</style>