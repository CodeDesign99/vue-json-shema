import { defineComponent } from "vue";

export default defineComponent({
    props: {
        block: {
            type: Object
        },
        component: {
            type: Object
        }
    },
    setup(props) {
        const { width, height } = props.component.resize || {}
        let data = {}
        const onMouswmove = (e) => {
            let { clientX, clientY } = e
            let { startX, startY, startWidth, startHeight, startLeft, startTop, direction } = data

            if (direction.horizontal === 'center') {
                clientX = startX
            }
            if (direction.vertical === 'center') {
                clientY = startY
            }

            let durX = clientX - startX
            let durY = clientY - startY

            // 针对反向拖拽的点 需要取反，拿到正确的组件top和left
            if (direction.vertical === 'start') {
                durY = -durY
                props.block.top = startTop - durY
            }
            if (direction.horizontal === 'start') {
                durX = -durX
                props.block.left = startLeft - durX
            }

            const width = startWidth + durX
            const height = startHeight + durY

            props.block.width = width
            props.block.height = height
            props.block.hasResize = true
        }
        const onMouseup = () => {
            document.body.removeEventListener('mousemove', onMouswmove)
            document.body.removeEventListener('mouseup', onMouseup)
        }
        const onMouseDown = (e, direction) => {
            e.stopPropagation();
            data = {
                startX: e.clientX,
                startY: e.clientY,
                startWidth: props.block.width,
                startHeight: props.block.height,
                startLeft: props.block.left,
                startTop: props.block.top,
                direction
            }
            document.body.addEventListener('mousemove', onMouswmove)
            document.body.addEventListener('mouseup', onMouseup)
        }
        return () => {
            return (
                <>
                    {width && <>
                        <div
                            class="block-resize block-resize-left"
                            onMousedown={e => onMouseDown(e, {
                                horizontal: 'start',
                                vertical: 'center'
                            })}
                        ></div>
                        <div
                            class="block-resize block-resize-right"
                            onMousedown={e => onMouseDown(e, {
                                horizontal: 'end',
                                vertical: 'center'
                            })}
                        ></div>
                    </>}
                    {height && <>
                        <div
                            class="block-resize block-resize-top"
                            onMousedown={e => onMouseDown(e, {
                                horizontal: 'center',
                                vertical: 'start'
                            })}
                        ></div>
                        <div
                            class="block-resize block-resize-bottom"
                            onMousedown={e => onMouseDown(e, {
                                horizontal: 'center',
                                vertical: 'end'
                            })}
                        ></div>
                    </>}
                    {width && height && <>
                        <div
                            class="block-resize block-resize-top-left"
                            onMousedown={e => onMouseDown(e, {
                                horizontal: 'start',
                                vertical: 'start'
                            })}
                        ></div>
                        <div
                            class="block-resize block-resize-top-right"
                            onMousedown={e => onMouseDown(e, {
                                horizontal: 'end',
                                vertical: 'start'
                            })}
                        ></div>
                        <div
                            class="block-resize block-resize-bottom-left"
                            onMousedown={e => onMouseDown(e, {
                                horizontal: 'start',
                                vertical: 'end'
                            })}
                        ></div>
                        <div
                            class="block-resize block-resize-bottom-right"
                            onMousedown={e => onMouseDown(e, {
                                horizontal: 'end',
                                vertical: 'emd'
                            })}
                        ></div>
                    </>}
                </>
            )
        }
    }
})