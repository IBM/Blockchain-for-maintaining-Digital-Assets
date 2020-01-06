import Vue from 'vue';
import VModal from 'vue-js-modal';
import App from './App.vue';
import router from './router';

Vue.use(VModal, {dialog: true, dynamic: true});
Vue.config.productionTip = false;

new Vue({
    render: function (h) { return h(App); },
    router,
}).$mount('#app');
