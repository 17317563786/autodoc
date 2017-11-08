<template>
  <div class="container">
    <div class="file-detail-header layout-header">
      <el-button type="primary" size="small" @click="routerGoBack" icon="arrow-left">返回</el-button>
    </div>
    <div class="file-detail-content layout-content no-footer" :class="readonly ? 'no-footer' : ''" v-loading="loading">
      <div class="doc-name">{{filename}}</div>
      <div class="color-info">
        <div class="item bg-green"></div>
        <div class="label">匹配正确</div>
        <div class="item bg-red"></div>
        <div class="label">冲突</div>
        <div class="item bg-yellow"></div>
        <div class="label">可能正确</div>
        <div class="item bg-blue"></div>
        <div class="label">其他值，其他比例</div>
        <div class="item bg-gray"></div>
        <div class="label">匹配缺失</div>
      </div>
      <h3 v-if="tables.length <= 0" class="t-center">无表格</h3>
      <h3 v-else class="t-center">表格目录</h3>
      <div class="contents-wrapper clearfloat">
        <div class="l">
          <div v-for="(item, index) in tableTitleList" class="content-item" v-if="index <=tableTitleList.length/2" @click="moveToTable(item)">{{item.name}}</div>
        </div>
        <div class="r">
          <div v-for="(item, index) in tableTitleList" class="content-item" v-if="index >=tableTitleList.length/2" @click="moveToTable(item)">{{item.name}}</div>
        </div>
      </div>
      <div class="tables-wrapper">
        <div class="table-item" v-for="item in tables" v-html="item.html" @click="handleTableClick(item, $event)"></div>
      </div>
    </div>
    <div class="back-to-top" @click="backToTop"><i class="el-icon-arrow-up mr10"></i>返回顶部</div>
  </div>
</template>
<script>
import { fetchFileTabels } from 'src/store/api'
// import taggingWordsForHTMLTable from 'src/util/taggingWordsForHTMLTable'
import { findTheadNode, findTdNode, findTrNode, previousSiblingNum } from 'src/util/tools'
export default {
  name: 'file-tables',
  components: {
  },
  data () {
    return {
      loading: true,
      tables: [],
      tableTitleList: []
    }
  },
  computed: {
    docId () {
      return this.$route.params.id
    },
    readonly () {
      return this.$route.query.type === 'readonly'
    },
    filename () {
      return this.$route.query.filename
    }
  },
  async beforeMount () {
    fetchFileTabels(this.docId).then(resp => {
      this.tables = markTable(resp.data.items)
      this.tableTitleList = calcTableTitleList(resp.data.items)
      this.loading = false
    }).catch(err => {
      console.error(err)
    })
  },
  methods: {
    routerGoBack () {
      this.$router.go(-1)
    },
    moveToTable (item) {
      document.querySelector('[data-table-id="' + item.id + '"]').scrollIntoView()
    },
    backToTop () {
      document.querySelector('.layout-content').scrollTop = 0
    },
    handleTableClick (table, e) {
      if (e.target.nodeName === 'TBODY' || e.target.nodeName === 'THEAD' || e.target.nodeName === 'TR') {
        return
      }
      let clickable = []
      Object.keys(table.hightlights).forEach(key => {
        clickable = clickable.concat(table.hightlights[key])
      })
      let theadRowNum
      if (findTheadNode(e.target)) {
        theadRowNum = findTheadNode(e.target).querySelectorAll('tr').length
      } else {
        theadRowNum = 0
      }
      let column = previousSiblingNum(findTdNode(e.target))
      let row
      if (findTrNode(e.target) && findTrNode(e.target).parentNode.nodeName === 'TBODY') {
        row = previousSiblingNum(findTrNode(e.target)) + theadRowNum
      } else {
        row = previousSiblingNum(findTrNode(e.target))
      }

      let tableInfo = {
        tableIndex: table.entity_index,
        column,
        row
      }
      let flag = false
      clickable.forEach(cell => {
        if (cell.row === row && cell.column === column) {
          flag = true
        }
      })
      if (flag) {
        this.$store.dispatch('revisionItems/fetch_revision_list', {
          docId: this.docId,
          tableInfo
        }).then(resp => {
          if (resp.data.items.length > 0) {
            window.localStorage.setItem('revisionItems', JSON.stringify(resp.data.items))
            window.open(window.location.href.split('#')[0] + '#/revision/items')
          } else {
            this.$message('没有相关的句子')
          }
        })
      }
    }
  }
}
function markTable (tables) {
  let container = document.createElement('div')
  let tr
  let td
  let duplicatePosition
  let possiblePosition
  let correctPosition
  let noMatchPosition
  let valuePosition
  tables.forEach((table, index) => {
    duplicatePosition = []
    possiblePosition = []
    correctPosition = []
    noMatchPosition = []
    valuePosition = []
    container.innerHTML = table.html
    if (table.html === '') {
      return
    }
    container.querySelectorAll('p')[0].setAttribute('data-table-id', index)
    try {
      if (table.hightlights.correct) {
        correctPosition = correctPosition.concat(table.hightlights.correct)
        correctPosition.forEach(cell => {
          tr = container.querySelectorAll('tr')[cell.row]
          let trs = [...tr.querySelectorAll('td')]
          let col = cell.column
          trs.forEach(td => {
            if (td.colSpan && td.colSpan > 1) {
              col = col - td.colSpan + 1
            }
          })
          td = tr.querySelectorAll('td')[col]

          td && td.classList.add('bg-green')
        })
      }
      if (table.hightlights.duplicate) {
        duplicatePosition = duplicatePosition.concat(table.hightlights.duplicate)
      }
      if (table.hightlights.wrong) {
        duplicatePosition = duplicatePosition.concat(table.hightlights.wrong)
      }
      if (table.hightlights.multi_match) {
        duplicatePosition = duplicatePosition.concat(table.hightlights.multi_match)
      }
      duplicatePosition.forEach(cell => {
        tr = container.querySelectorAll('tr')[cell.row]
        let trs = [...tr.querySelectorAll('td')]
        let col = cell.column
        trs.forEach(td => {
          if (td.colSpan && td.colSpan > 1) {
            col = col - td.colSpan + 1
          }
        })
        td = tr.querySelectorAll('td')[col]
        td && td.classList.add('bg-red')
      })
      if (table.hightlights.possible) {
        possiblePosition = possiblePosition.concat(table.hightlights.possible)
        possiblePosition.forEach(cell => {
          tr = container.querySelectorAll('tr')[cell.row]
          let trs = [...tr.querySelectorAll('td')]
          let col = cell.column
          trs.forEach(td => {
            if (td.colSpan && td.colSpan > 1) {
              col = col - td.colSpan + 1
            }
          })
          td = tr.querySelectorAll('td')[col]
          td && td.classList.add('bg-yellow')
        })
      }
      if (table.hightlights.no_match) {
        noMatchPosition = noMatchPosition.concat(table.hightlights.no_match)
        noMatchPosition.forEach(cell => {
          tr = container.querySelectorAll('tr')[cell.row]
          let trs = [...tr.querySelectorAll('td')]
          let col = cell.column
          trs.forEach(td => {
            if (td.colSpan && td.colSpan > 1) {
              col = col - td.colSpan + 1
            }
          })
          td = tr.querySelectorAll('td')[col]
          td && td.classList.add('bg-gray')
        })
      }
      if (table.hightlights.value) {
        valuePosition = valuePosition.concat(table.hightlights.value)
      }
      if (table.hightlights.value_rate) {
        valuePosition = valuePosition.concat(table.hightlights.value_rate)
      }
      valuePosition.forEach(cell => {
        tr = container.querySelectorAll('tr')[cell.row]
        let trs = [...tr.querySelectorAll('td')]
        let col = cell.column
        trs.forEach(td => {
          if (td.colSpan && td.colSpan > 1) {
            col = col - td.colSpan + 1
          }
        })
        td = tr.querySelectorAll('td')[col]
        td && td.classList.add('bg-blue')
      })
    } catch (err) {
      console.error(err)
    }
    table.html = container.innerHTML
  })

  return tables
}
function calcTableTitleList (tables) {
  let tableTitleList = []
  let container = document.createElement('div')
  tables.forEach((table, index) => {
    if (table.html === '') {
      return
    }
    container.innerHTML = table.html
    let params = {
      id: index
    }
    params.name = container.querySelectorAll('p')[0].innerText
    if (params.name.length > 50) {
      params.name = container.querySelectorAll('p')[1].innerText
    }
    tableTitleList.push(params)
  })
  return tableTitleList
}
</script>
<style lang="less">
@import "../../assets/less/variables.less";
.doc-name{
  font-weight: 20px;
  font-weight: bold;
  line-height: 2;
  margin-bottom: 10px;
}
.tables-wrapper{
  .bg-green{
    background-color: #13CE66;
    opacity: .8;
    cursor: pointer;
  }
  .bg-yellow{
    background-color: #F7BA2A;
    opacity: .8;
    cursor: pointer;
  }
  .bg-gray{
    background-color: #D3DCE6;
    opacity: .8;
    cursor: pointer;
  }
  .bg-blue{
    background-color: #58B7FF;
    opacity: .8;
    cursor: pointer;
  }
  .bg-red{
    background-color: #FF4949;
    opacity: .8;
    cursor: pointer;
  }
  padding: 0 30px;
  .table-item{
    margin-bottom: 50px;
    &>p:nth-child(1){
      float: left;
    }
    &>p:nth-child(2){
      float: right;
    }
    table{
      table-layout: fixed;
      width: 100%;
      text-align: center;
      border-collapse: collapse;
    }
    thead{
      background: @gray-lighter;
      border-bottom: 2px solid @silver-base;
    }
    th{
      border: 1px solid @silver-base;
    }
    td{
      border: 1px solid @silver-base;
      padding: 5px 0;
      word-wrap:break-word;
    }
  }
}
.color-info{
  display: flex;
  padding: 0 30px;
  margin-bottom: 10px;
  .item{
    height: 20px;
    width: 20px;
    margin-right: 5px;
  }
  .label{
    margin-right: 10px;
  }
  .bg-green{
    background-color: #13CE66;
    opacity: .8;
    cursor: pointer;
  }
  .bg-yellow{
    background-color: #F7BA2A;
    opacity: .8;
    cursor: pointer;
  }
  .bg-gray{
    background-color: #D3DCE6;
    opacity: .8;
    cursor: pointer;
  }
  .bg-blue{
    background-color: #58B7FF;
    opacity: .8;
    cursor: pointer;
  }
  .bg-red{
    background-color: #FF4949;
    opacity: .8;
    cursor: pointer;
  }
}
.contents-wrapper{
  padding: 20px 30px;
  line-height: 2;
  overflow: hidden;
  font-size: 15px;
  margin: 0px 0 50px;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #777;
  .content-item{
    text-decoration: underline;
    cursor: pointer;
  }
  .l{
    margin-right: 50px;
    max-width: 50%;
  }
  .r{
    max-width: 50%;
  }
}
.back-to-top{
  position: fixed;
  right: 0px;
  bottom: 50px;
  background-color: #fff;
  padding: 3px 10px;
  border-radius: 5px 0 0 5px;
  box-shadow: 0 0 7px #c7c7c7;
  z-index: 10;
  font-size: 14px;
  cursor: pointer;
}
</style>
