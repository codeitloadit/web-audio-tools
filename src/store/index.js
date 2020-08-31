import Vue from 'vue'
import Vuex from 'vuex'
import * as Tone from 'tone'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        chain: [],
        source: null,
        stream: null,
        master: null,
    },
    getters: {
        chain: (state) => state.chain,
        stream: (state) => state.stream,
        master: (state) => state.master,
    },
    mutations: {
        setTheSource: (state, source) => {
            if (state.source !== null) {
                state.source.disconnect()
                state.chain.forEach((i) => {
                    i.disconnect()
                })
                state.master.disconnect()
            }
            state.source = source
            state.source.chain(...state.chain)
        },
        setTheStream: (state, stream) => {
            if (state.stream !== null) {
                state.stream.disconnect()
            }
            state.stream = stream
        },
        setTheMaster: (state, node) => {
            state.master = node
        },
        addToChain: (state, node) => {
            state.chain.push(node)
            state.source.disconnect()
            state.chain.forEach((i) => {
                i.disconnect()
            })
            state.source.chain(...state.chain, state.master, Tone.Master)
        },
        deleteFromChain: (state, node) => {
            state.source.disconnect()
            state.chain.forEach((i) => {
                i.disconnect()
            })
            state.chain.splice(state.chain.indexOf(node), 1)
            state.source.chain(...state.chain, state.master, Tone.Master)
        },
    },
    actions: {
        setSource({commit}, source) {
            commit('setTheSource', source)
        },
        setStream({commit}, stream) {
            commit('setTheStream', stream)
        },
        setMaster({commit}, node) {
            commit('setTheMaster', node)
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
