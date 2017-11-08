// 单句分流
import {
  fetchSentenceRandom,
  getDocHtmlSegment,
  pushSentenceStatus,
  quadrupleMaker
} from '../api'
import _ from 'lodash/array'

const scope = 'sentenceFactory'
export default {
  state: {
    sentences: {
      proofread_hidden: {},
      duplicate: {},
      other_value: {},
      other_value_rate: {},
      no_match: {}
    }
  },
  mutations: {
    [scope + '/set_sentences'] (state, {sentence, type}) {
      state.sentences[type] = sentence
    },
    [scope + '/set_item_status'] (state, {sentenceId, status}) {
      Object.keys(state.sentences).forEach(name => {
        if (state.sentences[name].id === sentenceId) {
          if (status === 'approve') {
            state.sentences[name].status = 10
          } else {
            state.sentences[name].status = 20
          }
        }
      })
    },
    [scope + '/set_item_reject_tags'] (state, {sentenceId, rejectTags}) {
      Object.keys(state.sentences).forEach(name => {
        if (state.sentences[name].id === sentenceId) {
          state.sentences[name].reject_tags = rejectTags
        }
      })
    },
    [scope + '/set_sentence_f_html'] (state, {sentenceId, html}) {
      Object.keys(state.sentences).forEach(name => {
        if (state.sentences[name].id === sentenceId) {
          state.sentences[name].f_html = html
        }
      })
    },
    [scope + '/set_sentence_data'] (state, {sentenceId, data}) {
      Object.keys(state.sentences).forEach(name => {
        if (state.sentences[name].id === sentenceId) {
          state.sentences[name].data = data
        }
      })
    },
    [scope + '/set_data_status'] (state, {sentenceId, dataStatus}) {
      Object.keys(state.sentences).forEach(name => {
        if (state.sentences[name].id === sentenceId) {
          state.sentences[name].data_status = dataStatus
        }
      })
    }
  },
  actions: {
    [scope + '/fetch_sentence'] ({ commit, state }, {type, status}) {
      return fetchSentenceRandom(type, status).then(resp => {
        if (resp.data.items.length === 0) {
          return
        }
        resp.data.items = resp.data.items.filter(item => {
          return item.source_text.trim() !== '' && item.text !== null
        })
        resp.data.items.forEach(item => {
          item.f_html = ''
          item.data = {}
        })

        commit(scope + '/set_sentences', {
          type,
          sentence: resp.data.items[0]
        })
      })
    },
    [scope + '/fetch_sentence_f_html'] ({commit, state}, {docId, sentenceId}) {
      let paragraphIndex = null
      Object.keys(state.sentences).forEach(name => {
        if (state.sentences[name].id === sentenceId) {
          paragraphIndex = state.sentences[name].paragraph_index
        }
      })
      return getDocHtmlSegment(docId, 'paragraph', paragraphIndex).then(resp => {
        commit(scope + '/set_sentence_f_html', {sentenceId, html: resp.data.html})
      })
    },
    [scope + '/fetch_quadruples'] ({ commit, state }, { sentenceId, sentence, recentYear, recentMonth, reportPeriod }) {
      return quadrupleMaker(sentence, recentYear, recentMonth, reportPeriod).then(resp => {
        if (resp.data.attributes === null) resp.data.attributes = []
        if (resp.data.times === null) resp.data.times = []
        if (resp.data.values === null) resp.data.values = []
        if (resp.data.preattributes === null) resp.data.preattributes = []

        resp.data.quadruples.forEach(item => {
          if (item.preattributes === null) item.preattributes = []
        })
        resp.data.relations_over_tuple = _.uniqBy(resp.data.relations_over_tuple, 'index')
        let temp
        resp.data.relations_over_tuple.forEach(item => {
          if (item.operator === '--') {
            temp = item.left
            item.left = item.right
            item.right = temp
            item.operator = '-'
          }
          if (item.operator === '//') {
            temp = item.left
            item.left = item.right
            item.right = temp
            item.operator = '/'
          }
          if (item.operator === '~CGR') {
            temp = item.left
            item.left = item.right
            item.right = temp
            item.operator = 'CGR'
          }
        })
        commit(scope + '/set_sentence_data', {
          sentenceId,
          data: resp.data})
      })
    },
    [scope + '/push_sentence_revision_status'] ({commit, state}, {sentenceId, action, rejectTags}) {
      if (action !== 'approve') {
        let tagsStr = rejectTags.map(item => {
          return item.name
        }).join(',')
        return pushSentenceStatus(sentenceId, action, tagsStr).then(resp => {
          commit(scope + '/set_item_status', {sentenceId, status: action})
          if (action !== 'approve') {
            commit(scope + '/set_item_reject_tags', {sentenceId, rejectTags})
          }
        })
      } else {
        return pushSentenceStatus(sentenceId, action).then(resp => {
          commit(scope + '/set_item_status', {sentenceId, status: action})
        })
      }
    }
  }
}
