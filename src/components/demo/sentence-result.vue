<template>
  <div class="sentence-result-wrapper">
    <sentence :sentence="sentence"></sentence>
    <slot></slot>
    <div class="result-wrapper">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="提取值" name="quadruples">
          <quadruples :quadruples="quadruples" :relations="relations" :editQuadruples="editQuadruples" @hoverTpav="hoverTpav"></quadruples>
        </el-tab-pane>
        <el-tab-pane label="提取关系" name="relations">
          <relations :relations="relations" @hoverTpav="hoverTpav"></relations>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
import sentence from './sentence'
import quadruples from './quadruples'
import relations from './relations'
import { isArray, isObject, isNumber } from 'src/util/tools'
export default {
  name: 'sentence-result',
  components: {
    sentence,
    quadruples,
    relations
  },
  props: {
    resultData: {
      type: Object
    },
    editQuadruples: {
      type: Boolean,
      default: false
    },
    value: null
  },
  data() {
    return {
      activeTab: 'quadruples',
      backData: {},
      sentence: [],
      quadruples: [],
      relations: []
    }
  },
  watch: {
    resultData() {
      this.handleData()
    },
    value(val) {
      this.activeTab = val
    },
    activeTab(val) {
      this.$emit('input', val)
    }
  },
  mounted() {
    this.handleData()
    // this.$on('')
  },
  methods: {
    handleData() {
      var data = this.resultData
      if (data) {
        data.updated_text = data.updated_text || data.text
        Object.keys(data).forEach(key => {
          // 如果他为null，就让他变成空对象，暂时先这样处理
          data[key] = data[key] || {}
        })
        this.backData = data
        // 先把句子拆分开
        this.drawSentence()
        // 再把值提取出来
        this.drawQuadruples()
        // 在把关系提取出来
        this.drawRelation()
      }
    },
    // 拆分句子
    drawSentence() {
      var update = this.editQuadruples
      var text = update ? this.backData.updated_text : this.backData.text
      // 下面这几个变量名也应该弄成动态的
      var time, attribute, preattributes, value
      time = attribute = preattributes = value = !1
      var list = text.split('').map((i, index) => {
        return { text: i, time, attribute, preattributes, value, index }
      })
      this.sentence = list
      // 给重新高亮文字时用的
      this.backList = list
    },
    drawQuadruples() {
      var data = this.backData
      let quadruples = data.quadruples.map(i => this.findTpav(i))
      this.quadruples = quadruples
    },
    drawRelation() {
      var data = this.backData
      // 先处理操作符
      data.relations_over_tuple.forEach(i => {
        if (i.operator === '--' || i.operator === '//' || i.operator === '~CGR') {
          [i.left, i.right] = [i.right, i.left]
          i.operator = i.operator.slice(1)
        }
        if (i.operator === '/') i.operator = '÷'
        if (i.operator === 'CGR') i.operator = '符合增长率'
      })
      // 然后在筛选出来有几个关系式
      var relationArr = data.relations_over_tuple.filter(i => {
        return i.operator === '=' || i.operator === '≈' || i.operator === '>' || i.operator === '<' || i.operator === '>=' || i.operator === '<='
      })
      // 首先计算好所有的allIdx，放到data里面
      this.allIdx = this.calculateIdx(data)
      this.backData = data
      var arr = relationArr.map(i => {
        var oarr = this.parseObj(i)
        oarr = this.steamroller(oarr)
        return oarr
      })
      this.relations = arr
    },
    // 扁平化数组，这个方法还可以在优化
    steamroller(arr) {
      return arr.reduce((a, b) => a.concat(isArray(b) ? this.steamroller(b) : b), [])
    },
    // 这个方法和下面的方法形成递归
    findObj(val) {
      var obj = {}
      if (isNumber(val)) {
        obj = this.allIdx.find(i => {
          if (isArray(i.f_index)) {
            return i.f_index.includes(val)
          }
          return i.f_index === val
        })
        return this.parseObj(obj)
      }
      return this.parseObj(val)
    },
    parseObj(val) {
      var obj = {}
      if (val.operator) {
        var left, right
        left = val.left
        right = val.right
        // 判断运算符是否加括号
        if (val.operator === '+' || val.operator === '-' || val.operator === '符合增长率') {
          return [{ operator: '(' }, this.findObj(left), val, this.findObj(right), { operator: ')' }]
        }
        return [this.findObj(left), val, this.findObj(right)]
      } else if (val.f_type) {
        obj[val.f_type] = val
        return obj
      }
      return this.findTpav(val)
    },
    // (这个函数的写法还不是很好，需要修改一下)
    calculateIdx({ attributes, preattributes, times, values, relations_over_tuple }) {
      var tpav = { attribute: attributes, preattributes, time: times, value: values }
      var tpavArr = Object.keys(tpav).reduce((acc, key) => {
        var obj = tpav[key]
        var arr = Object.keys(obj).map(k => {
          obj[k].f_type = key
          obj[k].f_index = obj[k].word_index
          return obj[k]
        })
        return acc.concat(arr)
      }, [])
      relations_over_tuple.forEach(i => {
        i.f_index = i.index
      })
      return relations_over_tuple.concat(tpavArr)
    },
    // 找到对应代号tpav实体(这里判断空的情况先待定)
    findTpav(obj) {
      // 不能直接在参数上面进行修改
      var tpav = {}
      var data = this.backData
      tpav.time = obj.time ? data.times[obj.time] : ''
      tpav.attribute = obj.attribute ? data.attributes[obj.attribute] : ''
      tpav.value = obj.value ? data.values[obj.value] : obj.value_str
      tpav.preattributes = obj.preattributes ? obj.preattributes.map(j => {
        return { preattributes: data.preattributes[j] }
      }) : []
      return tpav
    },
    // 替换文字
    replaceWord(item, wordList) {
      Object.keys(item).forEach(key => {
        var obj = item[key]
        if (isArray(obj)) {
          if (obj.length) {
            obj.forEach(i => {
              this.replaceWord(i, wordList)
            })
          }
        } else if (isObject(obj)) {
          var delArr = wordList.splice(obj.position, obj.value.length)
          delArr.forEach(i => { i[key] = true })
          wordList.splice(obj.position, 0, ...delArr)
        }
      })
      return wordList
    },
    hoverTpav(item) {
      // 因为数组中的元素是对象，所以需要深度拷贝一下,这里一会儿看看还能不能再改一下
      var wordList = JSON.parse(JSON.stringify(this.backList))
      wordList = this.replaceWord(item, wordList)
      this.sentence = wordList
    }
  }
}
</script>
<style lang="less">
.sentence-result-wrapper {
  padding: 10px 0;
  height: 100%;
  .result-wrapper {
    height: ~'calc(100% - 210px)';
    overflow-y: scroll;
    box-shadow: 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12), 0 2px 4px -1px rgba(0, 0, 0, .2);
    padding: 10px;
    box-sizing: border-box;
  }
}
</style>