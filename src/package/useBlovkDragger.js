export default function useBlockDragger(focusData) { 
    let dragState = {
        startX: 0,
        startY: 0
    }
    const mousemove = (e) => {
        const { clientX: moveX, clientY: moveY } = e
        const durX = moveX - dragState.startX
        const durY = moveY - dragState.startY
        focusData.value.focus.forEach((block, idx) => { 
            block.top = dragState.startPos[idx].top + durY
            block.left = dragState.startPos[idx].left + durX
        })
    }
    const mouseup = (e) => {
        document.removeEventListener('mousemove', mousemove)
        document.removeEventListener('mouseup', mouseup)
    }
    const mousedown = (e) => {
        dragState = {
            startX: e.clientX,
            startY: e.clientY,
            startPos: focusData.value.focus.map(({ top, left }) => ({top, left}))
        }
        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
    }
    return { mousedown }
}