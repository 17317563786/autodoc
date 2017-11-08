<template>
  <div class="formula-wrapper">
    <div v-if="isEnd">
      <el-tooltip class="item" effect="dark" :content="current.table_triples ? '数值来源：表格' : '数值来源：句子'" placement="top">
        <div
          v-if="current.text_quadruple"
          class="formula-end-item"
          :class="{
            'current': current.table_triples && $store.state[storeName].formulaCurrentItem.index === current.index
          }"
          @click="handleClickFormulaEnd">
          <div class="tpav-wrapper">
            <span class="time" v-if="current.text_quadruple.time">{{current.text_quadruple.time.value}}</span>
            <span class="attr" v-if="current.text_quadruple.attribute">{{current.text_quadruple.attribute.value}}</span>
            <span class="preat" >
              <span v-for="(preattr, preattrIndex) in current.text_quadruple.preattributes">
                {{preattr.value}}
                {{++preattrIndex == current.text_quadruple.preattributes.length ? '' : ', '}}
              </span>
            </span>
            <span class="value" v-if="current.text_quadruple.value">{{current.text_quadruple.value.value}}</span>
            <span v-if="!current.text_quadruple.value && !current.table_triples" class="value"> ？</span>
          </div>
          <div v-if="current.table_triples" class="select-bottom-bar" :class="current.table_triples.length > 1 ? '' : 'pointer'">
            <el-select
              ref="select"
              v-model="current.current_table"
              @change="handleSelectChange"
              :disabled="current.table_triples.length <= 1">
              <el-option
                v-for="(item, index) in current.table_triples"
                :label="item.value + item.value_unit"
                :value="index">
                <div class="align-right">{{item.value + item.value_unit}}</div>
              </el-option>
            </el-select>
          </div>
        </div>
        <div v-else
          class="formula-end-item"
          @click="handleClickFormulaEnd">
          <span class="value no">
            <p class="fs-12">文本中的值为</p>
            <p class="fs-18">{{ current.text_word.value }}</p>
          </span>
        </div>
      </el-tooltip>
    </div>
    <div v-else>
    <!-- 如果是除法，需要查询下一层节点是不是结束标志，如果不是，加上括号 -->
      <span  v-if="current.operator == '/' && !~endSymbol.indexOf(findRelationItem(current.left).operator)" class="except">（</span>
      <formula :data="data" :current="findRelationItem(current.left)" :storeName="storeName"></formula>
      <span  v-if="current.operator == '/' && !~endSymbol.indexOf(findRelationItem(current.left).operator)" class="except">）</span>

      <div class="formula-operator">{{current.operator}}</div>

      <span  v-if="current.operator == '/' && !~endSymbol.indexOf(findRelationItem(current.right).operator)" class="except">（</span>
      <formula :data="data" :current="findRelationItem(current.right)" :storeName="storeName"></formula>
      <span  v-if="current.operator == '/' && !~endSymbol.indexOf(findRelationItem(current.right).operator)" class="except">）</span>
    </div>
  </div>
</template>
<script>
import formula from 'src/components/formula.vue'

export default {
  name: 'formula',
  components: {
    formula
  },
  props: {
    data: {
      type: Array,
      required: true
    },
    current: {
      type: Object,
      required: true
    },
    storeName: {
      type: String,
      required: true
    }
  },
  computed: {
    isEnd () {
      return ~this.endSymbol.indexOf(this.current.operator)
    }
  },
  data () {
    return {
      endSymbol: ['p&v', 't&a', '']
    }
  },
  methods: {
    findRelationItem (index) {
      return this.data.filter(item => {
        return item.index === index
      })[0]
    },
    handleClickFormulaEnd () {
      this.$store.commit(this.storeName + '/set_formula_current_item', this.current)
      // hack here 点击外层掉起select的下来菜单
      if (this.current.table_triples &&
          this.current.table_triples.length > 1 &&
          !this.$refs.select.visible) {
        this.$refs.select.handleFocus()
      }
    },
    handleSelectChange (value) {
      this.$store.commit(this.storeName + '/set_formula_current_item', this.current)
      let ids = this.$store.state[this.storeName].activeCollapseName.split('_')
      this.$store.commit(this.storeName + '/set_relation_item_current_table', {
        revisionItemId: Number(ids[1]),
        relaitonItemIndex: this.current.index,
        tableIndex: Number(value)
      })
    }
  }
}
</script>
<style lang="less">
.formula-wrapper{
  font-size: 12px;
  display: inline-block;
  vertical-align: middle;
  padding: 0 5px;
  text-align: center;
  white-space: nowrap;
  .formula-operator{
    display: inline-block;
    vertical-align: middle;
    margin: 0 10px;
    font-size: 28px;
    font-weight: 200;
    line-height: 40px;
  }
  .except{
    display: inline-block;
    vertical-align: middle;
    font-size: 32px;
    font-weight: 200;
  }
  .formula-end-item{
    display: inline-block;
    position: relative;
    background-color: #EFF2F7;
    border: 1px solid #C8D5EA;
    cursor: pointer;
    padding: 3px;
    transition: box-shadow .3s;
    &:hover{
      box-shadow: 1px 3px 10px #a7a7a7;
    }
    &:active{
      box-shadow: none;
    }
    &.current:after{
      border-top: 1px solid #333;
      border-left: 1px solid #333;
      content: '';
      height: 20px;
      width: 20px;
      position: absolute;
      left: 90px;
      top: 75px;
      z-index: 1;
      transform: rotate(45deg);
      background-color: #fff;
    }
    .tpav-wrapper{
      position: relative;
      padding: 10px;
      width: 200px;
      height: 60px;
      text-align: center;
    }
    .select-bottom-bar{
      width: 100%;
      position: absolute;
      right: 0;
      bottom: 16px;
      line-height: 1.3;
      text-align: center;
      &.pointer{
        .el-input__inner{
          cursor: pointer;
        }
      }
      .el-select{
        width: 100%;
      }
      .el-input__inner{
        background-color: transparent;
        border-radius: 0;
        border: none;
        font-size: 16px;
        padding: 2px 3px;
        text-align: center;
        height: 20px;
        color: #e6063d;
      }
      .el-input__icon{
        width: 15px;
        color: #e6063d;
        top: 25px;
        left: 92.5px;
        font-size: 18px;
      }
    }
    .time{
      position: absolute;
      left: 0;
      top: 0;
      line-height: 1.3;
      max-width: 50%;
      overflow-x: hidden;
      text-overflow: ellipsis;
    }
    .attr{
      position: absolute;
      right: 0;
      top: 0;
      line-height: 1.3;
      max-width: 50%;
      overflow-x: hidden;
      text-overflow: ellipsis;
    }
    .preat{
      width: 100%;
      text-align: center;
      position: absolute;
      top: 16px;
      left: 0;
      line-height: 1.3;
      max-width: 100%;
      overflow-x: hidden;
      text-overflow: ellipsis;
    }
    .value{
      width: 100%;
      position: absolute;
      right: 0;
      bottom: 10px;
      line-height: 1.3;
      text-align: center;
      font-size: 16px;
      &.no{
        position: static;
        display: block;
        line-height: 40px;
        text-align: center;
        line-height: 1.6;
      }
    }
  }
}
.align-right{
  text-align: right;
}
</style>