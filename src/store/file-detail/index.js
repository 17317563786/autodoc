import faultyRevisionFactory from './faulty-revision'
import tupleRevisionFactory from './tuple-revision'
import relaitonRevisionFactory from './relation-revision'
import otherValueRevisionFactory from './other-value'

import {
  pushProofreadResult,
  docRevisionFinish,
  pushDocProofreadResult,
  pushHideCommentByType,
  pushUserChoice
} from '../api.js'

const name = 'fileDetail'

let faulty = faultyRevisionFactory(name)
let tuple = tupleRevisionFactory(name)
let relation = relaitonRevisionFactory(name)
let otherValue = otherValueRevisionFactory(name)

export default {
  state: {
    owner: '',

    faultyItemList: [],
    tupleItemList: [],
    relationItemList: [],

    activeCollapseName: '', // relation
    formulaCurrentItem: {} // relation
  },
  mutations: {
    [name + '/set_doc_owner'] (state, username) {
      state.owner = username
    },
    [name + '/set_active_collapse'] (state, name) {
      // relation中处于打开状态的修订条目
      state.activeCollapseName = name
    },
    [name + '/set_item_proofread_result'] (state, {type, revisionItemId, result}) {
      let targetList
      if (type === 'faulty') {
        targetList = state.faultyItemList
      } else if (type === 'tuple') {
        targetList = state.tupleItemList
      } else if (type === 'relation') {
        targetList = state.relationItemList
      } else if (type === 'other_value') {
        // other_value与tuple共用一个数组
        targetList = state.tupleItemList
      }
      targetList.forEach((item) => {
        if (item.id === revisionItemId) {
          item.internal_status = result
        }
      })
    },
    [name + '/set_item_user_choice'] (state, {type, revisionItemId, option}) {
      let targetList
      if (type === 'faulty') {
        targetList = state.faultyItemList
      } else if (type === 'tuple') {
        targetList = state.tupleItemList
      } else if (type === 'relation') {
        targetList = state.relationItemList
      } else if (type === 'other_value') {
        // other_value与tuple共用一个数组
        targetList = state.tupleItemList
      }
      targetList.forEach((item) => {
        if (item.id === revisionItemId) {
          item.user_choice = option
        }
      })
    },
    ...faulty.mutations,
    ...tuple.mutations,
    ...relation.mutations,
    ...otherValue.mutations
  },
  actions: {
    [name + '/push_item_user_choice'] ({ commit, state }, { type, revisionItemId, option }) {
      return new Promise((resolve, reject) => {
        pushUserChoice(revisionItemId, option).then((resp) => {
          resolve(resp)
          window.VueFetchEventBus.$notify.success({
            title: '成功',
            message: '修订数据已记录'
          })
          commit(name + '/set_item_user_choice', { type, revisionItemId, option })
        }).catch((err) => {
          reject(err)
          console.log(err)
        })
      })
    },
    [name + '/push_item_proofread_result'] ({ commit, state }, { type, revisionItemId, result }) {
      return new Promise((resolve, reject) => {
        pushProofreadResult(revisionItemId, result).then((resp) => {
          resolve(resp)
          window.VueFetchEventBus.$notify.success({
            title: '成功',
            message: '操作已成功'
          })
          commit(name + '/set_item_proofread_result', { type, revisionItemId, result })
        }).catch((err) => {
          reject(err)
          console.error(err)
        })
      })
    },
    [name + '/doc_revision_finish'] ({ commit, state }, { docId }) {
      return new Promise((resolve, reject) => {
        docRevisionFinish(docId).then((resp) => {
          resolve(resp)
          window.VueFetchEventBus.$notify.success({
            title: '成功',
            message: '修订已完成'
          })
        }).catch((err) => {
          reject(err)
          console.log(err)
        })
      })
    },
    [name + '/doc_proofread_finish'] ({ commit, state }, { docId }) {
      return new Promise((resolve, reject) => {
        pushDocProofreadResult(docId, 'finish').then((resp) => {
          resolve(resp)
          window.VueFetchEventBus.$notify.success({
            title: '成功',
            message: '预审已完成'
          })
        }).catch((err) => {
          reject(err)
          console.log(err)
        })
      })
    },
    [name + '/doc_proofread_reject'] ({ commit, state }, { docId }) {
      return new Promise((resolve, reject) => {
        pushDocProofreadResult(docId, 'reject').then((resp) => {
          resolve(resp)
          window.VueFetchEventBus.$notify.success({
            title: '成功',
            message: '预审已拒绝'
          })
        }).catch((err) => {
          reject(err)
          console.log(err)
        })
      })
    },
    [name + '/push_all_proofread_result'] ({ commit, state }, { docId, action, type, contentType }) {
      return pushHideCommentByType(docId, action, type, contentType).then(resp => {
        let itemList
        if (contentType === 'quadruple') {
          itemList = state.tupleItemList
        }
        if (contentType === 'relation') {
          itemList = state.relationItemList
        }
        itemList.forEach((item) => {
          if (item.type === type) {
            if (action === 'hide') {
              item.internal_status = 1
            }
            if (action === 'show') {
              item.internal_status = 0
            }
          }
        })
        return resp
      })
    },
    ...faulty.actions,
    ...tuple.actions,
    ...relation.actions,
    ...otherValue.actions
  }
}
