import Vue from 'vue'
import Vuex from 'vuex'

import userInfo from './user-info'
import fileDetail from './file-detail/index'

import uploadFileList from './upload-file-list'
import uploadFileListAll from './upload-file-list-all'

import allShowComments from './revision/all-show-comments'
import allRejectItems from './revision/all-reject-items'
import allAcceptItems from './revision/all-accept-items'
import allFixedRejectItems from './revision/all-fixed-reject-items'

import sentenceFactory from './sentence/sentence-factory'
import allSentences from './sentence/all-sentences'
import sentenceTool from './sentence/sentence-tool'

// 根据table的row和column拿到的revisionItems存放store
import revisionItems from './revision-items'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    userInfo,
    uploadFileList,
    uploadFileListAll,
    fileDetail,
    allShowComments,
    allSentences,
    sentenceFactory,
    sentenceTool,
    revisionItems,

    allRejectItems,
    allAcceptItems,
    allFixedRejectItems
  }
})
