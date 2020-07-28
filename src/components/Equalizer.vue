<template>
    <div class="effectContainer">
        <h1 ref="title" class="title active">Equalizer</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="power.svg" />
        </span>
        <div ref="low"></div>
        <div ref="lowFreq"></div>
        <div ref="mid"></div>
        <div ref="highFreq"></div>
        <div ref="high"></div>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {knob} from '../knob'
import {mapActions} from 'vuex'

export default {
    name: 'Equalizer',
    methods: {
        ...mapActions(['appendToChain', 'removeFromChain']),
        toggle() {
            if (this.isActive) {
                this.node.low.value = 0
                this.node.mid.value = 0
                this.node.high.value = 0
                this.$refs.toggleButton.classList.remove('activeButton')
                this.$refs.title.classList.remove('active')
            } else {
                this.node.low.value = this.knobs.low.getValue()
                this.node.lowFrequency.value = this.knobs.lowFreq.getValue()
                this.node.mid.value = this.knobs.mid.getValue()
                this.node.highFrequency.value = this.knobs.highFreq.getValue()
                this.node.high.value = this.knobs.high.getValue()
                this.$refs.toggleButton.classList.add('activeButton')
                this.$refs.title.classList.add('active')
            }
            this.isActive = !this.isActive

            Object.values(this.knobs).forEach((knob) => {
                knob.setActive(this.isActive)
            })
        },
    },
    node: null,
    knobs: null,
    isActive: false,
    mounted() {
        this.knobs = {
            low: knob.create(this.$refs.low, 'Low', 0, -50, 50, true, (knob, value) => {
                if (this.isActive) {
                    this.node.low.value = value
                }
            }),
            lowFreq: knob.create(this.$refs.lowFreq, 'Low Freq.', 400, -200, 1000, false, (knob, value) => {
                if (this.isActive) {
                    this.node.lowFrequency.value = value
                }
            }),
            mid: knob.create(this.$refs.mid, 'Mid', 0, -50, 50, true, (knob, value) => {
                if (this.isActive) {
                    this.node.mid.value = value
                }
            }),
            highFreq: knob.create(this.$refs.highFreq, 'High Freq.', 2500, 1000, 4000, false, (knob, value) => {
                if (this.isActive) {
                    this.node.highFrequency.value = value
                }
            }),
            high: knob.create(this.$refs.high, 'High', 0, -50, 50, true, (knob, value) => {
                if (this.isActive) {
                    this.node.high.value = value
                }
            }),
        }

        this.node = new Tone.EQ3()
        this.appendToChain(this.node)

        this.toggle()
    },
    beforeDestroy() {
        this.removeFromChain(this.node)
    },
}
</script>

<style></style>
