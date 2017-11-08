import {
  getDocHtmlSegment,
  fetchSentenceList,
  fetchSentenceQuadruple,
  fetchAllTags,
  pushSentenceStatus,
  AIAnaylse,
  fetchSentenceExample,
  fetchAutoDocSentence
} from '../api'
export default {
  state: {
    tags: [],
    list: [],
    pager: {
      total: 0,
      size: 50,
      page: 1
    },
    // 后端返回的数据
    sentence: {},
    // 更新后的数据
    updateSentence: {},
    // 前端传递的参数
    sentenceParams: {},
    // 返回的句子例子
    sentenceExample: [],
    // true表示为输入句子状态，false为展示句子结果状态
    sentenceState: true,
    // 文档攥写生成的句子列表
    autoDocSentenceList: []
  },
  mutations: {
    ['allSentences/set_sentences_list'](state, list) {
      state.list = list
    },
    ['allSentences/set_pager'](state, pager) {
      state.pager = pager
    },
    ['allSentences/set_tags'](state, tags) {
      state.tags = tags
    },
    ['allSentences/set_item_status'](state, { sentenceId, status }) {
      state.list.forEach((item) => {
        if (item.id === sentenceId) {
          if (status === 'approve') {
            item.status = 10
          } else {
            item.status = 20
          }
        }
      })
    },
    ['allSentences/set_item_reject_tags'](state, { sentenceId, rejectTags }) {
      state.list.forEach((item) => {
        if (item.id === sentenceId) {
          item.reject_tags = rejectTags
        }
      })
    },
    ['allSentences/set_tag_cur'](state, tagId) {
      state.tags.forEach((item) => {
        item.cur = false
        if (item.id === tagId) {
          item.cur = true
        }
      })
    },
    ['allSentences/clear_tag_cur'](state) {
      state.tags.forEach((item) => {
        item.cur = false
      })
    },
    ['allSentences/set_sentence_f_html'](state, { sentenceId, html }) {
      state.list.forEach((item) => {
        if (item.id === sentenceId) {
          item.f_html = html
        }
      })
    },
    ['allSentences/set_sentence_f_quadruples'](state, { sentenceId, quadruples }) {
      state.list.forEach((item) => {
        if (item.id === sentenceId) {
          item.f_quadruples = quadruples
        }
      })
    },
    ['allSentences/set_data_status'](state, { sentenceId, dataStatus }) {
      state.list.forEach((item) => {
        if (item.id === sentenceId) {
          item.data_status = dataStatus
        }
      })
    },
    // 下面是我的状态
    ['demo/AIAnalyse/get'](state, data) {
      state.sentence = state.updateSentence = data
    },
    ['demo/toggle/sentenceState'](state) {
      state.sentenceState = !state.sentenceState
    },
    ['demo/sentence/example/get'](state, data) {
      state.sentenceExample = data
    },
    ['demo/sentenceParams'](state, sentenceParams) {
      state.sentenceParams = sentenceParams
    },
    ['demo/sentence/update'](state, data) {
      state.updateSentence = data
    },
    ['demo/sentence/update/senteceParams'](state, data) {
      state.sentenceParams.source_text = data.updated_text
    },
    ['demo/autoDoc/sentence'](state, data) {
      setTimeout(_ => {
        state.autoDocSentenceList = data || []
      }, 800)
    },
    ['demo/autoDoc/clearSentence'](state) {
      state.autoDocSentenceList = []
    }
  },
  actions: {
    ['allSentences/fetch_list']({ commit, state }, { type, status }) {
      let promiseFetch = null
      let tagName = null

      state.tags.forEach((item) => {
        if (item.cur) {
          tagName = item.name
        }
      })
      if (tagName) {
        promiseFetch = fetchSentenceList(state.pager, type, status, tagName)
      } else {
        promiseFetch = fetchSentenceList(state.pager, type, status)
      }
      return promiseFetch.then(resp => {
        resp.data.items = resp.data.items.filter(item => {
          return item.source_text.trim() !== '' && item.text !== null
        })
        resp.data.items.forEach(item => {
          item.f_quadruples = []
          item.f_html = ''
        })

        commit('allSentences/set_sentences_list', resp.data.items)
        commit('allSentences/set_pager', {
          page: resp.data.page,
          size: state.pager.size,
          total: resp.data.total
        })
      })
    },
    ['allSentences/fetch_sentence_quadruple']({ commit, state }, sentenceId) {
      fetchSentenceQuadruple(sentenceId).then(resp => {
        commit('allSentences/set_sentence_f_quadruples', { sentenceId, quadruples: resp.data.items })
      })
    },
    ['allSentences/fetch_all_tags']({ commit, state }) {
      if (state.tags.length !== 0) {
        return
      }
      return fetchAllTags('sentence').then(resp => {
        resp.data.forEach(item => {
          item.cur = false
        })
        commit('allSentences/set_tags', resp.data)
      })
    },
    ['allSentences/push_sentence_revision_status']({ commit, state }, { sentenceId, action, rejectTags }) {
      if (action !== 'approve') {
        let tagsStr = rejectTags.map(item => {
          return item.name
        }).join(',')
        return pushSentenceStatus(sentenceId, action, tagsStr).then(resp => {
          commit('allSentences/set_item_status', { sentenceId, status: action })
          if (action !== 'approve') {
            commit('allSentences/set_item_reject_tags', { sentenceId, rejectTags })
          }
        })
      } else {
        return pushSentenceStatus(sentenceId, action).then(resp => {
          commit('allSentences/set_item_status', { sentenceId, status: action })
        })
      }
    },
    ['allSentences/fetch_sentence_f_html']({ commit, state }, { docId, sentenceId }) {
      let paragraphIndex = null
      state.list.forEach(item => {
        if (item.id === sentenceId) {
          paragraphIndex = item.paragraph_index
        }
      })
      return getDocHtmlSegment(docId, 'paragraph', paragraphIndex).then(resp => {
        commit('allSentences/set_sentence_f_html', { sentenceId, html: resp.data.html })
      })
    },
    async ['demo/AIAnalyse']({ commit }, sentence) {
      var data = await AIAnaylse(sentence)
      if (data.status === 'ok') {
        commit('demo/AIAnalyse/get', data.data)
        commit('demo/toggle/sentenceState')
        commit('demo/sentenceParams', sentence)
      }
    },
    async ['demo/sentence/example']({ commit }) {
      var data = await fetchSentenceExample()
      if (data.status === 'ok') {
        commit('demo/sentence/example/get', data.data)
      }
    },
    async ['demo/updateSentence']({ commit, state }, update) {
      var sentence = state.sentenceParams
      var params = {
        update,
        ...sentence
      }
      var data = await AIAnaylse(params)
      if (data.status === 'ok') {
        commit('demo/sentence/update', data.data)
        commit('demo/sentence/update/senteceParams', data.data)
      }
    },
    async ['demo/autoDoc']({ commit }, params) {
      var data = await fetchAutoDocSentence(params)
      if (data.status === 'ok') {
        commit('demo/autoDoc/sentence', data.data.items)
      }
      return data
    }
  },
  // 我的getters
  getters: {
    'getSentence': state => state.sentence,
    'getSentenceState': state => state.sentenceState,
    'getSentenceExample': state => state.sentenceExample,
    'getUpdateSentence': state => state.updateSentence,
    'getAutodocSentenceList': state => state.autoDocSentenceList
  }
}
