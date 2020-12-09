<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="/static/wat/x_white.svg" @click="close" />
        <h1 ref="title" class="title">Metronome</h1>

        <div id="buttons">
            <span ref="toggleButton" class="toggleButton" @click="toggle">
                <img class="buttonIcon" src="/static/wat/play.svg" />
            </span>
            <span id="mute" ref="muteButton" class="toggleButton" @click="mute">
                <img class="buttonIcon" src="/static/wat/mute.svg" />
            </span>
            <br />
            <span id="tap" ref="tapButton" class="toggleButton" @mousedown="tapDown" @mouseup="tapUp">
                <!-- <img class="buttonIcon" src="/static/wat/tap.svg" /> -->
                TAP
            </span>
        </div>

        <div id="topRow">
            <label for="bpm">BPM:</label>
            <input
                ref="bpm"
                type="text"
                name="bpm"
                value="120"
                @click="highlightBPM"
                @keypress="handleBPMKeypress"
                @keydown="handleBPMKeydown"
                @keyup="handleBPMKeyup"
                @change="handleInputChange"
            />
            <br />
            <label for="beats">Beats:</label>
            <select ref="top" name="beats" @change="handleInputChange">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4" selected>4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
            </select>
            <br />
            <label for="noteLength">Notes:</label>
            <select ref="bot" name="noteLength" @change="handleInputChange">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4" selected>4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
            </select>
        </div>
        <canvas ref="canvas" :width="width" :height="height"></canvas>

        <div ref="volume"></div>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {mapGetters} from 'vuex'
import {utils} from '../utils'
import {knob} from '../knob'

const effectName = 'Metronome'

export default {
    name: effectName,
    methods: {
        ...mapGetters(['stream']),
        playNote(note) {
            if (!this.isMuted) {
                this.node.triggerAttack(note)
            }
        },
        toggle() {
            Tone.Transport.cancel()
            if (this.isActive) {
                this.$refs.toggleButton.classList.remove('activeButton')
                this.$refs.title.classList.remove('active')
                setTimeout(this.drawOffState, 0)
            } else {
                Tone.Transport.stop()
                if (this.bpm === '---') {
                    this.bpm = this.lastSetBMP
                }
                Tone.Transport.bpm.value = this.bpm
                const offset = 16 / this.bot
                Tone.Transport.timeSignature = [this.top, this.bot]

                for (let i = 0; i < this.top; i++) {
                    Tone.Transport.scheduleRepeat(
                        (time) => {
                            this.playNote(i === 0 ? 'C2' : 'C4')

                            const self = this
                            Tone.Draw.schedule(function() {
                                self.highlightBeat(i, self.top)
                            }, time)
                        },
                        '0:' + Tone.Transport.timeSignature + ':0',
                        '0:0:' + offset * i
                    )
                }
                Tone.Transport.start()
                this.$refs.toggleButton.classList.add('activeButton')
                this.$refs.title.classList.add('active')
            }
            this.isActive = !this.isActive

            Object.values(this.knobs).forEach((knob) => {
                knob.setActive(this.isActive)
            })
        },
        close() {
            this.$emit('closeEffect', effectName)
        },
        highlightBeat(beatIndex, totalBeats) {
            this.ctx.clearRect(0, 0, this.width, this.height)
            const padding = 2
            const beatWidth = this.width / totalBeats
            for (let i = 0; i < totalBeats; i++) {
                let fill = '#151515'
                let stroke = '#ff9c33'
                if (!this.isActive) {
                    stroke = '#c9c9c9'
                } else if (i === beatIndex && this.isActive) {
                    fill = '#ff9c33'
                    stroke = '#ff9c33'
                }
                utils.roundRect(
                    this.ctx,
                    i * beatWidth + padding,
                    padding,
                    beatWidth - padding * 2,
                    this.height - padding * 2,
                    4,
                    fill,
                    stroke,
                    2
                )

                this.ctx.fillStyle = '#ff9c33'
                if (!this.isActive) {
                    this.ctx.fillStyle = '#c9c9c9'
                } else if (i === beatIndex && this.isActive) {
                    this.ctx.fillStyle = '#151515'
                }
                this.ctx.font = '24px Graphik Semibold'
                this.ctx.fillText(i + 1, i * beatWidth + padding + beatWidth / 2 - 10, this.height * 0.6)
            }
        },
        tapDown() {
            const transportSeconds = Tone.Transport.seconds
            const elapsedTime = transportSeconds - this.previousElapsedTime
            this.previousElapsedTime = transportSeconds
            if (this.isActive) {
                this.toggle()
            }
            if (elapsedTime < 5 && elapsedTime > 0) {
                this.recentElapsedTimes.push(elapsedTime)
                if (this.recentElapsedTimes.length > 1) {
                    if (this.recentElapsedTimes.length > 5) {
                        this.recentElapsedTimes.shift()
                    }
                    let sum = 0
                    for (let i = 0; i < this.recentElapsedTimes.length; i++) {
                        sum += parseFloat(this.recentElapsedTimes[i])
                    }
                    this.bpm = Math.round(60 / (sum / this.recentElapsedTimes.length))
                    this.$refs.bpm.value = this.bpm
                    this.lastSetBMP = this.bpm
                }
            } else {
                this.$refs.bpm.value = '---'
                this.recentElapsedTimes = []
            }

            this.playNote('C2')

            this.$refs.tapButton.classList.add('activeButton')
        },
        tapUp() {
            this.$refs.tapButton.classList.remove('activeButton')
        },
        mute() {
            if (this.isMuted) {
                this.$refs.muteButton.classList.remove('muted')
            } else {
                this.$refs.muteButton.classList.add('muted')
            }
            this.isMuted = !this.isMuted
        },
        highlightBPM() {
            this.$refs.bpm.select()
        },
        handleBPMKeypress(e) {
            if (e.key === 'Enter') {
                this.$refs.bpm.blur()
            }
        },
        handleBPMKeyup() {
            if (isNaN(this.$refs.bpm.value)) {
                this.$refs.bpm.value = '---'
                this.$refs.bpm.select()
            }
        },
        handleBPMKeydown(e) {
            const v = this.$refs.bpm.value

            const isAllowedKey = () => {
                return (
                    [
                        'Backspace',
                        'Enter',
                        'Meta',
                        'Control',
                        'Shift',
                        'Tab',
                        'ArrowUp',
                        'ArrowDown',
                        'ArrowLeft',
                        'ArrowRight',
                    ].indexOf(e.key) >= 0 ||
                    (e.metaKey && ['a', 'x', 'c', 'v'].indexOf(e.key) >= 0)
                )
            }

            if (isAllowedKey()) {
                return true
            } else if (isNaN(v) && !isNaN(e.key)) {
                return true
            } else if (this.$refs.bpm.selectionEnd > 0 && (!isNaN(e.key) || isAllowedKey())) {
                return true
            } else if (isNaN(e.key) || v.length >= 3) {
                e.preventDefault()
            }
        },
        handleInputChange() {
            if (isNaN(this.$refs.bpm.value)) {
                this.$refs.bpm.value = '---'
                this.$refs.bpm.select()
            }

            this.bpm = parseInt(this.$refs.bpm.value, 10)
            this.top = parseInt(this.$refs.top.value, 10)
            this.bot = parseInt(this.$refs.bot.value, 10)

            if (this.bpm != '---') {
                this.lastSetBMP = this.bpm
            }

            if (this.isActive) {
                this.toggle()
                setTimeout(this.toggle, 500)
            } else {
                this.drawOffState()
            }
        },
        drawOffState() {
            this.highlightBeat(999, this.top)
        },
    },
    data() {
        return {
            isActive: false,
            isMuted: false,
            wasMuted: false,
            bpm: 120,
            top: 4,
            bot: 4,
            volume: 100,
            width: 200,
            height: 100,
        }
    },
    mounted() {
        this.wasMuted = localStorage.metWasMuted === 'true' ? true : false
        this.bpm = localStorage.metBpm || this.bpm
        this.top = localStorage.metTop || this.top
        this.bot = localStorage.metBot || this.bot
        this.volume = localStorage.metVolume || this.volume

        this.knobs = {
            volume: knob.create(this.$refs.volume, 'Volume', 100, 0, 100, false, (knob, value) => {
                const v = utils.map(value, 0, 100, -25, 0)
                this.node.volume.value = v
                this.volume = v
            }),
        }

        this.$refs.bpm.value = this.bpm
        this.$refs.top.value = this.top
        this.$refs.bot.value = this.bot

        this.previousElapsedTime = 0
        this.recentElapsedTimes = []
        window.recentElapsedTimes = this.recentElapsedTimes
        this.lastSetBMP = 120

        this.node = new Tone.Sampler({
            C2: '/static/wat/metro_bar.wav',
            C4: '/static/wat/metro_beat.wav',
        }).toDestination()

        Tone.Transport.start(0)

        this.canvas = this.$refs.canvas
        this.ctx = this.canvas.getContext('2d')
        this.canvas.style.backgroundColor = '#111'

        this.drawOffState()

        if (this.wasMuted) {
            this.mute()
        }
    },
    watch: {
        isMuted(value) {
            localStorage.metWasMuted = value
        },
        bpm(value) {
            localStorage.metBpm = value
        },
        top(value) {
            localStorage.metTop = value
        },
        bot(value) {
            localStorage.metBot = value
        },
        volume(value) {
            localStorage.metVolume = value
        },
    },
    beforeDestroy() {
        Tone.Transport.cancel()
    },
}
</script>

<style scoped>
.effectContainer {
    font-family: 'Graphik Semibold', Avenir, Helvetica, Arial, sans-serif;
}

#buttons {
    display: inline-block;
    width: 110px;
}

canvas {
    border-radius: 6px;
}

#topRow {
    display: inline-block;
    text-align: right;
    position: relative;
    top: -12px;
    cursor: default;
}

label {
    padding-top: 10px;
}

.toggleButton {
    top: -45px;
}

#tap {
    top: -27px;
    width: 84px;
    font-size: 22px;
}

#tap.toggleButton.activeButton {
    background-color: #ff9c33;
    box-shadow: 0 0 30px #ff9c33;
}

#tap > img {
    width: 24px;
    height: 24px;
    position: relative;
    top: -2px;
}

.muted {
    background-color: #ff7077;
    box-shadow: 0 0 30px #ff7077;
}

label {
    display: inline-block;
    font-size: 16px;
    margin-right: 6px;
    color: #9c9c9c;
}

input[type='text'],
select {
    font-family: 'Graphik Regular', Avenir, Helvetica, Arial, sans-serif;
    width: 40px;
    color: #c9c9c9;
    background-color: #111111;
    font-size: 16px;
    border: none;
    border-radius: 6px;
    text-align: center;
    margin-right: 23px;
    padding: 5px 5px 5px 2px;
    user-select: initial;
    -moz-user-select: initial;
    -ms-user-select: initial;
    -webkit-user-select: initial;
}

select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23666666'><polygon points='0,0 80,0 40,50'/></svg>")
        no-repeat;
    background-size: 12px;
    background-position: calc(100% - 3px) 10px;
    background-repeat: no-repeat;
    background-color: #111111;
    padding-left: 12px;
    text-align: left;
    width: 47px;
}

#settings {
    background-color: #1e1e1e;
    cursor: default;
    opacity: 0;
}
</style>
