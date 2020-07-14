<template>
    <div class="effectContainer">
        <h1>Metronome</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="power.svg" />
        </span>
        <span id="tap" ref="tapButton" class="toggleButton" @mousedown="tapDown" @mouseup="tapUp">
            <img class="buttonIcon" src="tap.svg" />
        </span>
        <canvas width="1" height="100"></canvas>
        <canvas ref="canvas" :width="width" :height="height"></canvas>
        <div id="topRow">
            <label for="bpm">BPM:</label>
            <input type="text" name="bpm" value="120" />

            <label for="beats">Beats:</label>
            <select name="beats">
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
            <select name="noteLength">
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

export default {
    name: 'Metronome',
    methods: {
        ...mapGetters(['stream']),
        toggle() {
            if (this.isActive) {
                this.$refs.toggleButton.classList.remove('activeButton')
            } else {
                this.$refs.toggleButton.classList.add('activeButton')
            }
            this.isActive = !this.isActive
        },
        tapDown() {
            this.$refs.tapButton.classList.add('activeButton')
        },
        tapUp() {
            this.$refs.tapButton.classList.remove('activeButton')
        },
        draw() {
            this.ctx.clearRect(0, 0, this.width, this.height)

            if (this.isActive) {
                window.requestAnimationFrame(this.draw)
            } else {
                this.drawOffState()
            }
        },
        drawOffState() {
            this.ctx.fillStyle = '#444'
            this.ctx.strokeStyle = '#444'
        },
    },
    node: null,
    isActive: false,
    data() {
        return {
            width: 400,
            height: 50,
        }
    },
    canvas: null,
    ctx: null,
    mounted() {
        this.node = new Tone.Sampler({
            C2: 'metro_bar.wav',
            C4: 'metro_beat.wav',
        })
        Tone.connect(Tone.Master, this.node)

        this.canvas = this.$refs.canvas
        this.ctx = this.canvas.getContext('2d')
        this.canvas.style.backgroundColor = '#111'

        this.ctx.lineWidth = 8
        this.ctx.lineCap = 'round'
        this.ctx.textAlign = 'center'

        this.drawOffState()
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
