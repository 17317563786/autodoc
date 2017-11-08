/* eslint-disable */
export default function taggingWordsForHTML (html, triples, paraIndex) {
  // html [String] 字符串文本，例如<p>最近三年，发行人总资产报酬率分别为6.07%、6.06%和6.53%</p>
  // triples [Object] 四元组信息,

  // 去掉前后p标签和段落中的标签
  if (/<p>/i.test(html)) {
    html = html.replace(/<\/?[^>]*>/g, '')
  }
  if (!triples) {
    return html
  }
  // 计算所有要标注的word
  let wordArr = []
    // 切断引用
  triples = JSON.parse(JSON.stringify(triples))
  // 只有txt_value
  if (triples.position !== undefined) {
    triples = {
      value: triples
    }
  }
  if (!(triples instanceof Array)) {
    triples = [ triples ]
  }
  triples.forEach((triple) => {
    Object.keys(triple).forEach(function(attr) {
      if (triple[attr]) {
        if (attr !== 'preattributes') {
          triple[attr].type = attr
          wordArr.push(triple[attr])
        } else {
          triple[attr].forEach((item) => {
            item.type = attr
            wordArr.push(item)
          })
        }
      }
    })
  })

  // 清除pos为-1的
  // item.value == '?'  ???
  wordArr = wordArr.filter((item) => {
    return item.position !== -1 && item.value != '?'
  })
  let paraArr = html.split('。')
  let targetParaIndex = 0
  // 四元组内容为空？
  if (wordArr.length === 0) {
    //paraIndex 未设置？
    if (paraIndex !== undefined) {
      let tempIndex = 0
      paraArr.forEach((item, index) => {
        // tempIndex += (item.length + 1) + 1 // why +1 again
        tempIndex += (item.length + 1)
        if (paraIndex === tempIndex) {
          targetParaIndex = index + 1
        }
      })
      paraArr = paraArr.map((item, index) => {
        if (index !== targetParaIndex) {
          item = `<span class="silver">${item}</span>`
        }
        return item
      })
      return paraArr.join('。')
    } else {
      return html
    }
  }

  //paraIndex 可能没有？
  if (paraIndex !== undefined) {
    let tempIndex = 0

    paraArr.forEach((item, index) => {
      tempIndex += (item.length + 1)
      if (paraIndex === tempIndex) {
        targetParaIndex = index + 1
      }
    })
    html = paraArr[targetParaIndex]
    wordArr.forEach((item) => {
      //item.position = item.position - paraIndex - 1 // why -1
      if (item.position >= paraIndex) {
        item.position = item.position - paraIndex
      }
    })

    paraArr = paraArr.map((item, index) => {
      if (index !== targetParaIndex) {
        item = `<span class="silver">${item}</span>`
      }
      return item
    })
  }

  wordArr = wordArr.sort((a, b) => {
    return a['position'] - b['position']
  })
  let taggingFail = false
  //重点句子：四元组和其他部分组成
  let sentenceArr = []
  for (let i in wordArr) {
    //添加@s
    i = i- 0
    if (i === 0) {
      sentenceArr.push(html.substring(0, wordArr[0].position))
      if (html.substring(wordArr[0].position, wordArr[0].position + wordArr[0].value.length) == wordArr[0].value) {
        sentenceArr.push(strFontMark(wordArr[0]))
      } else {
        taggingFail = true
        break
      }
    }
    if (i > 0 && i < wordArr.length - 1 && wordArr.length > 2) {
      sentenceArr.push(html.substring(wordArr[i - 1].position + wordArr[i - 1].value.length, wordArr[i].position))
      if (html.substring(wordArr[i].position, wordArr[i].position + wordArr[i].value.length) == wordArr[i].value) {
        sentenceArr.push(strFontMark(wordArr[i]))
      } else {
        taggingFail = true
        break
      }
    }
    if (i === wordArr.length - 1) {
      if (wordArr.length !== 1) {
        sentenceArr.push(html.substring(wordArr[i - 1].position + wordArr[i - 1].value.length, wordArr[i].position))
        if (html.substring(wordArr[i].position, wordArr[i].position + wordArr[i].value.length) == wordArr[i].value) {
          sentenceArr.push(strFontMark(wordArr[i]))
        } else {
          taggingFail = true
          break
        }
      }
      sentenceArr.push(html.substring(wordArr[i].position + wordArr[i].value.length, html.length))
    }
  }
  // 匹配失败，改用字符串匹配
  if (taggingFail) {
    wordArr.forEach((item) => {
      if (item !== '' && item !== null) {
        // TODO There is a console error : SyntaxError: Invalid regular expression: /),并/: Unmatched ')'
        html = html.replace(new RegExp(item.value.replace(/\./, '\\.'), 'gm'), strFontMark(item))
      }
    })
    if (paraIndex !== undefined) {
      paraArr[targetParaIndex] = html
      return paraArr.join('。') + '<i class="fa fa-exclamation"></i>'
    } else {
      return html
    }
  }

  if (paraIndex !== undefined) {
    paraArr[targetParaIndex] = sentenceArr.join('')
    return paraArr.join('。')
  } else {
    return sentenceArr.join('')
  }

  function strFontMark (item) {
    if (item.type === 'value') {
      return '<span class="bg-red">' + item.value + '</span>'
    } else if (item.type === 'attribute') {
      return '<span class="bg-blue">' + item.value + '</span>'
    } else if (item.type === 'preattributes') {
      return '<span class="bg-green">' + item.value + '</span>'
    } else if (item.type === 'time') {
      return '<span class="bg-yellow">' + item.value + '</span>'
    } else {
      return item.value
    }
  }
}
