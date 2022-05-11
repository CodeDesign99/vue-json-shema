import { computed, defineComponent, inject, onMounted, ref } from "vue";
import BlockResize from "./block-resize";

export default defineComponent({
    props: {
        block: {
            type: Object
        },
        formData: {
            type: Object
        }
    },
    setup(props) {
        const blockStyles = computed(() => ({
            top: `${props.block.top}px`,
            left: `${props.block.left}px`,
            zIndex: props.block.zIndex
        }))
        const config = inject('config')
        const blockRef = ref(null)
        onMounted(() => {
            const { offsetWidth, offsetHeight } = blockRef.value
            if (props.block.alingnCenter) { // 说明是拖拽松手时渲染的，其他的不需要
                props.block.left -= offsetWidth / 2
                props.block.top -= offsetHeight / 2
                props.block.alingnCenter = false
            }
            props.block.width = offsetWidth
            props.block.height = offsetHeight
        })
        return () => {
            // 通过block的key获取对应组件对象
            const component = config.componentMap[props.block.key]
            // 获取render返回组件
            const RenderComponent = component.render({
                size: props.block.hasResize ? { width: props.block.width, height: props.block.height } : {},
                props: props.block.props,
                model: Object.keys(component.model || {}).reduce((prev, modelName) => {
                    const propName = props.block.model[modelName]
                    prev[modelName] = {
                        modelValue: props.formData[propName],
                        "onUpdate:modelValue": val => props.formData[propName] = val
                    }
                    return prev
                }, {})
            })

            const { width, height } = component.resize || {}

            return <div class="editor-block" style={blockStyles.value} ref={blockRef} >
                {RenderComponent}

                {props.block.focus && (width || height) && <BlockResize
                    block={props.block}
                    component={component}
                ></BlockResize>}
            </div>
        }
    }
})