<template>
    <div class="effectContainer">
        <h1>Waveform</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">On/Off</span>
        <canvas ref="canvas" :width="width" :height="height"></canvas>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {mapActions} from 'vuex'
import {utils} from '../utils'

export default {
    name: 'Waveform',
    methods: {
        ...mapActions(['appendToChain']),
        toggle() {
            if (this.isActive) {
                this.$refs.toggleButton.classList.remove('activeButton')
            } else {
                this.$refs.toggleButton.classList.add('activeButton')
                window.requestAnimationFrame(this.draw)
            }
            this.isActive = !this.isActive
        },
        draw() {
            this.ctx.clearRect(0, 0, this.width, this.height)
            if (this.isActive) {
                const value = this.node.getValue()

                this.ctx.beginPath()
                for (let i = 0; i < value.length; i++) {
                    if (i === 0) {
                        this.ctx.moveTo(
                            utils.map(i, 0, value.length, 0, this.width),
                            utils.map(value[i], -1, 1, this.height, 0)
                        )
                    } else {
                        this.ctx.lineTo(
                            utils.map(i, 0, value.length, 0, this.width),
                            utils.map(value[i], -1, 1, this.height, 0)
                        )
                    }
                }
                this.ctx.stroke()
                window.requestAnimationFrame(this.draw)
            }
        },
    },
    node: null,
    isActive: false,
    data() {
        return {
            width: 400,
            height: 100,
        }
    },
    canvas: null,
    ctx: null,
    mounted() {
        this.node = new Tone.Waveform()
        Tone.connect(Tone.Master, this.node)

        this.canvas = this.$refs.canvas
        this.ctx = this.canvas.getContext('2d')

        this.canvas.style.backgroundColor = '#111'

        this.ctx.strokeStyle = '#16adce'
        this.ctx.lineWidth = 4

        window.requestAnimationFrame(this.draw)
        this.toggle()
    },
}
</script>

<style scoped>
canvas {
    border-radius: 6px;
}
</style>
