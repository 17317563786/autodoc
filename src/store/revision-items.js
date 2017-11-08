// 通过表格视图点击单元格定，找到的revisionItems
import { fetchTabelsRevisionItems, pushUserChoice, pushDocProofreadResult, pushProofreadResult, getDocHtmlSegment, confirmItemRevisionStatus, docRevisionFinish, revisionItemAddTag } from './api.js'
import { taggingWordsForHTML, taggingWordsForHTMLTable } from '../util/tools.js'
/* eslint-disable no-useless-computed-key */
let name = 'revisionItems'
export default {
  state: {
    list: []
  },
  mutations: {
    [name + '/set_list'] (state, list) {
      state.list = list
    },
    [name + '/set_item_f_html_paragraph'] (state, {revisionItemId, html}) {
      state.list.forEach((item) => {
        if (item.id === revisionItemId) {
          if (item.txt_triples === null) {
            item.f_html_paragraph = taggingWordsForHTML(html, item.txt_value, item.index_in_para)
          } else {
            item.f_html_paragraph = taggingWordsForHTML(html, item.txt_triples, item.index_in_para)
          }
        }
      })
    },
    [name + '/set_item_f_dup_html_paragraph'] (state, {revisionItemId, dupParaIndex, html}) {
      state.list.forEach((item) => {
        if (item.id === revisionItemId) {
          item.duplicate_sentences.forEach((dupParaItem, index) => {
            if (dupParaItem.paragraph_index === dupParaIndex) {
              dupParaItem.f_dup_html_paragraph = taggingWordsForHTML(html, item.dup_txt_triples[index], dupParaItem.index_in_paragraph)
            }
          })
        }
      })
    },
    [name + '/set_item_f_matched_html_paragraph'] (state, {revisionItemId, matchedParaIndex, html}) {
      state.list.forEach((item) => {
        if (item.id === revisionItemId) {
          item.matched_sentences.forEach((dupParaItem, index) => {
            if (dupParaItem.paragraph_index === matchedParaIndex) {
              dupParaItem.f_matched_html_paragraph = taggingWordsForHTML(html, item.matched_txt_triples[index], dupParaItem.index_in_paragraph)
            }
          })
        }
      })
    },
    [name + '/set_item_f_html_table'] (state, {revisionItemId, tableIndex, html}) {
      if (html === '' || html === null) return
      state.list.forEach((item) => {
        if (item.id === revisionItemId) {
          item.table_triples.forEach((tableItem) => {
            if (tableItem.table_index === tableIndex) {
              tableItem.f_html_table = taggingWordsForHTMLTable(html, tableItem.row, tableItem.column)
            }
          })
        }
      })
    },
    [name + '/set_item_status'] (state, {revisionItemId, status}) {
      state.list.forEach((item) => {
        if (item.id === revisionItemId) {
          if (status === 'approve') {
            item.status = 10
          } else {
            item.status = 20
          }
        }
      })
    },
    [name + '/set_item_user_choice'] (state, {revisionItemId, option}) {
      state.list.forEach((item) => {
        if (item.id === revisionItemId) {
          if (option === 'comment') {
            item.user_choice = 1
          } else {
            item.user_choice = -1
          }
        }
      })
    },
    [name + '/set_item_reject_tags'] (state, {revisionItemId, rejectTags}) {
      state.list.forEach((item) => {
        if (item.id === revisionItemId) {
          item.reject_tags = rejectTags
        }
      })
    },
    [name + '/set_item_proofread_result'] (state, {revisionItemId, result}) {
      state.list.forEach((item) => {
        if (item.id === revisionItemId) {
          item.internal_status = result
        }
      })
    },
    [name + '/del_revision_item'] (state, {revisionItemId}) {
      let targetIndex = null
      state.list.forEach((item, index) => {
        if (item.id === revisionItemId) {
          targetIndex = index
        }
      })
      state.list.splice(targetIndex, 1)
    },
    [name + '/set_item_feedback_status'] (state, {revisionItemId, status}) {
      state.list.forEach((item, index) => {
        if (item.id === revisionItemId) {
          item.data_status = status
        }
      })
    }
  },
  actions: {
    [name + '/fetch_revision_list'] ({ commit, state }, { docId, tableInfo }) {
      return fetchTabelsRevisionItems(docId, tableInfo).then((resp) => {
        resp.data.items.forEach((item) => {
          // 先检查空数组
          if (item.table_triples === null) {
            item.table_triples = []
          }
          if (item.dup_txt_triples === null) {
            item.dup_txt_triples = []
          }
          if (item.matched_para_indices === null) {
            item.matched_para_indices = []
          }
          // 再添加前端字段
          item.f_html_paragraph = ''
          item.table_triples.forEach((tableItem) => {
            tableItem.f_html_table = ''
          })
          item.duplicate_sentences.forEach((item) => {
            item.f_dup_html_paragraph = ''
          })
          item.matched_sentences.forEach((item) => {
            item.f_matched_html_paragraph = ''
          })
          // 兼容老数据
          if (item.duplicate_sentences.length !== item.dup_para_indices.length) {
            item.duplicate_sentences = item.dup_para_indices.map((item) => {
              return {
                paragraph_index: item,
                f_dup_html_paragraph: ''
              }
            })
          }
          if (item.matched_sentences.length !== item.matched_para_indices.length) {
            item.matched_sentences = item.matched_para_indices.map((item) => {
              return {
                paragraph_index: item,
                f_matched_html_paragraph: ''
              }
            })
          }
        })
        commit(name + '/set_list', resp.data.items)
        return resp
      })
    },
    [name + '/fetch_item_html_segment'] ({ commit, state }, { docId, revisionItemId }) {
      let promiseArr = []
      let typeArr = []
      return new Promise((resolve, reject) => {
        state.list.forEach((item) => {
          if (item.id === revisionItemId) {
            if (item.f_html_paragraph === '') {
              promiseArr.push(getDocHtmlSegment(docId, 'paragraph', item.para_index))
              typeArr.push({type: 'paragraph'})
            }
            item.table_triples.forEach((tableItem, index) => {
              if (tableItem.f_html_table === '') {
                if (!~typeArr.map(i => i.index).indexOf(tableItem.table_index)) {
                  promiseArr.push(getDocHtmlSegment(docId, 'table', tableItem.table_index))
                  typeArr.push({type: 'table', index: tableItem.table_index})
                }
              }
            })
            item.duplicate_sentences.forEach((dupParaItem) => {
              if (dupParaItem.f_dup_html_paragraph === '') {
                promiseArr.push(getDocHtmlSegment(docId, 'paragraph', dupParaItem.paragraph_index))
                typeArr.push({type: 'dup_paragraph', index: dupParaItem.paragraph_index})
              }
            })
            item.matched_sentences.forEach((matchedParaItem) => {
              if (matchedParaItem.f_matched_html_paragraph === '') {
                promiseArr.push(getDocHtmlSegment(docId, 'paragraph', matchedParaItem.paragraph_index))
                typeArr.push({type: 'matched_paragraph', index: matchedParaItem.paragraph_index})
              }
            })
          }
        })

        Promise.all(promiseArr).then((result) => {
          result.forEach((item, index) => {
            if (item.data.html !== '' && item.data.html !== null) {
              if (typeArr[index].type === 'paragraph') {
                commit(name + '/set_item_f_html_paragraph', {
                  revisionItemId,
                  html: item.data.html
                })
              } else if (typeArr[index].type === 'table') {
                commit(name + '/set_item_f_html_table', {
                  revisionItemId,
                  tableIndex: typeArr[index].index,
                  html: item.data.html
                })
              } else if (typeArr[index].type === 'dup_paragraph') {
                commit(name + '/set_item_f_dup_html_paragraph', {
                  revisionItemId,
                  dupParaIndex: typeArr[index].index,
                  html: item.data.html
                })
              } else if (typeArr[index].type === 'matched_paragraph') {
                commit(name + '/set_item_f_matched_html_paragraph', {
                  revisionItemId,
                  matchedParaIndex: typeArr[index].index,
                  html: item.data.html
                })
              }
            } else {
              window.VueFetchEventBus.$notify.warning({
                title: '错误',
                message: '返回段落或表格html为空'
              })
            }
          })
          resolve({status: true})
        }).catch((err) => {
          reject(err)
          window.VueFetchEventBus.$notify.warning({
            title: '错误',
            message: err.message
          })
          console.error(err)
        })
      })
    },
    [name + '/push_item_revision_status'] ({ commit, state }, { revisionItemId, status, rejectTags }) {
      return new Promise((resolve, reject) => {
        let rejectTagsArr = []
        if (rejectTags) {
          rejectTagsArr = rejectTags.map(item => item.name)
        }
        confirmItemRevisionStatus(revisionItemId, status, rejectTagsArr.join(',')).then((resp) => {
          resolve(resp)
          window.VueFetchEventBus.$notify.success({
            title: '成功',
            message: '修订数据已记录'
          })
          commit(name + '/set_item_status', { revisionItemId, status })
          if (rejectTags) {
            commit(name + '/set_item_reject_tags', { revisionItemId, rejectTags })
          }
        }).catch((err) => {
          reject(err)
          console.log(err)
        })
      })
    },
    [name + '/push_item_user_choice'] ({ commit, state }, { revisionItemId, option }) {
      return new Promise((resolve, reject) => {
        pushUserChoice(revisionItemId, option).then((resp) => {
          resolve(resp)
          window.VueFetchEventBus.$notify.success({
            title: '成功',
            message: '修订数据已记录'
          })
          commit(name + '/set_item_user_choice', { revisionItemId, option })
        }).catch((err) => {
          reject(err)
          console.log(err)
        })
      })
    },
    [name + '/push_item_proofread_result'] ({ commit, state }, { revisionItemId, result }) {
      return new Promise((resolve, reject) => {
        pushProofreadResult(revisionItemId, result).then((resp) => {
          resolve(resp)
          window.VueFetchEventBus.$notify.success({
            title: '成功',
            message: '操作已成功'
          })
          commit(name + '/set_item_proofread_result', { revisionItemId, result })
        }).catch((err) => {
          reject(err)
          console.error(err)
        })
      })
    },
    [name + '/push_item_reject_tags'] ({ commit, state }, { revisionItemId, rejectTags }) {
      return new Promise((resolve, reject) => {
        revisionItemAddTag(revisionItemId, rejectTags.map(item => item.name).join(',')).then((resp) => {
          resolve(resp)
          window.VueFetchEventBus.$notify.success({
            title: '成功',
            message: '添加tag成功'
          })
          commit(name + '/set_item_reject_tags', { revisionItemId, rejectTags })
        }).catch((err) => {
          reject(err)
          console.log(err)
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
    }
  }
}
