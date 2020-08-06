<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="x_white.svg" @click="close" />
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

const effectName = 'Spectrum'

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
    data() {
        return {
            isActive: false,
            width: 400,
            height: 100,
        }
    },
    mounted() {
        this.node = new Tone.FFT(4096)
        Tone.connect(Tone.Master, this.node)

        this.canvas = this.$refs.canvas
        this.ctx = this.canvas.getContext('2d')

        this.canvas.style.backgroundColor = '#111'

        this.ctx.fillStyle = '#F68432'

        this.toggle()
    },
    beforeDestroy() {
        Tone.disconnect(Tone.Master, this.node)
    },
}
</script>

<style scoped>
canvas {
    border-radius: 6px;
}
</style>
