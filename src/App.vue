<template>
    <div id="app">
        <div id="browser">
            <h1>Effects:</h1>
            <span class="effectLabel" @click="addEffect(Reverb)">Reverb</span>
            <span class="effectLabel" @click="addEffect(Compressor)">Compressor</span>
            <span class="effectLabel" @click="addEffect(Gate)">Gate</span>
            <span class="effectLabel" @click="addEffect(Limiter)">Limiter</span>
            <span class="effectLabel" @click="addEffect(Delay)">Delay</span>
            <span class="effectLabel" @click="addEffect(Equalizer)">Equalizer</span>
            <h1>Tools:</h1>
            <span class="effectLabel" @click="addEffect(Meter)">Meter</span>
            <span class="effectLabel" @click="addEffect(Tuner)">Tuner</span>
            <span class="effectLabel" @click="addEffect(Metronome)">Metronome</span>
            <span class="effectLabel" @click="addEffect(Spectrum)">Spectrum</span>
            <span class="effectLabel" @click="addEffect(Waveform)">Waveform</span>
        </div>

        <AudioInput />

        <div class="effectWrapper" v-for="(effect, index) in effects" :key="index">
            <component :is="effect" :name="effect.name"> </component>
        </div>

        <MasterOutput />
    </div>
</template>

<script>
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
    },
    methods: {
        addEffect(effect) {
            this.effects.push(effect)
        },
    },
    data() {
        return {
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
    margin: 8px 16px 8px 4px;
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

#browser > .effectLabel:hover {
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
</style>
