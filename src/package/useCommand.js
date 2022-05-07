import deepcopy from "deepcopy"
import { onUnmounted } from "vue"
import { events } from "./events"

export default function useCommand(data) {
    const state = { // 前进后退需要指针
        current: -1, // 前进后退的索引值
        queue: [], //存放所有的操作指令
        commands: {}, // 制作命令和执行功能一个映射表 undo : () => {}, redo: () => {}
        commandArray: [], // 存放所有指令
        destoryArray: []
    }

    const registry = (command) => {
        state.commandArray.push(command)
        state.commands[command.name] = (...args) => { // 命令名字对应执行函数
            const { redo, undo } = command.execute(args)
            redo()
            if (!command.pushQueue) {
                return
            }
            const { queue, current } = state
            if (queue.length) {
                queue.slice(0, current + 1) // 可能在放置的过程中有撤销操作，所以根据当前最新的current值来计算新的
                state.queue = queue
            }
            queue.push({ redo, undo }) // 保存指令的前进后退
            state.current = current + 1
        }
    }

    // 注册我们需要的命令
    registry({
        name: 'redo',
        keyboard: 'ctrl+y',
        execute() {
            return {
                redo() {
                    const item = state.queue[state.current + 1] // 找到当前的下一步还原操作
                    if (item) {
                        item.redo && item.redo()
                        state.current++
                    }
                }
            }
        }
    })
    registry({
        name: 'undo',
        keyboard: 'ctrl+z',
        execute() {
            return {
                redo() {
                    if (state.current === -1) return
                    const item = state.queue[state.current] // 找到上一步还原
                    if (item) {
                        item.undo && item.undo()
                        state.current--
                    }
                }
            }
        }
    })
    registry({
        name: 'drag',
        pushQueue: true, // 如果希望将操作放入队列中可以加一个属性 表示的等会操作要放到队列里
        init() { // 初始化操作 默认就会执行
            this.before = null
            // 监听拖拽开始事件，保存状态
            const start = () => this.before = deepcopy(data.value.blocks)
            // 拖拽之后需要触发对应指令
            const end = () => state.commands.drag()
            events.on('start', start)
            events.on('end', end)

            return () => {
                events.off('start', start)
                events.off('end', end)
            }
        },
        execute() {
            const before = this.before
            const after = data.value.blocks // 之后的状态
            return {
                redo() { // 默认松手就直接执行
                    data.value = { ...data.value, blocks: after }
                },
                undo() { // 前一步
                    data.value = { ...data.value, blocks: before }
                }
            }
        }
    })
    registry({
        name: 'updateContainer',
        pushQueue: true,
        execute(newValue) {
            let state = {
                before: data.value,
                after: newValue
            }
            return {
                redo: () => {
                    data.value = state.after
                },
                undo: () => {
                    data.value = state.before
                }
            }

        }
    })

    const keyboardEvent = (() => {
        const keyCodes = {
            90: 'z',
            89: 'y'
        }
        const onKeydown = (e) => {
            const { ctrlKey, keyCode } = e // ctrl + z ctrl + y
            let keyString = []
            if (ctrlKey) keyString.push('ctrl')
            keyString.push(keyCodes[keyCode])
            keyString = keyString.join('+')

            state.commandArray.forEach(({ keyboard, name }) => {
                if (!keyboard) return
                if (keyboard === keyString) {
                    state.commands[name]()
                    e.preventDefault()
                }
            })
        }
        const init = () => { // 初始化事件
            window.addEventListener('keydown', onKeydown)
            return () => { // 销毁事件
                window.removeEventListener('keydown', onKeydown)
            }
        }
        return init
    })();


    (() => {
        // 监听键盘事件
        state.destoryArray.push(keyboardEvent())
        state.commandArray.forEach(command => command.init && state.destoryArray.push(command.init()))
    })()
    onUnmounted(() => { // 清理绑定的事件
        state.destoryArray.forEach(fn => fn && fn())
    })
    return state
}