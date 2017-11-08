import {
  fetchDocRevisionInfo
} from '../api.js'

// 前端定义的字段
// f_html_paragraph 文档中段落的html
// f_html_table 文档中表格的html
// f_dup_html_paragraph 冲突文档中段落的html

// revision 四元组
export default function (name) {
  return {
    mutations: {
      [name + '/set_doc_other_value_list'] (state, data) {
        state.tupleItemList = state.tupleItemList.concat(data)
      }
    },
    actions: {
      [name + '/fetch_doc_other_value_list'] ({ commit, state }, { docId }) {
        return fetchDocRevisionInfo(docId, 'other_value').then((resp) => {
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
          commit(name + '/set_doc_other_value_list', resp.data.items)
        })
      }
    }
  }
}
