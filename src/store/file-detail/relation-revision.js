import {
  fetchDocRevisionInfo,
  getDocHtmlSegment
} from '../api.js'

import {
  uniqueArr
} from 'src/util/tools.js'

export default function (name) {
  return {
    mutations: {
      [name + '/set_relaiton_list'] (state, list) {
        state.relationItemList = list
      },
      [name + '/set_formula_current_item'] (state, current) {
        state.formulaCurrentItem = current
      },
      [name + '/set_relation_item_f_html_paragraph'] (state, {revisionItemId, html}) {
        state.relationItemList.forEach((item) => {
          if (item.id === revisionItemId) {
            item.f_html_paragraph = html
          }
        })
      },
      [name + '/set_relation_item_table_html'] (state, {revisionItemId, tableIndex, html}) {
        state.relationItemList.forEach((item) => {
          if (item.id === revisionItemId) {
            item.relations.forEach(relation => {
              if (relation.table_triples instanceof Array) {
                relation.table_triples.forEach(table => {
                  if (table.table_index === tableIndex) {
                    table.f_html_table = html
                  }
                })
              }
            })
          }
        })
      },
      [name + '/set_relation_item_current_table'] (state, {revisionItemId, relaitonItemIndex, tableIndex}) {
        state.relationItemList.forEach((item) => {
          if (item.id === revisionItemId) {
            item.relations.forEach(relation => {
              if (relation.index === relaitonItemIndex) {
                relation.current_table = tableIndex
              }
            })
          }
        })
      }
    },
    actions: {
      [name + '/fetch_doc_relation_list'] ({ commit, state }, { docId }) {
        return fetchDocRevisionInfo(docId, 'relation').then((resp) => {
          commit(name + '/set_relaiton_list', dataPipeline(resp).data.items)
        })
      },
      [name + '/fetch_relation_html_segment'] ({ commit, state }, { docId, revisionItemId }) {
        let promiseArr = []
        let typeArr = []
        return new Promise((resolve, reject) => {
          state.relationItemList.forEach((item) => {
            if (item.id === revisionItemId) {
              if (item.f_html_paragraph === '') {
                promiseArr.push(getDocHtmlSegment(docId, 'paragraph', item.para_index))
                typeArr.push({type: 'paragraph'})
              }
              let tableArr = []
              item.relations.forEach(relation => {
                if (relation.table_triples instanceof Array) {
                  tableArr = tableArr.concat(relation.table_triples)
                }
              })
              tableArr = uniqueArr(tableArr, 'table_index')
              tableArr.forEach(tableItem => {
                promiseArr.push(getDocHtmlSegment(docId, 'table', tableItem.table_index))
                typeArr.push({type: 'table', index: tableItem.table_index})
              })
            }
          })

          Promise.all(promiseArr).then((result) => {
            result.forEach((item, index) => {
              if (item.data.html !== '' && item.data.html !== null) {
                if (typeArr[index].type === 'paragraph') {
                  commit(name + '/set_relation_item_f_html_paragraph', {
                    revisionItemId,
                    html: item.data.html
                  })
                } else if (typeArr[index].type === 'table') {
                  commit(name + '/set_relation_item_table_html', {
                    revisionItemId,
                    tableIndex: typeArr[index].index,
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
      }
    }
  }
}

// 数据管道，用于处理返回数据中的空值，兼容老数据
function dataPipeline (resp) {
  resp.data.items.forEach((item) => {
    // 再添加前端字段
    item.f_html_paragraph = ''
    item.relations.forEach(relation => {
      if (relation.operator === '--' ||
          relation.operator === '//' ||
          relation.operator === '~CGR' ||
          relation.operator === '~DR' ||
          relation.operator === '~GR') {
        [relation.left, relation.right] = [relation.right, relation.left]
        relation.operator = relation.operator.slice(1)
      }
      if (relation.operator === 'CGR') relation.operator = '复合增长率'
      if (relation.operator === 'GR') {
        relation.operator = '-'
        increase(relation, item.relations)
      }
      if (relation.operator === 'DR') {
        relation.operator = '-'
        reduction(relation, item.relations)
      }
      if (relation.table_triples) {
        if (relation.table_triples.length <= 0) {
          relation.table_triples = null
        } else {
          relation.current_table = 0
          relation.table_triples.forEach(table => { table.f_html_table = '' })
        }
      }
    })
  })
  // 过滤老数据
  resp.data.items = resp.data.items.filter(item => {
    return !(item.txt_triples instanceof Array)
  })
  return resp
}
// 将减幅转为公式
function reduction (relation, relations) {
  [relation.left, relation.right] = [relation.right, relation.left]
  let temp = {
    index: 0,
    left: relation.index,
    right: relation.left,
    operator: '/',
    value: relation.value,
    value_unit: relation.value_unit
  }

  relations.forEach(item => {
    if (item.left === relation.index) {
      item.left = 0
    }
    if (item.right === relation.index) {
      item.right = 0
    }
  })
  relations.push(temp)
}
// 将增幅转为公式
function increase (relation, relations) {
  let temp = {
    index: 0,
    left: relation.index,
    right: relation.right,
    operator: '/',
    value: relation.value,
    value_unit: relation.value_unit
  }
  relations.forEach(item => {
    if (item.left === relation.index) {
      item.left = 0
    }
    if (item.right === relation.index) {
      item.right = 0
    }
  })
  relations.push(temp)
}
