<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="x_white.svg" @click="close" />
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

const effectName = 'Equalizer'

export default {
    name: effectName,
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
                this.node.low.value = this.eqLow = this.knobs.low.getValue()
                this.node.lowFrequency.value = this.eqLowFreq = this.knobs.lowFreq.getValue()
                this.node.mid.value = this.eqMid = this.knobs.mid.getValue()
                this.node.highFrequency.value = this.eqHighFreq = this.knobs.highFreq.getValue()
                this.node.high.value = this.eqHigh = this.knobs.high.getValue()
                this.$refs.toggleButton.classList.add('activeButton')
                this.$refs.title.classList.add('active')
            }
            this.isActive = !this.isActive

            Object.values(this.knobs).forEach((knob) => {
                knob.setActive(this.isActive)
            })
        },
        close() {
            this.$emit('closeEffect', effectName)
        },
    },
    data() {
        return {
            isActive: false,
            eqLow: 0,
            eqLowFreq: 400,
            eqMid: 0,
            eqHighFreq: 2500,
            eqHigh: 0,
        }
    },
    mounted() {
        this.node = new Tone.EQ3()
        this.appendToChain(this.node)

        this.eqLow = localStorage.eqLow || this.eqLow
        this.eqLowFreq = localStorage.eqLowFreq || this.eqLowFreq
        this.eqMid = localStorage.eqMid || this.eqMid
        this.eqHighFreq = localStorage.eqHighFreq || this.eqHighFreq
        this.eqHigh = localStorage.eqHigh || this.eqHigh

        this.knobs = {
            low: knob.create(this.$refs.low, 'Low', this.eqLow, -50, 50, true, (_, v) => {
                if (this.isActive) {
                    this.node.low.value = v
                    this.eqLow = v
                }
            }),
            lowFreq: knob.create(this.$refs.lowFreq, 'Low Freq.', this.eqLowFreq, -200, 1000, false, (_, v) => {
                if (this.isActive) {
                    this.node.lowFrequency.value = v
                    this.eqLowFreq = v
                }
            }),
            mid: knob.create(this.$refs.mid, 'Mid', this.eqMid, -50, 50, true, (_, v) => {
                if (this.isActive) {
                    this.node.mid.value = v
                    this.eqMid = v
                }
            }),
            highFreq: knob.create(this.$refs.highFreq, 'High Freq.', this.eqHighFreq, 1000, 4000, false, (_, v) => {
                if (this.isActive) {
                    this.node.highFrequency.value = v
                    this.eqHighFreq = v
                }
            }),
            high: knob.create(this.$refs.high, 'High', this.eqHigh, -50, 50, true, (_, v) => {
                if (this.isActive) {
                    this.node.high.value = v
                    this.eqHigh = v
                }
            }),
        }

        this.toggle()
    },
    watch: {
        eqLow(value) {
            localStorage.eqLow = value
        },
        eqLowFreq(value) {
            localStorage.eqLowFreq = value
        },
        eqMid(value) {
            localStorage.eqMid = value
        },
        eqHighFreq(value) {
            localStorage.eqHighFreq = value
        },
        eqHigh(value) {
            localStorage.eqHigh = value
        },
    },
    beforeDestroy() {
        this.node.disconnect()
        this.removeFromChain(this.node)
    },
}
</script>

<style></style>
