<template>
    <div class="effectContainer">
        <h1>Backing Track</h1>
        <span ref="toggleButton" class="toggleButton disabled" @click="toggle">Loading</span>
        <div ref="volume"></div>
        <div ref="pan"></div>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {knob} from '../knob'
import {mapActions} from 'vuex'

export default {
    name: 'BackingTrack',
    methods: {
        ...mapActions(['setPlayer', 'appendToChain']),
        toggle() {
            if (this.isActive) {
                this.node.stop()
                this.$refs.toggleButton.classList.remove('activeButton')
            } else {
                this.node.start()
                this.$refs.toggleButton.classList.add('activeButton')
            }
            this.isActive = !this.isActive
        },
    },
    node: null,
    knobs: null,
    isActive: false,
    mounted() {
        this.knobs = {
            volume: knob.create(this.$refs.volume, 'Volume', 0, -10, 10, true, (knob, value) => {
                this.node.volume.value = value
            }),
            pan: knob.create(this.$refs.pan, 'Pan', 0, -100, 100, true, (knob, value) => {
                panner.pan.value = value / 100
            }),
        }

        this.node = new Tone.Player('One and Done.mp3', () => {
            this.$refs.toggleButton.innerText = 'On/Off'
            this.$refs.toggleButton.classList.remove('disabled')
        })
        this.setPlayer(this.node)

        const panner = new Tone.Panner()
        this.appendToChain(panner)
    },
}
</script>

<style></style>
