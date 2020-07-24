<template>
    <div class="effectContainer">
        <select ref="select"></select>
        <h1>Audio Input</h1>
        <span ref="toggleButton" class="toggleButton activeButton" @click="toggle">
            <img class="buttonIcon" src="power.svg" />
        </span>
        <span ref="muteButton" class="toggleButton" @click="mute">
            <img class="buttonIcon" src="mute.svg" />
        </span>
        <div ref="volume"></div>
        <div ref="pan"></div>
    </div>
</template>

<script>
import * as Tone from 'tone'
window.Tone = Tone
import {knob} from '../knob'
import {mapActions} from 'vuex'

export default {
    name: 'AudioInput',
    methods: {
        ...mapActions(['setSource', 'setStream', 'appendToChain']),
        toggle() {
            this.node.close()
            if (this.isActive) {
                this.$refs.toggleButton.classList.remove('activeButton')
            } else {
                this.openStream()
                this.$refs.toggleButton.classList.add('activeButton')
            }
            this.isActive = !this.isActive

            Object.values(this.knobs).forEach((knob) => {
                knob.setActive(this.isActive)
            })
        },
        mute() {
            if (this.isMuted) {
                Tone.Master.mute = false
                this.$refs.muteButton.classList.remove('muted')
            } else {
                Tone.Master.mute = true
                this.$refs.muteButton.classList.add('muted')
            }
            this.isMuted = !this.isMuted
        },
        openStream() {
            this.node.open(this.$refs.select.value).then((stream) => {
                this.setStream(stream)
            })
        },
    },
    node: null,
    knobs: null,
    isActive: false,
    isMuted: false,
    mounted() {
        this.knobs = {
            volume: knob.create(this.$refs.volume, 'Volume', 0, -10, 10, true, (knob, value) => {
                this.node.volume.value = value
            }),
            pan: knob.create(this.$refs.pan, 'Pan', 0, -100, 100, true, (knob, value) => {
                panner.pan.value = value / 100
            }),
        }

        // TODO: Understand why the UserMedia is not working as the source.
        const player = new Tone.Player('One and Done.mp3')
        this.setSource(player)
        player.autostart = true

        this.node = new Tone.UserMedia()
        this.appendToChain(this.node)

        Tone.UserMedia.enumerateDevices()
            .then((deviceInfos) => {
                for (let i = 0; i !== deviceInfos.length; ++i) {
                    const deviceInfo = deviceInfos[i]
                    const option = document.createElement('option')
                    option.value = deviceInfo.deviceId
                    if (deviceInfo.kind === 'audioinput') {
                        option.text = deviceInfo.label || `microphone ${this.$refs.select.length + 1}`
                        this.$refs.select.appendChild(option)
                    }
                }

                this.openStream()
                this.isActive = true
                Object.values(this.knobs).forEach((knob) => {
                    knob.setActive(this.isActive)
                })

                this.$refs.select.onchange = () => {
                    this.node.close()
                    this.openStream()
                }
            })
            .catch((error) => {
                console.log('Tone.UserMedia.enumerateDevices: ', error.message, error.name)
            })

        const panner = new Tone.Panner()
        this.appendToChain(panner)

        this.mute()
    },
}
</script>

<style scoped>
select {
    float: right;
    width: 180px;
    border-radius: 6px;
    color: #c9c9c9;
    background-color: #111111;
    font-size: 16px;
    border: none;
    border-radius: 6px;
    position: relative;
    top: -3px;
}

.muted {
    background-color: #ff7077;
    box-shadow: 0 0 30px #ff7077;
}
</style>
