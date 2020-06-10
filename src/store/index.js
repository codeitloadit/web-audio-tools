import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        chain: [],
        player: null,
        audioNode: null, // TODO: Should connect to the users input: new Tone.UserMedia();
    },
    getters: {
        chain: (state) => state.chain,
    },
    mutations: {
        setThePlayer: (state, player) => (state.player = player),
        addToChain: (state, node) => {
            state.chain.push(node)
            state.player.chain(...state.chain)
        },
    },
    actions: {
        setPlayer({commit}, player) {
            commit('setThePlayer', player)
        },
        appendToChain({commit}, node) {
            commit('addToChain', node)
        },
    },
    modules: {},
})
