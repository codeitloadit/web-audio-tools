<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="/static/wat/x_white.svg" @click="close" />
        <h1 ref="title" class="title">Freeverb</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="/static/wat/power.svg" />
        </span>
        <div ref="roomSize"></div>
        <div ref="dampening"></div>
        <div ref="wet"></div>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {knob} from '../knob'
import {mapActions} from 'vuex'

const effectName = 'Freeverb'

export default {
    name: effectName,
    methods: {
        ...mapActions(['appendToChain', 'removeFromChain']),
        toggle() {
            if (this.isActive) {
                this.node.wet.value = 0
                this.$refs.toggleButton.classList.remove('activeButton')
                this.$refs.title.classList.remove('active')
            } else {
                this.node.wet.value = this.knobs.wet.getValue() / 100
                this.frvbWet = this.knobs.wet.getValue()
                this.$refs.toggleButton.classList.add('activeButton')
                this.$refs.title.classList.add('active')
            }
            this.isActive = !this.isActive

            Object.values(this.knobs).forEach((knob) => {
                knob.setActive(this.isActive)
            })
        },
        close() {
            this.$emit('closeEffect', effectName)
        },
    },
    data() {
        return {
            isActive: false,
            frvbWasActive: true,
            frvbRoomSize: 20,
            frvbDampening: 2000,
            frvbWet: 30,
        }
    },
    mounted() {
        this.node = new Tone.Freeverb()
        this.appendToChain(this.node)
        window[effectName] = this.node

        this.frvbWasActive = localStorage.frvbWasActive === 'false' ? false : true
        this.frvbRoomSize = localStorage.frvbRoomSize || this.frvbRoomSize
        this.frvbDampening = localStorage.frvbDampening || this.frvbDampening
        this.frvbWet = localStorage.frvbWet || this.frvbWet

        this.knobs = {
            roomSize: knob.create(this.$refs.roomSize, 'Room Size', this.frvbRoomSize, 0, 100, false, (_, v) => {
                this.node.roomSize.value = v / 100
                this.frvbRoomSize = v
            }),
            dampening: knob.create(this.$refs.dampening, 'Dampening', this.frvbDampening, 0, 10000, false, (_, v) => {
                this.node.dampening.value = v
                this.frvbDampening = v
            }),
            wet: knob.create(this.$refs.wet, 'Dry/Wet', this.frvbWet, 0, 100, true, (_, v) => {
                if (this.isActive) {
                    this.node.wet.value = v / 100
                    this.frvbWet = v
                }
            }),
        }

        this.node.roomSize.value = this.knobs.roomSize.getValue() / 100
        this.node.dampening.value = this.knobs.dampening.getValue()
        this.node.wet.value = 0

        if (this.frvbWasActive) {
            this.toggle()
        }
    },
    watch: {
        isActive(value) {
            localStorage.frvbWasActive = value
        },
        frvbRoomSize(value) {
            localStorage.frvbRoomSize = value
        },
        frvbDampening(value) {
            localStorage.frvbDampening = value
        },
        frvbWet(value) {
            localStorage.frvbWet = value
        },
    },
    beforeDestroy() {
        this.node.disconnect()
        this.removeFromChain(this.node)
    },
}
</script>

<style></style>
