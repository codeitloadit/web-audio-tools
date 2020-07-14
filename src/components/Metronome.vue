<template>
    <div class="effectContainer">
        <h1>Metronome</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="power.svg" />
        </span>
        <canvas width="1" height="100"></canvas>
        <canvas ref="canvas" :width="width" :height="height"></canvas>
        <div id="topRow">
            <span id="tap">Tap</span>
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

            this.ctx.font = '30px Arial'
            this.ctx.fillText('♯', 380, 34)
            this.ctx.fillText('♭', 20, 38)

            this.ctx.font = '60px Arial'
            this.ctx.fillText('--', 200, 85)
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
canvas {
    border-radius: 6px;
}

#topRow {
    display: table-caption;
    position: relative;
    top: -100px;
    left: 80px;
    width: 400px;
}

#tap {
    display: inline-block;
    background-color: #eee;
    border-radius: 4px;
    color: #111;
    text-align: center;
    padding: 3px 10px;
    margin-right: 16px;
    cursor: pointer;
    font-size: 14px;
}

label {
    display: inline-block;
    font-size: 14px;
    margin-right: 6px;
    color: #eee;
}

input[type='text'],
select {
    width: 40px;
    color: #111;
    font-size: 14px;
    background-color: #eee;
    border: none;
    border-radius: 4px;
    text-align: center;
    margin-right: 16px;
    padding: 3px 3px 3px 0;
}
</style>
