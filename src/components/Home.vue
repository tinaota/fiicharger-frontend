<template>
    <div>
        <el-row class="header">
            <el-col :sm="24" :lg="8" class="sys">
                <div>
                    <!-- <img :src="appLogo"> -->
                    <img :src="systemLogo">
                </div>
            </el-col>
            <el-col :sm="24" :lg="16" class="header-info">
                <!-- <el-dropdown trigger="hover">
                    <span class="el-dropdown-link userinfo-inner" style="vertical-align: top;">{{ langList[lang] }}</span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item v-for="(item, key) in langList" :key="key" @click.native="handleChangeLang(key)">{{ item }}</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown> -->
                <div class="img-container">
                    <img :src="appLogo" width="36px" height="36px">
                </div>
                <el-divider direction="vertical"></el-divider>
                <div class="img-container">
                    <img :src="sysUserAvatar" />
                </div>
                <el-dropdown trigger="hover">
                    <div class="el-dropdown-link userinfo-inner">
                        {{userData.name}}
                    </div>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item divided @click.native="logout">{{$t('login.logout')}}</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-col>
        </el-row>
        <section class="container">
            <aside class="left-container">
                <el-menu unique-opened router
                    :default-active="routerName"
                    class="el-menu-vertical-demo home-menu"
                    @select="handleMenuSelect"
                    id="list-wraper"
                    ref="menuCollapsed">
                    <template v-for="item in $router.options.routes" >
                        <template v-if="!item.hidden && item.ename ==='Home'">
                            <template v-for="child in item.children">
                                <template v-if="menuShowCtrl(child)">
                                    <el-menu-item v-if="!child.hasChild" :index="child.path" :key="child.path" >
                                        <img :src="getImgUrl(child.iconCls)" style="margin-right:6px;width:21px"><span slot="title">{{ $t(child.name) }}</span>
                                    </el-menu-item>
                                    <el-submenu v-else :index="child.path" :key="child.path">
                                        <template slot="title">
                                            <div style="margin-right:6px;width:21px;display: inline-block;text-align: center;"><img :src="getImgUrl(child.iconCls)"></div>
                                            <span>{{$t(child.name)}}</span>
                                        </template>
                                        <template v-for="subChild in child.children" >
                                            <el-menu-item v-if="subMenuShowCtrl(child.path, subChild)" :index="subChild.path" style="padding-left:44px;padding-right: 20px;" :key="subChild.path" :class="{menuEn:lang =='en', subMenu: true}">{{ "-"+$t(subChild.name) }}</el-menu-item>
                                        </template>
                                    </el-submenu>
                                </template>
                            </template>
                        </template>
                    </template>
                </el-menu>
                <div class="version">{{ $t('version') + version }}</div>
            </aside>
            <section class="right-container">
                <transition name="fade" mode="out-in">
                    <transition name="fade" mode="out-in">
                        <router-view></router-view>
                    </transition>
                </transition>
            </section>
        </section>
    </div>
</template>

<script>
import * as types from "../store/types";
import { $GLOBAL_LANG, $GLOBAL_VERSION } from '@/utils/global';
import { $HTTP_logout } from "@/api/api";
import Vue from 'vue';
import { getLang } from "@/utils/function";
import apiConfig from "../../config/apiConfig";
import { setScrollBar } from "@/utils/function";
import fiics_logo from 'imgs/fiics_logo.png';
import app_icon from 'imgs/app_icon.png';
export default {
    data() {
        return {
            version: $GLOBAL_VERSION,
            menuList: {},
            routerParent: '',
            routerName: '',
            userData: {
                account: '',
                name: '',
                accPermissionType: ''
            },
            lang: '',
            langList: $GLOBAL_LANG,
            systemLogo: fiics_logo,
            sysUserAvatar: '',
            appLogo: app_icon
        };
    },
    created() {
        if (window.sessionStorage.getItem("fiics-user")) {
            const userData = JSON.parse(window.sessionStorage.getItem("fiics-user"));
            this.userData = {
                account: userData.accountInfo.account,
                name: userData.accountInfo.name,
                accPermissionType: userData.accountInfo.accPermissionType
            }
            this.sysUserAvatar = userData.accountInfo.operatorPicPath;
        } else {
            this.$store.commit(types.LOGOUT, JSON.stringify({}));
            this.$router.push("/login");
        }
        this.$router.options.routes.filter(item => item.ename=='Home')[0].children.forEach(item => {
            let temp = {};
            if(item.hidden)  return;
            item.hasChild && item.children && item.children.forEach(childItem => {
                temp[childItem.path] = childItem;
            });
            if (item.iconCls.includes('_p')) {
                item.iconCls.replace('_p','_o');
            }
            item.children2 = temp;
            this.menuList[item.path] = item;
        });
        this.routerName = this.$route.path;
        const count = (this.routerName.match(/\//g) || []).length;
        if (this.routerName) {
            if (count !== 1) {
                this.routerName = '/' + this.routerName.split('/')[1]
            }
            this.routerParent = "";
            for(var key in this.menuList) {
                if (this.menuList[key].hasChild && this.menuList[key].children2[this.routerName]) {
                    this.routerParent = key;
                }
            }
            if (this.routerParent && this.menuList[this.routerParent] && this.menuList[this.routerParent].iconCls && !this.menuList[this.routerParent].iconCls.includes('_p')) {
                this.menuList[this.routerParent].iconCls = this.menuList[this.routerParent].iconCls.replace('_o','_p');
            } else if (this.routerName !== "/" && this.menuList[this.routerName] && this.menuList[this.routerName].iconCls && !this.menuList[this.routerName].iconCls.includes('_p')) {
                this.menuList[this.routerName].iconCls = this.menuList[this.routerName].iconCls.replace('_o','_p');
                this.routerParent = this.routerName;
            }
        }
        if (!window.sessionStorage.getItem('fiics-lang')) {
            window.sessionStorage.setItem("fiics-lang", 'en');
        }
        this.lang = window.sessionStorage.getItem('fiics-lang');
        this.$store.dispatch('setLang', this.lang);
    },
    activated() {
    },
    mounted() {
        setScrollBar('.home-menu', this);
    },
    methods: {
        menuShowCtrl: function(child) {
            //運營商操作維修員
            if (this.userData.accPermissionType === 4 &&
                (child.path === '/info' || child.path === '/billing' || child.path === '/account')) {
                return false;
            //維修人員
            } else if (this.userData.accPermissionType === 5 &&
                (child.path === '/info' || child.path === '/billing' || child.path === '/account' || child.path === '/setting')) {
                return false;
            //客服人員
            } else if (this.userData.accPermissionType === 6 && child.path === '/info') {
                return false;
            } else {
                return !child.hidden;
            }
        },
// 1：Demo、FiiAdmin，
// 2：(空 維持原先狀態不改)，
// 3：運營商，
// 4：運營商操作維修員，
// 5：維修人員，
// 6：客服人員
        subMenuShowCtrl: function(childPath, subChild) {
            //客服人員
            if (this.userData.accPermissionType === 6) {
                if (childPath === '/chargingStation') {
                    if (subChild.path === '/chargingSession' || subChild.path === '/chargePointAlert') {
                        return false;
                    } else {
                        return !subChild.hidden;
                    }
                } else if (childPath === '/account' && subChild.path === '/operator') {
                    return false;
                } else {
                    return !subChild.hidden;
                }
            //運營商
            } else if (this.userData.accPermissionType === 3 &&
                (childPath === '/account' && subChild.path === '/endUser')) {
                return false;
            } else {
                return !subChild.hidden;
            }
        },
        handleChangeLang(lang) {
            if(this.lang !== lang) {
                this.lang = lang;
                window.sessionStorage.setItem("fiics-lang", lang);
                this.$router.go(0);
            }
        },
        handleMenuSelect(index, indexPath) {
            // this.$jQuery(".home-menu").length > 0 && this.$jQuery(".home-menu").mCustomScrollbar('destroy');
            if (this.routerParent !== indexPath[0]) {
                if (this.menuList[this.routerParent] && this.menuList[this.routerParent].iconCls) {
                    this.menuList[this.routerParent].iconCls = this.menuList[this.routerParent].iconCls.replace('_p','_o');
                }
                this.menuList[indexPath[0]].iconCls = this.menuList[indexPath[0]].iconCls.replace('_o','_p');
                this.routerParent = indexPath[0];
            }
            // setScrollBar('.home-menu', this);
            // this.routerName = index;
        },
        getImgUrl(iconName) {
            return require('imgs/'+iconName+'.png');
        },
        logout: function() {
            this.$confirm(i18n.t('login.hint_logout'), i18n.t('general.hint'), {
                showClose: false,
                customClass: 'custom'
            }).then(() => {
                $HTTP_logout().then(data => {
                    if (!!data.success) {
                        this.$store.commit(types.LOGOUT, JSON.stringify({}));
                        this.$router.push("/login");
                        this.$destroy();
                        window.location.reload();
                    } else {
                        this.$message.error(i18n.t('login.err_logout'));
                    }
                });
            })
            .catch(() => {});
        }
    }
};
</script>
<style scoped lang="scss">
.el-dropdown-menu {
    margin-top: -8px;
}
.header {
    height: 68px;
    padding: 16px;
    background:  #D5E0EF;
    .header-info {
        height: 100%;
        text-align: right;
        padding-right: 12px;
        .el-divider {
            background-color: #979797;
            margin: 0 24px;
            height: 36px;
            width: 1.5px;
            vertical-align: unset;
        }
        .el-dropdown {
            height: 36px;
            line-height: 36px;
            color: #525E69;
            font-size: 0.875rem;
            letter-spacing: 0px;
            vertical-align: top;
            &:focus {
                outline: unset;
            }
            .userinfo-inner {
                div {
                    display: inline-block;
                }
            }
        }
        .img-container {
            height: 36px;
            line-height: 36px;
            margin-right: 6px;
            display:inline-block;
            vertical-align: top;
            img {
                width: auto;
                max-height: 36px;
                vertical-align: middle;
            }
        }
    }
}
.container {
    width: 100%;
    height: calc(100vh - 68px);
    .left-container {
        width: 208px;
        height: 100%;
        display: inline-block;
        float: left;
        background: #D5E0EF;
        box-sizing: border-box;
        padding-top: 16px;
        .el-menu {
            height: calc(100% - 30px);
            overflow: hidden;
            background: #D5E0EF;
            border-right: none;
        }
        .version {
            color: #525E69;
            font-size: 1rem;
            padding-left: 12px;
        }
    }
    .right-container {
        width: calc(100% - 208px);
        height: 100%;
        display: inline-block;
        background-color: #DCE6f3;
        border-top-left-radius: 20px;
    }
}
</style>