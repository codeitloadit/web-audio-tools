import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        chain: [],
        source: null,
        stream: null,
    },
    getters: {
        chain: (state) => state.chain,
        stream: (state) => state.stream,
    },
    mutations: {
        setTheSource: (state, source) => {
            state.source = source
            state.source.chain(...state.chain)
        },
        setTheStream: (state, stream) => {
            state.stream = stream
            state.stream.chain(...state.chain)
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
        setStream({commit}, stream) {
            commit('setTheStream', stream)
        },
        appendToChain({commit}, node) {
            commit('addToChain', node)
        },
    },
    modules: {},
})
