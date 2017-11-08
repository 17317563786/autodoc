<template>
  <div class="demo-autodoc-wrapper">
    <div class="excel-btn-wrapper">
      <el-button type="primary" @click="uploadClick">点击上传</el-button>
      <span>支持主流excel的格式</span>
      <a class="ml10 fs-13" href="./static/模板.xlsx" target="_blank">Excel模版下载</a>
      <input ref="upload" id="upload-input" type="file" class="c-hide" @change="handleFileChange">
    </div>
    <div class="handle-wrapper">
      <div class="sheets-inner">
        <div class="sheets">
          <el-radio-group v-model="tabIndex" @change="tabClick">
            <el-radio-button v-for="(sheet, index) in tpavSheets" :label="index">{{sheet.sheetName}}</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div class="choose-tag">
        <div class="choose-tag-inner">
          <el-tag v-for="tag in chooseTags" :closable="true" :close-transition="true" @close="removeTag(tag)" class="choose-tag-item" type="gray">
            {{tag.attr}}
          </el-tag>
          <el-button v-if="chooseTags.length" type="primary" class="write-button" @click="writeSentence" size="small">生成句子</el-button>
        </div>
      </div>
    </div>
    <div class="autodoc-result-wrapper">
      <div class="sheet-wrapper" v-loading="loading">
        <div class="sheet-wrapper-inner">
          <div v-if="curSheet.length">
            <el-tag class="attr-item" @click.native="chooseTag(tpav)" type="gray" v-for="tpav in curSheet">{{tpav.attr}}</el-tag>
          </div>
          <div v-else>暂无属性</div>
        </div>
      </div>
      <div class="autodoc-sentence-wrapper">
        <div class="autodoc-sentence-wrapper-inner">
          <div v-if="autoDocSentenceList.length" v-loading="sentenceLoading" class="result-sentence">
            <div v-for="sentence in autoDocSentenceList">{{sentence}}</div>
          </div>
          <div v-else>暂无相似句子</div>
        </div>
      </div>
    </div>
    <div class="instructions">*请在上面的标签中任选1 - 3个，即可生成句子</div>
  </div>
</template>
<script>
function fixdata(data) {
  var o = ''
  var l = 0
  var w = 10240
  for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)))
  o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)))
  return o
}
/**
 * 下面是解析表格的函数
 */
function locationSheet(workSheet) {
  // 如果表时空的那么返回一个空数组
  if (!workSheet['!ref']) return []
  // 拿到范围
  var ref = workSheet['!ref']
  // 拿到表头所占的行数
  var tHeadLength = workSheet['!merges'] ? workSheet['!merges'].length : 0
  var xStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  var xArr = xStr.split('')
  // 现在X坐标只能处理到A-Z的数据
  var [startPoint, endPoint] = ref.split(':')
  var [sX, sY] = match(startPoint)
  var [eX, eY] = match(endPoint)
  // 表头的处理也太固定了，写的太死了
  var tableNames = [...Array(tHeadLength)].map((i, index) => workSheet[`${sX}${+sY + index}`].v)
  var xRange = xArr.slice(xArr.indexOf(sX), xArr.indexOf(eX) + 1)
  var yArr = [...Array(Number(eY) + 1)].map((i, index) => index)
  var yRange = yArr.slice(yArr.indexOf(Number(sY) + tHeadLength))
  return {
    sheets: parseSheet(workSheet, xRange, yRange),
    tableNames
  }
}
function match(str) {
  // 如果不是字符串格式返回
  // 这个正则表达式写的不太好啊
  if (typeof str !== 'string') return ['A', '1']
  var word = str.match(/^[A-Z]+/gi)[0]
  var num = str.match(/\d+$/gi)[0]
  return [word, num]
}

function parseSheet(workSheet, xRange, yRange) {
  var arr = []
  var attr = xRange.shift() // A
  var time = yRange.shift() // 3
  xRange.forEach(x => {
    yRange.forEach(y => {
      arr.push({
        value: `${x}${y}`,
        attr: `${attr}${y}`,
        time: `${x}${time}`
      })
    })
  })
  arr.forEach(i => {
    Object.keys(i).forEach(key => {
      i[key] = workSheet[`${i[key]}`] ? workSheet[`${i[key]}`].v : ''
    })
  })
  return formateTime(arr)
}
function formateTime(arr) {
  arr.forEach(i => {
    if (typeof i.time === 'number') {
      i.time = dateTimeFormatter((i.time - 19 - 70 * 365) * 86400 - 3600 * 8, 'yyyy年MM月dd日')
    }
  })
  return arr
}
function uniqueAtrr(sheets) {
  if (!sheets) return []
  var seen = new Map()
  return sheets.filter(tav => {
    return !seen.has(tav.attr) && seen.set(tav.attr, 1)
  })
}
import XLSX from 'xlsx'
import { dateTimeFormatter } from 'util/tools'
import { mapGetters } from 'vuex'
export default {
  name: 'demo-auto-doc',
  data() {
    return {
      tpavSheets: [],
      // loading
      loading: false,
      sentenceLoading: false,
      // 去重后的tav
      uniqueAtrr: [],
      // 分页
      pager: {
        page: 1,
        size: 20,
        total: 0
      },
      tabIndex: 0,
      // 当前选中的表格
      curSheet: [],
      // 选中的标签
      chooseTags: []
    }
  },
  computed: {
    ...mapGetters({
      autoDocSentenceList: 'getAutodocSentenceList'
    })
  },
  watch: {
    autoDocSentenceList() {
      this.sentenceLoading = false
    }
  },
  methods: {
    async handleFileChange(e) {
      this.loading = true
      this.tpavSheets = []
      // 只读取第一个文件
      var file = e.target.files[0]
      var wb = await this.fileConvertToWorkbook(file)
      // 获取sheet表名的数组
      var sheetNames = wb.SheetNames
      var sheets = sheetNames.map(i => {
        var worksheet = wb.Sheets[i]
        var tpav = locationSheet(worksheet)
        return {
          sheetName: i,
          tableNames: tpav.tableNames,
          tpavTable: tpav.sheets,
          uniqueAtrrTable: uniqueAtrr(tpav.sheets)
        }
      })
      // 去一下重
      this.curSheet = sheets[0].uniqueAtrrTable
      setTimeout(_ => {
        this.loading = false
        this.tpavSheets = sheets
      }, 1000)
    },
    fileConvertToWorkbook(file) {
      var reader = new window.FileReader()
      // 当读取操作完成的时候，readyState 变成已完成（DONE），并触发 loadend 事件，同时 result 属性中将包含一个 ArrayBuffer 对象以表示所读取文件的数据。
      return new Promise((resolve, reject) => {
        reader.readAsArrayBuffer(file)
        reader.onload = (e) => {
          let data = e.target.result
          let arr = fixdata(data)
          var workbook = XLSX.read(window.btoa(arr), { type: 'base64' })
          resolve(workbook)
        }
        reader.onerror = (err) => reject(err)
      })
    },
    tabClick(index) {
      this.curSheet = this.tpavSheets[index].uniqueAtrrTable
      this.chooseTags = []
    },
    // 选择标签
    chooseTag(tpav) {
      // 下面这里先放着
      var tags = this.chooseTags
      if (tags.length >= 3) {
        this.$message({
          message: '最多选择三个属性',
          type: 'warning'
        })
        return
      }
      tags.some(i => i.attr === tpav.attr)
        ? tags.filter(i => i.attr !== tpav.attr)
        : tags.push(tpav)
      this.chooseTags = tags
    },
    // 移除标签
    removeTag(tag) {
      this.chooseTags.splice(this.chooseTags.indexOf(tag), 1)
    },
    writeSentence() {
      this.sentenceLoading = true
      var tableNames = this.tpavSheets[this.tabIndex].tableNames
      var title = tableNames[0]
      // 下面还得必须是中文字符的冒号，限制太多了
      var unit = tableNames[1].split('：')[1]
      var tags = this.chooseTags
      var tavs = tags.map(i => {
        return {
          title,
          time: i.time,
          attribute: i.attr,
          value: `${i.value}${unit}`
        }
      })
      var params = { tavs }
      this.$nextTick(_ => {
        this.$store.dispatch('demo/autoDoc', params)
      })
    },
    uploadClick() {
      var uploadInput = this.$refs.upload
      uploadInput.value = null
      uploadInput.click()
      this.$store.commit('demo/autoDoc/clearSentence')
    }
  }
}
</script>
<style lang="less">
.demo-autodoc-wrapper {
  padding: 20px;
  .instructions {
    margin-top: 20px;
    font-weight: 700;
    color: #777;
  }
  .autodoc-result-wrapper {
    height: 200px;
  }
  .handle-wrapper {
    align-items: center;
    .choose-tag {
      padding-left: 8px;
      .choose-tag-item {
        margin-right: 10px;
      }
    }
    .write-button {
      margin-right: 10px;
    }
  }
  .autodoc-result-wrapper,
  .handle-wrapper {
    margin-top: 20px;
    display: flex;
    &>div {
      width: 50%;
      height: 100%;
    }
    .sheet-wrapper {
      padding-right: 8px;
      .sheet-wrapper-inner {
        box-shadow: 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12), 0 2px 4px -1px rgba(0, 0, 0, .2);
        border-radius: 2px;
        overflow-y: scroll;
        height: 100%;
        padding: 8px;
      }
    }
    .autodoc-sentence-wrapper {
      padding-left: 8px;
      .autodoc-sentence-wrapper-inner {
        height: 100%;
        padding: 8px;
        color: #777;
        font-size: 20px;
        background: whitesmoke;
        border: 1px solid whitesmoke;
        .result-sentence {
          height: 100%;
        }
      }
    }
    .attr-item {
      margin: 10px;
      cursor: pointer;
    }
  }
}
</style>