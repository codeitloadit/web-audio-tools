<template>
    <span></span>
</template>

<script>
import * as Tone from 'tone'
import {mapActions} from 'vuex'

export default {
    name: 'MasterOutput',
    methods: {
        ...mapActions(['appendToChain']),
    },
    mounted() {
        this.appendToChain(Tone.Master)
    },
}
</script>

<style></style>
