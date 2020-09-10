<template>
    <div class="effectContainer">
        <h1>Monitor</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
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
import {Events} from '../events'

export default {
    name: 'StreamOutput',
    methods: {
        ...mapActions(['setStreamOutput', 'connectMaster', 'disconnectMaster']),
        toggle() {
            if (this.isActive) {
                this.disconnectMaster()
                this.$refs.toggleButton.classList.remove('activeButton')
            } else {
                this.connectMaster()
                this.$refs.toggleButton.classList.add('activeButton')
            }
            this.isActive = !this.isActive

            Events.$emit('toggleMonitor', this.isActive)

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
    },
}
</script>

<style scoped>
.effectContainer {
    cursor: default;
}
</style>
