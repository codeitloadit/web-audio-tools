<template>
    <div id="app">
        <AudioInput />

        <div id="browser">
            <h1>Effects:</h1>
            <span class="effectLabel" @click="toggleEffect($event, Reverb)">Reverb</span>
            <span class="effectLabel" @click="toggleEffect($event, Compressor)">Compressor</span>
            <span class="effectLabel" @click="toggleEffect($event, Gate)">Gate</span>
            <span class="effectLabel" @click="toggleEffect($event, Limiter)">Limiter</span>
            <span class="effectLabel" @click="toggleEffect($event, Delay)">Delay</span>
            <span class="effectLabel" @click="toggleEffect($event, Equalizer)">Equalizer</span>
            <h1>Tools:</h1>
            <span class="effectLabel" @click="toggleEffect($event, Meter)">Meter</span>
            <span class="effectLabel" @click="toggleEffect($event, Tuner)">Tuner</span>
            <span class="effectLabel" @click="toggleEffect($event, Metronome)">Metronome</span>
            <span class="effectLabel" @click="toggleEffect($event, Spectrum)">Spectrum</span>
            <span class="effectLabel" @click="toggleEffect($event, Waveform)">Waveform</span>
        </div>

        <draggable v-model="effects" v-bind="dragOptions" @start="drag = true" @end="drag = false">
            <transition-group type="transition" :name="!drag ? 'flip-list' : null">
                <div class="effectWrapper" v-for="(effect, index) in effects" :key="index">
                    <component :is="effect" :name="effect.name"> </component>
                </div>
            </transition-group>
        </draggable>

        <!-- <div v-for="element in effects" :key="element.id">{{ element.name }}</div> -->

        <MasterOutput />
    </div>
</template>

<script>
import draggable from 'vuedraggable'
import AudioInput from './components/AudioInput'
import Gate from './components/Gate'
import Delay from './components/Delay'
import Reverb from './components/Reverb'
import Compressor from './components/Compressor'
import Equalizer from './components/Equalizer'
import Limiter from './components/Limiter'
import MasterOutput from './components/MasterOutput'
import Meter from './components/Meter'
import Spectrum from './components/Spectrum'
import Waveform from './components/Waveform'
import Tuner from './components/Tuner'
import Metronome from './components/Metronome'

export default {
    name: 'App',
    components: {
        AudioInput, // TODO: Replace this with the WebRTC stream audio.
        MasterOutput,
        draggable,
    },
    methods: {
        toggleEffect(event, effect) {
            if (this.effects.some((e) => e.name === effect.name)) {
                this.effects.splice(this.effects.indexOf(effect), 1)
                event.target.classList.remove('active')
            } else {
                this.effects.push(effect)
                event.target.classList.add('active')
            }
        },
    },
    computed: {
        dragOptions() {
            return {
                animation: 300,
                group: 'effects',
                swapThreshold: 0.1,
            }
        },
    },
    data() {
        return {
            drag: false,
            effects: [],
            Tuner,
            Metronome,
            Gate,
            Delay,
            Reverb,
            Compressor,
            Equalizer,
            Limiter,
            Spectrum,
            Waveform,
            Meter,
        }
    },
    mounted() {},
}
</script>

<style>
input:focus,
select:focus,
textarea:focus,
button:focus {
    outline: none;
}

* {
    user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -webkit-user-select: none;
}

html {
    color: #aaa;
    background-color: #101010;
    font-family: 'Graphik Regular', Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

h1 {
    font-family: 'Graphik Semibold', Avenir, Helvetica, Arial, sans-serif;
    font-size: 20px;
    margin: 0;
    padding: 0;
}

.effectContainer {
    display: inline-block;
    background-color: #1e1e1e;
    padding: 16px;
    border-radius: 12px;
    margin: 3px 2px;
    height: 125px;
    border: 2px solid #151515;
    cursor: move;
}

canvas {
    cursor: default;
}

.toggleButton {
    display: inline-block;
    width: 30px;
    height: 24px;
    background-color: #c9c9c9;
    border-radius: 4px;
    color: #151515;
    text-align: center;
    padding: 6px 4px 2px 4px;
    vertical-align: top;
    position: relative;
    top: 34px;
    margin: 0 12px 0 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
}

.activeButton {
    background-color: #d6c771;
    box-shadow: 0 0 30px #d6c771;
}

.disabled {
    color: #666;
}

.buttonIcon {
    width: 20px;
    height: 20px;
}

#browser > h1 {
    display: inline-block;
    margin: 16px 16px 12px 4px;
    color: #ff9c33;
}

#browser > .effectLabel {
    font-family: 'Graphik Medium', Avenir, Helvetica, Arial, sans-serif;
    font-size: 18px;
    margin: 4px 16px 4px 4px;
    cursor: pointer;
    border-radius: 4px;
    padding: 4px 6px;
    color: #151515;
    background-color: #c9c9c9;
}

#browser > .effectLabel.active {
    background-color: #d6c771;
    box-shadow: 0 0 30px #d6c771;
}

.effectWrapper {
    display: inline-block;
}

.title {
    color: #9c9c9c;
}

.title.active {
    color: #ff9c33;
}

.sortable-ghost {
    opacity: 0.5;
}

.sortable-ghost > div {
    border: 2px solid #ff9c33;
}
</style>
