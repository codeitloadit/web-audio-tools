<template>
    <div class="effectContainer">
        <h1>Delay</h1>
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

export default {
    name: 'Delay',
    methods: {
        ...mapActions(['appendToChain']),
        toggle() {
            if (this.isActive) {
                this.node.wet.value = 0
                this.$refs.toggleButton.classList.remove('activeButton')
            } else {
                this.node.wet.value = this.knobs.wet.getValue() / 100
                this.$refs.toggleButton.classList.add('activeButton')
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
    },
}
</script>

<style></style>
