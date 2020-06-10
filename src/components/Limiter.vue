<template>
    <div class="effectContainer">
        <h1>Limiter</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">On/Off</span>
        <div ref="threshold"></div>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {knob} from '../knob'
import {mapActions} from 'vuex'

export default {
    name: 'Limiter',
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
            threshold: knob.create(this.$refs.threshold, 'Threshold', -20, -100, 0, false, (knob, value) => {
                if (this.isActive) {
                    this.node.threshold.value = value
                }
            }),
        }

        this.node = new Tone.Limiter(0)
        this.appendToChain(this.node)
    },
}
</script>

<style></style>
