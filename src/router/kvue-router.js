
// 1.实现一个插件
// 2.实现VueRouter: 处理选项、监控url变化，动态渲染

// 缓存 Vue 不需要 import Vue 有利于插件开发
let Vue;

class VueRouter {
  /**
   * Vue要在这里用
   * @param {Object} options 配置参数
   * @param {Array} options.routes 路由配置 
   * @param {string} options.base 根路径 
   * @param {string} options.mode 路由模式  'history' | 'hash'
   */
  constructor(options) {
    // 1.处理选项
    this.$options = options;

    // 2.需要响应式的current
    const initial = window.location.hash.slice(1) || '/'
    Vue.util.defineReactive(this, 'current', initial)

    // 2.监控url变化
    window.addEventListener("hashchange", this.onHashChange.bind(this));
  }

  onHashChange() {
    this.current = window.location.hash.slice(1);
  }
}

// 插件要求实现install(Vue)
VueRouter.install = function (_Vue) {
  Vue = _Vue

  // 利用全局混入延迟调用后续代码
  Vue.mixin({   // 内部会把这个对象给每个组件的属性混在一起
    beforeCreate() {
      // 任务1：挂载$router
      // 以后每个组件都会调用该方法
      if (this.$options.router) {
        // 此时的上下文 this 是当前组件实例
        Vue.prototype.$router = this.$options.router;
      }
    },
  });

  // 任务2：注册两个全局组件
  Vue.component("router-link", {
    props: {
      to: {
        type: String,
        required: true,
      },
    },
    render(h) {
      // <router-link to="#/about">abc</router-link> => <a href="#/about">abc</a>
      // return <a href={"#" + this.to}>{this.$slots.default}</a>;
      return h("a", { attrs: { href: "#" + this.to, 'data-link': this.to } }, this.$slots.default);
    },
  });

  Vue.component("router-view", {
    render(h) {
      // 获取current
      let Component = null
      const route = this.$router.$options.routes.find(
        (route) => route.path === this.$router.current
      );
      if (route) {
        Component = route.component
      }
      return h(Component);
    },
  });
}

export default VueRouter;