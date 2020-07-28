<template>
    <div class="effectContainer">
        <h1 ref="title" class="title">Metronome</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="play.svg" />
        </span>
        <span id="tap" ref="tapButton" class="toggleButton" @mousedown="tapDown" @mouseup="tapUp">
            <img class="buttonIcon" src="tap.svg" />
        </span>
        <br />
        <br />
        <span id="mute" ref="muteButton" class="toggleButton" @click="mute">
            <img class="buttonIcon" src="mute.svg" />
        </span>
        <span id="settings" ref="settingsButton" class="toggleButton">
            <img class="buttonIcon" src="settings.svg" />
        </span>
        <canvas ref="canvas" :width="width" :height="height"></canvas>
        <div id="topRow">
            <label for="bpm">BPM:</label>
            <input
                ref="bpm"
                type="text"
                name="bpm"
                value="120"
                @click="highlightBPM"
                @keypress="handleBPMKeypress"
                @change="handleInputChange"
            />

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

            <label for="noteLength">Beat Length:</label>
            <select ref="bottom" name="noteLength" @change="handleInputChange">
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
    </div>
</template>

<script>
import * as Tone from 'tone'
import {mapGetters} from 'vuex'
import {utils} from '../utils'

export default {
    name: 'Metronome',
    methods: {
        ...mapGetters(['stream']),
        playNote(note) {
            if (!this.isMuted) {
                this.node.triggerAttack(note)
            }
        },
        toggle() {
            if (this.isActive) {
                Tone.Transport.stop()
                this.drawOffState()
                this.$refs.toggleButton.classList.remove('activeButton')
                this.$refs.title.classList.remove('active')
            } else {
                if (this.$refs.bpm.value === '---') {
                    this.$refs.bpm.value = this.lastSetBMP
                }
                Tone.Transport.cancel().stop()
                Tone.Transport.bpm.value = parseInt(this.$refs.bpm.value, 10)
                const tsTop = parseInt(this.$refs.top.value, 10)
                const tsBot = parseInt(this.$refs.bottom.value, 10)
                const offset = 16 / tsBot
                Tone.Transport.timeSignature = [tsTop, tsBot]
                for (let i = 0; i < tsTop; i++) {
                    Tone.Transport.scheduleRepeat(
                        () => {
                            this.playNote(i === 0 ? 'C2' : 'C4')
                            this.highlightBeat(i, tsTop)
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
        },
        highlightBeat(beatIndex, totalBeats) {
            this.ctx.clearRect(0, 0, this.width, this.height)
            const padding = 6
            const beatWidth = this.width / totalBeats
            for (let i = 0; i < totalBeats; i++) {
                let fill = '#151515'
                let stroke = '#ff9c33'
                if (i === beatIndex) {
                    fill = '#ff9c33'
                    stroke = '#ff9c33'
                }
                utils.roundRect(
                    this.ctx,
                    i * beatWidth + padding,
                    padding,
                    beatWidth - padding * 2,
                    this.height - padding * 2,
                    6,
                    fill,
                    stroke,
                    2
                )

                this.ctx.fillStyle = '#ff9c33'
                if (i === beatIndex) {
                    this.ctx.fillStyle = '#151515'
                }
                this.ctx.font = '30px Graphik Semibold'
                this.ctx.fillText(i + 1, i * beatWidth + padding + beatWidth / 2 - 15, this.height * 0.72)
            }
        },
        tapDown() {
            const elapsedTime = Tone.Transport.seconds
            Tone.Transport.cancel()
                .stop()
                .start()
            if (this.isActive) {
                this.toggle()
            }
            if (elapsedTime < 5) {
                this.recentElapsedTimes.push(elapsedTime)
                if (this.recentElapsedTimes.length > 1) {
                    if (this.recentElapsedTimes.length > 5) {
                        this.recentElapsedTimes.shift()
                    }
                    let sum = 0
                    for (let i = 0; i < this.recentElapsedTimes.length; i++) {
                        sum += parseFloat(this.recentElapsedTimes[i])
                    }
                    let bpm = Math.round(60 / (sum / this.recentElapsedTimes.length))
                    this.$refs.bpm.value = bpm
                    this.lastSetBMP = this.$refs.bpm.value
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
        handleInputChange() {
            if (this.$refs.bpm.value != '---') {
                this.lastSetBMP = this.$refs.bpm.value
            }
            if (this.isActive) {
                this.toggle()
                setTimeout(this.toggle, 500)
            } else {
                this.drawOffState()
            }
        },
        drawOffState() {
            this.highlightBeat(999, this.$refs.top.value)
        },
    },
    data() {
        return {
            width: 400,
            height: 50,
        }
    },
    mounted() {
        this.recentElapsedTimes = []
        this.lastSetBMP = 120

        this.node = new Tone.Sampler({
            C2: 'metro_bar.wav',
            C4: 'metro_beat.wav',
        }).toMaster()

        Tone.Transport.start(0)

        this.canvas = this.$refs.canvas
        this.ctx = this.canvas.getContext('2d')
        this.canvas.style.backgroundColor = '#111'

        setTimeout(this.drawOffState, 500)
    },
    beforeDestroy() {
        Tone.Transport.cancel().stop()
    },
}
</script>

<style scoped>
.effectContainer {
    font-family: 'Graphik Semibold', Avenir, Helvetica, Arial, sans-serif;
}

canvas {
    border-radius: 6px;
}

#topRow {
    display: table-caption;
    position: relative;
    top: -100px;
    left: 119px;
    width: 430px;
}

.toggleButton {
    top: 18px;
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
    width: 44px;
    color: #c9c9c9;
    background-color: #111111;
    font-size: 16px;
    border: none;
    border-radius: 6px;
    text-align: center;
    margin-right: 28px;
    padding: 5px 5px 5px 2px;
}
</style>
