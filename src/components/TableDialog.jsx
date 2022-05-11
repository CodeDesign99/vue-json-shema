import deepcopy from "deepcopy"
import { ElButton, ElDialog, ElInput, ElTable, ElTableColumn } from "element-plus"
import { createVNode, defineComponent, reactive, ref, render } from "vue"

const TableConmpponent = defineComponent({
    props: {
        option: {
            type: Object
        }
    },
    setup(props, ctx) {
        const isShow = ref(false)
        const state = reactive({
            option: props.option,
            editData: []
        })
        const add = () => {
            state.editData.push({})
        }
        const onDelete = () => {
        }
        const onCanel = () => {
            isShow.value = false
        }
        const onConfirm = () => {
            state.option.onConfirm(state.editData)
            onCanel()
        }
        const methds = {
            show(option) {
                state.option = option
                state.editData = deepcopy(option.data)
                isShow.value = true
            }
        }
        ctx.expose(methds)
        return () => {
            return (
                <ElDialog v-model={isShow.value} title={state.option.config.label}>
                    {{
                        default: () => <div>
                            <div><ElButton onClick={add}>添加</ElButton><ElButton>重置</ElButton></div>
                            <ElTable data={state.editData}>
                                <ElTableColumn type="index"></ElTableColumn>
                                {state.option.config.table.options.map((item, index) => {
                                    return (
                                        <ElTableColumn label={item.label}>
                                            {
                                                {
                                                    default: ({ row }) => <ElInput v-model={row[item.field]}></ElInput>
                                                }
                                            }
                                        </ElTableColumn>
                                    )
                                })}
                                <ElTableColumn label="操作">
                                    <ElButton type="danger"
                                        onClick={() => onDelete()}>删除</ElButton>
                                </ElTableColumn>
                            </ElTable>
                        </div>,
                        footer: () => <div>
                            <ElButton onClick={onCanel}>取消</ElButton>
                            <ElButton type="primary" onClick={onConfirm}>确认</ElButton>
                        </div>
                    }}
                </ElDialog>
            )
        }
    }
})

let vnode
export const $tableDialog = (option) => {
    if (!vnode) {
        const el = document.createElement('div')
        vnode = createVNode(TableConmpponent, { option })
        render(vnode, el)
        document.body.appendChild(el)
    }
    const { show } = vnode.component.exposed
    show(option)
}
