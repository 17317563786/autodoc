import Vue from 'vue'
import { fetchDocList, confirmDate, delDocById, reAnalysiseDoc } from './api.js'

// list_item字段如下
// {
// created_utc : 1485072901
// filename : "demo123.docx"
// id : 36
// status : 30 // status 60为已完成
// updated_utc : 1485072921
// user_id : 0
// last_year: 2012
// last_month: 9
// }
/* eslint-disable no-useless-computed-key */
export default {
  state: {
    list: [],
    pager: {
      total: 0,
      size: 15,
      page: 1
    }
  },
  mutations: {
    ['uploadFileList/set_doc_list'] (state, list) {
      list.forEach(function(item) {
        item.isRestart = false
      })
      state.list = list
    },
    ['uploadFileList/set_pager'] (state, pager) {
      Vue.set(state, 'pager', pager)
    },
    ['uploadFileList/set_item_recent_year'] (state, { docId, recentYear }) {
      state.list.forEach((item) => {
        if (item.id === docId) {
          item.last_year = recentYear
        }
      })
    },
    ['uploadFileList/set_item_recent_month'] (state, { docId, recentMonth }) {
      state.list.forEach((item) => {
        if (item.id === docId) {
          item.last_month = recentMonth
        }
      })
    },
    ['uploadFileList/set_item_status'] (state, { docId, itemStatus }) {
      state.list.forEach((item) => {
        if (item.id === docId) {
          item.status = itemStatus
        }
      })
    },
    ['uploadFileList/add_new_item'] (state, item) {
      state.list.unshift(item)
    },
    ['uploadFileList/del_item'] (state, docId) {
      let tempIndex = 0
      state.list.forEach((item, index) => {
        if (item.id === docId) {
          tempIndex = index
        }
      })
      state.list.splice(tempIndex, 1)
    }
  },
  actions: {
    ['uploadFileList/fetch_doc_list'] ({ commit, state }) {
      return fetchDocList(state.pager.page, state.pager.size).then((resp) => {
        commit('uploadFileList/set_doc_list', resp.data.items)
        commit('uploadFileList/set_pager', {
          page: state.pager.page,
          size: state.pager.size,
          total: resp.data.total
        })
      })
    },
    ['uploadFileList/push_recent_date'] ({ commit, state }, { id, year, month, period }) {
      return new Promise((resolve, reject) => {
        confirmDate(id, year, month, period).then((resp) => {
          resolve(resp)
          commit('uploadFileList/set_item_recent_year', {
            docId: id,
            recentYear: year
          })
          commit('uploadFileList/set_item_recent_month', {
            docId: id,
            recentMonth: month
          })
        }).catch((err) => {
          reject(err)
          console.log(err)
        })
      })
    },
    ['uploadFileList/del_doc_by_id'] ({ commit, state }, { docId }) {
      return delDocById(docId).then((resp) => {
        commit('uploadFileList/del_item', docId)
      })
    },
    ['uploadFileList/restart_doc_by_id'] ({ commit, state }, { docId }) {
      return reAnalysiseDoc(docId)
    }
  }
}
