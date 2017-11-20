import Primus from 'Primus'

export default {
  install(Vue, connection, opts) {
    let primus;

    if (connection != null && typeof connection === "object") {
      primus = connection;
    } else {
      primus = Primus(connection || "", opts);
    }

    Vue.prototype.$primus = primus;

    let addListeners = function () {
    };

    let removeListeners = function () {
    };

    Vue.mixin({
      beforeCompile: addListeners,

      // Vue v2.x
      beforeCreate: addListeners,

      beforeDestroy: removeListeners
    });

//    Vue.prototype.$primus = function (methodOptions) {
//  }
  }
}
