<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="/static/wat/x_white.svg" @click="close" />
        <h1 ref="title" class="title">FFT Tuner</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="/static/wat/power.svg" />
        </span>
        <div ref="threshold"></div>
        <canvas ref="canvas" :width="width" :height="height"></canvas>
        <div ref="smoothing"></div>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {mapGetters} from 'vuex'
import {utils} from '../utils'
import {knob} from '../knob'

const effectName = 'TunerFFT'

export default {
    name: effectName,
    methods: {
        ...mapGetters(['stream']),
        toggle() {
            if (this.isActive) {
                this.$refs.toggleButton.classList.remove('activeButton')
                this.$refs.title.classList.remove('active')
                this.node.disconnect()
            } else {
                this.$refs.toggleButton.classList.add('activeButton')
                this.$refs.title.classList.add('active')

                if (this.$store.getters.stream) {
                    Tone.connect(this.$store.getters.stream, this.node)
                    window.requestAnimationFrame(this.draw)
                } else {
                    console.error('Tuner error: No mediaStreamSource set')
                }
            }
            this.isActive = !this.isActive

            Object.values(this.knobs).forEach((knob) => {
                knob.setActive(this.isActive)
            })
        },
        close() {
            this.$emit('closeEffect', effectName)
        },
        getPitchData() {
            const spectrum = this.node.getValue()
            const peaks = []

            for (let i = 0; i < spectrum.length; i++) {
                if (i === 0 || i === spectrum.length - 1) {
                    continue
                }

                if (
                    spectrum[i] >= spectrum[i - 1] &&
                    spectrum[i] >= spectrum[i + 1] &&
                    spectrum[i] > -this.tunThreshold
                ) {
                    peaks.push({
                        amplitude: spectrum[i],
                        index: i,
                    })
                }
            }

            if (peaks.length < 5) {
                return {
                    note: '',
                    detune: '',
                }
            }

            peaks.sort((a, b) =>
                a.amplitude > b.amplitude ? 1 : a.amplitude === b.amplitude ? (a.index < b.index ? 1 : -1) : -1
            )

            const dominantPeaks = peaks.slice(peaks.length - 5)
            dominantPeaks.sort((a, b) => (a.index > b.index ? 1 : -1))

            const notes = []
            const frequencies = []
            dominantPeaks.forEach((peak) => {
                notes.push(utils.noteFromFrequency(this.node.getFrequencyOfIndex(peak.index)))
                frequencies.push(this.node.getFrequencyOfIndex(peak.index))
            })

            const fundamentalNote = utils.mode(notes)

            let noteIndexClosestToFrequency = null
            let frequencyOffset = Infinity
            dominantPeaks.forEach((peak, i) => {
                if (notes[i] === fundamentalNote) {
                    const offset = Math.abs(frequencies[i] - 440)
                    if (offset < frequencyOffset) {
                        frequencyOffset = offset
                        noteIndexClosestToFrequency = i
                    }
                }
            })

            const fundamentalFrequency = this.node.getFrequencyOfIndex(dominantPeaks[noteIndexClosestToFrequency].index)

            // let fundamentalFrequency = ''
            // if (fundamentalNote === notes[0] && notes[0] === notes[1]) {
            //     fundamentalFrequency = this.node.getFrequencyOfIndex(dominantPeaks[1].index)
            // } else {
            //     fundamentalFrequency = this.node.getFrequencyOfIndex(
            //         dominantPeaks[notes.indexOf(fundamentalNote)].index
            //     )
            // }
            const noteNumber = utils.noteNumberFromFrequency(fundamentalFrequency)
            const centsOff = utils.centsOffFromFrequency(fundamentalFrequency, noteNumber)

            return {
                note: fundamentalNote,
                detune: centsOff,
            }
        },
        draw() {
            this.ctx.clearRect(0, 0, this.width, this.height)

            if (this.isActive) {
                const pitchData = this.getPitchData()
                // console.log(pitchData)
                this.recentPitchData.push(pitchData)

                this.ctx.strokeStyle = '#444'
                this.drawArc(250, 268)
                this.drawArc(272, 290)

                if (this.recentPitchData.length > this.tunSmoothing) {
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

                    if (dominantNote) {
                        let detuneSum = 0
                        let relaventNoteCount = 0
                        this.recentPitchData.forEach((pd) => {
                            if (pd.note === dominantNote) {
                                detuneSum += pd.detune
                                relaventNoteCount++
                            }
                        })
                        const averageDetune = detuneSum / relaventNoteCount

                        this.ctx.strokeStyle = '#ff9c33'
                        this.ctx.fillStyle = '#ff9c33'
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

                if (this.isActive) {
                    window.requestAnimationFrame(this.draw)
                }
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
            tunWasActive: true,
            width: 400,
            height: 100,
            tunThreshold: 60,
            tunSmoothing: 15,
        }
    },
    mounted() {
        this.node = new Tone.FFT(4096)
        this.recentPitchData = []

        this.tunWasActive = localStorage.tunWasActive === 'false' ? false : true
        this.tunThreshold = localStorage.tunThreshold || this.tunThreshold
        this.tunSmoothing = localStorage.tunSmoothing || this.tunSmoothing

        this.knobs = {
            threshold: knob.create(this.$refs.threshold, 'Threshold', this.tunThreshold, 25, 100, false, (_, v) => {
                this.tunThreshold = v
            }),
            smoothing: knob.create(this.$refs.smoothing, 'Smoothing', this.tunSmoothing, 1, 100, false, (_, v) => {
                this.tunSmoothing = v
            }),
        }

        this.canvas = this.$refs.canvas
        this.ctx = this.canvas.getContext('2d')
        this.canvas.style.backgroundColor = '#111'

        this.ctx.lineWidth = 8
        this.ctx.lineCap = 'round'
        this.ctx.textAlign = 'center'

        this.drawOffState()

        if (this.tunWasActive) {
            this.toggle()
        }
    },
    watch: {
        isActive(value) {
            localStorage.tunWasActive = value
        },
        tunThreshold(value) {
            localStorage.tunThreshold = value
        },
        tunSmoothing(value) {
            localStorage.tunSmoothing = value
        },
    },
    beforeDestroy() {
        if (this.isActive) {
            this.toggle()
        }
    },
}
</script>

<style scoped>
canvas {
    border-radius: 6px;
    margin: 0 8px;
}
</style>
