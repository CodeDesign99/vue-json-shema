import { computed } from 'vue'
export default function useFocus(data, callback) { 
    const focusData = computed(() => { 
        const focus = []
        const undocused = []
        data.value.blocks.forEach(block => (block.focus ? focus : undocused).push(block))
        return { focus, undocused }
    })
    const clearBlockFocus = () => {
        data.value.blocks.forEach(block => block.focus = false)
    }
    const blockMousedown = (e, block) => { 
        e.preventDefault()
        e.stopPropagation() 
        // block上我们规划一个属性 focus 获取焦点后就将focus变为true
        if (e.shiftKey) {
            block.focus = !block.focus
        } else { 
            clearBlockFocus() // 清空其他foucs属性
            block.focus = !block.focus
        }
        callback(e)
    }
    const containerMousedown = () => { 
        clearBlockFocus() // 点击容器让选中的失去焦点
    }
    return {
        blockMousedown,
        containerMousedown,
        focusData
    }
}