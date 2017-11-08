/* eslint-disable */
// 将html表格的表头抽出，标出指定的单元格
export default function taggingWordsForHTMLTable (htmlTable, rowInTable, colInTable) {
  let container = document.createElement('div')
  let oldDomContainer = document.createElement('div')

  oldDomContainer.innerHTML = htmlTable
  oldDomContainer.classList.add('hide-table', 'table-wrapper')

  let oldTable = oldDomContainer.querySelector('table')
  // 容错， 没有thead直接渲染
  if (oldTable.querySelectorAll('thead').length === 0) {
    return oldDomContainer.innerHTML
  }
  // 容错，thead中最小rowspan不为1的会导致表头渲染错误
  // let theadTdArr = Array.prototype.slice.call(oldDomContainer.querySelector('thead').querySelectorAll('td'))
  let theadTdArr = [...oldDomContainer.querySelector('thead').querySelector('tr').querySelectorAll('td')]
  let theadTdRowspan = theadTdArr.map(td => {
    if (td.getAttribute('rowspan')) {
      return td.getAttribute('rowspan')
    } else {
      return 1
    }

  })
  if (!~theadTdRowspan.indexOf(1)) {
    theadTdArr.forEach(td => {
      td.setAttribute('rowspan', parseInt(td.getAttribute('rowspan'), 10) - 1)
    })
    rowInTable--
  }

  let allTrInTable = Array.prototype.slice.call(oldTable.querySelectorAll('tr'))
  let maxColNum = 0
  allTrInTable.forEach((trItem) => {
    let colNum = trItem.querySelectorAll('td').length
    if (maxColNum < colNum) {
      maxColNum = colNum
    }
  })
  let tr = oldTable.querySelectorAll('tr')[rowInTable]
  if (tr !== undefined && tr !== null) {
    let allTdArray = Array.prototype.slice.call(tr.querySelectorAll('td'))
    let targetColTdNum = allTdArray.length
    for (let i = 0 ; i < colInTable ;i++) {
      if (allTdArray[i].colSpan !== 1) {
        colInTable = colInTable - allTdArray[i].colSpan + 1
        targetColTdNum = targetColTdNum + allTdArray[i].colSpan - 1
      }
    }
    if (maxColNum > targetColTdNum) {
      // colInTable = colInTable - maxColNum + targetColTdNum
    }
    let td = tr.querySelectorAll('td')[colInTable]
    if (td !== undefined && td !== null) {
      td.classList.add('bg-red')
    } else {
      let tds = tr.querySelectorAll('td')
      tds[tds.length-1].classList.add('bg-red')
    }
  } else {
    return oldDomContainer.innerHTML
  }
  let tableTitle = document.createElement('div')
  let tableBody = document.createElement('div')
  let tableHead = document.createElement('div')
  tableTitle.classList.add('table-title', 'clearfloat')
  tableBody.classList.add('table-body')
  tableHead.classList.add('table-head')

  // 插入文档流，计算宽度
  document.body.appendChild(oldDomContainer)

  let thead = document.createElement('thead')
  if (tr.parentNode.previousElementSibling === null) {
    // 有的表格所有都在thead中
    setTimeout(() => {
      document.body.removeChild(oldDomContainer)
    }, 2000)
    return oldDomContainer.innerHTML
  }
  thead.innerHTML = tr.parentNode.previousElementSibling.innerHTML

  // 计算单元格宽度
  let cellWidthArr = []
  let num = 0
  Array.prototype.slice.call(tr.parentNode.previousElementSibling.querySelector('tr').querySelectorAll('td')).forEach((item) => {
    num = item.colSpan
    while (num > 0) {
      cellWidthArr.push(item.offsetWidth/item.colSpan)
      num--
    }
  })

  let cellWidthDom = cellWidthArr.map((item, index) => {
    item = item * 0.8
    return `<col style="width: ${item}px;" /></col>`
  }).join('')

  // 从老表格中删除选中的thead
  if (oldTable.querySelectorAll('thead').length === 1) {
    let oldThead = tr.parentNode.previousElementSibling
    oldThead.parentNode.removeChild(oldThead)
  }

  tableHead.innerHTML = '<table><colgroup>' + cellWidthDom + '</colgroup>' + '<thead>' + thead.innerHTML + '</thead></table>'
  tableBody.innerHTML = '<table><colgroup>' + cellWidthDom + '</colgroup>' + oldTable.innerHTML + '</table>'

  Array.prototype.slice.call(oldDomContainer.querySelectorAll('div > p')).forEach((item) => {
    tableTitle.appendChild(item)
  })
  container.appendChild(tableTitle)
  container.appendChild(tableHead)
  container.appendChild(tableBody)

  setTimeout(() => {
    document.body.removeChild(oldDomContainer)
  }, 2000)

  // return oldDomContainer.innerHTML
  return container.innerHTML
}