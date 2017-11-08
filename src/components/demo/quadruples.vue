<template>
  <div class="demo-quadruples">
    <div v-if="editableQuadruples.length">
      <el-table row-class-name="rowClass" @cell-mouse-enter="hoverTpav" :data="editableQuadruples" style="width: 100%">
        <el-table-column prop="time.value" align="center" label="时间" width="140">
          <template scope="scope">
            <div @click="editTPAV(scope.row, 'time')" class="overflow" :class="editQuadruples ? 'time' : ''">
              {{scope.row.time.value}}
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="定语/属性">
          <template scope="scope">
            <div class="attr-and-preat">
              <span v-for="preattr in scope.row.preattributes" class="preattr-item">[{{preattr.preattributes.value}}]</span>
              <span class="attribute">{{scope.row.attribute.value}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="value.value" align="center" label="值">
          <template scope="scope">
            <div @click="editTPAV(scope.row, 'value')" slot="reference" class="overflow" :class="editQuadruples ? 'value' : ''">
              <span v-if="scope.row.value">{{scope.row.value.value || scope.row.value}}</span>
              <span v-else>?</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else>无</div>
    <!--对话框-->
    <el-dialog title="修改" v-model="dialogVisible">
      <div v-if="editItem === 'time'" class="edit-item">
        <span>时间：</span>
        <el-input class="input edit-input" v-model="editRow.time.value" placeholder="请输入时间"></el-input>
      </div>
      <!--<div class="edit-item">
                      <span>属性：</span>
                      <el-input class="input edit-input" v-model="editRow.attribute.value" placeholder="请输入属性"></el-input>
                    </div>-->
      <div v-if="editItem === 'value'" class="edit-item">
        <span>值：</span>
        <el-input class="input value-input" v-model="editRow.value.value" placeholder="请输入值"></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmDialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { steamroller } from 'src/util/tools'
export default {
  name: 'demo-quadruples',
  props: {
    quadruples: {
      type: Array
    },
    editQuadruples: {
      default: false,
      type: Boolean
    },
    relations: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      editableQuadruples: [],
      dialogVisible: false,
      editItem: '',
      editRow: {
        time: '',
        value: '',
        attribute: '',
        preattributes: []
      }
    }
  },
  watch: {
    relations() {
      this.findEditableTpav()
    }
  },
  methods: {
    findEditableTpav() {
      var arr = steamroller(this.relations)
      var arr2 = arr.filter(i => {
        if (i.operator) return false
        if (!i.time) return false
        return true
      })
      // 这里的去重用了好多循环写的不好
      var arr3 = this.quadruples.concat(arr2)
      var res = []
      for (var i = 0, len = arr3.length; i < len; i++) {
        var item = arr3[i]
        for (var j = 0, jLen = res.length; j < jLen; j++) {
          if (this.same(res[j], item)) break
        }
        if (j === jLen) res.push(item)
      }
      this.editableQuadruples = res
    },
    same(a, b) {
      var num = 1
      if (a.value && b.value) {
        if (a.value.checksum === b.value.checksum) num += 1
      }
      if (a.time && b.time) {
        if (a.time.checksum === b.time.checksum) num += 1
      }
      if (a.attribute && b.attribute) {
        if (a.attribute.checksum === b.attribute.checksum) num += 1
      }
      var p1 = a.preattributes.map(i => i.preattributes.checksum)
      var p2 = b.preattributes.map(i => i.preattributes.checksum)
      if (p1.every(i => p2.includes(p1))) num += 1
      return num === 4
    },
    // 只管进入表格的
    hoverTpav(item) {
      this.$emit('hoverTpav', item)
    },
    editTPAV(row, editItem) {
      if (!this.editQuadruples) return
      if (editItem === 'value') {
        if (!row.value) {
          this.$message({
            message: '该值不可修改',
            type: 'warning'
          })
          return
        }
        if (!row.value.value) {
          this.$message({
            message: '该值为计算结果不可修改',
            type: 'warning'
          })
          return
        }
      }
      this.editItem = editItem
      this.editRow = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },
    confirmDialog() {
      var editRow = this.editRow
      var { preattributes, ...rest } = editRow
      typeof (preattributes)
      // console.log(preattributes)
      // 目前还不能修改定语
      var update = Object.keys(rest).map(key => {
        var obj = {
          word_index: editRow[key].word_index,
          word_type: key,
          word: editRow[key].value
        }
        return obj
      })
      this.$store.dispatch('demo/updateSentence', update)
      this.dialogVisible = false
    }
  }
}
</script>
<style lang="less">
.demo-quadruples {
  .overflow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .edit-item {
    display: flex;
    margin-bottom: 20px;
    align-items: center;
  }
  .attribute,
  .preattr-item {
    margin-left: 6px;
  }
  .attr-and-preat {
    text-align: center;
  }
  .time:hover,
  .value:hover {
    color: #50bfff
  }
  .time,
  .value {
    cursor: pointer;
  }
  .input {
    flex: 1;
  }
  .split {
    font-weight: 500;
  }
}
</style>
