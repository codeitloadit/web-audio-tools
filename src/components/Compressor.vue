<template>
    <div class="effectContainer">
        <h1>Compressor</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">On/Off</span>
        <div ref="threshold"></div>
        <div ref="ratio"></div>
        <div ref="attack"></div>
        <div ref="release"></div>
        <div ref="knee"></div>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {knob} from '../knob'
import {mapActions} from 'vuex'

export default {
    name: 'Compressor',
    methods: {
        ...mapActions(['appendToChain']),
        toggle() {
            if (this.isActive) {
                this.node.threshold.value = 0
                this.$refs.toggleButton.classList.remove('activeButton')
            } else {
                this.node.threshold.value = this.knobs.threshold.getValue()
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
            threshold: knob.create(this.$refs.threshold, 'Threshold', -50, -100, 0, false, (knob, value) => {
                if (this.isActive) {
                    this.node.threshold.value = value
                }
            }),
            ratio: knob.create(this.$refs.ratio, 'Ratio', 4, 1, 20, false, (knob, value) => {
                this.node.ratio.value = value
            }),
            attack: knob.create(this.$refs.attack, 'Attack', 5, 0, 1000, false, (knob, value) => {
                this.node.attack.value = value / 1000
            }),
            release: knob.create(this.$refs.release, 'Release', 255, 1, 1000, false, (knob, value) => {
                this.node.release.value = value / 1000
            }),
            knee: knob.create(this.$refs.knee, 'Knee', 30, 0, 40, false, (knob, value) => {
                this.node.knee.value = value
            }),
        }

        this.node = new Tone.Compressor(0, 1)
        this.appendToChain(this.node)
        this.node.threshold.value = 0
        this.node.ratio.value = this.knobs.ratio.getValue()
        this.node.attack.value = this.knobs.attack.getValue() / 1000
        this.node.release.value = this.knobs.release.getValue() / 1000
        this.node.knee.value = this.knobs.knee.getValue()
    },
}
</script>

<style></style>
