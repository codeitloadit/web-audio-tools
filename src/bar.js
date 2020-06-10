'use strict'

function Bar() {
    this.create = function(div, value, valMin, valMax, markerStart, markerEnd, markerStep, peaks) {
        const width = 200
        const height = 50
        const heightString = height.toString()
        const widthString = width.toString()
        const canvas = document.createElement('canvas')
        div.style.height = heightString + 'px'
        div.style.position = 'relative'
        div.style.textAlign = 'center'
        div.style.width = widthString + 'px'
        div.appendChild(canvas)

        const bar = {
            _canvas: canvas,
            _div: div,
            _height: height,
            _width: width,

            _properties: {
                colorBG: '#181818',
                colorFG: '#16adce',
                colorMarkers: '#888888',
                colorPeaks: '#ff0000',
                markerStart: markerStart,
                markerEnd: markerEnd,
                markerStep: markerStep,
                trackWidth: 0.5,
                valMin: valMin,
                valMax: valMax,
                valPeaks: [],
                val: value,
            },

            getPeaks: function() {
                const properties = this._properties
                const peaks = properties.valPeaks
                const numPeaks = peaks.length
                const peaksCopy = []

                for (let i = 0; i < numPeaks; i++) {
                    const peak = peaks[i]
                    peaksCopy.push(peak)
                }

                return peaksCopy
            },

            getProperty: function(key) {
                const properties = this._properties
                const value = properties[key]
                return value
            },

            getValue: function() {
                const properties = this._properties
                const value = properties.val
                return value
            },

            node: function() {
                const div = this._div
                return div
            },

            redraw: function() {
                this.resize()
                const properties = this._properties
                const colorTrack = properties.colorBG
                const colorFilling = properties.colorFG
                const colorMarkers = properties.colorMarkers
                const colorPeaks = properties.colorPeaks
                const markerStart = properties.markerStart
                const markerEnd = properties.markerEnd
                const markerStep = properties.markerStep
                const trackWidth = properties.trackWidth
                const valMin = properties.valMin
                const valMax = properties.valMax
                const peaks = properties.valPeaks
                const value = properties.val
                const height = this._height
                const width = this._width
                const lineWidth = Math.round(trackWidth * height)
                const halfWidth = 0.5 * lineWidth
                const centerY = 0.5 * height
                const lineTop = centerY - halfWidth
                const lineBottom = centerY + halfWidth
                const relativeValue = (value - valMin) / (valMax - valMin)
                const fillingEnd = width * relativeValue
                const numPeaks = peaks.length
                const canvas = this._canvas
                const ctx = canvas.getContext('2d')

                ctx.clearRect(0, 0, width, height)

                if ((markerStart !== null) & (markerEnd !== null) & (markerStep !== null) & (markerStep !== 0)) {
                    ctx.lineCap = 'butt'
                    ctx.lineWidth = '2'
                    ctx.strokeStyle = colorMarkers

                    let long = true
                    for (let v = markerStart; v <= markerEnd; v += markerStep) {
                        const relativePos = (v - valMin) / (valMax - valMin)
                        const pos = Math.round(width * relativePos)
                        ctx.beginPath()
                        if (long) {
                            ctx.moveTo(pos, height * 0.15)
                            ctx.lineTo(pos, height * 0.85)
                        } else {
                            ctx.moveTo(pos, height * 0.2)
                            ctx.lineTo(pos, height * 0.8)
                        }
                        ctx.stroke()
                        long = !long
                    }
                }

                ctx.beginPath()
                ctx.rect(0, lineTop, width, lineWidth)
                ctx.fillStyle = colorTrack
                ctx.fill()

                ctx.beginPath()
                ctx.rect(0, lineTop, fillingEnd, lineWidth)
                ctx.fillStyle = colorFilling
                ctx.fill()

                ctx.strokeStyle = colorPeaks

                for (let i = 0; i < numPeaks; i++) {
                    const peak = peaks[i]
                    const relativePeak = (peak - valMin) / (valMax - valMin)
                    const pos = Math.round(width * relativePeak)
                    ctx.beginPath()
                    ctx.moveTo(pos, lineTop)
                    ctx.lineTo(pos, lineBottom)
                    ctx.stroke()
                }
            },

            resize: function() {
                const canvas = this._canvas
                canvas.style.height = '100%'
                canvas.style.width = '100%'
                canvas.height = this._height
                canvas.width = this._width
            },

            setPeaks: function(peaks) {
                const peaksCopy = []
                const numPeaks = peaks.length

                for (let i = 0; i < numPeaks; i++) {
                    const peak = peaks[i]
                    peaksCopy.push(peak)
                }

                this.setProperty('valPeaks', peaksCopy)
            },

            setProperty: function(key, value) {
                this._properties[key] = value
                this.redraw()
            },

            setValue: function(value) {
                const properties = this._properties
                const valMin = properties.valMin
                const valMax = properties.valMax

                if (value < valMin) {
                    value = valMin
                } else if (value > valMax) {
                    value = valMax
                }

                value = Math.round(value)
                this.setProperty('val', value)
            },
        }

        const resizeListener = function() {
            bar.redraw()
        }

        canvas.addEventListener('resize', resizeListener)
        bar.setPeaks(peaks)
        return bar
    }
}

export const bar = new Bar()
