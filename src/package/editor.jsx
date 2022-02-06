import { computed, defineComponent, inject, ref } from "vue";
import './editor.scss'
import EditorBlock from "./editor-block";
import deepcopy from "deepcopy";
import { useMenuDragger } from "./useMenuDragger";
import useFocus from "./useFocus";
import useBlockDragger from "./useBlockDragger";

export default defineComponent({
    props: {
        modelValue: {
            type: Object
        }
    },
    emits: ['update:modelValue'],
    setup(props, ctx) {
        const data = computed({
            get() { 
                return props.modelValue
            },
            set(newValue) { 
                ctx.emit('update:modelValue', deepcopy(newValue))
            }
        })
        const containerStyles = computed(() => ({ 
            width: data.value.container.width + 'px',
            height: data.value.container.height + 'px'
        }))
        const config = inject('config')
        const containerRef = ref(null)
        // 1.实现菜单的拖拽功能
        const { dragstart, dragend } = useMenuDragger(containerRef, data)
        
        // 2.实现 EditorBlock 获取焦点 , 选中后可能就直接拖动了
        // 2.1 获取焦点
        const { blockMousedown, containerMousedown, focusData, lastSelectBlock } = useFocus(data, (e) => { 
            mousedown(e)
        })
        // 2.2 实现组件拖拽
        const { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock, data)
        
        return () => <div class="editor">
            <div class="editor-left">
                { /* 根据注册列表 渲染对应的内容 可以实现H5的拖拽*/ }
                {
                    config.componentList.map(component => <div
                        class="editor-left-item"
                        draggable
                        onDragstart={e => dragstart(e, component)}
                        onDragend={dragend}
                    >
                        <span>{component.label}</span>
                        <div>{component.preview()}</div>
                    </div>)
                }
            </div>
            <div class="editor-top">菜单栏</div>
            <div class="editor-right">属性控制栏</div>
            <div class="editor-container">
                { /* 负责产生滚动条 */}
                <div class="editor-container-canvas">
                    { /* 产生内容区域 */}
                    <div
                        class="editor-container-canvas__content"
                        style={containerStyles.value}
                        ref={containerRef}
                        onMousedown={ containerMousedown }
                    >
                        {
                            (data.value.blocks.map((block, index) => <div>
                                <EditorBlock
                                    class={ block.focus ? 'editor-block-focus' : '' }
                                    block={block}
                                    onMousedown={ (e) => blockMousedown(e, block, index) }
                                ></EditorBlock>
                            </div>))
                        }
                        {
                            markLine.x !== null && <div class="line-x" style={{ left: markLine.x + 'px' }}></div>
                        }
                        {
                            markLine.y !== null && <div class="line-y" style={{ top: markLine.y + 'px' }}></div>
                        }
                    </div>
                </div>
            </div>
        </div>
    }
})