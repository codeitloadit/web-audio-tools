import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        chain: [],
        source: null,
    },
    getters: {
        chain: (state) => state.chain,
    },
    mutations: {
        setTheSource: (state, source) => {
            state.source = source
            state.source.chain(...state.chain)
        },
        addToChain: (state, node) => {
            state.chain.push(node)
            state.source.chain(...state.chain)
        },
    },
    actions: {
        setSource({commit}, source) {
            commit('setTheSource', source)
        },
        appendToChain({commit}, node) {
            commit('addToChain', node)
        },
    },
    modules: {},
})
