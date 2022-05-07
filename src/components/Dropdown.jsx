import {
    computed,
    createVNode,
    defineComponent,
    inject,
    onBeforeUnmount,
    onMounted,
    provide,
    reactive,
    ref,
    render
} from "vue"

export const DropdownItem = defineComponent({
    props: {
        label: String,
        icon: String
    },
    setup(props) {
        const { label, icon } = props
        const hide = inject('hide')
        return () => <div class="dropdown-item" onClick={hide}>
            <i class={icon}></i>
            <span>{label}</span>
        </div>
    }
})

const DropdownComponent = defineComponent({
    props: {
        option: { type: Object }
    },
    setup(props, ctx) {
        const isShow = ref(false)
        const state = reactive({
            option: props.option
        })
        ctx.expose({
            showDropdown(option) {
                state.option = option
                isShow.value = true
                const { top, left, height } = option.el.getBoundingClientRect()
                state.top = top + height
                state.left = left
            }
        })
        const el = ref(null)
        const onMousedownDocument = (e) => {
            if (!el.value.contains(e.target)) {
                isShow.value = false
            }
        }
        onMounted(() => {
            document.addEventListener('mousedown', onMousedownDocument, true)
        })
        onBeforeUnmount(() => {
            document.removeEventListener('mousedown', onMousedownDocument)
        })
        provide('hide', () => isShow.value = false)
        const classes = computed(() => [
            'dropdown',
            {
                'dropdown-isShow': isShow.value
            }
        ])
        const style = computed(() => ({
            top: state.top + 'px',
            left: state.left + 'px'
        }))

        return () => {
            return <div class={classes.value} style={style.value} ref={el}>
                {state.option.content()}
            </div>
        }
    }
})

let vnode

export function $dropdown(option) {
    if (!vnode) {
        let el = document.createElement('div')
        vnode = createVNode(DropdownComponent, { option })
        render(vnode, el)
        document.body.appendChild(el)
    }

    const { showDropdown } = vnode.component.exposed
    showDropdown(option)
}