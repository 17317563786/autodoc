<template>
  <div class="pumpbox">
    <div v-if="docDataPump&&docDataPump.length" :class="{effected:item.IsEffect}" :style="{textIndent:4*item.Level+'em'}" v-for="item in docDataPump">
      {{item.Title}}({{item.Start}},{{item.End}})
      <doc-data-pump  :docDataPump="item.SubTitles">
      </doc-data-pump>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'doc-data-pump',
    props: {
      docDataPump: {
        type: Array,
        required: true
      }
    }
  }
</script>
<style lang="less">

  .effected{
    background-color:#56f1d4;
  }


</style>