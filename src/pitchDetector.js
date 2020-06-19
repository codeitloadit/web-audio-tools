'use strict'
const noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const minSamples = 0
const goodEnoughCorrelation = 0.99
const bufSize = 4096

export class PitchDetector {
    buf = new Float32Array(bufSize)
    audioContext = null
    analyser = null

    setStream(mediaStreamSource) {
        this.audioContext = mediaStreamSource.context
        this.analyser = this.audioContext.createAnalyser()
        this.analyser.fftSize = bufSize
        mediaStreamSource.connect(this.analyser)
    }

    noteFromPitch(frequency) {
        let noteNum = 12 * (Math.log(frequency / 440) / Math.log(2))
        return Math.round(noteNum) + 69
    }

    frequencyFromNoteNumber(note) {
        return 440 * Math.pow(2, (note - 69) / 12)
    }

    centsOffFromPitch(frequency, note) {
        return Math.floor((1200 * Math.log(frequency / this.frequencyFromNoteNumber(note))) / Math.log(2))
    }

    autoCorrelate() {
        let SIZE = this.buf.length
        let MAX_SAMPLES = Math.floor(SIZE / 2)
        let best_offset = -1
        let best_correlation = 0
        let rms = 0
        let foundGoodCorrelation = false
        let correlations = new Array(MAX_SAMPLES)

        for (let i = 0; i < SIZE; i++) {
            let val = this.buf[i]
            rms += val * val
        }
        rms = Math.sqrt(rms / SIZE)
        if (rms < 0.01) {
            return -1
        }

        let lastCorrelation = 1
        for (let offset = minSamples; offset < MAX_SAMPLES; offset++) {
            let correlation = 0

            for (let i = 0; i < MAX_SAMPLES; i++) {
                correlation += Math.abs(this.buf[i] - this.buf[i + offset])
            }
            correlation = 1 - correlation / MAX_SAMPLES
            correlations[offset] = correlation
            if (correlation > goodEnoughCorrelation && correlation > lastCorrelation) {
                foundGoodCorrelation = true
                if (correlation > best_correlation) {
                    best_correlation = correlation
                    best_offset = offset
                }
            } else if (foundGoodCorrelation) {
                let shift = (correlations[best_offset + 1] - correlations[best_offset - 1]) / correlations[best_offset]
                return this.audioContext.sampleRate / (best_offset + 8 * shift)
            }
            lastCorrelation = correlation
        }
        if (best_correlation > 0.01) {
            return this.audioContext.sampleRate / best_offset
        }
        return -1
        //	let best_frequency = this.audioContext.sampleRate/best_offset;
    }

    getPitchData() {
        this.analyser.getFloatTimeDomainData(this.buf)
        let ac = this.autoCorrelate()
        const pitchData = {
            pitch: ac,
            note: '',
            detune: '',
            buf: this.buf,
        }

        if (ac == -1) {
            return pitchData
        } else {
            pitchData.pitch = Math.round(ac)
            let note = this.noteFromPitch(ac)
            pitchData.note = noteStrings[note % 12]
            pitchData.detune = this.centsOffFromPitch(ac, note)
            return pitchData
        }
    }
}
