import Vue from 'vue'
import { fetchAllRejectItems, getDocHtmlSegment,
  confirmItemRevisionStatus, fetchAllTags, pushRevisionItemIssueStatus,
  revisionItemAddTag } from '../api.js'
import { taggingWordsForHTML, taggingWordsForHTMLTable } from 'util/tools.js'
/* eslint-disable no-useless-computed-key */
export default {
  state: {
    tags: [],
    list: [],
    pager: {
      total: 0,
      size: 400,
      page: 1
    }
  },
  mutations: {
    ['allRejectItems/set_doc_revision_list'] (state, data) {
      state.list = data
    },
    ['allRejectItems/set_pager'] (state, pager) {
      Vue.set(state, 'pager', pager)
    },
    ['allRejectItems/set_tags'] (state, tags) {
      Vue.set(state, 'tags', tags)
    },
    ['allRejectItems/set_tag_cur'] (state, tagId) {
      state.tags.forEach((item) => {
        item.cur = false
        if (item.id === tagId) {
          item.cur = true
        }
      })
    },
    ['allRejectItems/set_item_f_html_paragraph'] (state, {revisionItemId, html}) {
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
    ['allRejectItems/set_item_f_dup_html_paragraph'] (state, {revisionItemId, dupParaIndex, html}) {
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
    ['allRejectItems/set_item_f_matched_html_paragraph'] (state, {revisionItemId, matchedParaIndex, html}) {
      state.list.forEach((item) => {
        if (item.id === revisionItemId) {
          item.matched_sentences.forEach((matchedParaItem, index) => {
            if (matchedParaItem.paragraph_index === matchedParaIndex) {
              matchedParaItem.f_matched_html_paragraph = taggingWordsForHTML(html, item.matched_txt_triples[index], matchedParaItem.index_in_paragraph)
            }
          })
        }
      })
    },
    ['allRejectItems/set_item_f_html_table'] (state, {revisionItemId, tableIndex, html}) {
      if (html === '' || html === null) {
        return
      }
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
    ['allRejectItems/set_item_status'] (state, {revisionItemId, status}) {
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
    ['allRejectItems/set_item_reject_tags'] (state, {revisionItemId, rejectTags}) {
      state.list.forEach((item) => {
        if (item.id === revisionItemId) {
          item.reject_tags = rejectTags
        }
      })
    },
    ['allRejectItems/del_revision_item'] (state, revisionItemId) {
      let targetIndex = null
      state.list.forEach((item, index) => {
        if (item.id === revisionItemId) {
          targetIndex = index
        }
      })
      if (targetIndex !== null) {
        state.list.splice(targetIndex, 1)
      }
    }
  },
  actions: {
    ['allRejectItems/fetch_all_reject_items'] ({ commit, state }, tagName) {
      return fetchAllRejectItems(state.pager.page, state.pager.size, tagName).then((resp) => {
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
        resp.data.items = resp.data.items.filter((item) => {
          return !(item.txt_triples instanceof Array)
        })
        commit('allRejectItems/set_doc_revision_list', resp.data.items)
        commit('allRejectItems/set_pager', {
          page: resp.data.page,
          size: resp.data.size,
          total: resp.data.total
        })
      })
    },
    ['allRejectItems/fetch_item_html_segment'] ({ commit, state }, { docId, revisionItemId }) {
      let promiseArr = []
      let typeArr = []
      return new Promise((resolve, reject) => {
        state.list.forEach((item) => {
          if (item.id === revisionItemId && item.doc_id === docId) {
            if (item.f_html_paragraph === '') {
              promiseArr.push(getDocHtmlSegment(docId, 'paragraph', item.para_index))
              typeArr.push({type: 'paragraph'})
            }
            item.table_triples.forEach((tableItem) => {
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
                commit('allRejectItems/set_item_f_html_paragraph', {
                  revisionItemId,
                  html: item.data.html
                })
              } else if (typeArr[index].type === 'table') {
                commit('allRejectItems/set_item_f_html_table', {
                  revisionItemId,
                  tableIndex: typeArr[index].index,
                  html: item.data.html
                })
              } else if (typeArr[index].type === 'dup_paragraph') {
                commit('allRejectItems/set_item_f_dup_html_paragraph', {
                  revisionItemId,
                  dupParaIndex: typeArr[index].index,
                  html: item.data.html
                })
              } else if (typeArr[index].type === 'matched_paragraph') {
                commit('allRejectItems/set_item_f_matched_html_paragraph', {
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
    ['allRejectItems/push_item_revision_status'] ({ commit, state }, { revisionItemId, status, rejectTags }) {
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
          commit('allRejectItems/set_item_status', { revisionItemId, status })
          if (rejectTags) {
            commit('allRejectItems/set_item_reject_tags', { revisionItemId, rejectTags })
          }
        }).catch((err) => {
          reject(err)
          console.log(err)
        })
      })
    },
    ['allRejectItems/push_item_reject_tags'] ({ commit, state }, { revisionItemId, rejectTags }) {
      return new Promise((resolve, reject) => {
        revisionItemAddTag(revisionItemId, rejectTags.map(item => item.name).join(',')).then((resp) => {
          resolve(resp)
          window.VueFetchEventBus.$notify.success({
            title: '成功',
            message: '添加tag成功'
          })
          commit('allRejectItems/set_item_reject_tags', { revisionItemId, rejectTags })
        }).catch((err) => {
          reject(err)
          console.log(err)
        })
      })
    },
    ['allRejectItems/fetch_all_tags'] ({ commit, state }) {
      if (state.tags.length === 0) {
        return fetchAllTags().then((resp) => {
          resp.data.forEach((item) => {
            item.cur = false
          })
          commit('allRejectItems/set_tags', resp.data)
        })
      } else {
        state.tags.forEach((item) => {
          item.cur = false
        })
        return Promise.resolve({status: true})
      }
    },
    ['allRejectItems/push_revision_item_issue_status'] ({ commit, state }, { revisionItemId, status }) {
      return pushRevisionItemIssueStatus(revisionItemId, status).then((resp) => {
        commit('allRejectItems/del_revision_item', revisionItemId)
      })
    }
  },
  getters: {
    ['allRejectItems/correct_item_list'] (state) {
      return state.list.filter((item) => {
        if (item.type === 'correct') return true
      })
    },
    ['allRejectItems/duplicate_item_list'] (state) {
      return state.list.filter((item) => {
        if (item.type === 'duplicate') return true
      })
    },
    ['allRejectItems/multi_match_item_list'] (state) {
      return state.list.filter((item) => {
        if (item.type === 'multi_match') return true
      })
    },
    ['allRejectItems/wrong_item_list'] (state) {
      return state.list.filter((item) => {
        if (item.type === 'wrong') return true
      })
    },
    ['allRejectItems/no_match_item_list'] (state) {
      return state.list.filter((item) => {
        if (item.type === 'no_match') return true
      })
    },
    ['allRejectItems/possible_match_item_list'] (state) {
      return state.list.filter((item) => {
        if (item.type === 'possible_match') return true
      })
    },
    ['allRejectItems/value_item_list'] (state) {
      return state.list.filter((item) => {
        if (item.type === 'value') return true
      })
    },
    ['allRejectItems/value_rate_item_list'] (state) {
      return state.list.filter((item) => {
        if (item.type === 'value_rate') return true
      })
    }
  }
}
