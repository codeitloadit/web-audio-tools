<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="/static/wat/x_white.svg" @click="close" />
        <h1 ref="title" class="title">Limiter</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="/static/wat/power.svg" />
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
                this.node.threshold.value = this.lmtThreshold = this.knobs.threshold.getValue()
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
            lmtWasActive: true,
            lmtThreshold: -35,
        }
    },
    mounted() {
        this.node = new Tone.Limiter(0)
        this.appendToChain(this.node)

        this.lmtWasActive = localStorage.lmtWasActive === 'false' ? false : true
        this.lmtThreshold = localStorage.lmtThreshold || this.lmtThreshold

        this.knobs = {
            threshold: knob.create(this.$refs.threshold, 'Threshold', this.lmtThreshold, -35, 0, false, (_, v) => {
                if (this.isActive) {
                    this.node.threshold.value = v
                    this.lmtThreshold = v
                }
            }),
        }

        if (this.lmtWasActive) {
            this.toggle()
        }
    },
    watch: {
        isActive(value) {
            localStorage.lmtWasActive = value
        },
        lmtThreshold(value) {
            localStorage.lmtThreshold = value
        },
    },
    beforeDestroy() {
        this.node.disconnect()
        this.removeFromChain(this.node)
    },
}
</script>

<style></style>
