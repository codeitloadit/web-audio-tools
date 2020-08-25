<template>
    <div></div>
</template>

<script>
import * as Tone from 'tone'
window.Tone = Tone
import {mapActions} from 'vuex'

export default {
    name: 'WebRTCInput',
    methods: {
        ...mapActions(['setSource', 'setStream', 'appendToChain']),
        openStream(deviceId) {
            this.node.open(deviceId).then((stream) => {
                this.setStream(stream)
                Tone.Transport.start()
            })
        },
    },
    mounted() {
        // TODO: Understand why the UserMedia is not working as the source.
        const player = new Tone.Player()
        this.setSource(player)
        player.autostart = true

        this.node = new Tone.UserMedia()
        this.appendToChain(this.node)

        window.openStream = this.openStream
    },
}
</script>

<style scoped></style>
