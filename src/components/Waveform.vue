<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="x_white.svg" @click="close" />
        <h1 ref="title" class="title active">Waveform</h1>
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
        this.node = new Tone.Waveform(4096)
        Tone.connect(Tone.Master, this.node)

        this.canvas = this.$refs.canvas
        this.ctx = this.canvas.getContext('2d')

        this.canvas.style.backgroundColor = '#111'

        this.ctx.strokeStyle = '#F68432'
        this.ctx.lineWidth = 2

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
