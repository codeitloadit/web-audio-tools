<template>
    <div ref="meter" class="effectContainer">
        <h1>Meter</h1>
        <div ref="left"></div>
        <div ref="right"></div>
        <span ref="clipButton" class="toggleButton" @click="clearClip">Clip</span>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {bar} from '../bar'

export default {
    name: 'Meter',
    methods: {
        clearClip() {
            this.hasClipped = false
            this.$refs.clipButton.classList.remove('clip')
        },
    },
    hasClipped: false,
    mounted() {
        const split = new Tone.Split()
        Tone.connect(Tone.Master, split)

        this.leftMeter = new Tone.Meter()
        split.left.connect(this.leftMeter)

        this.rightMeter = new Tone.Meter()
        split.right.connect(this.rightMeter)

        const graphLeft = bar.create(this.$refs.left, 0, -70, 10, -70, 10, 5, [0])
        const graphRight = bar.create(this.$refs.right, 0, -70, 10, -70, 10, 5, [0])

        const drawMeter = () => {
            const leftLevel = this.leftMeter.getLevel()
            const rightLevel = this.rightMeter.getLevel()

            if (!this.hasClipped && (leftLevel > 0 || rightLevel > 0)) {
                this.hasClipped = true
                this.$refs.clipButton.classList.add('clip')
            }

            graphLeft.setValue(leftLevel)
            graphRight.setValue(rightLevel)

            window.requestAnimationFrame(drawMeter)
        }
        window.requestAnimationFrame(drawMeter)
    },
}
</script>

<style scoped>
.effectContainer > div:last-of-type {
    display: inline-block;
}

.toggleButton {
    width: 60px;
    top: -16px;
    margin: 0 4px 0 20px;
}

.clip {
    background-color: #ff7077;
    box-shadow: 0 0 30px #ff7077;
}
</style>
