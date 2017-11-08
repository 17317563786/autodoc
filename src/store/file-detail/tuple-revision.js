import {
  fetchDocRevisionInfo,
  getDocHtmlSegment,
  getDocById,
  getPumpById
} from '../api.js'

import {
  taggingWordsForHTML,
  taggingWordsForHTMLTable
} from 'src/util/tools.js'

// 前端定义的字段
// f_html_paragraph 文档中段落的html
// f_html_table 文档中表格的html
// f_dup_html_paragraph 冲突文档中段落的html

// revision 四元组
export default function (name) {
  return {
    mutations: {
      [name + '/set_doc_tuple_list'] (state, data) {
        state.tupleItemList = data
      },
      [name + '/set_item_f_html_paragraph'] (state, {revisionItemId, html}) {
        state.tupleItemList.forEach((item) => {
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
        state.tupleItemList.forEach((item) => {
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
        state.tupleItemList.forEach((item) => {
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
        state.tupleItemList.forEach((item) => {
          if (item.id === revisionItemId) {
            item.table_triples.forEach((tableItem) => {
              if (tableItem.table_index === tableIndex) {
                tableItem.f_html_table = taggingWordsForHTMLTable(html, tableItem.row, tableItem.column)
              }
            })
          }
        })
      }
    },
    actions: {
      [name + '/fetch_doc_tuple_list'] ({ commit, state }, { docId }) {
        return fetchDocRevisionInfo(docId).then((resp) => {
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
          // 过滤老数据
          resp.data.items = resp.data.items.filter(item => {
            return !(item.txt_triples instanceof Array)
          })
          commit(name + '/set_doc_tuple_list', resp.data.items)
        })
      },
      [name + '/fetch_item_html_segment'] ({ commit, state }, { docId, revisionItemId }) {
        let promiseArr = []
        let typeArr = []
        return new Promise((resolve, reject) => {
          state.tupleItemList.forEach((item) => {
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
      [name + '/fetch_doc_by_id'] ({ commit, state }, { docId }) {
        return getDocById(docId)
      },
      [name + '/fetch_pump_by_id'] ({ commit, state }, { docId }) {
        return getPumpById(docId)
      }
    }
  }
}
