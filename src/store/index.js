import Vue from 'vue'
import Vuex from 'vuex'
import * as Tone from 'tone'

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
            state.source.disconnect()
            state.chain.forEach((i) => {
                i.disconnect()
            })
            state.source.chain(...state.chain, Tone.Master)
            // console.log('addToChain CHAIN', state.chain)
        },
        deleteFromChain: (state, node) => {
            state.source.disconnect()
            state.chain.forEach((i) => {
                i.disconnect()
            })
            state.chain.splice(state.chain.indexOf(node), 1)
            state.source.chain(...state.chain, Tone.Master)
            // console.log('deleteFromChain CHAIN', state.chain)
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
        removeFromChain({commit}, node) {
            commit('deleteFromChain', node)
        },
    },
    modules: {},
})
