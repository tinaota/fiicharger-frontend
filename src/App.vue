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
    name: 'App',
    data() {
        return {
            sTime: new Date().getTime()
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
}
</script>

<style lang="scss">
@import "scss_table";
@import "scss_style";

body {
    height : 100%;
    width : 100%;
    margin: 0px;
    padding: 0px;
    font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;
    font-size: 14px;
    -webkit-font-smoothing: antialiased;
    background: #D5E0EF;
    letter-spacing: 0.6px;
    overflow: hidden;
}
#app {
    position: absolute;
    top: 0px;
    bottom: 0px;
    width: 100%;
    height : 100%;
}

.el-submenu [class^=fa] {
    vertical-align: baseline;
    margin-right: 10px;
}

.el-menu-item [class^=fa] {
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
    transition: all .2s ease;
}

.fade-enter,
.fade-leave-active {
    opacity: 0;
}
</style>
