export function fetchSentenceRelationById (docId, sid) {
  let url = '/api/v1/sentence/relation'
  let params = {
    doc_id: docId,
    sid
  }
  return fetch(url, { params })
}

export function fetchSentenceQuadrupleById (docId, sid) {
  let url = '/api/v1/sentence/quadruple'
  let params = {
    doc_id: docId,
    sid
  }
  return fetch(url, { params })
}

export function pushHideCommentByType (docId, action, type, contentType) {
  let url = `/api/v1/document/${docId}/proofread`
  let params = {
    action,
    type,
    content_type: contentType
  }
  return fetch(url, { type: 'POST', params })
}
export function fetchTabelsRevisionItems (docId, {tableIndex, row, column}) {
  let url = `/api/v1/document/${docId}/table/revision-item`
  let params = {
    table_index: tableIndex,
    row,
    column
  }
  return fetch(url, {params})
}
export function fetchFileTabels (docId) {
  let url = `/api/v1/document/${docId}/table`
  return fetch(url)
}
export function sendMessageTo(docId, title, content) {
  let url = `/api/v1/document/${docId}/send_message`
  let params = {
    title,
    content
  }
  return fetch(url, { type: 'POST', params })
}
export function searchDocList(page, size, orderBy, desc, type, value) {
  let url = `/api/v1/document/search`
  let params = {
    page,
    size,
    order_by: orderBy,
    desc,
    [type]: value
  }
  return fetch(url, { params })
}
export function fetchSentenceById(id) {
  let url = `/api/v1/sentence/${id}`
  return fetch(url)
}
export function fetchSentenceRandom(type, status) {
  let url = `/api/v1/sentence/random`
  let params = {
    type,
    status
  }
  return fetch(url, { params })
}
export function fetchAllShowComments(page, size) {
  let url = `/api/v1/revision_item/typical`
  let params = {
    page,
    size
  }
  return fetch(url, { params })
}
export function fetchSpace(docId, entityIndex) {
  // k 为上下段数
  let url = `/api/v1/document/${docId}/html_segment_context`
  let params = {
    entity_type: 'PARAGRAPH',
    entity_index: entityIndex,
    k: 3
  }
  return fetch(url, { params })
}
export function pushSentenceToWaterfall(sentenceId) {
  let url = `/api/v1/sentence/${sentenceId}/feedback`
  return fetch(url, { type: 'POST' })
}
export function pushSentenceStatus(sentenceId, action, tags) {
  let url = `/api/v1/sentence/${sentenceId}/confirm`
  let params = {
    action
  }
  if (tags !== undefined) {
    params.reject_tags = tags
  }
  return fetch(url, { type: 'POST', params })
}
export function fetchSentenceQuadruple(sentenceId) {
  let url = `/api/v1/sentence/${sentenceId}/quadruple`
  return fetch(url)
}
export function fetchSentenceList({ page, size }, type, status, tag) {
  // status: approved rejected
  // type: proofread_hidden user_revison rejected other_value
  let url = `/api/v1/sentence`
  let params = {
    page,
    size
  }
  if (type !== undefined) params.type = type
  if (status !== undefined) params.status = status
  if (tag !== undefined) params.tag = tag
  return fetch(url, { params })
}
// 传的参数好像不对？
export function quadrupleMaker(sentence, lastYear, lastMonth, reportPeriod) {
  let url = `/api/v1/adc/matmaker`
  let params = {
    source_text: sentence,
    ref: {}
  }
  if (lastYear !== undefined) {
    params.ref.last_year = lastYear
  }
  if (lastMonth !== undefined) {
    params.ref.last_month = lastMonth
  }
  if (reportPeriod !== undefined) {
    params.ref.report_period = reportPeriod
  }
  return fetch(url, { type: 'POST', params })
}
// 我重新写一个和上面一样的,获取分析结果
export function AIAnaylse(sentence) {
  let url = '/api/v1/adc/matmaker'
  let params = {
    source_text: sentence.source_text
  }
  let ref = {}
  if (sentence.recent_month) ref.recent_month = +sentence.recent_month
  if (sentence.recent_year) ref.recent_year = +sentence.recent_year
  if (sentence.report_period) ref.report_period = +sentence.report_period
  if (sentence.update) params.update = sentence.update
  params.ref = ref
  return fetch(url, { type: 'POST', params })
}
// 获取例子
export function fetchSentenceExample() {
  let url = '/api/v1/adc/sentence_example'
  return fetch(url)
}
export function fetchAutoDocSentence(params) {
  let url = '/api/v1/adc/senmaker'
  return fetch(url, {type: 'POST', params})
}
export function pushUserChoice(revisionItemId, type) {
  // donot comment
  if (type === 1) {
    type = 'comment'
  }
  if (type === 0) {
    type = 'donot'
  }
  let url = `/api/v1/revision_item/${revisionItemId}/user_choice`
  let params = {
    option: type
  }
  return fetch(url, { type: 'POST', params })
}
export function feedbackWaterfall(revisionItemId) {
  let url = `/api/v1/revision_item/${revisionItemId}/feedback`
  return fetch(url, { type: 'POST' })
}
export function getLeftTime() {
  let url = `/api/v1/user/balance`
  return fetch(url)
}
export function pushDocProofreadResult(docId, result) {
  let url = ''
  if (result === 'finish') {
    url = `/api/v1/document/${docId}/proofread_finish`
  } else {
    url = `/api/v1/document/${docId}/proofread_delete`
  }

  return fetch(url, { type: 'POST' })
}
export function pushProofreadResult(revisionItemId, result) {
  if (result === 0) {
    result = 'show'
  }
  if (result === 1) {
    result = 'hide'
  }
  let url = `/api/v1/revision_item/${revisionItemId}/proofread`
  let params = {
    action: result
  }
  return fetch(url, { type: 'POST', params })
}
export function fetchDocList(page, size, orderBy, desc) {
  let url = '/api/v1/document'
  let params = {
    page: page,
    size: size,
    orderby: orderBy || 'id',
    desc: desc === undefined ? 1 : desc
  }
  return fetch(url, { params })
}
export function fetchDocRevisionInfo(docId, type) {
  let url = `/api/v1/document/${docId}/revision-item`
  if (type === 'tuple') {
    url = url + '?content_type=quadruples'
  }
  if (type === 'relation') {
    url = url + '?content_type=relation'
  }
  if (type === 'faulty_wording') {
    url = url + '?content_type=faulty_wording'
  }
  if (type === 'other_value') {
    url = url + '?content_type=other_value'
  }
  return fetch(url)
}
export function confirmDate(docId, year, month, period, reversePeriod) {
  if (!docId) {
    return Promise.reject({
      statue: false,
      msg: '请先上传文件'
    })
  }
  let url = `/api/v1/document/${docId}/confirm_date`
  let params = {
    year,
    month,
    report_period: period,
    reverse_period: reversePeriod
  }
  return new Promise((resolve, reject) => {
    fetch(url, {
      type: 'POST',
      params
    }).then((resp) => {
      resolve(resp)
    })
  })
}
export function docRevisionFinish(docId) {
  if (!docId) {
    return Promise.reject({
      statue: false,
      msg: '没有此文件'
    })
  }

  let url = `/api/v1/document/${docId}/generate`
  return new Promise((resolve, reject) => {
    fetch(url).then((resp) => {
      resolve(resp)
    }).catch((err) => {
      reject(err)
    })
  })
}
export function getDocHtmlSegment(docId, type, index) {
  if (index === undefined) {
    return Promise.reject({
      statue: false,
      msg: '数据错误，没有entity_index'
    })
  }
  let url = `/api/v1/document/${docId}/html_segment`
  let params = {
    entity_type: type.toUpperCase(),
    entity_index: index
  }
  return new Promise((resolve, reject) => {
    fetch(url, {
      params
    }).then((resp) => {
      resolve(resp)
    }).catch((err) => {
      reject(err)
    })
  })
}
export function getDocHtmlSegments(docId, type, indexes) {
  if (indexes === undefined) {
    return Promise.reject({
      statue: false,
      msg: '数据错误，没有entity_index'
    })
  }
  let url = `/api/v1/document/${docId}/html_segments`
  let params = {
    entity_type: type.toUpperCase(),
    entity_index: indexes.join(',')
  }
  return new Promise((resolve, reject) => {
    fetch(url, {
      params
    }).then((resp) => {
      resolve(resp)
    }).catch((err) => {
      reject(err)
    })
  })
}
export function confirmItemRevisionStatus(revisionItemId, status, rejectTags) {
  let url = `/api/v1/revision_item/${revisionItemId}/confirm`
  let params = {
    action: status,
    reject_tags: rejectTags
  }
  if (!rejectTags) {
    delete params.reject_tags
  }
  return fetch(url, {
    type: 'POST',
    params
  })
}
export function fetchAllRejectItems(page, size, tag) {
  let url = `/api/v1/revision_item/rejected`
  let params = {
    page,
    size
  }

  if (tag) {
    params.tag = encodeURIComponent(tag)
  }
  return fetch(url, { params })
}
export function fetchAllFixedRejectItems(page, size, tag) {
  let url = `/api/v1/revision_item/fixed`
  let params = {
    page,
    size
  }

  if (tag) {
    params.tag = encodeURIComponent(tag)
  }
  return fetch(url, { params })
}
export function fetchAllAcceptItems(page, size) {
  let url = `/api/v1/revision_item/approved`
  let params = {
    page,
    size
  }
  return fetch(url, { params })
}
export function fetchAllTags(type) {
  let params = {}
  if (type !== undefined) {
    params.type = type
  }
  let url = `/api/v1/reject_reason_tag/all`
  return fetch(url, { params, session: true })
}
export function fetchSentenceQuadruples(docId, sid) {
  let url = `/api/v1/document/${docId}/sentence_quadruples`
  let params = {
    sid
  }
  return fetch(url, { params })
}
export function delDocById(docId) {
  let url = `/api/v1/document/${docId}/delete`
  return fetch(url, {
    type: 'POST'
  })
}
export function pushRevisionItemIssueStatus(revisionItemId, status) {
  let url = `/api/v1/revision_item/${revisionItemId}/${status}`
  return fetch(url, {
    type: 'POST'
  })
}
export function dummyLogin(username, password) {
  let url = `/api/v1/user/dummy`
  let params = {
    username,
    password
  }
  return fetch(url, {
    type: 'POST',
    params
  })
}
export function getUserInfo() {
  let url = `/api/v1/user/me`
  return fetch(url)
}
export function revisionItemAddTag(revisionItemId, rejectTags) {
  let url = `/api/v1/revision_item/${revisionItemId}/tag`
  let params = {
    reject_tags: rejectTags
  }
  return fetch(url, {
    type: 'POST',
    params
  })
}
function fetch(url, options = {}) {
  options.params = options.params || {}
  let fetchSetting = {
    method: options.type || 'GET',
    credentials: options.credentials || 'same-origin'
  }
  if (fetchSetting.method === 'GET') {
    let temp = '?'
    for (let key in options.params) {
      temp += key + '=' + options.params[key] + '&'
    }
    url = url + temp
    url = url.substring(0, url.length - 1)
  } else {
    if (options.formData) {
      let temp = ''
      for (let key in options.params) {
        temp += key + '=' + options.params[key] + '&'
      }
      temp = temp.substring(0, temp.length - 1)

      fetchSetting.headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
      fetchSetting.body = temp
    } else {
      fetchSetting.headers = {
        'Content-Type': 'application/json'
      }
      fetchSetting.body = JSON.stringify(options.params)
    }
  }
  if (options.session && window.sessionStorage.getItem(url)) {
    return Promise.resolve(JSON.parse(window.sessionStorage.getItem(url)))
  }
  return new Promise((resolve, reject) => {
    window.fetch(url, fetchSetting).then((rawResp) => {
      if (rawResp.ok) {
        return rawResp.json()
      } else {
        return {
          status: 'error',
          message: `${rawResp.status} ${rawResp.statusText}`
        }
      }
    }).then((resp) => {
      if (resp.status === 'ok') {
        if (options.session) {
          window.sessionStorage.setItem(url, JSON.stringify(resp))
        }
        resolve(resp)
      } else {
        reject(resp)
        window.VueFetchEventBus.$notify.warning({
          title: '服务端错误',
          message: resp.message
        })
      }
    }).catch((err) => {
      window.VueFetchEventBus.$notify.warning({
        title: '网络错误',
        message: '请检查连接 :' + err.message
      })
    })
  })
}

export function fetchCurrentPrice() {
  let url
  if (window.location.host !== 'd.bondowner.cn') {
    url = 'http://t.bondowner.cn/1/mp/charge/info'
  } else {
    url = 'http://bondowner.cn/1/mp/charge/info'
  }
  return new Promise((resolve, reject) => {
    window.fetch(url, {
      method: 'GET',
      mode: 'cors'
    }).then((rawResp) => {
      if (rawResp.ok) {
        return rawResp.json()
      } else {
        return {
          status: false,
          message: `${rawResp.status} ${rawResp.statusText}`
        }
      }
    }).then((resp) => {
      if (resp.status) {
        resolve(resp)
      } else {
        reject(resp)
      }
    })
  })
}
export function fetchChargeStatus(orderId) {
  let url
  if (window.location.host !== 'd.bondowner.cn') {
    url = 'http://t.bondowner.cn/1/mp/charge/finish?id=' + orderId
  } else {
    url = 'http://bondowner.cn/1/mp/charge/finish?id=' + orderId
  }
  return new Promise((resolve, reject) => {
    window.fetch(url, {
      method: 'GET',
      mode: 'cors'
    }).then((rawResp) => {
      if (rawResp.ok) {
        return rawResp.json({ id: orderId })
      } else {
        return {
          status: false,
          message: `${rawResp.status} ${rawResp.statusText}`
        }
      }
    }).then((resp) => {
      if (resp.status) {
        resolve(resp)
      } else {
        reject(resp)
      }
    })
  })
}

export function fetchCauseRelation(docId) {
  let url = `/api/v1/document/${docId}/causality`
  return fetch(url)
}
export function reAnalysiseDoc(docId) {
  let url = `/api/v1/document/${docId}/restart_analysis`
  return fetch(url, {
    type: 'POST'
  })
}
export function getSystemvVersion() {
  let url = `/api/v1/version`
  return fetch(url, {
    type: 'GET'
  })
}
export function getDocById(docId) {
  let url = `/api/v1/document/${docId}`
  return fetch(url, {
    type: 'GET'
  })
}
export function restartAnalysisForRef (docId, year, month, period, reversePeriod) {
  let url = `/api/v1/document/${docId}/restart_analysis_for_ref`
  let params = {
    'year': year,
    'month': month,
    'report_period': period,
    'reverse_period': reversePeriod
  }
  return fetch(url, {
    type: 'POST',
    params
  })
}
export function getPumpById(docId) {
  let url = `/api/v1/document/${docId}/toc`
  return fetch(url, {
    type: 'GET'
  })
}
export function logoDocQualityById(docId, quality) {
  let url = `/api/v1/document/${docId}`
  let params = {
    'quality': quality
  }
  return fetch(url, {
    type: 'PATCH',
    params
  })
}
