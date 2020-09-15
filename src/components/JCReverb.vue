<template>
    <div class="effectContainer">
        <img class="buttonIcon close" src="/static/wat/x_white.svg" @click="close" />
        <h1 ref="title" class="title">JCReverb</h1>
        <span ref="toggleButton" class="toggleButton" @click="toggle">
            <img class="buttonIcon" src="/static/wat/power.svg" />
        </span>
        <div ref="roomSize"></div>
        <div ref="wet"></div>
    </div>
</template>

<script>
import * as Tone from 'tone'
import {knob} from '../knob'
import {mapActions} from 'vuex'

const effectName = 'JCReverb'

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
                this.jcrvbWet = this.knobs.wet.getValue()
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
            jcrvbWasActive: true,
            jcrvbRoomSize: 20,
            jcrvbWet: 30,
        }
    },
    mounted() {
        this.node = new Tone.JCReverb()
        this.appendToChain(this.node)
        window[effectName] = this.node

        this.jcrvbWasActive = localStorage.jcrvbWasActive === 'false' ? false : true
        this.jcrvbRoomSize = localStorage.jcrvbRoomSize || this.jcrvbRoomSize
        this.jcrvbWet = localStorage.jcrvbWet || this.jcrvbWet

        this.knobs = {
            roomSize: knob.create(this.$refs.roomSize, 'Room Size', this.jcrvbRoomSize, 0, 100, false, (_, v) => {
                this.node.roomSize.value = v / 100
                this.jcrvbRoomSize = v
            }),
            wet: knob.create(this.$refs.wet, 'Dry/Wet', this.jcrvbWet, 0, 100, true, (_, v) => {
                if (this.isActive) {
                    this.node.wet.value = v / 100
                    this.jcrvbWet = v
                }
            }),
        }

        this.node.roomSize.value = this.knobs.roomSize.getValue() / 100
        this.node.wet.value = 0

        if (this.jcrvbWasActive) {
            this.toggle()
        }
    },
    watch: {
        isActive(value) {
            localStorage.jcrvbWasActive = value
        },
        jcrvbRoomSize(value) {
            localStorage.jcrvbRoomSize = value
        },
        jcrvbWet(value) {
            localStorage.jcrvbWet = value
        },
    },
    beforeDestroy() {
        this.node.disconnect()
        this.removeFromChain(this.node)
    },
}
</script>

<style></style>
