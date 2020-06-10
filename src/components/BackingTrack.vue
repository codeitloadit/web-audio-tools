<template>
    <div ref="player" class="effectContainer">
        <h1>Backing Track</h1>
        <span ref="playerButton" class="toggleButton disabled" @click="toggle">Loading</span>
        <div ref="volume"></div>
        <div ref="pan"></div>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {knob} from '../knob'
import {mapGetters, mapActions} from 'vuex'

export default {
    name: 'BackingTrack',
    methods: {
        ...mapActions(['setPlayer', 'appendToChain']),
        toggle() {
            if (this.isPlaying) {
                this.player.stop()
                this.$refs.playerButton.classList.remove('activeButton')
            } else {
                this.player.start()
                this.$refs.playerButton.classList.add('activeButton')
            }
            this.isPlaying = !this.isPlaying
        },
    },
    player: null,
    isPlaying: false,
    computed: mapGetters(['chain']),
    mounted() {
        this.player = new Tone.Player('One and Done.mp3', () => {
            this.$refs.playerButton.innerText = 'On/Off'
            this.$refs.playerButton.classList.remove('disabled')
        })
        this.setPlayer(this.player)

        const panner = new Tone.Panner()
        this.appendToChain(panner)

        this.appendToChain(Tone.Master)

        knob.create(this.$refs.volume, 'Volume', 0, -10, 10, true, (knob, value) => {
            this.player.volume.value = value
        })

        knob.create(this.$refs.pan, 'Pan', 0, -100, 100, true, (knob, value) => {
            panner.pan.value = value / 100
        })
    },
}
</script>

<style></style>
