<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="/static/wat/x_white.svg" @click="close" />
        <h1 ref="title" class="title active">Compressor</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="/static/wat/power.svg" />
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
                this.node.threshold.value = this.cmpThreshold = this.knobs.threshold.getValue()
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
            cmpThreshold: -50,
            cmpRatio: 4,
            cmpAttack: 5,
            cmpRelease: 255,
            cmpKnee: 30,
        }
    },
    mounted() {
        this.node = new Tone.Compressor(0, 1)
        this.appendToChain(this.node)

        this.cmpThreshold = localStorage.cmpThreshold || this.cmpThreshold
        this.cmpRatio = localStorage.cmpRatio || this.cmpRatio
        this.cmpAttack = localStorage.cmpAttack || this.cmpAttack
        this.cmpRelease = localStorage.cmpRelease || this.cmpRelease
        this.cmpKnee = localStorage.cmpKnee || this.cmpKnee

        this.knobs = {
            threshold: knob.create(this.$refs.threshold, 'Threshold', this.cmpThreshold, -100, 0, false, (_, v) => {
                if (this.isActive) {
                    this.node.threshold.value = v
                    this.cmpThreshold = v
                }
            }),
            ratio: knob.create(this.$refs.ratio, 'Ratio', this.cmpRatio, 1, 20, false, (_, v) => {
                this.node.ratio.value = v
                this.cmpRatio = v
            }),
            attack: knob.create(this.$refs.attack, 'Attack', this.cmpAttack, 0, 1000, false, (_, v) => {
                this.node.attack.value = v / 1000
                this.cmpAttack = v
            }),
            release: knob.create(this.$refs.release, 'Release', this.cmpRelease, 1, 1000, false, (_, v) => {
                this.node.release.value = v / 1000
                this.cmpRelease = v
            }),
            knee: knob.create(this.$refs.knee, 'Knee', this.cmpKnee, 0, 40, false, (_, v) => {
                this.node.knee.value = v
                this.cmpKnee = v
            }),
        }

        this.node.threshold.value = 0
        this.node.ratio.value = this.knobs.ratio.getValue()
        this.node.attack.value = this.knobs.attack.getValue() / 1000
        this.node.release.value = this.knobs.release.getValue() / 1000
        this.node.knee.value = this.knobs.knee.getValue()

        this.toggle()
    },
    watch: {
        cmpThreshold(value) {
            localStorage.cmpThreshold = value
        },
        cmpRatio(value) {
            localStorage.cmpRatio = value
        },
        cmpAttack(value) {
            localStorage.cmpAttack = value
        },
        cmpRelease(value) {
            localStorage.cmpRelease = value
        },
        cmpKnee(value) {
            localStorage.cmpKnee = value
        },
    },
    beforeDestroy() {
        this.node.disconnect()
        this.removeFromChain(this.node)
    },
}
</script>

<style></style>
