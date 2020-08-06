<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="x_white.svg" @click="close" />
        <h1 ref="title" class="title active">Compressor</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="power.svg" />
        </span>
        <div ref="threshold"></div>
        <div ref="ratio"></div>
        <div ref="attack"></div>
        <div ref="release"></div>
        <div ref="knee"></div>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {knob} from '../knob'
import {mapActions} from 'vuex'

const effectName = 'Compressor'

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
            ratio: knob.create(this.$refs.ratio, 'Ratio', 4, 1, 20, false, (knob, value) => {
                this.node.ratio.value = value
            }),
            attack: knob.create(this.$refs.attack, 'Attack', 5, 0, 1000, false, (knob, value) => {
                this.node.attack.value = value / 1000
            }),
            release: knob.create(this.$refs.release, 'Release', 255, 1, 1000, false, (knob, value) => {
                this.node.release.value = value / 1000
            }),
            knee: knob.create(this.$refs.knee, 'Knee', 30, 0, 40, false, (knob, value) => {
                this.node.knee.value = value
            }),
        }

        this.node = new Tone.Compressor(0, 1)
        this.appendToChain(this.node)
        this.node.threshold.value = 0
        this.node.ratio.value = this.knobs.ratio.getValue()
        this.node.attack.value = this.knobs.attack.getValue() / 1000
        this.node.release.value = this.knobs.release.getValue() / 1000
        this.node.knee.value = this.knobs.knee.getValue()

        this.toggle()
    },
    beforeDestroy() {
        this.node.disconnect()
        this.removeFromChain(this.node)
    },
}
</script>

<style></style>
