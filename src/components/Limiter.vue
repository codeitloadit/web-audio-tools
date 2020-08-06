<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="x_white.svg" @click="close" />
        <h1 ref="title" class="title active">Limiter</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="power.svg" />
        </span>
        <div ref="threshold"></div>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {knob} from '../knob'
import {mapActions} from 'vuex'

const effectName = 'Limiter'

export default {
    name: effectName,
    methods: {
        ...mapActions(['appendToChain', 'removeFromChain']),
        toggle() {
            if (this.isActive) {
                this.node.threshold.value = 0
                this.$refs.toggleButton.classList.remove('activeButton')
                this.$refs.title.classList.remove('active')
            } else {
                this.node.threshold.value = this.knobs.threshold.getValue()
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
            threshold: knob.create(this.$refs.threshold, 'Threshold', -50, -100, 0, false, (knob, value) => {
                if (this.isActive) {
                    this.node.threshold.value = value
                }
            }),
        }

        this.node = new Tone.Limiter(0)
        this.appendToChain(this.node)

        this.toggle()
    },
    beforeDestroy() {
        this.node.disconnect()
        this.removeFromChain(this.node)
    },
}
</script>

<style></style>
