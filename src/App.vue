<template>
    <div id="app">
        <AudioInput />
        <Tuner />
        <Metronome />
        <Meter />
        <Gate />
        <Delay />
        <Reverb />
        <Compressor />
        <Equalizer />
        <Limiter />
        <MasterOutput />
        <Spectrum />
        <Waveform />
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
        Gate,
        Delay,
        Reverb,
        Compressor,
        Equalizer,
        Limiter,
        MasterOutput,
        Meter,
        Spectrum,
        Waveform,
        Tuner,
        Metronome,
    },
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
    margin: 0 12px 0 8px;
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
</style>
