<template>
  <div class="charge-btn">
    <el-dialog title="您的可用上传次数已为零" v-model="dialogVisable" :close-on-press-escape="false" :show-close="false" :close-on-click-modal="false">
      <div class="charge-wrapper">
        <div class="charge-count-wrapper count-wrapper" v-if="!editCountStatus">
          <div>当前充值:
            <span class="count">{{chargeCount}}</span>
            次
          </div>
          <el-button type="defalut" @click="editCountStatus=true" size="small">修改次数</el-button>
        </div>
        <div class="charge-count-wrapper count-wrapper" v-else>
          <div class="charge-input">
            <span class="charge-unit">充值:</span>
            <el-input-number :min="1" :max="999" size="small" v-model="beforeChargeCount"></el-input-number>
            <span class="charge-unit ml10">次</span>
          </div>
          <el-button @click="handleChargeCount" size="small" type="default">确认</el-button>
        </div>
        <div v-loading="loading">
          <div class="order-info clearfloat">
            <div class="fl-l">
              <div>商品名称: {{title}}</div>
              <div>订单编号: {{editCountStatus ? '0' : orderId}}</div>
            </div>
            <div class="fl-r">
              <div>
                <span class="line-through">原价 : ¥{{originalPrice/100}}</span>
                <span>现价 : ¥{{currentPrice/100}}</span>
              </div>
              <div class="total-cash">订单总金额：¥{{editCountStatus ? '0' : currentPrice/100 * chargeCount}}</div>
            </div>
          </div>
          <div v-if="!editCountStatus" class="qrcode-wrapper">
            <img class="logo" src="../assets/img/wechat-pay-logo-text.png">
            <div class="qrcode">
              <canvas id="qrcode"></canvas>
              <img class="qrcode-footer-text" src="../assets/img/wechat-pay-text.png">
            </div>
            <div class="t-center">*请在5分钟内扫码支付</div>
          </div>
          <div v-else class="blank">
            修改完成后要点击确认哦~
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="default" @click="handlePayCancel">取消支付</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { fetchCurrentPrice, fetchChargeStatus } from '../store/api'
import QRious from 'qrious'
export default {
  name: 'charge',
  props: {
    dialogVisable: {
      require: true,
      type: Boolean
    }
  },
  data() {
    return {
      loading: false,
      orderId: 0,
      title: '',
      currentPrice: 1,
      originalPrice: 3000,
      timer: null,
      timerStartDate: null,
      // 充值次数
      chargeCount: 1,
      // 充值之前的次数
      beforeChargeCount: 1,
      editCountStatus: false
    }
  },
  methods: {
    async handleChargeCount() {
      this.loading = true
      this.editCountStatus = false
      this.chargeCount = this.beforeChargeCount
      var { data } = await this.fetchOrderInfo()
      this.orderId = data.payment.id
      this.$nextTick(_ => {
        new QRious({
          size: 260,
          element: document.getElementById('qrcode'),
          value: data.code_url
        })
        this.loading = false
      })
    },
    fetchOrderInfo() {
      let amount = this.chargeCount
      let url = '/api/v1/user/charge?amount=' + amount
      return this.$fetch({
        url
      })
    },
    handlePayFinish() {
      if (new Date().getTime() - this.timerStartDate > 300000) {
        this.$message.warning('超过5分钟，订单已自动取消')
        clearInterval(this.timer)
        this.$emit('close')
        return
      }
      fetchChargeStatus(this.orderId).then((resp) => {
        if (resp.data.result) {
          this.$message.success('支付成功，已经为您添加上传次数')
          this.$store.dispatch('userInfo/fetch_balance')
          clearInterval(this.timer)
          this.$emit('close')
          this.$emit('pay-success')
        }
      })
    },
    handlePayCancel() {
      clearInterval(this.timer)
      this.$emit('close')
    }
  },
  watch: {
    dialogVisable() {
      if (this.dialogVisable) {
        this.loading = true
        this.chargeCount = this.beforeChargeCount = 1
        Promise.all([fetchCurrentPrice(), this.fetchOrderInfo()]).then(result => {
          this.title = result[0].data.title
          this.currentPrice = result[0].data.current_price
          this.originalPrice = result[0].data.original_price

          this.orderId = result[1].data.payment.id
          this.$nextTick(_ => {
            new QRious({
              size: 260,
              element: document.getElementById('qrcode'),
              value: result[1].data.code_url
            })
            this.loading = false
          })
        })
        this.timerStartDate = new Date().getTime()
        this.timer = setInterval(this.handlePayFinish, 5000)
      } else {
        this.handlePayCancel()
      }
    }
  }
}
</script>
<style lang="less">
.charge-btn {
  display: inline-block;
  .charge-count-wrapper {
    display: flex;
    border-radius: 5px;
    box-sizing: border-box;
    background-color: #D3DCE6;
    padding: 10px;
    font-size: 18px;
    justify-content: space-between;
    .count {
      color: #f6416c;
    }
    .charge-input {
      display: flex;
      margin-right: 20px;
      align-items: center;
      .charge-unit {
        font-weight: 700;
        font-size: 16px;
        margin-right: 10px;
      }
    }
  }
  .count-wrapper {
    padding: 10px 20px;
  }
}

.charge-wrapper {
  .blank {
    height: 400px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  #qrcode {
    width: 260px;
    height: 260px;
  }
  .order-info {
    margin-top: 10px;
    border-radius: 5px;
    box-sizing: border-box;
    background-color: #D3DCE6;
    padding: 10px;
    font-size: 18px;
    height: 80px;
    .fl-l {
      margin-left: 10px;
      line-height: 30px;
      font-size: 16px;
    }
    .fl-r {
      margin-right: 80px;
      line-height: 30px;
      .total-cash {
        color: #f6416c;
        font-size: 20px;
      }
      .line-through {
        font-size: 16px;
        font-weight: 400;
        text-decoration: line-through;
        margin-right: 10px;
        color: #8492A6;
      }
    }
  }
  .qrcode-wrapper {
    padding: 20px 10px;
    margin-top: 10px;
    .logo {
      float: left;
      width: 200px;
      margin-left: 80px;
      margin-top: 20px;
    }
    .qrcode {
      margin: 0 auto;
      width: 260px;
    }
    .qrcode-footer-text {
      width: 260px;
      padding: 15px;
      box-sizing: border-box;
    }
  }
}
</style>