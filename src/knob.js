'use strict'

function Knob() {
    this.create = function(div, label, value, valMin, valMax, isNeedle = false, listener) {
        const width = 100
        const height = 100
        const heightString = height.toString()
        const widthString = width.toString()
        const smaller = width < height ? width : height
        const fontSize = 0.2 * smaller
        const fontSizeString = fontSize.toString()
        const canvas = document.createElement('canvas')

        div.style.display = 'inline-block'
        div.style.height = heightString + 'px'
        div.style.position = 'relative'
        div.style.textAlign = 'center'
        div.style.width = widthString + 'px'
        div.appendChild(canvas)

        const input = document.createElement('input')
        input.style.appearance = 'textfield'
        input.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
        input.style.border = 'none'
        input.style.color = '#ff9c33'
        input.style.fontFamily = 'Graphik Regular'
        input.style.fontSize = fontSizeString + 'px'
        input.style.height = heightString + 'px'
        input.style.margin = 'auto'
        input.style.padding = '0px'
        input.style.textAlign = 'center'
        input.style.width = widthString + 'px'

        const inputMode = document.createAttribute('inputmode')
        inputMode.value = 'numeric'
        input.setAttributeNode(inputMode)

        const inputDiv = document.createElement('div')
        inputDiv.style.bottom = '0px'
        inputDiv.style.display = 'none'
        inputDiv.style.left = '0px'
        inputDiv.style.position = 'absolute'
        inputDiv.style.right = '0px'
        inputDiv.style.top = '0px'
        inputDiv.appendChild(input)
        div.appendChild(inputDiv)

        const knob = {
            _canvas: canvas,
            _div: div,
            _height: height,
            _input: input,
            _inputDiv: inputDiv,
            _listeners: [],
            _mousebutton: false,
            _previousVal: 0,
            _timeout: null,
            _timeoutDoubleTap: null,
            _touchCount: 0,
            _width: width,
            _isActive: false,

            _notifyUpdate: function() {
                const properties = this._properties
                const value = properties.val
                const listeners = this._listeners
                const numListeners = listeners.length

                for (let i = 0; i < numListeners; i++) {
                    const listener = listeners[i]

                    if (listener !== null) {
                        listener(this, value)
                    }
                }
            },

            setActive: function(isActive) {
                this._isActive = isActive
                this.redraw()
            },

            _properties: {
                angleEnd: 0.75 * Math.PI,
                angleOffset: -0.5 * Math.PI,
                angleStart: -0.75 * Math.PI,
                colorBG: '#111111',
                colorFG: '#ff9c33',
                inactiveColorFG: '#9c9c9c',
                colorLabel: '#9c9c9c',
                fnStringToValue: function(string) {
                    return parseInt(string)
                },
                fnValueToString: function(value) {
                    return value.toString()
                },
                label: label,
                labelScale: 3.6,
                needle: isNeedle,
                readonly: false,
                textScale: 1.0,
                trackWidth: 0.1,
                valMin: valMin,
                valMax: valMax,
                val: value,
            },

            abort: function() {
                const previousValue = this._previousVal
                const properties = this._properties
                properties.val = previousValue
                this.redraw()
            },

            addListener: function(listener) {
                const listeners = this._listeners
                listeners.push(listener)
            },

            commit: function() {
                const properties = this._properties
                const value = properties.val
                this._previousVal = value
                this.redraw()
                this._notifyUpdate()
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
                const needle = properties.needle
                const angleStart = properties.angleStart
                const angleOffset = properties.angleOffset
                const angleEnd = properties.angleEnd
                const actualStart = angleStart + angleOffset
                const actualEnd = angleEnd + angleOffset
                const label = properties.label
                const value = properties.val
                const valueToString = properties.fnValueToString
                const valueStr = valueToString(value)
                const valMin = properties.valMin
                const valMax = properties.valMax
                const relValue = (value - valMin) / (valMax - valMin)
                const relAngle = relValue * (angleEnd - angleStart)
                const angleVal = actualStart + relAngle
                const colorTrack = properties.colorBG
                const colorFilling = this._isActive ? properties.colorFG : properties.inactiveColorFG
                const colorLabel = properties.colorLabel
                const textScale = properties.textScale
                const trackWidth = properties.trackWidth
                const height = this._height
                const width = this._width
                const smaller = width < height ? width : height
                const centerX = 0.5 * width
                const centerY = 0.5 * height
                const radius = 0.4 * smaller
                const labelY = centerY + radius + 3
                const lineWidth = Math.round(trackWidth * radius)
                const labelSize = Math.round(properties.labelScale * lineWidth)
                const labelSizeString = labelSize.toString()
                const fontSize = 0.15 * smaller * textScale
                const fontSizeString = fontSize.toString()
                const canvas = this._canvas
                const ctx = canvas.getContext('2d')

                ctx.clearRect(0, 0, width, height)

                ctx.beginPath()
                ctx.arc(centerX, centerY, radius, actualStart, actualEnd)
                ctx.lineCap = 'round'
                ctx.lineWidth = lineWidth
                ctx.strokeStyle = colorTrack
                ctx.stroke()

                ctx.beginPath()
                ctx.fillStyle = colorFilling
                ctx.arc(centerX, centerY, radius / 6, 0, (360 * Math.PI) / 180)
                ctx.fill()

                ctx.beginPath()

                if (needle) {
                    const middle = (-90 * Math.PI) / 180
                    if (angleVal >= middle) {
                        ctx.arc(centerX, centerY, radius, middle, angleVal)
                    } else {
                        ctx.arc(centerX, centerY, radius, angleVal, middle)
                    }
                } else {
                    ctx.arc(centerX, centerY, radius, actualStart, angleVal)
                }

                ctx.lineCap = 'round'
                ctx.lineWidth = lineWidth
                ctx.strokeStyle = colorFilling
                ctx.stroke()

                ctx.beginPath()
                ctx.moveTo(centerX, centerY)
                ctx.lineTo(radius * Math.cos(angleVal) + centerX, radius * Math.sin(angleVal) + centerY)
                ctx.lineCap = 'round'
                ctx.lineWidth = lineWidth
                ctx.strokeStyle = colorFilling
                ctx.stroke()

                ctx.font = fontSizeString + 'px Graphik Regular'
                ctx.fillStyle = colorFilling
                ctx.textAlign = 'center'
                ctx.textBaseline = 'bottom'
                ctx.fillText(valueStr, centerX, centerY + radius - 7)

                if (label !== null) {
                    ctx.font = labelSizeString + 'px Graphik Regular'
                    ctx.fillStyle = colorLabel
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText(label, centerX, labelY)
                }

                const elemInput = this._input
                elemInput.style.color = colorFilling
                elemInput.style.fontSize = fontSizeString + 'px'
            },

            resize: function() {
                const canvas = this._canvas
                canvas.style.height = '100%'
                canvas.style.width = '100%'
                canvas.height = this._height
                canvas.width = this._width
            },

            setProperty: function(key, value) {
                this._properties[key] = value
                this.redraw()
            },

            setValue: function(value) {
                this.setValueFloating(value)
                this.commit()
            },

            setValueFloating: function(value) {
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

        const mouseEventToValue = function(e, properties) {
            const canvas = e.target
            const width = canvas.scrollWidth
            const height = canvas.scrollHeight
            const centerX = 0.5 * width
            const centerY = 0.5 * height
            const x = e.offsetX
            const y = e.offsetY
            const relX = x - centerX
            const relY = y - centerY
            const angleStart = properties.angleStart
            const angleEnd = properties.angleEnd
            const angleDiff = angleEnd - angleStart
            let angle = Math.atan2(relX, -relY) - angleStart
            const twoPi = 2.0 * Math.PI

            if (angle < 0) {
                if (angleDiff >= twoPi) {
                    angle += twoPi
                } else {
                    angle = 0
                }
            }

            const valMin = properties.valMin
            const valMax = properties.valMax
            let value = (angle / angleDiff) * (valMax - valMin) + valMin

            if (value < valMin) {
                value = valMin
            } else if (value > valMax) {
                value = valMax
            }

            return value
        }

        const touchEventToValue = function(e, properties) {
            const canvas = e.target
            const rect = canvas.getBoundingClientRect()
            const offsetX = rect.left
            const offsetY = rect.top
            const width = canvas.scrollWidth
            const height = canvas.scrollHeight
            const centerX = 0.5 * width
            const centerY = 0.5 * height
            const touches = e.targetTouches
            let touch = null

            if (touches.length > 0) {
                touch = touches.item(0)
            }

            let x = 0.0
            let y = 0.0

            if (touch !== null) {
                const touchX = touch.pageX
                x = touchX - offsetX
                const touchY = touch.pageY
                y = touchY - offsetY
            }

            const relX = x - centerX
            const relY = y - centerY
            const angleStart = properties.angleStart
            const angleEnd = properties.angleEnd
            const angleDiff = angleEnd - angleStart
            const twoPi = 2.0 * Math.PI
            let angle = Math.atan2(relX, -relY) - angleStart

            if (angle < 0) {
                if (angleDiff >= twoPi) {
                    angle += twoPi
                } else {
                    angle = 0
                }
            }

            const valMin = properties.valMin
            const valMax = properties.valMax
            let value = (angle / angleDiff) * (valMax - valMin) + valMin

            if (value < valMin) {
                value = valMin
            } else if (value > valMax) {
                value = valMax
            }

            return value
        }

        // const doubleClickListener = function() {
        //     const properties = knob._properties;
        //     const readonly = properties.readonly;

        //     if (!readonly) {
        //     	e.preventDefault();
        //     	const inputDiv = knob._inputDiv;
        //     	inputDiv.style.display = 'block';
        //     	const inputElem = knob._input;
        //     	inputElem.focus();
        //     	knob.redraw();
        //     }
        // }

        const mouseDownListener = function(e) {
            const btn = e.buttons

            if (btn === 1) {
                const properties = knob._properties
                const readonly = properties.readonly

                if (!readonly) {
                    e.preventDefault()
                    const val = mouseEventToValue(e, properties)
                    knob.setValueFloating(val)
                }

                knob._mousebutton = true
            }

            if (btn === 4) {
                const properties = knob._properties
                const readonly = properties.readonly

                if (!readonly) {
                    e.preventDefault()
                    const inputDiv = knob._inputDiv
                    inputDiv.style.display = 'block'
                    const inputElem = knob._input
                    inputElem.focus()
                    knob.redraw()
                }
            }
        }

        const mouseMoveListener = function(e) {
            const btn = knob._mousebutton

            if (btn) {
                const properties = knob._properties
                const readonly = properties.readonly

                if (!readonly) {
                    e.preventDefault()
                    const val = mouseEventToValue(e, properties)
                    knob.setValueFloating(val)
                    knob.commit()
                }
            }
        }

        const mouseUpListener = function(e) {
            const btn = knob._mousebutton

            if (btn) {
                const properties = knob._properties
                const readonly = properties.readonly

                if (!readonly) {
                    e.preventDefault()
                    const val = mouseEventToValue(e, properties)
                    knob.setValue(val)
                }
            }

            knob._mousebutton = false
        }

        const mouseCancelListener = function() {
            const btn = knob._mousebutton

            if (btn) {
                knob.abort()
                knob._mousebutton = false
            }
        }

        const touchStartListener = function(e) {
            const properties = knob._properties
            const readonly = properties.readonly

            if (!readonly) {
                const touches = e.targetTouches
                const numTouches = touches.length
                const singleTouch = numTouches === 1

                if (singleTouch) {
                    knob._mousebutton = true

                    if (knob._touchCount === 0) {
                        const f = function() {
                            if (knob._touchCount === 2) {
                                const properties = knob._properties
                                const readonly = properties.readonly

                                if (!readonly) {
                                    e.preventDefault()
                                    const inputDiv = knob._inputDiv
                                    inputDiv.style.display = 'block'
                                    const inputElem = knob._input
                                    inputElem.focus()
                                    knob.redraw()
                                }
                            }

                            knob._touchCount = 0
                        }

                        let timeout = knob._timeoutDoubleTap
                        window.clearTimeout(timeout)
                        timeout = window.setTimeout(f, 500)
                        knob._timeoutDoubleTap = timeout
                    }

                    knob._touchCount++
                    const val = touchEventToValue(e, properties)
                    knob.setValueFloating(val)
                }
            }
        }

        var touchMoveListener = function(e) {
            const btn = knob._mousebutton

            if (btn) {
                const properties = knob._properties
                const readonly = properties.readonly

                if (!readonly) {
                    const touches = e.targetTouches
                    const numTouches = touches.length
                    const singleTouch = numTouches === 1

                    if (singleTouch) {
                        e.preventDefault()
                        const val = touchEventToValue(e, properties)
                        knob.setValueFloating(val)
                    }
                }
            }
        }

        const touchEndListener = function(e) {
            const btn = knob._mousebutton

            if (btn) {
                const properties = knob._properties
                const readonly = properties.readonly

                if (!readonly) {
                    const touches = e.targetTouches
                    const numTouches = touches.length
                    const noMoreTouches = numTouches === 0

                    if (noMoreTouches) {
                        e.preventDefault()
                        knob._mousebutton = false
                        knob.commit()
                    }
                }
            }

            knob._mousebutton = false
        }

        const touchCancelListener = function() {
            const btn = knob._mousebutton

            if (btn) {
                knob.abort()
                knob._touchCount = 0
                const timeout = knob._timeoutDoubleTap
                window.clearTimeout(timeout)
            }

            knob._mousebutton = false
        }

        const resizeListener = function() {
            knob.redraw()
        }

        // const scrollListener = function(e) {
        //     const readonly = knob.getProperty('readonly')

        //     if (!readonly) {
        //         e.preventDefault()
        //         const delta = e.deltaY
        //         const direction = delta > 0 ? 1 : delta < 0 ? -1 : 0
        //         let val = knob.getValue()
        //         val += direction
        //         knob.setValueFloating(val)

        //         const commit = function() {
        //             knob.commit()
        //         }

        //         let timeout = knob._timeout
        //         window.clearTimeout(timeout)
        //         timeout = window.setTimeout(commit, 250)
        //         knob._timeout = timeout
        //     }
        // }

        // const keyPressListener = function(e) {
        //     const kc = e.keyCode

        //     if (kc === 13 || kc === 27) {
        //         const inputDiv = knob._inputDiv
        //         inputDiv.style.display = 'none'
        //         const input = e.target

        //         if (kc === 13) {
        //             const properties = knob._properties
        //             const value = input.value
        //             const stringToValue = properties.fnStringToValue
        //             const val = stringToValue(value)
        //             const valid = isFinite(val)

        //             if (valid) {
        //                 knob.setValue(val)
        //             }
        //         }

        //         input.value = ''
        //     }
        // }

        // canvas.addEventListener('dblclick', doubleClickListener)
        canvas.addEventListener('mousedown', mouseDownListener)
        canvas.addEventListener('mouseleave', mouseCancelListener)
        canvas.addEventListener('mousemove', mouseMoveListener)
        canvas.addEventListener('mouseup', mouseUpListener)
        canvas.addEventListener('resize', resizeListener)
        canvas.addEventListener('touchstart', touchStartListener, {passive: true})
        canvas.addEventListener('touchmove', touchMoveListener, {passive: true})
        canvas.addEventListener('touchend', touchEndListener)
        canvas.addEventListener('touchcancel', touchCancelListener)
        // canvas.addEventListener('wheel', scrollListener, {passive: true})
        // input.addEventListener('keypress', keyPressListener)
        knob.redraw()
        knob.addListener(listener)
        return knob
    }
}

export const knob = new Knob()
