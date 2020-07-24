<template>
    <div class="effectContainer">
        <h1 ref="title" class="title active">Spectrum</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="power.svg" />
        </span>
        <canvas ref="canvas" :width="width" :height="height"></canvas>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {mapActions} from 'vuex'
import {utils} from '../utils'

export default {
    name: 'Spectrum',
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
        draw() {
            this.ctx.clearRect(0, 0, this.width, this.height)
            if (this.isActive) {
                const spectrum = this.node.getValue()

                this.ctx.beginPath()
                this.ctx.moveTo(0, this.height)

                for (let i = 0; i < spectrum.length; i++) {
                    this.ctx.lineTo(
                        utils.map(Math.log(i), 0, Math.log(spectrum.length), 0, this.width),
                        utils.map(spectrum[i], -127, 0, this.height, 0)
                    )
                }
                this.ctx.lineTo(this.width, this.height)
                this.ctx.fill()
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
        this.node = new Tone.FFT(4096)
        Tone.connect(Tone.Master, this.node)

        this.canvas = this.$refs.canvas
        this.ctx = this.canvas.getContext('2d')

        this.canvas.style.backgroundColor = '#111'

        this.ctx.fillStyle = '#F68432'

        this.toggle()
    },
}
</script>

<style scoped>
canvas {
    border-radius: 6px;
}
</style>
