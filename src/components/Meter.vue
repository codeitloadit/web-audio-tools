<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="/static/wat/x_white.svg" @click="close" />
        <h1 ref="title" class="title active">Meter</h1>
        <div ref="left"></div>
        <div ref="right"></div>
        <span ref="clipButton" class="toggleButton" @click="clearClip">
            <img class="buttonIcon" src="/static/wat/clip.svg" />
        </span>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {bar} from '../bar'

const effectName = 'Meter'

export default {
    name: effectName,
    methods: {
        clearClip() {
            this.hasClipped = false
            this.$refs.clipButton.classList.remove('clip')
        },
        close() {
            this.$emit('closeEffect', effectName)
        },
    },
    data() {
        return {
            hasClipped: false,
        }
    },
    mounted() {
        this.split = new Tone.Split()
        Tone.connect(this.$store.getters.streamOutput, this.split)

        this.leftMeter = new Tone.Meter()
        this.split.connect(this.leftMeter, 0)

        this.rightMeter = new Tone.Meter()
        this.split.connect(this.rightMeter, 1)

        const graphLeft = bar.create(this.$refs.left, 0, -70, 10, -70, 10, 5, [0])
        const graphRight = bar.create(this.$refs.right, 0, -70, 10, -70, 10, 5, [0])

        const draw = () => {
            const leftLevel = this.leftMeter.getValue()
            const rightLevel = this.rightMeter.getValue()

            if (!this.hasClipped && (leftLevel > 0 || rightLevel > 0)) {
                this.hasClipped = true
                this.$refs.clipButton.classList.add('clip')
            }

            graphLeft.setValue(leftLevel)
            graphRight.setValue(rightLevel)

            window.requestAnimationFrame(draw)
        }
        window.requestAnimationFrame(draw)
    },
    beforeDestroy() {
        this.rightMeter.disconnect()
        this.leftMeter.disconnect()
        this.split.disconnect()
    },
}
</script>

<style scoped>
.effectContainer > div:last-of-type {
    display: inline-block;
}

.toggleButton {
    /* width: 60px; */
    top: -16px;
    margin: 0 4px 0 20px;
}

.clip {
    background-color: #ff7077;
    box-shadow: 0 0 30px #ff7077;
}
</style>
