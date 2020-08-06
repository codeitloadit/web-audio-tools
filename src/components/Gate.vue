<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="x_white.svg" @click="close" />
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
    },
    data() {
        return {
            isActive: false,
            gateThreshold: -60,
            gateSmoothing: 10,
        }
    },
    created() {
        this.node = new Tone.Gate(-1000, 0.1)
        this.appendToChain(this.node)
    },
    mounted() {
        this.gateThreshold = localStorage.gateThreshold || this.gateThreshold
        this.gateSmoothing = localStorage.gateSmoothing || this.gateSmoothing

        this.knobs = {
            threshold: knob.create(this.$refs.threshold, 'Threshold', this.gateThreshold, -200, 0, false, (_, v) => {
                if (this.isActive) {
                    this.node.threshold = v
                    this.gateThreshold = v
                }
            }),
            smoothing: knob.create(this.$refs.smoothing, 'Smoothing', this.gateSmoothing, 1, 100, false, (_, v) => {
                this.node.smoothing = v / 100
                this.gateSmoothing = v
            }),
        }

        this.node.smoothing = this.knobs.smoothing.getValue() / 100

        this.toggle()
    },
    watch: {
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
