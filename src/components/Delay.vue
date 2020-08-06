<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="x_white.svg" @click="close" />
        <h1 ref="title" class="title active">Delay</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="power.svg" />
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
    node: null,
    knobs: null,
    isActive: false,
    mounted() {
        this.knobs = {
            time: knob.create(this.$refs.time, 'Time', 6, 0, 100, false, (knob, value) => {
                this.node.delayTime.value = value / 100
            }),
            feedback: knob.create(this.$refs.feedback, 'Feedback', 10, 0, 100, false, (knob, value) => {
                this.node.feedback.value = value / 100
            }),
            wet: knob.create(this.$refs.wet, 'Dry/Wet', 50, 0, 100, true, (knob, value) => {
                if (this.isActive) {
                    this.node.wet.value = value / 100
                }
            }),
        }

        this.node = new Tone.FeedbackDelay()
        this.appendToChain(this.node)
        this.node.delayTime.value = this.knobs.time.getValue() / 100
        this.node.feedback.value = this.knobs.feedback.getValue() / 100
        this.node.wet.value = 0

        this.toggle()
    },
    beforeDestroy() {
        this.node.disconnect()
        this.removeFromChain(this.node)
    },
}
</script>

<style></style>
