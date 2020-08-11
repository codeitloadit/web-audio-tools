<template>
    <div class="effectContainer">
        <h1 ref="title" class="title">Backing Track for Testing</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img ref="playDisabled" class="buttonIcon" src="play_grey.svg" />
            <img id="playEnabled" ref="playEnabled" class="buttonIcon" src="play.svg" />
            <img id="stop" ref="stop" class="buttonIcon" src="stop.svg" />
        </span>
        <span ref="loadButton" class="toggleButton" @click="triggerFileInput">
            <img class="buttonIcon" src="load.svg" />
        </span>
        <span id="fileName" ref="fileName"></span>
        <div ref="volume"></div>
        <div ref="pan"></div>
        <input type="file" id="file" ref="file" @change="loadFile" />
    </div>
</template>

<script>
import * as Tone from 'tone'
import {knob} from '../knob'
import {mapActions} from 'vuex'

export default {
    name: 'BackingTrackDebug',
    methods: {
        ...mapActions(['setSource', 'appendToChain']),
        toggle() {
            if (this.isActive) {
                this.node.stop()
                this.$refs.playEnabled.style.display = 'inline'
                this.$refs.stop.style.display = 'none'
                this.$refs.toggleButton.classList.remove('activeButton')
                this.$refs.title.classList.remove('active')
            } else {
                if (!this.node.loaded) {
                    return
                }
                this.node.start()
                this.$refs.playEnabled.style.display = 'none'
                this.$refs.stop.style.display = 'inline'
                this.$refs.toggleButton.classList.add('activeButton')
                this.$refs.title.classList.add('active')
            }
            this.isActive = !this.isActive

            Object.values(this.knobs).forEach((knob) => {
                knob.setActive(this.isActive)
            })
        },
        triggerFileInput() {
            this.$refs.file.click()
        },
        loadFile(event) {
            const file = event.target.files[0]
            const reader = new FileReader()

            reader.onload = (e) => {
                if (this.isActive) {
                    this.toggle()
                }
                this.node.load(e.target.result)
                this.$refs.playDisabled.style.display = 'none'
                this.$refs.playEnabled.style.display = 'inline'
                this.$refs.fileName.innerText = event.target.files[0].name
            }
            reader.readAsDataURL(file)
        },
    },
    data() {
        return {
            isActive: false,
        }
    },
    mounted() {
        this.knobs = {
            volume: knob.create(this.$refs.volume, 'Volume', 0, -10, 10, true, (knob, value) => {
                this.node.volume.value = value
            }),
            pan: knob.create(this.$refs.pan, 'L     Pan     R', 0, -100, 100, true, (knob, value) => {
                panner.pan.value = value / 100
            }),
        }

        this.node = new Tone.Player(null, () => {
            this.$refs.toggleButton.classList.remove('disabled')
        })
        this.setSource(this.node)

        const panner = new Tone.Panner()
        this.appendToChain(panner)
    },
}
</script>

<style scoped>
#playEnabled,
#file,
#stop {
    display: none;
}

.effectContainer {
    position: relative;
}

#fileName {
    position: absolute;
    left: 20px;
    bottom: 18px;
    font-size: 14px;
    max-width: 120px;
    height: 14px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>
