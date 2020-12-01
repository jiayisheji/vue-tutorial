// 1.实现一个插件
// 2.实现Vuex: 处理数据状态
let Vue;

class Store {
  /**
   * Vue要在这里用
   * @param {Object} options  状态参数
   * @param {Object} options.state  状态集合
   * @param {Object} options.mutations  同步变更状态事件集合
   * @param {Object} options.actions  异步变更状态事件集合
   * @param {Object} options.modules  状态模块化
   * @param {Object} options.getters  store 的计算属性
   */
  constructor(options) {
    // 1.选项处理
    this._mutations = options.mutations;
    this._actions = options.actions;

    // 2 创建 store 的计算属性集合
    const computed = {}

    // 暴露 store 的计算属性集合 API
    this.getters = {}

    // 给getters绑定属性
    Object.entries(options.getters).forEach(([key, fn]) => {
      // 把传递配置属性放到计算属性集合中
      // 这里不能写直接 this.state，因为 this._vm 还没有创建
      computed[key] = partial(fn, this);
      // 给getters添加劫持属性
      Object.defineProperty(this.getters, key, {
        get: () => this._vm[key],
        enumerable: true
      })
    })

    // 3.响应式state
    this._vm = new Vue({
      data: {
        $$state: options.state
      },
      computed
    })
  }

  /** 防止用户修改 */
  set state(value) {
    console.error('please use replaceState to reset state');
  }
  get state() {
    return this._vm._data.$$state;
  }

  commit = (type, payload) => {
    const entry = this._mutations[type]

    if (!entry) {
      console.error('unknown mutation type');
      return
    }

    entry(this.state, payload)
  }

  dispatch = (type, payload) => {
    const entry = this._actions[type]

    if (!entry) {
      console.error('unknown action type');
      return
    }

    entry(this, payload)
  }

}

// 插件要求实现install(Vue)
const install = (_Vue) => {
  Vue = _Vue;

  // 利用全局混入延迟调用后续代码
  Vue.mixin({
    beforeCreate() {
      // 任务1：挂载$store
      // 以后每个组件都会调用该方法
      if (this.$options.store) {
        // 此时的上下文 this 是当前组件实例
        Vue.prototype.$store = this.$options.store
      }
    }
  })
}

export default {
  Store,
  install
}

function partial(fn, arg) {
  return function () {
    return fn(arg.state)
  }
}