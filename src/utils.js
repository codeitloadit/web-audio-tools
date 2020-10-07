export const utils = {
    map(n, start1, stop1, start2, stop2) {
        return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2
    },

    roundRect(context, x, y, w, h, radius, fillColor, strokeColor, strokeWidth) {
        const r = x + w
        const b = y + h
        context.fillStyle = fillColor
        context.strokeStyle = strokeColor
        context.lineWidth = strokeWidth
        context.beginPath()
        context.moveTo(x + radius, y)
        context.lineTo(r - radius, y)
        context.quadraticCurveTo(r, y, r, y + radius)
        context.lineTo(r, y + h - radius)
        context.quadraticCurveTo(r, b, r - radius, b)
        context.lineTo(x + radius, b)
        context.quadraticCurveTo(x, b, x, b - radius)
        context.lineTo(x, y + radius)
        context.quadraticCurveTo(x, y, x + radius, y)
        context.fill()
        context.stroke()
    },

    getMousePosOnCanvas(canvas, event) {
        const rect = canvas.getBoundingClientRect()
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        }
    },

    rgbToHex(r, g, b) {
        if (r > 255 || g > 255 || b > 255) {
            throw 'Invalid color component'
        }
        return ((r << 16) | (g << 8) | b).toString(16)
    },

    preventDrag(element) {
        const overrides = ['ondragstart', 'ondragenter', 'ondragover', 'onclick']
        overrides.forEach((event) => {
            element[event] = (e) => {
                e.preventDefault()
                e.stopPropagation()
            }
        })
    },
}
