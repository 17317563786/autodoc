<template>
  <div :class="operator === '/' ? 'block' : 'inline-block'">
    <relation-item v-if="isNumber(item.left) && ~indexList.indexOf(item.left)" :relations="relations" :quadruples="quadruples" :item="findItemByIndex(item.left)" :operator="item.operator"></relation-item>
    <div v-if="isNumber(item.left) && !~indexList.indexOf(item.left)" class="inline-block"
    @mouseover="rectHover(item.left)" @mouseout="rectHover({})">
      <div class="item rect">
        <span class="value no">{{findQuadrupleByIndex(item.left).value}}</span>
      </div>
    </div>

    <div v-if="!isNumber(item.left)" :class="item.operator === '/' ? 'block' : 'inline-block'"
    @mouseover="rectHover(item.left)" @mouseout="rectHover({})">
      <div class="item rect">
        <span class="time" v-if="item.left.time">{{quadruples.times[item.left.time].value}}</span>
        <span class="time" v-else>? &nbsp;</span>
        <span class="preattribute">
          <span v-if="item.left.preattributes && item.left.preattributes.length>0">
            <span v-for="preId in item.left.preattributes">[{{quadruples.preattributes[preId].value}}]</span>
          </span>
          <span v-else>&nbsp;</span>
        </span>
        <span class="attribute" v-if="item.left.attribute">{{quadruples.attributes[item.left.attribute].value}}</span>
        <span class="attribute" v-else>? &nbsp;</span>
        <span class="value" v-if="item.left.value">{{quadruples.values[item.left.value].value}}</span>
        <span class="value" v-else>? &nbsp;</span>
      </div>
    </div>

    <div  v-if="item.operator !== '/'" class="inline-block">
      <div class="item op">
        {{item.operator}}
      </div>
    </div>
    <div v-if="item.operator === '/'" class="line"></div>

    <div v-if="!isNumber(item.right)" :class="item.operator === '/' ? 'block' : 'inline-block'"
    @mouseover="rectHover(item.right)" @mouseout="rectHover({})">
      <div class="item rect">
        <span class="time" v-if="item.right.time">{{quadruples.times[item.right.time].value}}</span>
        <span class="time" v-else>? &nbsp;</span>
        <span class="preattribute">
          <span v-if="item.right.preattributes && item.right.preattributes.length>0">
            <span v-for="preId in item.right.preattributes">[{{quadruples.preattributes[preId].value}}]</span>
          </span>
          <span v-else>&nbsp;</span>
        </span>
        <span class="attribute" v-if="item.right.attribute">{{quadruples.attributes[item.right.attribute].value}}</span>
        <span class="attribute" v-else>? &nbsp;</span>
        <span class="value" v-if="item.right.value">{{quadruples.values[item.right.value].value}}</span>
        <span class="value" v-else>? &nbsp;</span>
      </div>
    </div>

    <relation-item v-if="isNumber(item.right) && ~indexList.indexOf(item.right)" :relations="relations" :quadruples="quadruples" :item="findItemByIndex(item.right)" :operator="item.operator"></relation-item>
    <div v-if="isNumber(item.right) && !~indexList.indexOf(item.right)" @mouseover="rectHover(item.right)" @mouseout="rectHover({})" class="inline-block">
      <div class="item rect">
        <span class="value no">{{findQuadrupleByIndex(item.right).value}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { isEmpty } from 'src/util/tools'
import relationItem from './relation-item.vue'
export default {
  name: 'relation-item',
  components: {
    relationItem
  },
  props: {
    relations: {
      type: Array,
      required: true
    },
    quadruples: {
      type: Object,
      required: true
    },
    item: {
      type: Object,
      required: true
    },
    operator: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      endSymbol: ['p&v', '', 't&a']
    }
  },
  computed: {
    indexList () {
      return this.relations.map(item => {
        return item.index
      })
    },
    quadruplesArray () {
      let attributes = []
      Object.keys(this.quadruples.attributes).forEach(key => {
        attributes.push(this.quadruples.attributes[key])
      })
      let preattributes = []
      Object.keys(this.quadruples.preattributes).forEach(key => {
        preattributes.push(this.quadruples.preattributes[key])
      })
      let times = []
      Object.keys(this.quadruples.times).forEach(key => {
        times.push(this.quadruples.times[key])
      })
      let values = []
      Object.keys(this.quadruples.values).forEach(key => {
        values.push(this.quadruples.values[key])
      })

      return {
        attributes,
        preattributes,
        times,
        values
      }
    }
  },
  methods: {
    findItemByIndex (targetIndex) {
      return this.relations.filter((item) => {
        return item.index === targetIndex
      })[0]
    },
    findQuadrupleByIndex (targetIndex) {
      return this.quadruplesArray.attributes.concat(this.quadruplesArray.preattributes).concat(this.quadruplesArray.times).concat(this.quadruplesArray.values).filter((item) => {
        return item.word_index === targetIndex
      })[0]
    },
    isNumber (number) {
      return typeof number === 'number'
    },
    rectHover (hoverData) {
      if (typeof hoverData === 'number') {
        hoverData = {
          value: this.findQuadrupleByIndex(hoverData)
        }
      } else {
        if (!isEmpty(hoverData)) {
          let preattributes = []
          if (hoverData.preattributes) {
            preattributes = hoverData.preattributes.map(preAttr => {
              return this.quadruples.preattributes[preAttr]
            })
          }

          hoverData = {
            attribute: this.quadruples.attributes[hoverData.attribute],
            time: this.quadruples.times[hoverData.time],
            value: this.quadruples.values[hoverData.value],
            preattributes
          }
        }
      }
      this.$root.$emit('relaiton-item-hover', hoverData)
    }
  }
}
</script>