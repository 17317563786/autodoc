import { getUserInfo, getLeftTime } from './api.js'
/* eslint-disable no-useless-computed-key */
export default {
  state: {
    id: null,
    type: 'normal',
    name: '',
    imageUrl: '',
    balance: 0
  },
  mutations: {
    ['userInfo/set_user_id'] (state, id) {
      state.id = id
    },
    ['userInfo/set_user_type'] (state, type) {
      state.type = type
    },
    ['userInfo/set_user_name'] (state, name) {
      state.name = name.toLowerCase()
    },
    ['userInfo/set_user_imageurl'] (state, imageUrl) {
      state.imageUrl = imageUrl
    },
    ['userInfo/set_balance'] (state, balance) {
      state.balance = balance
    }
  },
  actions: {
    ['userInfo/fetch_userinfo'] ({ commit, state }) {
      return getUserInfo().then((resp) => {
        commit('userInfo/set_user_id', resp.data.id)
        commit('userInfo/set_user_name', resp.data.name)
        commit('userInfo/set_user_imageurl', resp.data.image)

        if (resp.data.user_sys === 0 && resp.data.user_id === 0) {
          commit('userInfo/set_user_type', 'admin')
        }
        if (resp.data.user_sys === 2 && (resp.data.user_ext_type === 1 || resp.data.user_ext_type === 2)) {
          commit('userInfo/set_user_type', 'admin')
        }
        if (resp.data.user_sys === 2 && (resp.data.user_ext_type === 3 || resp.data.user_ext_type === 4)) {
          commit('userInfo/set_user_type', 'proofread')
        }
      })
    },
    ['userInfo/fetch_balance'] ({ commit, state }) {
      return getLeftTime().then((resp) => {
        commit('userInfo/set_balance', resp.data.balance)
      })
    }
  }
}
