<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="/static/wat/x_white.svg" @click="close" />
        <h1 ref="title" class="title">Compressor</h1>
        <select ref="presets" class="presets">
            <option value="disabled" disabled selected>Presets</option>
        </select>
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
import json from '../presets.json'

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
        checkPresets() {
            this.$refs.presets.value = 'disabled'
            Object.keys(json[effectName]).forEach((name) => {
                const preset = json[effectName][name]
                if (
                    this.knobs.threshold.getValue('cmpThreshold') === preset.cmpThreshold &&
                    this.knobs.ratio.getValue('cmpRatio') === preset.cmpRatio &&
                    this.knobs.attack.getValue('cmpAttack') === preset.cmpAttack &&
                    this.knobs.release.getValue('cmpRelease') === preset.cmpRelease &&
                    this.knobs.knee.getValue('cmpKnee') === preset.cmpKnee
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
            cmpWasActive: true,
            cmpThreshold: -50,
            cmpRatio: 4,
            cmpAttack: 5,
            cmpRelease: 255,
            cmpKnee: 30,
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

            this.knobs.threshold.setValue(preset.cmpThreshold)
            this.knobs.ratio.setValue(preset.cmpRatio)
            this.knobs.attack.setValue(preset.cmpAttack)
            this.knobs.release.setValue(preset.cmpRelease)
            this.knobs.knee.setValue(preset.cmpKnee)
        }

        this.node = new Tone.Compressor(0, 1)
        this.appendToChain(this.node)

        this.cmpWasActive = localStorage.cmpWasActive === 'false' ? false : true
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
                this.checkPresets()
            }),
            ratio: knob.create(this.$refs.ratio, 'Ratio', this.cmpRatio, 1, 20, false, (_, v) => {
                this.node.ratio.value = v
                this.cmpRatio = v
                this.checkPresets()
            }),
            attack: knob.create(this.$refs.attack, 'Attack', this.cmpAttack, 0, 1000, false, (_, v) => {
                this.node.attack.value = v / 1000
                this.cmpAttack = v
                this.checkPresets()
            }),
            release: knob.create(this.$refs.release, 'Release', this.cmpRelease, 1, 1000, false, (_, v) => {
                this.node.release.value = v / 1000
                this.cmpRelease = v
                this.checkPresets()
            }),
            knee: knob.create(this.$refs.knee, 'Knee', this.cmpKnee, 0, 40, false, (_, v) => {
                this.node.knee.value = v
                this.cmpKnee = v
                this.checkPresets()
            }),
        }

        this.node.threshold.value = 0
        this.node.ratio.value = this.knobs.ratio.getValue()
        this.node.attack.value = this.knobs.attack.getValue() / 1000
        this.node.release.value = this.knobs.release.getValue() / 1000
        this.node.knee.value = this.knobs.knee.getValue()

        this.checkPresets()

        if (this.cmpWasActive) {
            this.toggle()
        }
    },
    watch: {
        isActive(value) {
            localStorage.cmpWasActive = value
        },
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
