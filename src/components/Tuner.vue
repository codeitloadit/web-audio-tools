<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="x_white.svg" @click="close" />
        <h1 ref="title" class="title active">Tuner</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="power.svg" />
        </span>
        <canvas ref="canvas" :width="width" :height="height"></canvas>
    </div>
</template>

<script>
import {mapGetters} from 'vuex'
import {PitchDetector} from '../pitchDetector'
import {utils} from '../utils'

const effectName = 'Tuner'

export default {
    name: effectName,
    methods: {
        ...mapGetters(['stream']),
        toggle() {
            if (this.isActive) {
                this.$refs.toggleButton.classList.remove('activeButton')
                this.$refs.title.classList.remove('active')
            } else {
                this.$refs.toggleButton.classList.add('activeButton')
                this.$refs.title.classList.add('active')

                if (this.$store.getters.stream) {
                    this.node.setStream(this.$store.getters.stream)
                    window.requestAnimationFrame(this.draw)
                } else {
                    console.error('Tuner error: No mediaStreamSource set')
                }
            }
            this.isActive = !this.isActive
        },
        close() {
            this.$emit('closeEffect', effectName)
        },
        draw() {
            this.ctx.clearRect(0, 0, this.width, this.height)

            if (this.isActive) {
                const pitchData = this.node.getPitchData()
                this.recentPitchData.push(pitchData)

                this.ctx.strokeStyle = '#444'
                this.drawArc(250, 268)
                this.drawArc(272, 290)

                if (this.recentPitchData.length > 50) {
                    this.recentPitchData.shift()

                    const recentNotes = []
                    this.recentPitchData.forEach((pd) => {
                        recentNotes.push(pd.note)
                    })

                    const dominantNote = recentNotes
                        .sort(
                            (a, b) =>
                                recentNotes.filter((v) => v === a).length - recentNotes.filter((v) => v === b).length
                        )
                        .pop()

                    if (dominantNote !== '') {
                        let detuneSum = 0
                        let relaventNoteCount = 0
                        this.recentPitchData.forEach((pd) => {
                            if (pd.note === dominantNote) {
                                detuneSum += pd.detune
                                relaventNoteCount++
                            }
                        })
                        const averageDetune = detuneSum / relaventNoteCount

                        this.ctx.strokeStyle = '#F68432'
                        this.ctx.fillStyle = '#F68432'
                        if (Math.abs(averageDetune) < 2) {
                            this.ctx.strokeStyle = '#00ff5e'
                            this.ctx.fillStyle = '#00ff5e'
                        }

                        const baseNote = dominantNote[0]
                        const isSharp = dominantNote[1] === '#'

                        this.ctx.font = '60px Graphik Regular'
                        this.ctx.fillText(baseNote, 200, 85)

                        if (isSharp) {
                            this.ctx.font = '30px Graphik Regular'
                            this.ctx.fillText('#', 232, 62)
                        }

                        const angle = utils.map(averageDetune, -50, 50, 250, 290)
                        this.drawArc(angle - 1, angle + 1)

                        this.ctx.font = '30px Graphik Regular'
                        if (Math.abs(averageDetune) < 2) {
                            this.ctx.fillText('♭', 20, 38)
                            this.ctx.fillText('♯', 380, 34)
                            this.drawFlatTriangle()
                            this.drawSharpTriangle()
                        } else if (averageDetune < 0) {
                            this.ctx.fillText('♭', 20, 38)
                            this.drawFlatTriangle()
                            this.ctx.fillStyle = '#444'
                            this.ctx.fillText('♯', 380, 34)
                            this.drawSharpTriangle()
                        } else {
                            this.ctx.fillText('♯', 380, 34)
                            this.drawSharpTriangle()
                            this.ctx.fillStyle = '#444'
                            this.ctx.fillText('♭', 20, 38)
                            this.drawFlatTriangle()
                        }
                    } else {
                        this.drawOffState()
                    }
                } else {
                    this.drawOffState()
                }

                window.requestAnimationFrame(this.draw)
            } else {
                this.drawOffState()
            }
        },
        drawArc(start, stop) {
            this.ctx.beginPath()
            this.ctx.arc(200, 520, 500, (start * Math.PI) / 180, (stop * Math.PI) / 180)
            this.ctx.stroke()
        },
        drawFlatTriangle() {
            this.ctx.beginPath()
            this.ctx.moveTo(100, 60)
            this.ctx.lineTo(100, 80)
            this.ctx.lineTo(130, 70)
            this.ctx.fill()
        },
        drawSharpTriangle() {
            this.ctx.beginPath()
            this.ctx.moveTo(300, 60)
            this.ctx.lineTo(300, 80)
            this.ctx.lineTo(270, 70)
            this.ctx.fill()
        },
        drawOffState() {
            this.ctx.fillStyle = '#444'
            this.ctx.strokeStyle = '#444'

            this.drawArc(250, 268)
            this.drawArc(272, 290)

            this.ctx.font = '30px Graphik Regular'
            this.ctx.fillText('♯', 380, 34)
            this.ctx.fillText('♭', 20, 38)

            this.ctx.font = '60px Graphik Regular'
            this.ctx.fillText('--', 200, 85)

            this.drawSharpTriangle()
            this.drawFlatTriangle()
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
        this.node = new PitchDetector()
        this.recentPitchData = []

        this.canvas = this.$refs.canvas
        this.ctx = this.canvas.getContext('2d')
        this.canvas.style.backgroundColor = '#111'

        this.ctx.lineWidth = 8
        this.ctx.lineCap = 'round'
        this.ctx.textAlign = 'center'

        this.drawOffState()

        this.toggle()
    },
}
</script>

<style scoped>
canvas {
    border-radius: 6px;
}
</style>
