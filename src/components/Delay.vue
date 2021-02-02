<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="/static/wat/x_white.svg" @click="close" />
        <h1 ref="title" class="title">Delay</h1>
        <select ref="presets" class="presets">
            <option value="disabled" disabled selected>Presets</option>
        </select>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="/static/wat/power.svg" />
        </span>
        <div ref="time"></div>
        <div ref="feedback"></div>
        <div ref="wet"></div>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {knob} from '../knob'
import {mapActions} from 'vuex'
import json from '../presets.json'

const effectName = 'Delay'

export default {
    name: effectName,
    methods: {
        ...mapActions(['appendToChain', 'removeFromChain']),
        toggle() {
            if (this.isActive) {
                this.node.wet.value = 0
                this.$refs.toggleButton.classList.remove('activeButton')
                this.$refs.title.classList.remove('active')
            } else {
                this.node.wet.value = this.knobs.wet.getValue() / 100
                this.dlyWet = this.knobs.wet.getValue()
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
                    this.knobs.time.getValue('dlyTime') === preset.dlyTime &&
                    this.knobs.feedback.getValue('dlyFeedback') === preset.dlyFeedback &&
                    this.knobs.wet.getValue('dlyWet') === preset.dlyWet
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
            dlyWasActive: true,
            dlyTime: 6,
            dlyFeedback: 10,
            dlyWet: 50,
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

            this.knobs.time.setValue(preset.dlyTime)
            this.knobs.feedback.setValue(preset.dlyFeedback)
            this.knobs.wet.setValue(preset.dlyWet)
        }

        this.node = new Tone.FeedbackDelay()
        this.appendToChain(this.node)

        this.dlyWasActive = localStorage.dlyWasActive === 'false' ? false : true
        this.dlyTime = localStorage.dlyTime || this.dlyTime
        this.dlyFeedback = localStorage.dlyFeedback || this.dlyFeedback
        this.dlyWet = localStorage.dlyWet || this.dlyWet

        this.knobs = {
            time: knob.create(this.$refs.time, 'Time', this.dlyTime, 0, 100, false, (_, v) => {
                this.node.delayTime.value = v / 100
                this.dlyTime = v
                this.checkPresets()
            }),
            feedback: knob.create(this.$refs.feedback, 'Feedback', this.dlyFeedback, 0, 100, false, (_, v) => {
                this.node.feedback.value = v / 100
                this.dlyFeedback = v
                this.checkPresets()
            }),
            wet: knob.create(this.$refs.wet, 'Dry/Wet', this.dlyWet, 0, 100, true, (_, v) => {
                if (this.isActive) {
                    this.node.wet.value = v / 100
                    this.dlyWet = v
                }
                this.checkPresets()
            }),
        }

        this.node.delayTime.value = this.knobs.time.getValue() / 100
        this.node.feedback.value = this.knobs.feedback.getValue() / 100
        this.node.wet.value = 0

        this.checkPresets()

        if (this.dlyWasActive) {
            this.toggle()
        }
    },
    watch: {
        isActive(value) {
            localStorage.dlyWasActive = value
        },
        dlyTime(value) {
            localStorage.dlyTime = value
        },
        dlyFeedback(value) {
            localStorage.dlyFeedback = value
        },
        dlyWet(value) {
            localStorage.dlyWet = value
        },
    },
    beforeDestroy() {
        this.node.disconnect()
        this.removeFromChain(this.node)
    },
}
</script>

<style></style>
