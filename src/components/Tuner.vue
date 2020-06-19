<template>
    <div class="effectContainer">
        <span id="data">
            <span ref="peakX"></span>
            <span ref="peakY"></span>
        </span>
        <h1>Tuner</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">On/Off</span>
        <canvas ref="canvas" :width="width" :height="height"></canvas>
    </div>
</template>

<script>
import {mapGetters} from 'vuex'
import {PitchDetector} from '../pitchDetector'
import {utils} from '../utils'

export default {
    name: 'Tuner',
    methods: {
        ...mapGetters(['stream']),
        toggle() {
            if (this.isActive) {
                this.$refs.toggleButton.classList.remove('activeButton')
            } else {
                this.$refs.toggleButton.classList.add('activeButton')

                if (this.$store.getters.stream) {
                    this.node.setStream(this.$store.getters.stream)
                    window.requestAnimationFrame(this.draw)
                } else {
                    console.error('Tuner error: No mediaStreamSource set')
                }
            }
            this.isActive = !this.isActive
        },
        draw() {
            this.ctx.clearRect(0, 0, this.width, this.height)

            if (this.isActive) {
                const pitchData = this.node.getPitchData()
                this.recentPitchData.push(pitchData)

                this.ctx.strokeStyle = '#444'
                this.ctx.beginPath()
                this.ctx.arc(200, 520, 500, (250 * Math.PI) / 180, (268 * Math.PI) / 180)
                this.ctx.stroke()

                this.ctx.beginPath()
                this.ctx.arc(200, 520, 500, (272 * Math.PI) / 180, (290 * Math.PI) / 180)
                this.ctx.stroke()

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

                        this.ctx.strokeStyle = '#16adce'
                        this.ctx.fillStyle = '#16adce'
                        if (Math.abs(averageDetune) < 2) {
                            this.ctx.strokeStyle = '#2ECC71'
                            this.ctx.fillStyle = '#2ECC71'
                        }

                        const baseNote = dominantNote[0]
                        const isSharp = dominantNote[1] === '#'

                        this.ctx.font = '60px Arial'
                        this.ctx.fillText(baseNote, 200, 85)

                        if (isSharp) {
                            this.ctx.font = '30px Arial'
                            this.ctx.fillText('#', 232, 62)
                        }

                        const angle = utils.map(averageDetune, -50, 50, 250, 290)

                        this.ctx.beginPath()
                        this.ctx.arc(200, 520, 500, ((angle - 1) * Math.PI) / 180, ((angle + 1) * Math.PI) / 180)
                        this.ctx.stroke()

                        this.ctx.font = '30px Arial'
                        if (Math.abs(averageDetune) < 2) {
                            this.ctx.fillText('♭', 20, 38)
                            this.ctx.fillText('♯', 380, 34)

                            this.ctx.beginPath()
                            this.ctx.moveTo(100, 60)
                            this.ctx.lineTo(100, 80)
                            this.ctx.lineTo(130, 70)
                            this.ctx.fill()

                            this.ctx.beginPath()
                            this.ctx.moveTo(300, 60)
                            this.ctx.lineTo(300, 80)
                            this.ctx.lineTo(270, 70)
                            this.ctx.fill()
                        } else if (averageDetune < 0) {
                            this.ctx.fillText('♭', 20, 38)

                            this.ctx.beginPath()
                            this.ctx.moveTo(100, 60)
                            this.ctx.lineTo(100, 80)
                            this.ctx.lineTo(130, 70)
                            this.ctx.fill()

                            this.ctx.fillStyle = '#444'

                            this.ctx.fillText('♯', 380, 34)

                            this.ctx.beginPath()
                            this.ctx.moveTo(300, 60)
                            this.ctx.lineTo(300, 80)
                            this.ctx.lineTo(270, 70)
                            this.ctx.fill()
                        } else {
                            this.ctx.fillText('♯', 380, 34)

                            this.ctx.beginPath()
                            this.ctx.moveTo(300, 60)
                            this.ctx.lineTo(300, 80)
                            this.ctx.lineTo(270, 70)
                            this.ctx.fill()

                            this.ctx.fillStyle = '#444'

                            this.ctx.fillText('♭', 20, 38)

                            this.ctx.beginPath()
                            this.ctx.moveTo(100, 60)
                            this.ctx.lineTo(100, 80)
                            this.ctx.lineTo(130, 70)
                            this.ctx.fill()
                        }
                    } else {
                        this.ctx.font = '30px Arial'
                        this.ctx.fillStyle = '#444'
                        this.ctx.fillText('♯', 380, 34)
                        this.ctx.fillText('♭', 20, 38)

                        this.ctx.font = '60px Arial'
                        this.ctx.fillText('--', 200, 85)

                        this.ctx.beginPath()
                        this.ctx.moveTo(100, 60)
                        this.ctx.lineTo(100, 80)
                        this.ctx.lineTo(130, 70)
                        this.ctx.fill()

                        this.ctx.beginPath()
                        this.ctx.moveTo(300, 60)
                        this.ctx.lineTo(300, 80)
                        this.ctx.lineTo(270, 70)
                        this.ctx.fill()
                    }
                }

                window.requestAnimationFrame(this.draw)
            }
        },
    },
    recentPitchData: null,
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
        this.node = new PitchDetector()
        this.recentPitchData = []

        this.canvas = this.$refs.canvas
        this.ctx = this.canvas.getContext('2d')
        this.canvas.style.backgroundColor = '#111'

        this.ctx.lineWidth = 8
        this.ctx.lineCap = 'round'
        this.ctx.textAlign = 'center'

        // window.requestAnimationFrame(this.draw)
        // this.toggle()
    },
}
</script>

<style scoped>
#data {
    float: right;
}

#data span {
    margin-left: 10px;
}
canvas {
    border-radius: 6px;
}
</style>
