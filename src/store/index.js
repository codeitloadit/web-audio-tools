import Vue from 'vue'
import Vuex from 'vuex'
import * as Tone from 'tone'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        chain: [],
        source: null,
        stream: null,
        streamOutput: null,
        isMasterConnected: false,
    },
    getters: {
        chain: (state) => state.chain,
        stream: (state) => state.stream,
        streamOutput: (state) => state.streamOutput,
    },
    mutations: {
        setTheSource: (state, source) => {
            console.log('Setting source to:', source)
            if (state.source !== null) {
                state.source.disconnect()
                state.chain.forEach((i) => {
                    i.disconnect()
                })
            }
            state.source = source
            state.source.chain(...state.chain)
            if (state.isMasterConnected) {
                Tone.connect(state.streamOutput, Tone.Destination)
            }
        },
        setTheStream: (state, stream) => {
            console.log('Setting stream to:', stream)
            if (state.stream !== null) {
                state.stream.disconnect()
            }
            state.stream = stream
        },
        setTheStreamOutput: (state, node) => {
            window.streamOutput = node
            console.log('Setting stream output to:', node)
            state.streamOutput = node

            window.watSreamer = Tone.context.createMediaStreamDestination()
            Tone.connect(state.streamOutput, window.watSreamer)
        },
        addToChain: (state, node) => {
            console.log('Appending to chain:', node)
            state.chain.push(node)
            state.source.disconnect()
            state.chain.forEach((i) => {
                i.disconnect()
            })
            state.source.chain(...state.chain, state.streamOutput)
            console.log('Updated chain:', state.chain)
        },
        deleteFromChain: (state, node) => {
            console.log('Removing from chain:', node)
            state.source.disconnect()
            state.chain.forEach((i) => {
                i.disconnect()
            })
            state.chain.splice(state.chain.indexOf(node), 1)
            state.source.chain(...state.chain, state.streamOutput)
            console.log('Updated chain:', state.chain)
        },
        connectTheMaster: (state) => {
            console.log('Connecting Master')
            Tone.connect(state.streamOutput, Tone.Destination)
            state.isMasterConnected = true
        },
        disconnectTheMaster: (state) => {
            console.log('Disconnecting Master')
            Tone.disconnect(state.streamOutput, Tone.Destination)
            state.isMasterConnected = false
        },
    },
    actions: {
        setSource({commit}, source) {
            commit('setTheSource', source)
        },
        setStream({commit}, stream) {
            commit('setTheStream', stream)
        },
        setStreamOutput({commit}, node) {
            commit('setTheStreamOutput', node)
        },
        appendToChain({commit}, node) {
            commit('addToChain', node)
        },
        removeFromChain({commit}, node) {
            commit('deleteFromChain', node)
        },
        connectMaster({commit}) {
            commit('connectTheMaster')
        },
        disconnectMaster({commit}) {
            commit('disconnectTheMaster')
        },
    },
    modules: {},
})
