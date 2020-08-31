'use strict'

const noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const minSamples = 0
const bufSize = 4096
const maxSamples = bufSize / 2

export class PitchDetector {
    buf = new Float32Array(bufSize)
    audioContext = null
    analyser = null
    tolerance = 0.9

    setTolerance(tolerance) {
        this.tolerance = tolerance
    }

    setStream(mediaStreamSource) {
        this.audioContext = mediaStreamSource.context
        this.analyser = this.audioContext.createAnalyser()
        this.analyser.fftSize = bufSize
        mediaStreamSource.connect(this.analyser)
    }

    noteFromPitch(frequency) {
        const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2))
        return Math.round(noteNum) + 69
    }

    frequencyFromNoteNumber(note) {
        return 440 * Math.pow(2, (note - 69) / 12)
    }

    centsOffFromPitch(frequency, note) {
        return Math.floor((1200 * Math.log(frequency / this.frequencyFromNoteNumber(note))) / Math.log(2))
    }

    autoCorrelate() {
        let bestOffset = -1
        let bestCorrelation = 0
        let rms = 0
        let foundGoodCorrelation = false
        let correlations = new Array(maxSamples)

        for (let i = 0; i < bufSize; i++) {
            let val = this.buf[i]
            rms += val * val
        }
        rms = Math.sqrt(rms / bufSize)
        if (rms < 0.01) {
            return -1
        }

        let lastCorrelation = 1
        for (let offset = minSamples; offset < maxSamples; offset++) {
            let correlation = 0

            for (let i = 0; i < maxSamples; i++) {
                correlation += Math.abs(this.buf[i] - this.buf[i + offset])
            }
            correlation = 1 - correlation / maxSamples
            correlations[offset] = correlation
            if (correlation > this.tolerance && correlation > lastCorrelation) {
                foundGoodCorrelation = true
                if (correlation > bestCorrelation) {
                    bestCorrelation = correlation
                    bestOffset = offset
                }
            } else if (foundGoodCorrelation) {
                let shift = (correlations[bestOffset + 1] - correlations[bestOffset - 1]) / correlations[bestOffset]
                return this.audioContext.sampleRate / (bestOffset + 8 * shift)
            }
            lastCorrelation = correlation
        }
        if (bestCorrelation > 0.01) {
            return this.audioContext.sampleRate / bestOffset
        }
        return -1
    }

    getPitchData() {
        this.analyser.getFloatTimeDomainData(this.buf)
        const ac = this.autoCorrelate()
        const pitchData = {
            pitch: ac,
            note: '',
            detune: '',
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
