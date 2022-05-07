import { reactive } from "vue"
import { events } from "./events"

export default function useBlockDragger(focusData, lastSelectBlock, data) {
    let dragState = {
        startX: 0,
        startY: 0,
        dragging: false // 默认不是正在拖拽状态
    }
    const markLine = reactive({
        x: null,
        y: null
    })
    const mousemove = (e) => { // 移动
        let { clientX: moveX, clientY: moveY } = e
        if (!dragState.dragging) {
            dragState.dragging = true
            events.emit('start') // 触发事件就会记住拖拽前的位置
        }
        // 计算当前元素最新的left和top去线里面找，找到显示线
        // 鼠标移动后 - 鼠标移动前 + left
        const left = moveX - dragState.startX + dragState.startLeft
        const top = moveY - dragState.startY + dragState.startTop
        // 距离参照物元素还有5像素时 显示这根线
        let x = null, y = null
        for (let i = 0; i < dragState.lines.y.length; i++) {
            const { top: t, showTop: s } = dragState.lines.y[i] // 获取每一根线
            if (Math.abs(t - top) <= 3) { // 如果小于等于3说明接近了
                y = s   // 线要显示的位置
                moveY = dragState.startY - dragState.startTop + t // 实现快速和这个元素贴在一起
                break   // 找到就跳出循环
            }
        }
        for (let i = 0; i < dragState.lines.x.length; i++) {
            const { left: l, showLeft: s } = dragState.lines.x[i]
            if (Math.abs(l - left) <= 3) {
                x = s
                moveX = dragState.startX - dragState.startLeft + l
                break
            }
        }

        markLine.x = x
        markLine.y = y

        const durX = moveX - dragState.startX
        const durY = moveY - dragState.startY
        focusData.value.focus.forEach((block, idx) => {
            block.top = dragState.startPos[idx].top + durY
            block.left = dragState.startPos[idx].left + durX
        })
    }
    const mouseup = (e) => { // 松开
        document.removeEventListener('mousemove', mousemove)
        document.removeEventListener('mouseup', mouseup)
        markLine.x = null
        markLine.y = null
        if (dragState.dragging) {
            events.emit('end')
        }
    }
    const mousedown = (e) => { // 点下 
        const { width: targetWidth, height: targetHeight } = lastSelectBlock.value // 拖拽的最后选中元素
        dragState = {
            dragging: false,
            startX: e.clientX,
            startY: e.clientY, // 记录每个选中的位置上
            startLeft: lastSelectBlock.value.left, // 拖拽前的位置上 left
            startTop: lastSelectBlock.value.top,   //               top
            startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
            lines: (() => {
                const { unfocused } = focusData.value // 获取其他没选中的以他们位置做辅助线
                const lines = { x: [], y: [] } // 计算横线的位置用y来存 x存的是纵向
                unfocused.forEach(block => {
                    const { top: otherTop, left: otherLeft, width: otherWidth, height: otherHeight } = block
                    // 当此元素拖动到和A元素相对位置showTop一致时，要显示这根辅助线，辅助线的位置就是top
                    lines.y.push({ showTop: otherTop, top: otherTop }) // 顶对顶
                    lines.y.push({ showTop: otherTop, top: otherTop - targetHeight }) // 顶对底
                    lines.y.push({ showTop: otherTop + otherHeight / 2, top: otherTop + otherHeight / 2 - targetHeight / 2 }) // 中对中
                    lines.y.push({ showTop: otherTop + otherHeight, top: otherTop + otherHeight }) // 底对顶
                    lines.y.push({ showTop: otherTop + otherHeight, top: otherTop + otherHeight - targetHeight }) // 底对底

                    lines.x.push({ showLeft: otherLeft, left: otherLeft }) // 左对左
                    lines.x.push({ showLeft: otherLeft + otherWidth, left: otherLeft + otherWidth }) // 右对左
                    lines.x.push({ showLeft: otherLeft + otherWidth / 2, left: otherLeft + otherWidth / 2 - targetWidth / 2 }) // 中对中
                    lines.x.push({ showLeft: otherLeft + otherWidth, left: otherLeft + otherWidth - targetWidth }) // 右对右
                    lines.x.push({ showLeft: otherLeft, left: otherLeft - targetWidth }) // 左对右
                })
                return lines
            })()
        }
        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
    }
    return { mousedown, markLine }
}