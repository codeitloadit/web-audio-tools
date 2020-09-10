<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="/static/wat/x_white.svg" @click="close" />
        <h1 ref="title" class="title">Waveform</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="/static/wat/power.svg" />
        </span>
        <canvas ref="canvas" :width="width" :height="height"></canvas>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {mapActions} from 'vuex'
import {utils} from '../utils'

const effectName = 'Waveform'

export default {
    name: effectName,
    methods: {
        ...mapActions(['appendToChain']),
        toggle() {
            if (this.isActive) {
                this.$refs.toggleButton.classList.remove('activeButton')
                this.$refs.title.classList.remove('active')
            } else {
                this.$refs.toggleButton.classList.add('activeButton')
                this.$refs.title.classList.add('active')
                window.requestAnimationFrame(this.draw)
            }
            this.isActive = !this.isActive
        },
        close() {
            this.$emit('closeEffect', effectName)
        },
        draw() {
            this.ctx.clearRect(0, 0, this.width, this.height)
            if (this.isActive) {
                const value = this.node.getValue()

                this.ctx.beginPath()
                for (let i = 0; i < value.length; i++) {
                    const x = utils.map(i, 0, value.length, 0, this.width)
                    const y = utils.map(value[i], -1, 1, this.height, 0)
                    if (i === 0) {
                        this.ctx.moveTo(x, y)
                    } else {
                        this.ctx.lineTo(x, y)
                    }
                }
                this.ctx.stroke()
                window.requestAnimationFrame(this.draw)
            }
        },
    },
    data() {
        return {
            isActive: false,
            wavWasActive: true,
            width: 200,
            height: 100,
        }
    },
    mounted() {
        this.node = new Tone.Waveform(4096)
        Tone.connect(this.$store.getters.streamOutput, this.node)

        this.wavWasActive = localStorage.wavWasActive === 'false' ? false : true

        this.canvas = this.$refs.canvas
        this.ctx = this.canvas.getContext('2d')

        this.canvas.style.backgroundColor = '#111'

        this.ctx.strokeStyle = '#ff9c33'
        this.ctx.lineWidth = 2

        if (this.wavWasActive) {
            this.toggle()
        }
    },
    watch: {
        isActive(value) {
            localStorage.wavWasActive = value
        },
    },
    beforeDestroy() {
        this.node.disconnect()
    },
}
</script>

<style scoped>
canvas {
    border-radius: 6px;
}
</style>
