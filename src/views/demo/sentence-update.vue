<template>
  <div class="demo-sentence-update">
    <transition :name="sentenceState ? 'slide-right' : 'slide-left'">
        <input-sentence v-if="sentenceState"></input-sentence>
        <update-sentence v-else></update-sentence>
    </transition>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import inputSentence from 'components/input-sentence'
import updateSentence from 'components/update-sentence'
export default {
  name: 'sentence-wrapper',
  components: {
    inputSentence,
    updateSentence
  },
  data() {
    return {
      // inputSentence: true
    }
  },
  computed: {
    ...mapGetters({
      sentenceState: 'getSentenceState'
    })
  }
}
</script>
<style lang="less">
.demo-sentence-update {
  height: 100%;
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: all .5s cubic-bezier(.55,0,.1,1);
  }
  .slide-left-enter,
  .slide-right-leave-to {
    opacity: 0;
    transform: translate(30px, 0);
  }

  .slide-left-leave-to,
  .slide-right-enter {
    opacity: 0;
    transform: translate(-30px, 0);
  }
}
</style>