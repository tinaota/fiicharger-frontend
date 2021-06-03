<template>
    <div>
        <el-row class="header">
            <el-col :sm="24" :lg="4" class="sys">
                <div><img :src="systemLogo" style="margin-top: -8px;"></div>
            </el-col>
            <el-col :sm="24" :lg="20" class="header-info">
                <el-dropdown trigger="hover">
                    <span class="el-dropdown-link userinfo-inner">{{ langList[lang] }}</span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item v-for="(item, key) in langList" :key="key" @click.native="handleChangeLang(key)">{{ item }}</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
                <el-divider direction="vertical"></el-divider>
                <div style="margin-right: 6px; display:inline-block"><img :src="sysUserAvatar" /></div>
                <el-dropdown trigger="hover">
                    <div class="el-dropdown-link userinfo-inner">
                        {{sysUserName}}
                    </div>
                    <el-dropdown-menu slot="dropdown">
                        <!-- <el-dropdown-item divided @click.native="logout">{{$t('login.logout')}}</el-dropdown-item> -->
                        <el-dropdown-item divided>{{$t('login.logout')}}</el-dropdown-item>
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
                                <template v-if="!child.hidden">
                                    <el-menu-item v-if="!child.hasChild" :index="child.path" :key="child.path" >
                                        <img :src="getImgUrl(child.iconCls)" style="margin-right:12px;width:21px"><span slot="title">{{ $t(child.name) }}</span>
                                    </el-menu-item>
                                    <el-submenu v-else :index="child.path" :key="child.path">
                                        <template slot="title">
                                            <div style="margin-right:12px;width:21px;display: inline-block"><img :src="getImgUrl(child.iconCls)"></div>
                                            <span>{{$t(child.name)}}</span>
                                        </template>
                                        <template v-for="subChild in child.children" >
                                            <el-menu-item v-if="!subChild.hidden" :index="subChild.path" style="padding-left:60px;padding-right: 12px;" :key="subChild.path" :class="{menuEn:lang =='en', subMenu: true}">{{ "-"+$t(subChild.name) }}</el-menu-item>
                                        </template>
                                    </el-submenu>
                                </template>
                            </template>
                        </template>
                    </template>
                </el-menu>
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
import { $GLOBAL_LANG } from '@/utils/global';
import {
    $HTTP_Logout,
} from "@/api/api";
import Vue from 'vue';
import { getLang } from "@/utils/function";
import apiConfig from "../../config/apiConfig";
export default {
    data() {
        return {
            menuList: {},
            routerParent: '',
            routerName: '',
            userData: {},
            lang: '',
            langList: $GLOBAL_LANG,
            systemLogo: require("imgs/fiics_logo_130_54.png"),
            sysUserAvatar: require("imgs/ic_avata.png"),
            sysUserName: 'Developer'
        };
    },
    created() {
        // if (window.sessionStorage.getItem('fiics-accId')) {
        //     this.sysUserName = this.userData.name;
        // } else {
        //     this.$store.commit(types.LOGOUT, JSON.stringify({}));
        //     this.$router.push("/login");
        // }

        this.menuList = {};
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

            if (this.routerParent && this.menuList[this.routerParent].iconCls && !this.menuList[this.routerParent].iconCls.includes('_p')) {
                this.menuList[this.routerParent].iconCls = this.menuList[this.routerParent].iconCls.replace('_o','_p');
            } else if (this.routerName !== "/" && this.menuList[this.routerName].iconCls && !this.menuList[this.routerName].iconCls.includes('_p')) {
                this.menuList[this.routerName].iconCls = this.menuList[this.routerName].iconCls.replace('_o','_p');
                this.routerParent = this.routerName;
            }
        }
        this.lang = window.sessionStorage.getItem('fiics-lang') || 'en';
        this.$store.dispatch('setLang', this.lang);
    },
    activated() {
    },
    mounted() {
        this.leftScroll();
    },
    methods: {
        handleChangeLang(lang) {
            if(this.lang !== lang) {
                this.lang = lang;
                window.sessionStorage.setItem("fiics-lang", lang);
                this.$router.go(0);
            }
        },
        handleMenuSelect(index, indexPath) {
            if (this.routerParent !== indexPath[0]) {
                if (this.menuList[this.routerParent] && this.menuList[this.routerParent].iconCls) {
                    this.menuList[this.routerParent].iconCls = this.menuList[this.routerParent].iconCls.replace('_p','_o');
                }
                this.menuList[indexPath[0]].iconCls = this.menuList[indexPath[0]].iconCls.replace('_o','_p');
                this.routerParent = indexPath[0];
            }
            this.routerName = index;
        },
        getImgUrl(iconName) {
            return require('imgs/'+iconName+'.png');
        },
        leftScroll: function() {
            this.$jQuery("#list-wraper")
                .mCustomScrollbar({
                    theme: "rounded-dots",
                    scrollAmount: 50,
                    mouseWheelPixels:200
                });
            this.$jQuery("#list-wraper")
                .find(".mCSB_inside > .mCSB_container")
                .css("margin-right", "0");
        },
        // logout: function() {
        //     this.$confirm(i18n.t('login.hint_logout'), i18n.t('general.hint')
        //     , {
        //         type: "warning",
        //         confirmButtonText: i18n.t('general.ok'),
        //         cancelButtonText: i18n.t('general.cancel'),
        //     })
        //     .then(() => {
        //         $HTTP_Logout().then(data => {
        //             if (!!data.success) {
        //                 this.$store.commit(types.LOGOUT, JSON.stringify({}));
        //                 this.$router.push("/login");
        //                 this.$destroy();
        //                 window.location.reload();
        //             } else {
        //                 this.$message.error(i18n.t('login.err_logout'));
        //             }
        //         });
        //     })
        //     .catch(() => {});
        // }
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
    background:  #000;
    box-shadow: 1px 4px 4px 0 rgba(21,34,50,0.08);
    .header-info {
        height: 100%;
        text-align: right;
        padding-right: 12px;
        .el-divider {
            background-color: #979797;
            margin: -28px 32px 0;
            height: 2rem;
        }
        .el-dropdown {
            color: #FFF;
            letter-spacing: 0.72px;
            font-size: 0.875rem;
            height: 44px;
            vertical-align: middle;
            &:focus {
                outline: unset;
            }
            .userinfo-inner {
                div {
                    display: inline-block;
                    // vertical-align: middle;
                }
            }
        }
    }
}
.container {
    width: 100%;
    height: calc(100vh - 68px);
    .left-container {
        width: 230px;
        height: calc(100% - 16px);
        display: inline-block;
        float: left;
        background: #000;
        box-shadow: 0 2px 21px 2px rgba(0,0,0,0.20);
        padding-top: 16px;
        .el-menu {
            height: calc(100% - 16px);
            overflow: hidden;
            background: #000;
            border-right: none;
        }
    }
    .right-container {
        width: calc(100% - 230px);
        height: calc(100%);
        display: inline-block;
    }
}
</style>