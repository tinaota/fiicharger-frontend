
<template>
    <div :class="isDark? 'dark-theme':'light-theme'">
        <el-row class="header">
            <el-col :sm="24" :lg="8" class="sys">
                <div>
                    <img :src="systemLogo">
                </div>
            </el-col>
            <el-col :sm="24" :lg="16" class="header-info">
                <div class="img-container">
                    <img :src="userAvatar" />
                </div>
                <el-dropdown trigger="click">
                    <div class="el-dropdown-link userinfo-inner">
                        {{ userName!==" " ? userName : roleNameObj }}
                    </div>
                    <el-dropdown-menu slot="dropdown" :class="isDark? 'logout dark-theme':'logout light-theme'">
                        <el-dropdown-item @click.native="logout">{{ $t('login.logout') }}</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
                <el-divider direction="vertical"></el-divider>
                <el-dropdown trigger="click">
                    <div class="el-dropdown-link userinfo-inner img-container">
                        <el-button class="no-bg i change-theme-icon el-icon-setting" :style="{color:isDark? '#ffa500':'#000000'}"></el-button>
                    </div>

                    <el-dropdown-menu slot="dropdown" :class="isDark? 'home-settings dropdown-menu dark-theme':'home-settings dropdown-menu light-theme'">
                        <el-menu :default-active="activeIndex" mode="vertical" collapse :class="isDark? 'dark-theme':'light-theme'">
                            <el-submenu index="1">
                                <template slot="title">
                                    {{ $t('general.language') }}
                                </template>
                                <el-menu-item v-for="(item, key) in langList" :key="key" :index="key" :class="[(isDark? 'dark-theme':'light-theme'),(isActiveLang===key?'is-active':'')]" @click.native="handleChangeLang(key,item)">{{ item }}</el-menu-item>
                            </el-submenu>
                            <el-submenu index="2">
                                <template slot="title">
                                    {{ $t('general.theme') }}
                                </template>
                                <el-menu-item v-for="(item, key) in themeList" :key="key" :index="key" :class="[(isDark? 'dark-theme':'light-theme'),(isActiveTheme===item?'is-active':'')]" @click.native="changeTheme(item,key)">{{ item }}</el-menu-item>
                            </el-submenu>
                        </el-menu>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-col>
        </el-row>
        <section class="container">
            <aside class="left-container">
                <el-menu id="list-wraper" ref="menuCollapsed" unique-opened router :default-active="routerName" class="el-menu-vertical-demo home-menu" @select="handleMenuSelect">
                    <template v-for="item in $router.options.routes">
                        <template v-if="!item.hidden && item.ename ==='Home'">
                            <template v-for="child in item.children">
                                <template v-if="menuShowCtrl(child)">
                                    <el-menu-item v-if="!child.hasChild" :key="child.path" :index="child.path">
                                        <img :src="getImgUrl(child.iconCls)" style="margin-right:6px;width:21px"><span slot="title">{{ $t(child.name) }}</span>
                                    </el-menu-item>
                                    <el-submenu v-else :key="child.path" :index="child.path">
                                        <template slot="title">
                                            <div style="margin-right:6px;width:21px;display: inline-block;text-align: center;"><img :src="getImgUrl(child.iconCls)"></div>
                                            <span>{{ $t(child.name) }}</span>
                                        </template>
                                        <template v-for="subChild in child.children">
                                            <el-menu-item v-if="subMenuShowCtrl(child.path, subChild)" :key="subChild.path" :index="subChild.path" style="padding-left:38px;padding-right: 20px;" :class="{menuEn:lang =='en', subMenu: true}">{{ $t(subChild.name) }}</el-menu-item>
                                        </template>
                                    </el-submenu>
                                </template>
                            </template>
                        </template>
                    </template>
                </el-menu>
                <div class="version">{{ `${$t('version')}${version}(${roleNameObj})` }}</div>
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
import { $GLOBAL_LANG, $GLOBAL_VERSION, $GLOBAL_AUTH, $GLOBAL_BASE_URL } from "@/utils/global";
import { $HTTP_logout } from "@/api/api";
import { $GLOBAL_CLIENT_ID } from "@/utils/global";
import { setScrollBar, updateLangCookie, transformLangCookieToSymbol } from "@/utils/function";
import fiics_logo from "imgs/fiics_logo.png";
import fiics_logo_dark from "imgs/darkVersion/fiics_logo.png";
import app_icon from "imgs/app_icon.png";
import redirect from "../router/redirect";
import { app } from "../main";
import moment from 'moment'
export default {
    data() {
        return {
            version: $GLOBAL_VERSION,
            menuList: {},
            routerParent: "",
            routerName: "",
            userData: {
                account: "",
                name: "",
            },
            lang: "",
            langList: $GLOBAL_LANG,
            appLogo: app_icon,
            roleNameObj: "",
            uuid: "",
            activeIndex: "0",
            globalAuth: $GLOBAL_AUTH,
            globalBaseUrl: $GLOBAL_BASE_URL,
            isDark: false,
            isActiveLang: "",
        };
    },
    computed: {
        userName() {
            let userData = this.$store.state.userInfo;
            return userData.firstName + " " + userData.lastName;
        },
        userAvatar() {
            let userData = this.$store.state.userInfo;
            let final_url;
            if (
                !userData?.picture.includes("https") &&
                !userData?.picture.includes("http") &&
                userData?.picture !== ""
            ) {
                final_url = this.globalBaseUrl + this.globalAuth + "/" + userData?.picture;
            } else {
                final_url = userData?.picture;
            }
            return final_url;
        },
        systemLogo() {
            return this.isDark ? fiics_logo_dark : fiics_logo;
        },
        themeList() {
            return { 1: `${i18n.t("general.light")}`, 2: `${i18n.t("general.dark")}` };
        },
        isActiveTheme() {
            return this.$store.state.darkTheme ? `${i18n.t("general.dark")}` : `${i18n.t("general.light")}`;
        },
    },
    watch: {
        "$route.path": function () {
            if (
                this.routerName !== this.$route.path &&
                this.routerName === "/location" &&
                this.$route.path === "/chargePoint"
            ) {
                this.handleMenuSelect("/chargePoint", ["/chargingStation", "/chargePoint"]);
            }
        },
    },
    created() {
        if (this.$store.state.userInfo) {
            const userData = this.$store.state.userInfo;
            // set role(highest one)
            if (userData?.roles?.indexOf("Super") != -1) {
                this.roleNameObj = "Super";
            } else if (userData?.roles?.indexOf("Admin") != -1) {
                this.roleNameObj = "Admin";
            } else if (userData?.roles?.indexOf("Owner") != -1) {
                this.roleNameObj = "Owner";
            } else {
                this.roleNameObj = "Member";
            }
        } else {
            this.$store.commit(types.LOGOUT, JSON.stringify({}));
            this.$router.push("/login");
        }

        const languageCookie = ("; " + document.cookie).split(`; fii.culture=`).pop().split(";")[0];
        let language = transformLangCookieToSymbol(languageCookie);
        this.lang = language;
        this.isActiveLang = language;

        this.$router.options.routes
            .filter((item) => item.ename == "Home")[0]
            .children.forEach((item) => {
                let temp = {};
                if (item.hidden) return;
                item.hasChild &&
                    item.children &&
                    item.children.forEach((childItem) => {
                        temp[childItem.path] = childItem;
                    });
                if (item.iconCls.includes("_p")) {
                    item.iconCls.replace("_p", "_o");
                }
                item.children2 = temp;
                this.menuList[item.path] = item;
            });
        this.routerName = this.$route.path;
        const count = (this.routerName.match(/\//g) || []).length;
        if (this.routerName) {
            if (count !== 1) {
                this.routerName = "/" + this.routerName.split("/")[1];
            }
            this.routerParent = "";
            for (var key in this.menuList) {
                if (this.menuList[key].hasChild && this.menuList[key].children2[this.routerName]) {
                    this.routerParent = key;
                }
            }
            if (
                this.routerParent &&
                this.menuList[this.routerParent] &&
                this.menuList[this.routerParent].iconCls &&
                !this.menuList[this.routerParent].iconCls.includes("_p")
            ) {
                this.menuList[this.routerParent].iconCls = this.menuList[this.routerParent].iconCls.replace("_o", "_p");
            } else if (
                this.routerName !== "/" &&
                this.menuList[this.routerName] &&
                this.menuList[this.routerName].iconCls &&
                !this.menuList[this.routerName].iconCls.includes("_p")
            ) {
                this.menuList[this.routerName].iconCls = this.menuList[this.routerName].iconCls.replace("_o", "_p");
                this.routerParent = this.routerName;
            }
        }
    },
    beforeMount() {
        let uuidValue = localStorage.getItem("fiics-uuid");
        this.uuid = uuidValue;
        if (this.$store.state.darkTheme) {
            this.isDark = this.$store.state.darkTheme;
        }
    },
    activated() {},
    mounted() {
        setScrollBar(".home-menu", this);
    },
    methods: {
        menuShowCtrl: function (child) {
            if (
                (this.roleNameObj === "Admin" || this.roleNameObj === "Super" || this.roleNameObj === "Owner") &&
                child.path === "/contact"
            ) {
                return false;
            } else if (this.roleNameObj === "Member" && child.path !== "/contact") {
                return false;
            } else return !child.hidden;
        },

        subMenuShowCtrl: function (childPath, subChild) {
            return !subChild.hidden;
        },
        handleChangeLang(lang) {
            updateLangCookie(this.lang, lang);
            this.isActiveLang = lang;
            this.lang=lang
            if (app && app.$i18n) {
                app.$i18n.locale = lang;
                // change moment with respect to language
                moment.locale(lang)
            }
        },
        handleMenuSelect(index, indexPath) {
            // this.$jQuery(".home-menu").length > 0 && this.$jQuery(".home-menu").mCustomScrollbar('destroy');
            if (this.routerParent !== indexPath[0]) {
                if (this.menuList[this.routerParent] && this.menuList[this.routerParent].iconCls) {
                    this.menuList[this.routerParent].iconCls = this.menuList[this.routerParent].iconCls.replace(
                        "_p",
                        "_o"
                    );
                }
                this.menuList[indexPath[0]].iconCls = this.menuList[indexPath[0]].iconCls.replace("_o", "_p");
                this.routerParent = indexPath[0];
            }
            // setScrollBar('.home-menu', this);
            this.routerName = index;
        },
        getImgUrl(iconName) {
            return this.isDark
                ? require("imgs/darkVersion/" + iconName + ".png")
                : require("imgs/" + iconName + ".png");
        },
        logout: function () {
            this.$confirm(i18n.t("login.hint_logout"), i18n.t("login.logout"), {
                showClose: false,
                customClass: `custom ${this.isDark ? "dark-theme" : "light-theme"}`,
            })
                .then(() => {
                    let _token = JSON.parse(localStorage.getItem("fiics-auth"))?.access_token;
                    let params = {
                        client_id: $GLOBAL_CLIENT_ID,
                        token: _token,
                        device_id: this.uuid,
                    };
                    $HTTP_logout(params).then(() => {
                        this.$store.commit(types.LOGOUT, JSON.stringify({}));
                        this.$destroy();
                        window.location.reload();
                        redirect();
                    });
                })
                .catch(() => {});
        },
        changeTheme(item) {
            let _isDark = item === i18n.t("general.dark");
            this.isDark = _isDark;
            this.$store.commit(types.DARKTHEME, _isDark);
        },
    },
};
</script>
<style scoped lang="scss">
.el-dropdown-menu {
    .el-dropdown-menu__item {
        height: 60px;
        line-height: 60px;
        font-size: 14px;
        color: #909399;
        display: flex;
        justify-content: center;
    }
    .el-dropdown-menu__item:hover {
        color: #303133;
    }
}
.header {
    height: 68px;
    padding: 16px;
    background: #d5e0ef;
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
            color: #525e69;
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
            display: inline-block;
            vertical-align: top;
            img {
                width: auto;
                max-height: 36px;
                vertical-align: middle;
            }
            .change-theme-icon {
                margin-top: 2px;
                font-size: 2rem;
                background: none;
                &:hover {
                    background: none;
                }
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
        background: #d5e0ef;
        box-sizing: border-box;
        padding-top: 16px;
        .el-menu {
            height: calc(100% - 30px);
            overflow: hidden;
            background: #d5e0ef;
            border-right: none;
        }
        .version {
            color: #525e69;
            font-size: 1rem;
            padding-left: 12px;
        }
    }
    .right-container {
        width: calc(100% - 208px);
        height: 100%;
        display: inline-block;
        background-color: #dce6f3;
        border-top-left-radius: 20px;
    }
}

.logout {
    padding: 0 5px;
}

.dropdown-menu {
    width: 200px;
}

.el-menu--collapse {
    width: inherit;
}

.el-menu-item.dark-theme {
    background: #2d3855;
    color: #ffffff;
}

.el-menu-item.dark-theme.is-active {
    color: #1e5eff;
}
</style>
