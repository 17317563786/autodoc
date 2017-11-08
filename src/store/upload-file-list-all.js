import {
  fetchDocList,
  confirmDate,
  delDocById,
  searchDocList,
  reAnalysiseDoc,
  restartAnalysisForRef,
  logoDocQualityById
} from './api.js'

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
    listOrderBy: 'id',
    listDesc: 1,
    pager: {
      total: 0,
      size: 15,
      page: 1
    }
  },
  mutations: {
    ['uploadFileListAll/set_doc_list'] (state, list) {
      // 为点击重新分析相关效果给每个数据加一个属性isRwstart
      list.forEach(function(item) {
        item.isRestart = false
      })
      state.list = list
    },
    ['uploadFileListAll/set_pager'] (state, pager) {
      state.pager = pager
    },
    ['uploadFileListAll/set_listOrderBy'] (state, orderBy) {
      state.listOrderBy = orderBy
    },
    ['uploadFileListAll/set_listDesc'] (state, desc) {
      state.listDesc = desc
    },
    ['uploadFileListAll/set_item_recent_year'] (state, { docId, recentYear }) {
      state.list.forEach((item) => {
        if (item.id === docId) {
          item.last_year = recentYear
        }
      })
    },
    ['uploadFileListAll/set_item_recent_month'] (state, { docId, recentMonth }) {
      state.list.forEach((item) => {
        if (item.id === docId) {
          item.last_month = recentMonth
        }
      })
    },
    ['uploadFileListAll/set_item_status'] (state, { docId, itemStatus }) {
      state.list.forEach((item) => {
        if (item.id === docId) {
          item.status = itemStatus
        }
      })
    },
    ['uploadFileListAll/add_new_item'] (state, item) {
      state.list.unshift(item)
    },
    ['uploadFileListAll/del_item'] (state, docId) {
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
    ['uploadFileListAll/fetch_doc_list'] ({ commit, state }) {
      return fetchDocList(state.pager.page, state.pager.size, state.listOrderBy, state.listDesc).then((resp) => {
        commit('uploadFileListAll/set_doc_list', resp.data.items)
        commit('uploadFileListAll/set_pager', {
          page: state.pager.page,
          size: state.pager.size,
          total: resp.data.total
        })
      })
    },
    ['uploadFileListAll/search_doc_list'] ({ commit, state }, { searchType, value }) {
      return searchDocList(state.pager.page, state.pager.size, state.listOrderBy, state.listDesc, searchType, value).then((resp) => {
        commit('uploadFileListAll/set_doc_list', resp.data.items)
        commit('uploadFileListAll/set_pager', {
          page: state.pager.page,
          size: state.pager.size,
          total: resp.data.total
        })
      })
    },
    ['uploadFileListAll/push_recent_date'] ({ commit, state }, { id, year, month, period, reversePeriod }) {
      return new Promise((resolve, reject) => {
        confirmDate(id, year, month, period, reversePeriod).then((resp) => {
          resolve(resp)
          commit('uploadFileListAll/set_item_recent_year', {
            docId: id,
            recentYear: year
          })
          commit('uploadFileListAll/set_item_recent_month', {
            docId: id,
            recentMonth: month
          })
        }).catch((err) => {
          reject(err)
          console.log(err)
        })
      })
    },
    ['uploadFileListAll/del_doc_by_id'] ({ commit, state }, { docId }) {
      return delDocById(docId).then((resp) => {
        commit('uploadFileListAll/del_item', docId)
      })
    },
    ['uploadFileListAll/restart_doc_by_id'] ({ commit, state }, { docId }) {
      return reAnalysiseDoc(docId)
    },
    ['uploadFileListAll/restart_doc_for_ref'] ({ commit, state }, { docId, year, month, period, reversePeriod }) {
      return restartAnalysisForRef(docId, year, month, period, reversePeriod)
    },
    ['uploadFileListAll/logo_doc_quality_by_id'] ({ commit, state }, { docId, quality }) {
      return logoDocQualityById(docId, quality)
    }
  }
}
