import {
  fetchDocRevisionInfo,
  getDocHtmlSegment,
  getDocHtmlSegments
} from '../api.js'

export default function (name) {
  return {
    mutations: {
      [name + '/set_faulty_list'] (state, list) {
        state.faultyItemList = list
      },
      [name + '/set_faulty_item_f_html_paragraph'] (state, {revisionItemId, html}) {
        state.faultyItemList.forEach((item) => {
          if (item.id === revisionItemId) {
            item.f_html_paragraph = html
          }
        })
      }
    },
    actions: {
      [name + '/fetch_doc_faulty_list'] ({ commit, state }, { docId }) {
        return fetchDocRevisionInfo(docId, 'faulty_wording').then((resp) => {
          resp.data.items.forEach(item => {
            item.f_html_paragraph = ' '
          })
          commit(name + '/set_faulty_list', resp.data.items)
          return resp
        })
      },
      [name + '/fetch_faulty_html_segments'] ({ commit, state }, { docId, tip }) {
        let paraIndexArr = state.faultyItemList
          .filter(faulty => {
            return faulty.faulty_wording.tips === tip
          })
          .map(faulty => {
            return faulty.para_index
          })
        return getDocHtmlSegments(docId, 'paragraph', paraIndexArr).then(resp => {
          state.faultyItemList.forEach(faultyItem => {
            if (faultyItem.faulty_wording.tips === tip) {
              Object.keys(resp.data).forEach(key => {
                if (faultyItem.para_index === Number(key)) {
                  commit(name + '/set_faulty_item_f_html_paragraph', {
                    revisionItemId: faultyItem.id,
                    html: resp.data[key].html
                  })
                }
              })
            }
          })
          return resp
        })
      },
      [name + '/fetch_faulty_html_segment'] ({ commit, state }, { docId, revisionItemId }) {
        let promiseArr = []
        let typeArr = []
        return new Promise((resolve, reject) => {
          state.faultyItemList.forEach((item) => {
            if (item.id === revisionItemId) {
              if (item.f_html_paragraph === '') {
                promiseArr.push(getDocHtmlSegment(docId, 'paragraph', item.para_index))
                typeArr.push({type: 'paragraph'})
              }
            }
          })

          Promise.all(promiseArr).then((result) => {
            result.forEach((item, index) => {
              if (item.data.html !== '' && item.data.html !== null) {
                if (typeArr[index].type === 'paragraph') {
                  commit(name + '/set_faulty_item_f_html_paragraph', {
                    revisionItemId,
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
