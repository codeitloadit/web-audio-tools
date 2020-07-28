<template>
    <div class="effectContainer">
        <h1 ref="title" class="title active">Gate</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="power.svg" />
        </span>
        <div ref="threshold"></div>
        <div ref="smoothing"></div>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {knob} from '../knob'
import {mapActions} from 'vuex'

export default {
    name: 'Gate',
    methods: {
        ...mapActions(['appendToChain', 'removeFromChain']),
        toggle() {
            if (this.isActive) {
                this.node.threshold = -1000
                this.$refs.toggleButton.classList.remove('activeButton')
                this.$refs.title.classList.remove('active')
            } else {
                this.node.threshold = this.knobs.threshold.getValue()
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
            threshold: knob.create(this.$refs.threshold, 'Threshold', -60, -200, 0, false, (knob, value) => {
                if (this.isActive) {
                    this.node.threshold = value
                }
            }),
            smoothing: knob.create(this.$refs.smoothing, 'Smoothing', 10, 1, 100, false, (knob, value) => {
                this.node.smoothing = value / 100
            }),
        }

        this.node = new Tone.Gate(-1000, 0.1)
        this.appendToChain(this.node)
        this.node.smoothing = this.knobs.smoothing.getValue() / 100

        this.toggle()
    },
    beforeDestroy() {
        this.removeFromChain(this.node)
    },
}
</script>

<style></style>
