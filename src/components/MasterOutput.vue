<template>
    <div class="effectContainer">
        <h1>Monitor</h1>
        <span ref="toggleButton" class="toggleButton activeButton" @click="toggle">
            <img class="buttonIcon" src="/static/wat/power.svg" />
        </span>
        <div ref="volume"></div>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {mapActions} from 'vuex'
import {knob} from '../knob'
import {utils} from '../utils'

export default {
    name: 'MasterOutput',
    methods: {
        ...mapActions(['setMaster']),
        toggle() {
            if (this.isActive) {
                Tone.Master.mute = true
                this.$refs.toggleButton.classList.remove('activeButton')
            } else {
                Tone.Master.mute = false
                this.$refs.toggleButton.classList.add('activeButton')
            }
            this.isActive = !this.isActive

            Object.values(this.knobs).forEach((knob) => {
                knob.setActive(this.isActive)
            })
        },
    },
    mounted() {
        this.knobs = {
            volume: knob.create(this.$refs.volume, 'Volume', 100, 0, 100, false, (knob, value) => {
                Tone.Master.volume.value = utils.map(value, 0, 100, -50, 0)
            }),
        }

        this.setMaster(new Tone.Gain())

        this.toggle()
        this.toggle()
    },
}
</script>

<style></style>
