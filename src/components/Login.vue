<template>
    <div class="bg-container login" ref="loginContainer">
        <!-- <el-form
            :model="loginForm"
            :rules="loginRule"
            ref="loginForm"
            label-position="left"
            label-width="0px"
            class="demo-ruleForm login-container specBorder"
            status-icon>
            <div class="login-tab-title">
                <div class="logo"><img :src="fiiLogo"/></div>
            </div>
            <el-form-item prop="account">
                <el-input
                    type="text"
                    v-model="loginForm.account"
                    auto-complete="off"
                    :placeholder="$t('login.pls_input_account')">
                    <img slot="prefix" :src="accountImg"/>
                </el-input>
            </el-form-item>
            <el-form-item prop="checkPwd">
                <el-input
                    type="password"
                    v-model="loginForm.checkPwd"
                    auto-complete="off"
                    :placeholder="$t('login.pls_input_pwd')"
                    @keyup.enter.native="handleSubmitLogin">
                    <img slot="prefix" :src="pwdImg"/>
                </el-input>
            </el-form-item>
            <el-form-item prop="lang">
                <el-select
                    :popper-append-to-body="false"
                    v-model="loginForm.lang"
                    @change="handleChangeLang"
                    class="select-style"
                    popper-class="select-popper">
                    <el-option v-for="(item, key) in langList" :key="key" :label="item" :value="key"></el-option>
                </el-select>
            </el-form-item>
            <el-checkbox v-model="checked" checked class="remember">{{$t('login.remember_data')}}</el-checkbox>
            <el-form-item>
                <el-button type="primary" class="loginBtn" :loading="isLoading" @click.native.prevent="handleSubmitLogin">{{$t('login.login')}}</el-button>
            </el-form-item>
        </el-form> -->
    </div>
</template>

<script type="text/javascript">
// import * as types from "@/store/types";
// import { $HTTP_Login } from "@/api/api";
import { $GLOBAL_LANG } from "@/utils/global";
import md5 from "js-md5";
import THREE from 'libs/vanta/three.min.js';
// import p5 from 'libs/vanta/p5.min.js';
import TOPOLOGY  from 'libs/vanta/vanta.topology.min.js';
export default {
    data() {
        return {
            langList: $GLOBAL_LANG,
            fiiLogo: require("imgs/fiicharger_logo.png"),
            accountImg: require("imgs/icon_account_p.png"),
            pwdImg: require("imgs/icon_password_p.png"),
            isLoading: false,
            loginForm: {
                account: "",
                checkPwd: "",
                lang: "en",
            },
            loginRule: {
                account: [{ required: true, message: i18n.t("login.pls_input_account"), trigger: "blur" }],
                checkPwd: [{ required: true, message: i18n.t("login.pls_input_pwd"), trigger: "blur" }]
            },
            vantaEffect: null
            // checked: true,
        };
    },
    created() {
        let vm = this;
        document.onkeydown = function (e) {
            let _key = window.event.keyCode;
            if (_key === 13) {
                vm.handleSubmitLogin();
            }
        };
    },
    mounted() {
        if (window.sessionStorage.getItem('fiics-lang')) {
            var lang = window.sessionStorage.getItem('fiics-lang');
            this.loginForm.lang = lang;
            this.$store.dispatch('setLang', this.loginForm.lang);
        }
        this.vantaEffect = TOPOLOGY({
            el: this.$refs.loginContainer,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0xf8fbff,
            backgroundColor: 0xcde8ff,
            // p5: p5,
            THREE: THREE
        });
        // this.getCookie();
    },
    beforeDestroy() {
        if (this.vantaEffect) {
            this.vantaEffect.destroy();
        }
    },
    methods: {
        /*handleSubmitLogin(ev) {
            this.$refs.loginForm && this.$refs.loginForm.validate((isValid) => {
                if (isValid) {
                    // if (this.checked == true) {
                    //     this.setCookie(this.loginForm.account, this.loginForm.checkPwd, this.loginForm.lang, 7);
                    // } else {
                    //     this.clearCookie();
                    // }
                    this.isLoading = true;
                    const loginParams = {
                        account: this.loginForm.account,
                        password: this.loginForm.checkPwd,
                        lang: this.loginForm.lang
                    };
                    $HTTP_Login(loginParams).then((data) => {
                        this.isLoading = false;
                        if (!data.success) {
                            this.$message({ type: "warning", message: that.loginForm.lang === 'en' ? data.message : data.reason });
                        } else {
                            let userData = {
                                accId: data.accountInfo.accId,
                                name: data.accountInfo.name,
                                permission: data.accountInfo.accPermissionId,
                                modifyFlag: data.accountInfo.modifyFlag
                            };
                            // window.sessionStorage.setItem("fiics-accId", userData.accId);
                            // window.sessionStorage.setItem("fiics-token", md5(userData.accId + " " + new Date().toString()));
                            window.sessionStorage.setItem("fiics-user", JSON.stringify(userData));
                            window.sessionStorage.setItem("fiics-lang", loginParams.lang);
                            this.$store.commit(types.LOGIN, window.sessionStorage.getItem("fiics-token"));
                            this.$store.commit(types.USER, window.sessionStorage.getItem("fiics-user"));
                            this.$router.push({ path: "/power" });
                        }
                    })
                    .catch((error) => {
                        this.isLoading = false;
                        this.$message({ type: "error", message: i18n.t("error_network")});
                    });
                } else {
                    return false;
                }
            });
        },*/
        /*setCookie(c_name, c_pwd, exdays) {
            var exdate = new Date();
            exdate.setTime(exdate.getTime() + 24 * 60 * 60 * 1000 * exdays);
            document.cookie = "fiics-userName" + "=" + c_name + ";path=/;expires=" + exdate.toGMTString();
            document.cookie = "fiics-userPwd" + "=" + c_pwd + ";path=/;expires=" + exdate.toGMTString();
        },
        getCookie: function () {
            if (document.cookie.length > 0) {
                var arr = document.cookie.split("; ");
                for (var i = 0; i < arr.length; i++) {
                    var arr2 = arr[i].split("=");
                    switch(arr2[0]) {
                        case 'fiics-userName':
                            this.loginForm.account = arr2[1];
                            break;
                        case 'fiics-userPwd':
                            this.loginForm.checkPwd = arr2[1];
                            break;
                    }
                }
            }
        },
        clearCookie: function () {
            this.setCookie("", "", -1);
        },*/
        handleChangeLang() {
            this.$store.dispatch('setLang', this.loginForm.lang);
        }
    }
};
</script>
<style lang="scss" scoped>
*{
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}
html, body{
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: #333;
    overflow: hidden;
}
.el-form .el-select {
    width: 100%;
}
.bg-container {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: 0xcde8ff;
    .login-container {
        background-clip: padding-box;
        width: 680px;
        height: 698px;
        padding: 75px 106px;
        opacity: 0.89;
        background: #131F4A;
        border: 2px solid #304180;
        position: absolute;
        top: calc(50% - 349px);
        left: calc(50% - 340px);

        .login-tab-title {
            text-align: center;
            .logo {
                display: flex;
                justify-content: center;
                img {
                    width: 90px;
                    height: 86px;
                }
            }
        }
        // .remember {
        //     margin-bottom: 90px;
        // }
    }
}

.loginBtn.el-button {
    height: 44px;
    width: 100%;
    border: none;
    background: -moz-linear-gradient(left, #3FD4FF 0%, #3478DC 100%);
    background: -webkit-linear-gradient(left, #3FD4FF 0%, #3478DC 100%);
    background: linear-gradient(left, #3FD4FF 0%, #3478DC 100%);
    clip-path: inset(0 round 2px);
    font-size: 1rem;
    letter-spacing: 0.57px;
}
// .remember {
//     .el-checkbox__input.is-checked .el-checkbox__inner, .el-checkbox__input.is-indeterminate .el-checkbox__inner {
//         background-color: rgba(82,107,227,1);
//         border-color: rgba(67,60,201,0.29);
//     }
// }
@media (max-width: 680px ) {
    .bg-container .login-container {
        width: 90%;
        height: 90%;
        padding: 5%;
        top: 5%;
        left: 5%;
    }
}
// @media (max-height: 600px ) {
//     .bg-container .login-container {
//         .remember {
//             margin-bottom: 2rem;
//         }
//     }
// }
</style>