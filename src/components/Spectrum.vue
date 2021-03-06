<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="/static/wat/x_white.svg" @click="close" />
        <h1 ref="title" class="title">Spectrum</h1>
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
                        utils.map(Math.log(i), 0, Math.log(spectrum.length), -20, this.width + 20),
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
            spcWasActive: true,
            width: 200,
            height: 100,
        }
    },
    mounted() {
        this.node = new Tone.FFT(4096)
        Tone.connect(this.$store.getters.streamOutput, this.node)

        this.spcWasActive = localStorage.spcWasActive === 'false' ? false : true

        this.canvas = this.$refs.canvas
        this.ctx = this.canvas.getContext('2d')

        this.canvas.style.backgroundColor = '#111'

        this.ctx.fillStyle = '#ff9c33'

        if (this.spcWasActive) {
            this.toggle()
        }
    },
    watch: {
        isActive(value) {
            localStorage.spcWasActive = value
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
