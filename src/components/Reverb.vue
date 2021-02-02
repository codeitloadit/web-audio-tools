<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="/static/wat/x_white.svg" @click="close" />
        <h1 ref="title" class="title">Reverb</h1>
        <select ref="presets" class="presets">
            <option value="disabled" disabled selected>Presets</option>
        </select>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="/static/wat/power.svg" />
        </span>
        <div ref="decay"></div>
        <div ref="preDelay"></div>
        <div ref="wet"></div>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {knob} from '../knob'
import {mapActions} from 'vuex'
import json from '../presets.json'

const effectName = 'Reverb'

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
                this.rvbWet = this.knobs.wet.getValue()
                this.$refs.toggleButton.classList.add('activeButton')
                this.$refs.title.classList.add('active')
            }
            this.isActive = !this.isActive

            Object.values(this.knobs).forEach((knob) => {
                knob.setActive(this.isActive)
            })
        },
        generateReverb() {
            if (this.isGenerating) {
                this.isGeneratePending = true
            } else {
                this.isGeneratePending = false
                this.isGenerating = true
                this.node.generate().then(() => {
                    this.isGenerating = false
                    if (this.isGeneratePending) {
                        this.generateReverb()
                    }
                })
            }
        },
        close() {
            this.$emit('closeEffect', effectName)
        },
        checkPresets() {
            this.$refs.presets.value = 'disabled'
            Object.keys(json[effectName]).forEach((name) => {
                const preset = json[effectName][name]
                if (
                    this.knobs.decay.getValue('rvbDecay') === preset.rvbDecay &&
                    this.knobs.preDelay.getValue('rvbPreDelay') === preset.rvbPreDelay &&
                    this.knobs.wet.getValue('rvbWet') === preset.rvbWet
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
            isGenerating: false,
            isGeneratePending: false,
            rvbWasActive: true,
            rvbDecay: 20,
            rvbPreDelay: 50,
            rvbWet: 30,
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

            this.knobs.decay.setValue(preset.rvbDecay)
            this.knobs.preDelay.setValue(preset.rvbPreDelay)
            this.knobs.wet.setValue(preset.rvbWet)
        }

        this.node = new Tone.Reverb()
        this.generateReverb()
        this.appendToChain(this.node)
        window[effectName] = this.node

        this.rvbWasActive = localStorage.rvbWasActive === 'false' ? false : true
        this.rvbDecay = localStorage.rvbDecay || this.rvbDecay
        this.rvbPreDelay = localStorage.rvbPreDelay || this.rvbPreDelay
        this.rvbWet = localStorage.rvbWet || this.rvbWet

        this.knobs = {
            decay: knob.create(this.$refs.decay, 'Decay', this.rvbDecay, 0.0, 1000, false, (_, v) => {
                this.node.decay = v / 100
                this.rvbDecay = v
                this.generateReverb()
                this.checkPresets()
            }),
            preDelay: knob.create(this.$refs.preDelay, 'Pre Delay', this.rvbPreDelay, 1, 100, false, (_, v) => {
                this.node.preDelay = v / 1000
                this.rvbPreDelay = v
                this.generateReverb()
                this.checkPresets()
            }),
            wet: knob.create(this.$refs.wet, 'Dry/Wet', this.rvbWet, 0, 100, true, (_, v) => {
                if (this.isActive) {
                    this.node.wet.value = v / 100
                    this.rvbWet = v
                }
                this.checkPresets()
            }),
        }

        this.node.decay = this.knobs.decay.getValue() / 100
        this.node.preDelay = this.knobs.preDelay.getValue() / 1000
        this.node.wet.value = 0

        this.checkPresets()

        if (this.rvbWasActive) {
            this.toggle()
        }
    },
    watch: {
        isActive(value) {
            localStorage.rvbWasActive = value
        },
        rvbDecay(value) {
            localStorage.rvbDecay = value
        },
        rvbPreDelay(value) {
            localStorage.rvbPreDelay = value
        },
        rvbWet(value) {
            localStorage.rvbWet = value
        },
    },
    beforeDestroy() {
        this.node.disconnect()
        this.removeFromChain(this.node)
    },
}
</script>

<style></style>
