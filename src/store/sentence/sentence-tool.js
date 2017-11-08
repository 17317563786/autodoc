import { quadrupleMaker, fetchSentenceRelationById, fetchSentenceQuadrupleById } from '../api'
import _ from 'lodash/array'

export default {
  state: {
    data: {}
  },
  mutations: {
    ['sentenceTool/set_data'] (state, data) {
      state.data = data
    },
    ['sentenceTool/clear_back_data'](state, data) {
      state.data = {}
    }
  },
  actions: {
    ['sentenceTool/fetch_quadruples'] ({ commit, state }, { sentence, recentYear, recentMonth, reportPeriod }) {
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
        commit('sentenceTool/set_data', resp.data)
      })
    },
    ['sentenceTool/fetch_detail_by_id'] ({ commit, state }, { docId, sid }) {
      let respFinal = ''
      return fetchSentenceRelationById(docId, sid).then(resp => {
        respFinal = resp
        if (resp.data.attributes === null) resp.data.attributes = []
        if (resp.data.times === null) resp.data.times = []
        if (resp.data.values === null) resp.data.values = []
        if (resp.data.preattributes === null) resp.data.preattributes = []

        resp.data.quadruples || (resp.data.quadruples = [])
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
        fetchSentenceQuadrupleById(docId, sid).then(res => {
          res.data.items = res.data.items || []
          respFinal.data['quadruples'] = JSON.parse(JSON.stringify(res.data.items))
          commit('sentenceTool/set_data', respFinal.data)
        })
      })
    }
  }
}
