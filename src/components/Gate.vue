<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="/static/wat/x_white.svg" @click="close" />
        <h1 ref="title" class="title">Gate</h1>
        <select ref="presets" class="presets">
            <option value="disabled" disabled selected>Presets</option>
        </select>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="/static/wat/power.svg" />
        </span>
        <div ref="threshold"></div>
        <div ref="smoothing"></div>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {knob} from '../knob'
import {mapActions} from 'vuex'
import json from '../presets.json'

const effectName = 'Gate'

export default {
    name: effectName,
    methods: {
        ...mapActions(['appendToChain', 'removeFromChain']),
        toggle() {
            if (this.isActive) {
                this.node.threshold = -1000
                this.$refs.toggleButton.classList.remove('activeButton')
                this.$refs.title.classList.remove('active')
            } else {
                this.node.threshold = this.gateThreshold = this.knobs.threshold.getValue()
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
                    this.knobs.threshold.getValue('dlyTime') === preset.gateThreshold &&
                    this.knobs.smoothing.getValue('dlyWet') === preset.gateSmoothing
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
            gateWasActive: true,
            gateThreshold: -60,
            gateSmoothing: 10,
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

            this.knobs.threshold.setValue(preset.gateThreshold)
            this.knobs.smoothing.setValue(preset.gateSmoothing)
        }

        this.node = new Tone.Gate(-1000, 0.1)
        this.appendToChain(this.node)

        this.gateWasActive = localStorage.gateWasActive === 'false' ? false : true
        this.gateThreshold = localStorage.gateThreshold || this.gateThreshold
        this.gateSmoothing = localStorage.gateSmoothing || this.gateSmoothing

        this.knobs = {
            threshold: knob.create(this.$refs.threshold, 'Threshold', this.gateThreshold, -200, 0, false, (_, v) => {
                if (this.isActive) {
                    this.node.threshold = v
                    this.gateThreshold = v
                }
                this.checkPresets()
            }),
            smoothing: knob.create(this.$refs.smoothing, 'Smoothing', this.gateSmoothing, 1, 100, false, (_, v) => {
                this.node.smoothing = v / 100
                this.gateSmoothing = v
                this.checkPresets()
            }),
        }

        this.node.smoothing = this.knobs.smoothing.getValue() / 100

        this.checkPresets()

        if (this.gateWasActive) {
            this.toggle()
        }
    },
    watch: {
        isActive(value) {
            localStorage.gateWasActive = value
        },
        gateThreshold(value) {
            localStorage.gateThreshold = value
        },
        gateSmoothing(value) {
            localStorage.gateSmoothing = value
        },
    },
    beforeDestroy() {
        this.node.disconnect()
        this.removeFromChain(this.node)
    },
}
</script>

<style></style>
