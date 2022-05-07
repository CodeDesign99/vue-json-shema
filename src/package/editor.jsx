import { computed, defineComponent, inject, ref } from "vue";
import './editor.scss'
import EditorBlock from "./editor-block";
import deepcopy from "deepcopy";
import { useMenuDragger } from "./useMenuDragger";
import useFocus from "./useFocus";
import useBlockDragger from "./useBlockDragger";
import useCommand from "./useCommand";
import { $dialog } from "../components/Dialog";
import { ElButton } from "element-plus";
import { $dropdown, DropdownItem } from "../components/Dropdown";

export default defineComponent({
    props: {
        modelValue: {
            type: Object
        }
    },
    emits: ['update:modelValue'],
    setup(props, ctx) {
        const preview = ref(false)
        const editor = ref(true)

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
        const {
            blockMousedown,
            containerMousedown,
            focusData,
            lastSelectBlock,
            clearBlockFocus
        } = useFocus(data, preview, (e) => {
            mousedown(e)
        })
        // 2.2 实现组件拖拽
        const { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock, data)

        const { commands } = useCommand(data, focusData)
        const buttons = [
            { label: '撤销', icon: 'icon-back', handler: () => commands.undo() },
            { label: '重做', icon: 'icon-forward', handler: () => commands.redo() },
            {
                label: '导出', icon: 'icon-export', handler: () => {
                    $dialog({
                        title: '导出json',
                        content: JSON.stringify(data.value),
                        footer: false
                    })
                }
            },
            {
                label: '导入', icon: 'icon-import', handler: () => {
                    $dialog({
                        title: '导入json',
                        content: '',
                        footer: true,
                        onConfirm(json) {
                            commands.updateContainer(JSON.parse(json))
                        }
                    })
                }
            },
            { label: '置顶', icon: 'icon-place-top', handler: () => commands.placeTop() },
            { label: '置底', icon: 'icon-place-bottom', handler: () => commands.placeBottom() },
            { label: '删除', icon: 'icon-delete', handler: () => commands.delete() },
            {
                label: () => preview.value ? '编辑' : '预览',
                icon: () => preview.value ? 'icon-edit' : 'icon-browse',
                handler: () => {
                    preview.value = !preview.value
                    clearBlockFocus()
                }
            },
            {
                label: '关闭', icon: 'icon-close', handler: () => {
                    editor.value = !editor.value
                    clearBlockFocus()
                }
            },
        ]

        const onContextMenuBlock = (e, block) => {
            e.preventDefault()

            $dropdown({
                el: e.target,
                content: () => {
                    return <>
                        <DropdownItem
                            label="删除"
                            icon="icon-delete"
                            onClick={() => commands.delete()}
                        ></DropdownItem>
                        <DropdownItem
                            label="置顶"
                            icon="icon-place-top"
                            onClick={() => commands.placeTop()}
                        ></DropdownItem>
                        <DropdownItem
                            label="置底"
                            icon="icon-place-bottom"
                            onClick={() => commands.placeBottom()}
                        ></DropdownItem>
                        <DropdownItem
                            label="查看"
                            icon="icon-browse"
                            onClick={() => {
                                $dialog({
                                    title: '查看节点数据',
                                    content: JSON.stringify(block)
                                })
                            }}
                        ></DropdownItem>
                        <DropdownItem
                            label="导入"
                            icon="icon-import"
                            onClick={() => {
                                $dialog({
                                    title: '导入节点数据',
                                    content: '',
                                    footer: true,
                                    onConfirm(json) {
                                        if (!json) return
                                        commands.updateBlock(JSON.parse(json), block)
                                    }
                                })
                            }}
                        ></DropdownItem>
                    </>
                }
            })
        }

        return () => !editor.value ?
            <>
                <div class="editor-top" style={{ 'position': 'initial' }}>
                    <div><ElButton
                        type="primary"
                        onClick={() => { editor.value = true }}
                    >继续编辑</ElButton></div>
                </div>
                <div
                    class="editor-container-canvas__content"
                    style={containerStyles.value}
                >
                    {
                        (data.value.blocks.map((block, index) => <div>
                            <EditorBlock
                                class={block.focus ? 'editor-block-focus ' : ''}
                                block={block}
                            ></EditorBlock>
                        </div>))
                    }
                </div>
            </> :
            <div class="editor">
                <div class="editor-left">
                    { /* 根据注册列表 渲染对应的内容 可以实现H5的拖拽*/}
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
                <div class="editor-top">{
                    buttons.map((btn, index) => {
                        const label = typeof btn.label === 'function' ? btn.label() : btn.label
                        const icon = typeof btn.icon === 'function' ? btn.icon() : btn.icon
                        return <div
                            class="editor-top-button"
                            onClick={btn.handler}
                        >
                            <i class={icon}></i>
                            <span>{label}</span>
                        </div>
                    })
                }</div>
                <div class="editor-right">属性控制栏</div>
                <div class="editor-container">
                    { /* 负责产生滚动条 */}
                    <div class="editor-container-canvas">
                        { /* 产生内容区域 */}
                        <div
                            class="editor-container-canvas__content"
                            style={containerStyles.value}
                            ref={containerRef}
                            onMousedown={containerMousedown}
                        >
                            {
                                (data.value.blocks.map((block, index) => <div>
                                    <EditorBlock
                                        class={
                                            [
                                                block.focus ? 'editor-block-focus ' : '',
                                                preview.value ? 'editor-block-preview' : ''
                                            ]
                                        }
                                        block={block}
                                        onMousedown={(e) => blockMousedown(e, block, index)}
                                        onContextmenu={(e) => onContextMenuBlock(e, block)}
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