<template>
  <div class="update-sentence-wrapper">
    <div class="left">
      <sentence-result v-model="activeTab" :resultData="sentenceData">
        <div class="arrow arrow-bottom"><img src="~src/assets/img/arrow.png"/></div>
      </sentence-result>
    </div>
    <div class="center">
      <div class="back-to-input"><el-button @click="backToInput" type="info">再试一句</el-button></div>
      <div>
        <div class="arrow arrow-right"><img src="~src/assets/img/arrow.png"/></div>
      </div>
    </div>
    <div class="right">
      <sentence-result v-model="activeTab" :resultData="updateSentence" :editQuadruples="true">
        <div class="arrow arrow-top"><img src="~src/assets/img/arrow.png"/></div>
      </sentence-result>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import sentenceResult from 'components/demo/sentence-result'
export default {
  name: 'update-sentence',
  components: {
    sentenceResult
  },
  data() {
    return {
      activeTab: 'table'
    }
  },
  computed: {
    ...mapGetters({
      sentenceData: 'getSentence',
      updateSentence: 'getUpdateSentence'
    })
  },
  methods: {
    backToInput() {
      this.$store.commit('demo/toggle/sentenceState')
    }
  }
}
</script>
<style lang="less">
.update-sentence-wrapper {
  margin: 0 20px;
  height: 100%;
  display: flex;
  .left, .right {
    width: 45%;
    height: 100%;
  }
  .center {
    flex: 1;
    text-align: center;
  }
  .back-to-input {
    margin-top: 20px;
  }
  .arrow {
    text-align: center;
    height: 50px;
    box-sizing: border-box;
  }
  .arrow-bottom {
    transform: rotate(180deg);
  }
  .arrow-right {
    margin-top: 200px;
    transform: rotate(90deg);
  }
}
</style>