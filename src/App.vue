<template>
    <div id="app">
        <BackingTrack />
        <Gate />
        <Delay />
        <Reverb />
        <Compressor />
        <Equalizer />
        <Limiter />
        <MasterOutput />
        <Meter />
    </div>
</template>

<script>
import BackingTrack from './components/BackingTrack'
import Gate from './components/Gate'
import Delay from './components/Delay'
import Reverb from './components/Reverb'
import Compressor from './components/Compressor'
import Equalizer from './components/Equalizer'
import Limiter from './components/Limiter'
import MasterOutput from './components/MasterOutput'
import Meter from './components/Meter'

export default {
    name: 'App',
    components: {
        BackingTrack,
        Gate,
        Delay,
        Reverb,
        Compressor,
        Equalizer,
        Limiter,
        MasterOutput,
        Meter,
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
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

h1 {
    font-size: 20px;
    margin: 0 !important;
    padding: 0 !important;
}

.effectContainer {
    display: inline-block;
    background-color: #222;
    padding: 16px;
    border: 3px solid #666;
    border-radius: 12px;
    margin: 3px 2px;
    height: 125px;
}

.toggleButton {
    display: inline-block;
    width: 60px;
    height: 24px;
    background-color: #eee;
    border-radius: 4px;
    color: #111;
    text-align: center;
    padding-top: 8px;
    vertical-align: top;
    position: relative;
    top: 34px;
    margin: 0 12px 0 8px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
}

.activeButton {
    background-color: #fdfc7c;
    box-shadow: 0 0 30px #fdfc7c;
}

.disabled {
    color: #666;
}
</style>
