<template>
    <div class="effectContainer" ref="effectContainer">
        <img class="buttonIcon close" src="/static/wat/x_white.svg" @click="close" />
        <h1 ref="title" class="title">Backing Track</h1>
        <span id="fileName" ref="fileName"></span>
        <span id="timeData" ref="timeData">0:00 / 0:00</span>
        <span ref="loadButton" class="toggleButton" @click="triggerFileInput">
            <img class="buttonIcon" src="/static/wat/load.svg" />
        </span>
        <span id="mute" ref="muteButton" class="toggleButton" @click="mute">
            <img class="buttonIcon" src="/static/wat/mute.svg" />
        </span>
        <span id="play" ref="toggleButton" class="toggleButton" @click="toggle">
            <img ref="playDisabled" class="buttonIcon" src="/static/wat/play_grey.svg" />
            <img id="playEnabled" ref="playEnabled" class="buttonIcon" src="/static/wat/play.svg" />
            <img id="stop" ref="stop" class="buttonIcon" src="/static/wat/stop.svg" />
        </span>
        <span id="pause" ref="pauseButton" class="toggleButton" @click="pause">
            <img ref="pauseDisabled" class="buttonIcon" src="/static/wat/pause_grey.svg" />
            <img id="pauseEnabled" ref="pauseEnabled" class="buttonIcon" src="/static/wat/pause.svg" />
        </span>
        <canvas ref="canvas" :width="width" :height="height"></canvas>
        <div ref="volume"></div>
        <div ref="speed"></div>
        <input type="file" id="file" ref="file" @change="loadFile" accept="audio/*" />
    </div>
</template>

<script>
import * as Tone from 'tone'
import {knob} from '../knob'
import {utils} from '../utils'

const effectName = 'BackingTrack'

const secondsToMinutes = (seconds) => {
    if (!seconds) {
        return '0:00'
    }
    return new Date(seconds * 1000).toISOString().substr(14, 5)
}

const drawWaveLine = (ctx, x, y) => {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, y * -1)
    ctx.stroke()
}

export default {
    name: effectName,
    methods: {
        toggle() {
            if (this.audioElement.readyState <= 1) {
                return
            }
            if (this.isActive) {
                this.audioElement.pause()
                this.audioElement.currentTime = 0
                this.setStopState()
            } else {
                this.audioElement.play()
                this.setPlayState()
            }
        },
        setPlayState() {
            this.isActive = true
            this.$refs.playDisabled.style.display = 'none'
            this.$refs.playEnabled.style.display = 'none'
            this.$refs.stop.style.display = 'inline'
            this.$refs.pauseDisabled.style.display = 'none'
            this.$refs.pauseEnabled.style.display = 'inline'
            this.$refs.toggleButton.classList.add('activeButton')
            this.$refs.title.classList.add('active')
        },
        setStopState() {
            this.isActive = false
            this.$refs.playDisabled.style.display = 'none'
            this.$refs.playEnabled.style.display = 'inline'
            this.$refs.stop.style.display = 'none'
            this.$refs.pauseDisabled.style.display = 'inline'
            this.$refs.pauseEnabled.style.display = 'none'
            this.$refs.toggleButton.classList.remove('activeButton')
            this.$refs.title.classList.remove('active')
        },
        pause() {
            if (this.audioElement.src) {
                const pauseTime = this.audioElement.currentTime
                this.toggle()
                this.audioElement.currentTime = pauseTime

                this.$refs.pauseDisabled.style.display = 'none'
                this.$refs.pauseEnabled.style.display = 'inline'
            }
        },
        playAtMousePos() {
            if (this.audioElement.src) {
                this.audioElement.currentTime = this.audioElement.duration / (this.width / this.mousePos.x)
            }
        },
        mute() {
            if (this.audioElement.muted) {
                this.$refs.muteButton.classList.remove('muted')
            } else {
                this.$refs.muteButton.classList.add('muted')
            }
            this.audioElement.muted = !this.audioElement.muted
        },
        loadFile(event) {
            const file = event.target.files[0]
            const reader = new FileReader()

            reader.onload = (e) => {
                if (this.isActive) {
                    this.toggle()
                }

                this.audioElement.src = e.target.result

                this.node.load(e.target.result).then(() => {
                    this.$refs.playDisabled.style.display = 'none'
                    this.$refs.playEnabled.style.display = 'inline'
                    this.$refs.pauseDisabled.style.display = 'inline'
                    this.$refs.pauseEnabled.style.display = 'none'
                    this.$refs.fileName.innerText = event.target.files[0].name
                    this.btFileName = event.target.files[0].name
                    this.$refs.timeData.innerText = `0:00 / ${secondsToMinutes(this.audioElement.duration)}`

                    this.waveDataLeft = []
                    this.waveDataRight = []

                    this.ctx.clearRect(0, 0, this.width, this.height)

                    this.ctx.strokeStyle = '#666'

                    const leftChannel = this.node.buffer.getChannelData(0)
                    for (let i = 0; i < this.width; i++) {
                        const x = i
                        const y = leftChannel[x * Math.round(leftChannel.length / this.width)] * this.height * 0.25
                        this.waveDataLeft.push(y)
                    }

                    const rightChannel = this.node.buffer.getChannelData(1)
                    for (let i = 0; i < this.width; i++) {
                        const x = i
                        const y = rightChannel[x * Math.round(rightChannel.length / this.width)] * this.height * 0.25
                        this.waveDataRight.push(y)
                    }
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
            const elapsed = this.audioElement.duration / this.audioElement.currentTime
            if (this.$refs.timeData) {
                this.$refs.timeData.innerText = `${secondsToMinutes(
                    this.audioElement.currentTime
                )} / ${secondsToMinutes(this.audioElement.duration)}`
            }

            if (this.isActive || this.audioElement.currentTime > 0) {
                const progress = this.width / elapsed + 1

                if (progress > this.width) {
                    this.toggle()
                }

                this.ctx.save()
                this.ctx.translate(0, this.height * 0.25)

                this.ctx.strokeStyle = '#ff9c33'
                let hasChangedColor = false
                this.waveDataLeft.forEach((y, x) => {
                    if (!hasChangedColor && x > progress) {
                        this.ctx.strokeStyle = '#666'
                        hasChangedColor = true
                    }
                    drawWaveLine(this.ctx, x, y)
                })
                this.ctx.restore()

                this.ctx.save()
                this.ctx.translate(0, this.height * 0.75)
                this.ctx.strokeStyle = '#ff9c33'
                hasChangedColor = false
                this.waveDataRight.forEach((y, x) => {
                    if (!hasChangedColor && x > progress) {
                        this.ctx.strokeStyle = '#666'
                        hasChangedColor = true
                    }
                    drawWaveLine(this.ctx, x, y)
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
                this.waveDataLeft.forEach((y, x) => {
                    drawWaveLine(this.ctx, x, y)
                })
                this.ctx.restore()

                this.ctx.save()
                this.ctx.translate(0, this.height * 0.75)
                this.waveDataRight.forEach((y, x) => {
                    drawWaveLine(this.ctx, x, y)
                })
                this.ctx.restore()
            }

            if (this.audioElement.readyState === 4) {
                this.ctx.strokeStyle = '#c9c9c9'
                this.ctx.beginPath()
                this.ctx.moveTo(this.mousePos.x, 0)
                this.ctx.lineTo(this.mousePos.x, this.height)
                this.ctx.stroke()
            }

            window.requestAnimationFrame(this.draw)
        },
        close() {
            this.audioElement.src = ''
            this.$emit('closeEffect', effectName)
        },
    },
    data() {
        return {
            isActive: false,
            width: 400,
            height: 100,
            audioElement: document.getElementById('backingAudio'),
            waveDataLeft: [],
            waveDataRight: [],
            mousePos: {},
            btVolume: 100,
            btSpeed: 100,
            btFileName: '',
        }
    },
    mounted() {
        if (this.audioElement.src) {
            this.waveDataLeft = localStorage.btWaveDataLeft || this.waveDataLeft
            this.waveDataRight = localStorage.btWaveDataRight || this.waveDataRight
            this.waveDataLeft = this.waveDataLeft.split(',')
            this.waveDataRight = this.waveDataRight.split(',')

            this.$refs.fileName.innerText = localStorage.btFileName || this.btFileName
            this.$refs.timeData.innerText = `0:00 / ${secondsToMinutes(this.audioElement.duration)}`

            if (this.audioElement.paused) {
                this.setStopState()
            } else {
                this.setPlayState()
            }
        }

        this.btVolume = localStorage.btVolume || this.btVolume
        this.btSpeed = localStorage.btSpeed || this.btSpeed

        this.knobs = {
            volume: knob.create(this.$refs.volume, 'Volume', this.btVolume, 0, 100, false, (knob, value) => {
                this.audioElement.volume = value / 100
                this.btVolume = value
            }),
            speed: knob.create(this.$refs.speed, 'Speed', this.btSpeed, 50, 150, true, (knob, value) => {
                this.audioElement.playbackRate = value / 100
                this.btSpeed = value
            }),
        }
        Object.values(this.knobs).forEach((knob) => {
            knob.setActive(true)
        })

        this.node = new Tone.Player(null, () => {
            this.$refs.toggleButton.classList.remove('disabled')
        })
        window.bt = this.node

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

        this.canvas.addEventListener('mousedown', () => {
            this.playAtMousePos()
        })

        this.ctx = this.canvas.getContext('2d')

        this.canvas.style.backgroundColor = '#111'
        this.ctx.lineWidth = 2

        window.requestAnimationFrame(this.draw)
    },
    watch: {
        btVolume(value) {
            localStorage.btVolume = value
        },
        btSpeed(value) {
            localStorage.btSpeed = value
        },
        waveDataLeft(value) {
            localStorage.btWaveDataLeft = value
        },
        waveDataRight(value) {
            localStorage.btWaveDataRight = value
        },
        btFileName(value) {
            localStorage.btFileName = value
        },
    },
    beforeDestroy() {},
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
    min-width: 708px;
}

.toggleButton {
    top: 9px;
}

#fileName {
    position: absolute;
    left: 168px;
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
    right: 224px;
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
    margin-right: 8px;
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
