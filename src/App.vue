<template>
    <div id="app" @mouseover="timeout()">
        <keep-alive>
            <router-view v-if="$route.meta.keepAlive"></router-view>
        </keep-alive>
        <transition name="fade" mode="out-in">
            <router-view v-if="!$route.meta.keepAlive"></router-view>
        </transition>
    </div>
</template>

<script>
export default {
    name: "App",
    data() {
        return {
            sTime: new Date().getTime(),
        };
    },
    methods: {
        timeout() {
            let sTime = this.sTime;
            let eTime = new Date().getTime();
            let timeOut = 12 * 60 * 60 * 1000;
            if (eTime - sTime > timeOut) {
                this.sTime = new Date().getTime();
                // this.$router.push({ path: "/login" });
            } else {
                this.sTime = new Date().getTime();
            }
        }
    }
};
</script>

<style lang="scss">
@import "~@/styles/table";
@import "~@/styles/style";
@import "~@/styles/style-dark";

body {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    font-family: "Roboto Condensed", sans-serif;
    font-size: 1rem;
    -webkit-font-smoothing: antialiased;
    background: #d5e0ef;
    letter-spacing: 0.7px;
    overflow: hidden;
}
#app {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
}

.el-submenu [class^="fa"] {
    vertical-align: baseline;
    margin-right: 10px;
}

.el-menu-item [class^="fa"] {
    vertical-align: baseline;
    margin-right: 10px;
}

.toolbar {
    background: #f2f2f2;
    padding: 10px;
    .el-form-item {
        margin-bottom: 10px;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.2s ease;
}

.fade-enter,
.fade-leave-active {
    opacity: 0;
}
</style>
