import { computed, defineComponent, inject, onMounted, ref } from "vue";

export default defineComponent({
    props: {
        block: {
            type: Object
        }
    },
    setup(props) { 
        const blockStyles = computed(() => ({
            top: `${props.block.top}px`,
            left: `${props.block.left}px`,
            zIndex: `${props.block.zIndex}px`
        }))
        const config = inject('config')
        const blockRef = ref(null)
        onMounted(() => { 
            let { offsetWidth, offsetHeight } = blockRef.value
            if (props.block.alingnCenter) { // 说明是拖拽松手时渲染的，其他的不需要
                props.block.left -= offsetWidth / 2
                props.block.top -= offsetHeight / 2
                
                
                props.block.alingnCenter = false
            }
        })
        return () => { 
            // 通过block的key获取对应组件对象
            const component = config.componentMap[props.block.key]
            // 获取render返回组件
            const RenderComponent = component.render()
            return <div
                class="editor-block"
                style={blockStyles.value}
                ref={blockRef}
            >
                { RenderComponent }
            </div>
        }
    }
})