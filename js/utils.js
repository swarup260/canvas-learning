/**
 *
 * @param {Number} max
 * @param {Number} min
 * @returns
 */
 export function randomInt(max, min) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * 
 * @returns String
 */
export function randomColor() {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
}

/**
 * 
 * @param {Number} width 
 * @param {Number} height 
 * @return { {CANVAS:HTMLCanvasElement,context:CanvasRenderingContext2D} }
 */
export function createCanvas(width,height) {

    const CANVAS = document.querySelector('canvas')

    /* CANVAS SETUP */
    CANVAS.width = width
    CANVAS.height = height
    const context = CANVAS.getContext('2d')
    
    return {
        CANVAS,
        context
    }
}

