<template>
    <div class="effectContainer">
        <h1 ref="title" class="title active">Reverb</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="power.svg" />
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

export default {
    name: 'Reverb',
    methods: {
        ...mapActions(['appendToChain']),
        toggle() {
            if (this.isActive) {
                this.node.wet.value = 0
                this.$refs.toggleButton.classList.remove('activeButton')
                this.$refs.title.classList.remove('active')
            } else {
                this.node.wet.value = this.knobs.wet.getValue() / 100
                this.$refs.toggleButton.classList.add('activeButton')
                this.$refs.title.classList.add('active')
            }
            this.isActive = !this.isActive

            Object.values(this.knobs).forEach((knob) => {
                knob.setActive(this.isActive)
            })
        },
    },
    node: null,
    knobs: null,
    isActive: true,
    mounted() {
        this.knobs = {
            roomSize: knob.create(this.$refs.roomSize, 'Room Size', 20, 0, 100, false, (knob, value) => {
                this.node.roomSize.value = value / 100
            }),
            dampening: knob.create(this.$refs.dampening, 'Dampening', 2000, 0, 10000, false, (knob, value) => {
                this.node.dampening.value = value
            }),
            wet: knob.create(this.$refs.wet, 'Dry/Wet', 30, 0, 100, true, (knob, value) => {
                if (this.isActive) {
                    this.node.wet.value = value / 100
                }
            }),
        }

        this.node = new Tone.Freeverb({
            roomSize: 0.7,
            dampening: 100,
        })
        this.appendToChain(this.node)
        this.node.roomSize.value = this.knobs.roomSize.getValue() / 100
        this.node.dampening.value = this.knobs.dampening.getValue()
        this.node.wet.value = 0

        this.toggle()
    },
}
</script>

<style></style>
