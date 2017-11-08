<template>
  <div v-if="faultyList.length <= 0" class="empty-comments">文档中未发现错别字～</div>
  <div v-else class="file-detail-faulty">
    <faulty-items
      storeName="fileDetail"
      :proofread="proofread"
      :readonly="readonly"
      :faulties="faultyListClassification"
      :initialCollapse="activeCollapse">
    </faulty-items>
  </div>
</template>
<script>
import faultyItems from 'components/faulty-items.vue'

export default {
  name: 'file-detail-faulty',
  components: {
    faultyItems
  },
  computed: {
    proofread () {
      return this.$route.query.type === 'proofread'
    },
    readonly () {
      return this.$route.query.type === 'readonly'
    },
    activeCollapse () {
      return this.$route.query.collapse || ''
    },
    faultyList () {
      return this.$store.state.fileDetail.faultyItemList
    },
    faultyListClassification () {
      let list = {}
      this.$store.state.fileDetail.faultyItemList.forEach(faultyItem => {
        if (list[faultyItem.faulty_wording.tips]) {
          list[faultyItem.faulty_wording.tips].push(faultyItem)
        } else {
          list[faultyItem.faulty_wording.tips] = [faultyItem]
        }
      })
      return list
    }
  }
}
</script>
