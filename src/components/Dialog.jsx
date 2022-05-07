import { ElDialog, ElInput, ElButton } from "element-plus";
import { createVNode, defineComponent, reactive, ref, render } from "vue";

const DialogComponent = defineComponent({
    props: {
        option: {
            type: Object
        }
    },
    setup(props, ctx) {
        const isShow = ref(false)
        const state = reactive({
            option: props.option
        })

        ctx.expose({
            showDialog(option) {
                state.option = option
                isShow.value = true
            }
        })

        const onCancel = () => {
            isShow.value = false
        }

        const onConfirm = () => {
            isShow.value = false
            state.option.onConfirm && state.option.onConfirm(state.option.content)
        }

        return () => <ElDialog v-model={isShow.value} title={state.option.title}>
            {
                {
                    default: () => <ElInput
                        type='textarea'
                        v-model={state.option.content}
                        rows={10}
                    ></ElInput>,
                    footer: () => state.option.footer && <div>
                        <ElButton onClick={onCancel}>取消</ElButton>
                        <ElButton type='primary' onClick={onConfirm}>确定</ElButton>
                    </div>
                }
            }
        </ElDialog>
    }
})

let vnode

export function $dialog(option) {
    if (!vnode) {
        let el = document.createElement('div')
        vnode = createVNode(DialogComponent, { option })
        render(vnode, el)
        document.body.appendChild(el)
    }

    const { showDialog } = vnode.component.exposed
    showDialog(option)
}