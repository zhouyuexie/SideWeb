import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './action';
import * as getters from './getters';//获取数据的通用函数(进行处理)
import tickets from './modules/tickets.js';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  actions,
  getters,
  modules: {
    tickets,
  },
  strict: "development",
})