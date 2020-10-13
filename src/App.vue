<template>
    <div id="app">
        <audio v-if="debug" ref="stream1" src="/static/wat/oad.mp3" controls autoplay></audio>
        <audio v-if="debug" ref="stream2" src="/static/wat/smoc.mp3" controls></audio>

        <!-- <audio ref="backing" controls></audio> -->

        <draggable v-model="effects" v-bind="dragOptions" @start="drag = true" @end="drag = false">
            <!-- <transition-group type="transition" :name="!drag ? 'flip-list' : null"> -->
            <div class="effectWrapper" v-for="(effect, index) in effects" :key="index">
                <component
                    v-if="!reloading"
                    :is="effect"
                    :name="effect.name"
                    @closeEffect="closeEffect($event)"
                ></component>
            </div>
            <!-- </transition-group> -->

            <StreamOutput />
            <div id="newEffect" ref="newEffect" class="effectContainer" @click="showBrowser">
                <img src="/static/wat/plus_orange.svg" />
                <h1 ref="newEffectLabel">Add an audio effect or tool</h1>
            </div>
        </draggable>

        <div id="browser" ref="browser" @click="hideBrowser">
            <div id="browserContent" ref="browserContent">
                <h1>Effects:</h1>
                <!-- <img
                    ref="Freeverb"
                    class="effectImage"
                    @click="addEffect($event, Freeverb)"
                    src="/static/wat/reverb.png"
                />
                <img
                    ref="JCReverb"
                    class="effectImage"
                    @click="addEffect($event, JCReverb)"
                    src="/static/wat/reverb.png"
                /> -->
                <img ref="Reverb" class="effectImage" @click="addEffect($event, Reverb)" src="/static/wat/reverb.png" />
                <img
                    ref="Compressor"
                    class="effectImage"
                    @click="addEffect($event, Compressor)"
                    src="/static/wat/compressor.png"
                />
                <img ref="Gate" class="effectImage" @click="addEffect($event, Gate)" src="/static/wat/gate.png" />
                <img
                    ref="Limiter"
                    class="effectImage"
                    @click="addEffect($event, Limiter)"
                    src="/static/wat/limiter.png"
                />
                <img ref="Delay" class="effectImage" @click="addEffect($event, Delay)" src="/static/wat/delay.png" />
                <img
                    ref="Equalizer"
                    class="effectImage"
                    @click="addEffect($event, Equalizer)"
                    src="/static/wat/equalizer.png"
                />
                <br />
                <br />
                <h1>Tools:</h1>
                <img ref="Meter" class="effectImage" @click="addEffect($event, Meter)" src="/static/wat/meter.png" />
                <img ref="Tuner" class="effectImage" @click="addEffect($event, Tuner)" src="/static/wat/tuner.png" />
                <img
                    ref="Spectrum"
                    class="effectImage"
                    @click="addEffect($event, Spectrum)"
                    src="/static/wat/spectrum.png"
                />
                <img
                    ref="Waveform"
                    class="effectImage"
                    @click="addEffect($event, Waveform)"
                    src="/static/wat/waveform.png"
                />
                <img
                    ref="Metronome"
                    class="effectImage"
                    @click="addEffect($event, Metronome)"
                    src="/static/wat/metronome.png"
                />
                <img
                    ref="BackingTrack"
                    class="effectImage"
                    @click="addEffect($event, BackingTrack)"
                    src="/static/wat/backing.png"
                />
            </div>
        </div>
    </div>
</template>

<script>
import draggable from 'vuedraggable'
import BackingTrack from './components/BackingTrack'
import Gate from './components/Gate'
import Delay from './components/Delay'
import Reverb from './components/Reverb'
// import JCReverb from './components/JCReverb'
// import Freeverb from './components/Freeverb'
import Compressor from './components/Compressor'
import Equalizer from './components/Equalizer'
import Limiter from './components/Limiter'
import StreamOutput from './components/StreamOutput'
import Meter from './components/Meter'
import Spectrum from './components/Spectrum'
import Waveform from './components/Waveform'
import Tuner from './components/Tuner'
import Metronome from './components/Metronome'

import * as Tone from 'tone'
window.Tone = Tone
import {mapActions} from 'vuex'
import {utils} from './utils'

export default {
    name: 'App',
    components: {
        StreamOutput,
        draggable,
    },
    methods: {
        ...mapActions(['setStreamOutput', 'setSource', 'setStream', 'appendToChain', 'removeFromChain']),
        addEffect(event, effect) {
            event.stopPropagation()
            if (!this.effects.some((e) => e.name === effect.name)) {
                this.effects.push(effect)
                event.target.classList.add('active')
                this.$refs.newEffectLabel.style.display = 'none'
                this.hideBrowser()
            }
        },
        closeEffect(effectName) {
            this.effects.forEach((e, i) => {
                if (e.name === effectName) {
                    this.effects.splice(i, 1)
                    if (this.effects.length === 0) {
                        this.$refs.newEffectLabel.style.display = 'inline-block'
                    }
                    this.$refs[effectName].classList.remove('active')
                }
            })
        },
        showBrowser() {
            this.$refs.browser.style.display = 'block'
            const overlayHeight = document.getElementById('browser').clientHeight
            if (overlayHeight < 726) {
                this.$refs.browserContent.style.maxHeight = `${overlayHeight - 64}px`
                this.$refs.browserContent.style.width = '642px'
                this.$refs.browserContent.style.overflowY = 'scroll'
            } else {
                this.$refs.browserContent.style.maxHeight = ''
                this.$refs.browserContent.style.width = '622px'
                this.$refs.browserContent.style.overflowY = ''
            }
            const topMargin = Math.max((overlayHeight - document.getElementById('browserContent').offsetHeight) / 2, 0)
            this.$refs.browserContent.style.marginTop = `${topMargin}px`
        },
        hideBrowser() {
            this.$refs.browser.style.display = 'none'
        },
    },
    computed: {
        dragOptions() {
            return {
                animation: 300,
                group: 'effects',
                swapThreshold: 0.1,
                filter: '.nodrag',
            }
        },
    },
    data() {
        return {
            reloading: false,
            drag: false,
            effects: [],
            Tuner,
            Metronome,
            Gate,
            Delay,
            // Freeverb,
            // JCReverb,
            Reverb,
            Compressor,
            Equalizer,
            Limiter,
            Spectrum,
            Waveform,
            Meter,
            BackingTrack,
            debug: window.webpackHotUpdate,
        }
    },
    mounted() {
        window.connectAudioEffects = (stream) => {
            this.setStreamOutput(new Tone.Gain())

            window.stream = stream

            let source = null

            if (this.debug) {
                source = Tone.context.createMediaElementSource(stream)
            } else {
                source = Tone.context.createMediaStreamSource(stream)
            }

            this.setStream(source)

            const player = new Tone.Player()
            this.setSource(player)
            player.autostart = true

            const gain = new Tone.Gain()
            this.appendToChain(gain)

            Tone.connect(source, gain)

            // Refresh the active effects
            this.reloading = true
            // TODO: Figure out why we need this appendToChain in order for the stream to start working
            const wtf = new Tone.FeedbackDelay()
            this.appendToChain(wtf)
            setTimeout(() => {
                this.removeFromChain(wtf)
                this.reloading = false
            }, 0)
        }

        if (this.debug) {
            this.$refs.stream2.onplay = () => {
                this.$refs.stream1.pause()
                window.connectAudioEffects(this.$refs.stream2)
            }
            this.$refs.stream1.onplay = () => {
                this.$refs.stream2.pause()
                window.connectAudioEffects(this.$refs.stream1)
            }
        }

        utils.preventDrag(this.$refs.newEffect)
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

*:not(input[type='text']) {
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

#dragContainer {
    display: inline-block;
}

#newEffect {
    border: 2px solid #1e1e1e;
    background-color: #1e1e1e;
    cursor: pointer;
    padding: 16px 0;
}

#newEffect > img {
    display: inline-block;
    width: 48px;
    height: 122px;
}

#newEffect > h1 {
    display: inline-block;
    color: #ff9c33;
    margin: 0 24px 110px 12px;
    vertical-align: middle;
}

#newEffect:active,
#newEffect > h1:active {
    background-color: #333;
}

.effectContainer {
    display: inline-block;
    background-color: #1e1e1e;
    padding: 16px;
    border-radius: 12px;
    margin: 3px 2px;
    height: 125px;
    border: 2px solid #1e1e1e;
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

.buttonIcon.close {
    float: right;
    cursor: pointer;
    position: relative;
    right: -10px;
    top: -10px;
}

#browser {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.5);
    text-align: center;
}

#browserContent {
    display: inline-block;
    background-color: #333;
    border-radius: 12px;
    padding: 16px 16px 16px 20px;
    text-align: left;
}

#browserContent h1 {
    color: #aaa;
    margin-bottom: 4px;
}

.effectImage {
    margin-right: 4px;
    height: 100px;
    cursor: pointer;
}

.effectImage.active {
    opacity: 0.5;
    cursor: default;
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
