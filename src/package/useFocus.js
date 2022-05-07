import { computed, ref } from 'vue'
export default function useFocus(data, preview, callback) {
    const selectIndex = ref(-1) // 表示没有任何一个被选中
    // 最后选择的那一个
    const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value])
    const focusData = computed(() => {
        const focus = []
        const unfocused = []
        data.value.blocks.forEach(block => (block.focus ? focus : unfocused).push(block))
        return { focus, unfocused }
    })
    const clearBlockFocus = () => {
        data.value.blocks.forEach(block => block.focus = false)
    }
    const blockMousedown = (e, block, index) => {
        e.preventDefault()
        e.stopPropagation()
        // block上我们规划一个属性 focus 获取焦点后就将focus变为true
        if (e.shiftKey) {
            if (focusData.value.focus.length <= 1) {
                block.focus = true
            } else {
                block.focus = !block.focus
            }
        } else if (!block.focus) {
            clearBlockFocus() // 清空其他foucs属性
            block.focus = true
        }
        selectIndex.value = index
        callback(e)
    }
    const containerMousedown = () => {
        if (preview.value) return
        clearBlockFocus() // 点击容器让选中的失去焦点
        selectIndex.value = -1
    }
    return {
        blockMousedown,
        containerMousedown,
        focusData,
        lastSelectBlock,
        clearBlockFocus
    }
}