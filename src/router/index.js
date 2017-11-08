import Vue from 'vue'
import Router from 'vue-router'
import { getCookie } from '../util/tools'

import Auth from 'views/auth.vue'
import Index from 'views/index.vue'

import AllUploadFileList from 'views/upload-file-list-all.vue'
import NormalUploadFileList from 'views/upload-file-list.vue'

import FileDetail from 'views/file-detail/index.vue'
import FileTables from 'views/file-detail/file-tables.vue'

import AllShowComments from 'views/revision/all-show-comments.vue' // 未隐藏的冲突
import AllRejectItems from 'views/revision/all-reject-items.vue'
import AllAcceptItems from 'views/revision/all-accept-items.vue'
import AllFixedRejectItems from 'views/revision/all-fixed-reject-items.vue'

import AllSentences from 'views/sentence/all-sentences.vue'
import SentencesFactory from 'views/sentence/sentences-factory.vue' // 句子分流
import AllRejectSentences from 'views/sentence/all-reject-sentences.vue'
import SentenceSearch from 'views/sentence/sentence-search.vue'

import SentenceTool from 'views/sentence-tool.vue'
import DemoSentenceTool from 'views/demo/sentence-tool.vue'
import DemoSentenceUpdate from 'views/demo/sentence-update.vue'
import DemoSentenceAutodoc from 'views/demo/sentence-autodoc.vue'
import revisionQuadruples from 'views/revision-quadruples.vue'
import sentenceCauseResult from 'views/sentence-cause.vue'

import RevisionItems from 'views/revision-items.vue' // 表格视图的修订

Vue.use(Router)

const routes = [
  { path: '/', component: Index },
  { path: '/auth', component: Auth },

  { path: '/upload/file/list', component: NormalUploadFileList },
  { path: '/upload/file/list/all', component: AllUploadFileList },

  { path: '/file/detail/:id', component: FileDetail },
  { path: '/file/detail/table/:id', component: FileTables },
  { path: '/revision/items', component: RevisionItems },
  { path: '/file/detail/cr/:docId', component: sentenceCauseResult },

  { path: '/all/comments/show', component: AllShowComments },
  { path: '/all/comments/reject', component: AllRejectItems },
  { path: '/all/comments/accept', component: AllAcceptItems },
  { path: '/all/comments/reject/fixed', component: AllFixedRejectItems },

  { path: '/sentence/factory', component: SentencesFactory },
  { path: '/all/sentences', component: AllSentences },
  { path: '/all/sentences/reject', component: AllRejectSentences },
  { path: '/sentence/search', component: SentenceSearch },

  { path: '/sentence/tool', component: SentenceTool },
  { path: '/demo/sentence/tool', component: DemoSentenceTool },
  { path: '/demo/sentence/update', component: DemoSentenceUpdate },
  { path: '/demo/sentence/autodoc', component: DemoSentenceAutodoc },
  { path: '/sentence/quadruples/:docId/:sid', component: revisionQuadruples }
]

const router = new Router({
  mode: 'hash',
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path !== '/auth') {
    if (!(getCookie('user_id') && getCookie('user_sys'))) {
      next('/auth')
    } else {
      next()
    }
  } else {
    if (getCookie('user_id') && getCookie('user_sys')) {
      next('/')
    } else {
      next()
    }
  }
})

export default router
