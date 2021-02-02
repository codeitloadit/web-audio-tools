<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="/static/wat/x_white.svg" @click="close" />
        <h1 ref="title" class="title">Equalizer</h1>
        <select ref="presets" class="presets">
            <option value="disabled" disabled selected>Presets</option>
        </select>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="/static/wat/power.svg" />
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
import json from '../presets.json'

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
        checkPresets() {
            this.$refs.presets.value = 'disabled'
            Object.keys(json[effectName]).forEach((name) => {
                const preset = json[effectName][name]
                if (
                    this.knobs.low.getValue('eqLow') === preset.eqLow &&
                    this.knobs.lowFreq.getValue('eqLowFreq') === preset.eqLowFreq &&
                    this.knobs.mid.getValue('eqMid') === preset.eqMid &&
                    this.knobs.highFreq.getValue('eqHighFreq') === preset.eqHighFreq &&
                    this.knobs.high.getValue('eqHigh') === preset.eqHigh
                ) {
                    this.$refs.presets.value = name
                }
            })

            if (this.$refs.presets.value === 'disabled') {
                this.$refs.presets.classList.add('disabled')
            } else {
                this.$refs.presets.classList.remove('disabled')
            }
        },
    },
    data() {
        return {
            isActive: false,
            eqWasActive: true,
            eqLow: 0,
            eqLowFreq: 400,
            eqMid: 0,
            eqHighFreq: 2500,
            eqHigh: 0,
        }
    },
    mounted() {
        Object.keys(json[effectName]).forEach((name) => {
            const option = document.createElement('option')
            option.text = name
            option.value = name
            this.$refs.presets.append(option)
        })

        this.$refs.presets.onchange = () => {
            const preset = json[effectName][this.$refs.presets.value]

            this.knobs.low.setValue(preset.eqLow)
            this.knobs.lowFreq.setValue(preset.eqLowFreq)
            this.knobs.mid.setValue(preset.eqMid)
            this.knobs.highFreq.setValue(preset.eqHighFreq)
            this.knobs.high.setValue(preset.eqHigh)
        }

        this.node = new Tone.EQ3()
        this.appendToChain(this.node)

        this.eqWasActive = localStorage.eqWasActive === 'false' ? false : true
        this.eqLow = localStorage.eqLow || this.eqLow
        this.eqLowFreq = localStorage.eqLowFreq || this.eqLowFreq
        this.eqMid = localStorage.eqMid || this.eqMid
        this.eqHighFreq = localStorage.eqHighFreq || this.eqHighFreq
        this.eqHigh = localStorage.eqHigh || this.eqHigh

        this.knobs = {
            low: knob.create(this.$refs.low, 'Low', this.eqLow, -25, 25, true, (_, v) => {
                if (this.isActive) {
                    this.node.low.value = v
                    this.eqLow = v
                }
                this.checkPresets()
            }),
            lowFreq: knob.create(this.$refs.lowFreq, 'Low Freq.', this.eqLowFreq, -200, 1000, false, (_, v) => {
                if (this.isActive) {
                    this.node.lowFrequency.value = v
                    this.eqLowFreq = v
                }
                this.checkPresets()
            }),
            mid: knob.create(this.$refs.mid, 'Mid', this.eqMid, -25, 25, true, (_, v) => {
                if (this.isActive) {
                    this.node.mid.value = v
                    this.eqMid = v
                }
                this.checkPresets()
            }),
            highFreq: knob.create(this.$refs.highFreq, 'High Freq.', this.eqHighFreq, 1000, 4000, false, (_, v) => {
                if (this.isActive) {
                    this.node.highFrequency.value = v
                    this.eqHighFreq = v
                }
                this.checkPresets()
            }),
            high: knob.create(this.$refs.high, 'High', this.eqHigh, -25, 25, true, (_, v) => {
                if (this.isActive) {
                    this.node.high.value = v
                    this.eqHigh = v
                }
                this.checkPresets()
            }),
        }

        this.checkPresets()

        if (this.eqWasActive) {
            this.toggle()
        }
    },
    watch: {
        isActive(value) {
            localStorage.eqWasActive = value
        },
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
