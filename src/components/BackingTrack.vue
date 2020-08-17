<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="x_white.svg" @click="close" />
        <h1 ref="title" class="title">Backing Track</h1>
        <span id="fileName" ref="fileName"></span>
        <span id="timeData" ref="timeData">0:00 / 0:00</span>
        <span ref="loadButton" class="toggleButton" @click="triggerFileInput">
            <img class="buttonIcon" src="load.svg" />
        </span>
        <span id="mute" ref="muteButton" class="toggleButton" @click="mute">
            <img class="buttonIcon" src="mute.svg" />
        </span>
        <span id="play" ref="toggleButton" class="toggleButton" @click="toggle">
            <img ref="playDisabled" class="buttonIcon" src="play_grey.svg" />
            <img id="playEnabled" ref="playEnabled" class="buttonIcon" src="play.svg" />
            <img id="stop" ref="stop" class="buttonIcon" src="stop.svg" />
        </span>
        <span id="pause" ref="pauseButton" class="toggleButton" @click="pause">
            <img ref="pauseDisabled" class="buttonIcon" src="pause_grey.svg" />
            <img id="pauseEnabled" ref="pauseEnabled" class="buttonIcon" src="pause.svg" />
        </span>
        <canvas ref="canvas" :width="width" :height="height"></canvas>
        <div ref="volume"></div>
        <div ref="pan"></div>
        <input type="file" id="file" ref="file" @change="loadFile" />
    </div>
</template>

<script>
import * as Tone from 'tone'
import {knob} from '../knob'
import {utils} from '../utils'

const effectName = 'BackingTrack'

const secondsToMinutes = (seconds) => {
    return new Date(seconds * 1000).toISOString().substr(14, 5)
}

export default {
    name: effectName,
    methods: {
        toggle() {
            if (this.isActive) {
                Tone.Transport.pause()
                this.node.stop()
                this.$refs.playEnabled.style.display = 'inline'
                this.$refs.stop.style.display = 'none'
                this.$refs.pauseDisabled.style.display = 'inline'
                this.$refs.pauseEnabled.style.display = 'none'
                this.$refs.toggleButton.classList.remove('activeButton')
                this.$refs.title.classList.remove('active')
                this.isActive = false
            } else {
                if (!this.node.loaded) {
                    return
                }
                Tone.Transport.emit('stopTransport', effectName)
                Tone.Transport.seconds = this.pauseTime
                Tone.Transport.start()
                this.node.start()
                this.node.seek(this.pauseTime)
                this.pauseTime = 0
                this.$refs.playEnabled.style.display = 'none'
                this.$refs.stop.style.display = 'inline'
                this.$refs.pauseDisabled.style.display = 'none'
                this.$refs.pauseEnabled.style.display = 'inline'
                this.$refs.toggleButton.classList.add('activeButton')
                this.$refs.title.classList.add('active')
                this.isActive = true
            }

            Object.values(this.knobs).forEach((knob) => {
                knob.setActive(this.isActive)
            })
            window.requestAnimationFrame(this.draw)
        },
        pause() {
            if (this.pauseTime === 0) {
                const pauseTime = Tone.Transport.seconds
                this.toggle()
                this.pauseTime = pauseTime
            }
        },
        playAtMousePos() {
            this.node.seek(this.duration / (this.width / this.mousePos.x))
            Tone.Transport.seconds = this.duration / (this.width / this.mousePos.x)

            this.pauseTime = Tone.Transport.seconds
            if (this.isActive) {
                this.toggle()
                this.toggle()
            }
        },
        mute() {
            if (this.isMuted) {
                this.$refs.muteButton.classList.remove('muted')
            } else {
                this.$refs.muteButton.classList.add('muted')
            }
            this.isMuted = !this.isMuted
            this.node.mute = this.isMuted
        },
        loadFile(event) {
            const file = event.target.files[0]
            const reader = new FileReader()

            reader.onload = (e) => {
                if (this.isActive) {
                    this.toggle()
                }
                this.duration = 0
                this.pauseTime = 0
                Tone.Transport.seconds = 0

                this.node.load(e.target.result, () => {
                    this.$refs.playDisabled.style.display = 'none'
                    this.$refs.playEnabled.style.display = 'inline'
                    this.$refs.pauseDisabled.style.display = 'inline'
                    this.$refs.pauseEnabled.style.display = 'none'
                    this.$refs.fileName.innerText = event.target.files[0].name

                    this.duration = this.node.buffer.duration
                    this.waveData.left = []
                    this.waveData.right = []

                    this.ctx.clearRect(0, 0, this.width, this.height)

                    this.ctx.strokeStyle = '#666'

                    const p = 1

                    const leftChannel = this.node.buffer.getChannelData(0)
                    this.ctx.save()
                    this.ctx.translate(0, this.height * 0.25)
                    for (let i = 0; i < this.width * p; i++) {
                        const x = i / p
                        const y = leftChannel[x * Math.round(leftChannel.length / this.width)] * this.height * 0.25
                        this.waveData.left.push([x, y])
                        this.ctx.beginPath()
                        this.ctx.moveTo(x, 0)
                        this.ctx.lineTo(x, y)
                        this.ctx.stroke()
                        this.ctx.beginPath()
                        this.ctx.moveTo(x, 0)
                        this.ctx.lineTo(x, y * -1)
                        this.ctx.stroke()
                    }
                    this.ctx.restore()

                    const rightChannel = this.node.buffer.getChannelData(1)
                    this.ctx.save()
                    this.ctx.translate(0, this.height * 0.75)
                    for (let i = 0; i < this.width * p; i++) {
                        const x = i / p
                        const y = rightChannel[x * Math.round(rightChannel.length / this.width)] * this.height * 0.25
                        this.waveData.right.push([x, y])
                        this.ctx.beginPath()
                        this.ctx.moveTo(x, 0)
                        this.ctx.lineTo(x, y)
                        this.ctx.stroke()
                        this.ctx.beginPath()
                        this.ctx.moveTo(x, 0)
                        this.ctx.lineTo(x, y * -1)
                        this.ctx.stroke()
                    }
                    this.ctx.restore()
                })

                this.$refs.fileName.innerText = 'Loading...'
                this.$refs.timeData.innerText = '0:00 / 0:00'
            }
            reader.readAsDataURL(file)
        },
        triggerFileInput() {
            this.$refs.file.click()
        },
        draw() {
            this.ctx.clearRect(0, 0, this.width, this.height)
            const elapsed = this.duration / Tone.Transport.seconds
            this.$refs.timeData.innerText = `${secondsToMinutes(Tone.Transport.seconds)} / ${secondsToMinutes(
                this.duration
            )}`

            if (this.isActive || this.pauseTime !== 0) {
                const progress = this.width / elapsed + 1

                if (progress > this.width) {
                    this.toggle()
                }

                this.ctx.save()
                this.ctx.translate(0, this.height * 0.25)

                this.ctx.strokeStyle = '#ff9c33'
                let hasChangedColor = false
                this.waveData.left.forEach((i) => {
                    if (!hasChangedColor && i[0] > progress) {
                        this.ctx.strokeStyle = '#666'
                        hasChangedColor = true
                    }
                    this.ctx.beginPath()
                    this.ctx.moveTo(i[0], 0)
                    this.ctx.lineTo(i[0], i[1])
                    this.ctx.stroke()
                    this.ctx.beginPath()
                    this.ctx.moveTo(i[0], 0)
                    this.ctx.lineTo(i[0], i[1] * -1)
                    this.ctx.stroke()
                })
                this.ctx.restore()

                this.ctx.save()
                this.ctx.translate(0, this.height * 0.75)
                this.ctx.strokeStyle = '#ff9c33'
                hasChangedColor = false
                this.waveData.right.forEach((i) => {
                    if (!hasChangedColor && i[0] > progress) {
                        this.ctx.strokeStyle = '#666'
                        hasChangedColor = true
                    }
                    this.ctx.beginPath()
                    this.ctx.moveTo(i[0], 0)
                    this.ctx.lineTo(i[0], i[1])
                    this.ctx.stroke()
                    this.ctx.beginPath()
                    this.ctx.moveTo(i[0], 0)
                    this.ctx.lineTo(i[0], i[1] * -1)
                    this.ctx.stroke()
                })
                this.ctx.restore()

                this.ctx.strokeStyle = '#ff9c33'
                this.ctx.beginPath()
                this.ctx.moveTo(progress, 0)
                this.ctx.lineTo(progress, this.height)
                this.ctx.stroke()
            } else {
                this.ctx.strokeStyle = '#666'

                this.ctx.save()
                this.ctx.translate(0, this.height * 0.25)
                this.waveData.left.forEach((i) => {
                    this.ctx.beginPath()
                    this.ctx.moveTo(i[0], 0)
                    this.ctx.lineTo(i[0], i[1])
                    this.ctx.stroke()
                    this.ctx.beginPath()
                    this.ctx.moveTo(i[0], 0)
                    this.ctx.lineTo(i[0], i[1] * -1)
                    this.ctx.stroke()
                })
                this.ctx.restore()

                this.ctx.save()
                this.ctx.translate(0, this.height * 0.75)
                this.waveData.right.forEach((i) => {
                    this.ctx.beginPath()
                    this.ctx.moveTo(i[0], 0)
                    this.ctx.lineTo(i[0], i[1])
                    this.ctx.stroke()
                    this.ctx.beginPath()
                    this.ctx.moveTo(i[0], 0)
                    this.ctx.lineTo(i[0], i[1] * -1)
                    this.ctx.stroke()
                })
                this.ctx.restore()
            }

            if (this.node.loaded) {
                this.ctx.strokeStyle = '#c9c9c9'
                this.ctx.beginPath()
                this.ctx.moveTo(this.mousePos.x, 0)
                this.ctx.lineTo(this.mousePos.x, this.height)
                this.ctx.stroke()
            }

            window.requestAnimationFrame(this.draw)
        },
        close() {
            this.$emit('closeEffect', effectName)
        },
    },
    data() {
        return {
            isActive: false,
            isMuted: false,
            width: 400,
            height: 100,
            waveData: {
                left: [],
                right: [],
            },
            duration: 0,
            pauseTime: 0,
            mousePos: {},
        }
    },
    mounted() {
        this.knobs = {
            volume: knob.create(this.$refs.volume, 'Volume', 0, -10, 10, true, (knob, value) => {
                this.node.volume.value = value
            }),
            pan: knob.create(this.$refs.pan, 'L     Pan     R', 0, -100, 100, true, (knob, value) => {
                this.panner.pan.value = value / 100
            }),
        }

        this.node = new Tone.Player(null, () => {
            this.$refs.toggleButton.classList.remove('disabled')
        })
        window.bt = this.node

        this.panner = new Tone.Panner().toMaster()
        this.node.connect(this.panner)

        Tone.Transport.on('stop', () => {
            Tone.Transport.start()
        })

        Tone.Transport.on('stopTransport', (emitter) => {
            if (emitter.toString() !== effectName && this.isActive) {
                this.toggle()
            }
        })

        this.canvas = this.$refs.canvas

        this.canvas.addEventListener(
            'mousemove',
            (e) => {
                this.mousePos = utils.getMousePosOnCanvas(this.canvas, e)
            },
            false
        )

        this.canvas.addEventListener('mouseout', () => {
            this.mousePos = {x: -100, y: 0}
        })

        this.canvas.addEventListener('click', () => {
            this.playAtMousePos()
        })

        this.ctx = this.canvas.getContext('2d')

        this.canvas.style.backgroundColor = '#111'
        this.ctx.lineWidth = 2

        window.requestAnimationFrame(this.draw)
    },
    beforeDestroy() {
        this.node.stop()
        this.node.disconnect()
        this.panner.disconnect()
    },
}
</script>

<style scoped>
#playEnabled,
#file,
#stop,
#pauseEnabled {
    display: none;
}

.effectContainer {
    position: relative;
}

.toggleButton {
    top: 9px;
}

#fileName {
    position: absolute;
    left: 160px;
    top: 22px;
    font-size: 14px;
    text-align: center;
    width: 240px;
    height: 14px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

#timeData {
    position: absolute;
    right: 220px;
    top: 22px;
    font-size: 14px;
    font-family: 'Menlo', 'Monaco', 'Courier New', Courier, monospace;
    height: 14px;
}

.muted {
    background-color: #ff7077;
    box-shadow: 0 0 30px #ff7077;
}

canvas {
    border-radius: 6px;
}

.muted {
    background-color: #ff7077;
    box-shadow: 0 0 30px #ff7077;
}

#play,
#pause {
    position: absolute;
    top: 97px;
}

#play {
    left: 16px;
}

#pause {
    left: 70px;
}
</style>
