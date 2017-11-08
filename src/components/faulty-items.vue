<template>
  <div class="faulty-revisions-wrapper" v-loading="loading">
    <el-collapse
      v-if="faulties.length !== 0"
      v-model="activeCollapse"
      @change="showCommentDetail" accordion>
      <el-collapse-item
        v-for="(falutyList, tips) in faulties"
        :name="tips">
        <template slot="title">
          <el-tag type="success">句子数量：{{falutyList.length}}</el-tag>
          <span class="ml10">{{tips}}</span>
        </template>
        <div
          class="faulty-collapse-item-wrapper"
          v-loading="falutyList[0].f_html_paragraph == ' '">
          <div v-if="$store.state.userInfo.type !== 'normal'" class="fl-r mr10">
            <el-button
              type="text"
              size="small"
              @click.native="copyUrl(tips)">复制链接地址</el-button>
          </div>
          <el-table
            v-if="activeCollapse === tips"
            :data="falutyList"
            stripe
            style="width: 100%">
            <el-table-column
              prop="date"
              :label="tips + ' (文档中的句子)'">
              <template scope="scope">
                <div class="paragraph" v-html="taggingWordsForHTML(scope.row.f_html_paragraph, falutyPositionToValuePosition(scope.row.f_html_paragraph, scope.row.faulty_wording), scope.row.index_in_para)">
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="180">
              <template scope="scope">
                <el-button
                  v-if="$store.state.userInfo.type !== 'normal' && storeName === 'fileDetail' "
                  :type="scope.row.internal_status ? 'danger' : 'warning'" size="small" icon="information"
                  @click="hideRevisionItemForUser(scope.row.id, scope.row.internal_status)">
                  对用户{{scope.row.internal_status ? '显示' : '隐藏'}}
                </el-button>
                <el-button
                  v-if="$store.state.userInfo.type === 'normal'
                  && (scope.row.user_choice === 0 || scope.row.user_choice === -1)"
                  type="success" icon="edit" size="small"
                  @click="handleUserChoiceChange(scope.row.id, scope.row.user_choice)">
                  批注到word文档中
                </el-button>
                <el-button
                  v-if="$store.state.userInfo.type === 'normal'
                  && scope.row.user_choice === 1"
                  type="danger" size="small"
                  @click="handleUserChoiceChange(scope.row.id, scope.row.user_choice)">
                  <i class="fa fa-undo" aria-hidden="true"></i> 撤销批注
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import clipboard from 'clipboard-js'
import { isEmpty, taggingWordsForHTML } from 'src/util/tools'

function falutyPositionToValuePosition (paragraph, faultyWording) {
  // 去掉句子中的html标签
  if (/<p>/i.test(paragraph)) {
    paragraph = paragraph.replace(/<\/?[^>]*>/g, '')
  }
  return {
    value: {
      value: paragraph.substring(faultyWording.position[0], faultyWording.position[1]),
      position: faultyWording.position[0]
    }
  }
}
export default {
  name: 'faulty-items',
  props: {
    faulties: {
      type: Object,
      required: true
    },
    storeName: {
      type: String,
      required: true
    },
    initialCollapse: {
      type: String
    },
    proofread: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: false,
      activeCollapse: ''
    }
  },
  computed: {
    docId () {
      return Number(this.$route.params.id)
    },
    owner () {
      return this.$route.query.owner || this.$store.state[this.storeName].owner
    }
  },
  created () {
    if (this.$route.query.navmenu === 'faulty_wording' && this.initialCollapse) {
      this.activeCollapse = this.initialCollapse
      this.showCommentDetail(this.initialCollapse)
    }
  },
  methods: {
    isEmpty,
    taggingWordsForHTML,
    falutyPositionToValuePosition,
    showCommentDetail (tip) {
      if (!tip) return
      setTimeout(_ => {
        this.$store.dispatch(this.storeName + '/fetch_faulty_html_segments', {
          docId: this.docId,
          tip
        })
      }, 500)
    },
    handleUserChoiceChange (revisionItemId, userChoice) {
      let params = {
        type: 'faulty',
        revisionItemId
      }
      if (userChoice === 0 || userChoice === -1) {
        params.option = 1
      } else {
        params.option = 0
      }
      this.$store.dispatch('fileDetail/push_item_user_choice', params)
    },
    hideRevisionItemForUser (revisionItemId, result) {
      // result: 0 show 1 hide
      if (result) {
        result = 0
      } else {
        result = 1
      }
      this.$store.dispatch(this.storeName + '/push_item_proofread_result', {
        type: 'faulty',
        revisionItemId,
        result
      })
    },
    copyUrl (tip) {
      let query = {
        navmenu: 'faulty_wording',
        collapse: encodeURIComponent(tip),
        owner: encodeURIComponent(this.owner)
      }
      let queryStr = ''
      Object.keys(query).forEach(key => {
        queryStr += `&${key}=${query[key]}`
      })
      queryStr = '?' + queryStr.substring(1, queryStr.length)

      clipboard.copy(window.location.href.split('#')[0] + '#/file/detail/' + this.docId + queryStr)
        .then(_ => {
          this.$message.success('复制成功')
        })
    }
  }
}
</script>
<style lang="less">
@import "../assets/less/variables.less";
.faulty-revisions-wrapper{
  margin-top: 10px;
  .el-collapse-item__content{
    min-height: 110px;
  }
  .faulty-collapse-item-wrapper{
    min-height: 90px;
    .paragraph{
      font-size: 14px;
      margin: 10px 0;
    }
  }
}
</style>
