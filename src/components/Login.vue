<template>
    <div class="bg-container login" ref="loginContainer">
        <el-form
            :model="loginForm"
            :rules="loginRule"
            ref="loginForm"
            label-position="left"
            label-width="0px"
            class="demo-ruleForm login-container"
            status-icon>
            <div class="login-title">
                <img :src="fiiLogo"/>
            </div>
            <el-form-item prop="account" class="account">
                <el-input
                    type="text"
                    v-model="loginForm.account"
                    auto-complete="off"
                    :placeholder="$t('login.userName')"
                    @focus="handleFocus('acc', true)"
                    @blur="handleFocus('acc', false)">
                    <img slot="prefix" :src="!isFocusAcc ? accountImg: accountImg_n"/>
                </el-input>
            </el-form-item>
            <el-form-item prop="password" class="pwd">
                <el-input
                    type="password"
                    v-model="loginForm.password"
                    auto-complete="off"
                    :placeholder="$t('login.pwd')"
                    @focus="handleFocus('pwd', true)"
                    @blur="handleFocus('pwd', false)">
                    <img slot="prefix" :src="!isFocusPwd ? pwdImg: pwdImg_n"/>
                </el-input>
            </el-form-item>
            <el-form-item prop="captcha" class="captcha">
                <el-input
                    type="text"
                    v-model="loginForm.captcha"
                    auto-complete="off"
                    @keyup.enter.native="handleSubmitLogin">
                </el-input>
                <img id="auth-img" :src="captchaImg"/>
                <el-button class="no-bg refresh" @click="refreshCaptchaImg"></el-button>
            </el-form-item>
            <el-form-item prop="lang">
                <el-select
                    v-model="loginForm.lang"
                    @change="handleChangeLang">
                    <el-option v-for="(item, key) in langList" :key="key" :label="item" :value="key"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" class="loginBtn" :loading="isLoading" @click.native.prevent="handleSubmitLogin">{{$t('login.login')}}</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script type="text/javascript">
import * as types from "@/store/types";
import { $HTTP_login, $HTTP_getCaptcha } from "@/api/api";
import { $GLOBAL_LANG } from "@/utils/global";
import md5 from "js-md5";
// import p5 from 'libs/vanta/p5.min.js';
// import TOPOLOGY  from 'libs/vanta/vanta.topology.min.js';
import fiicharger_logo from 'imgs/fiicharger_logo.png';
import icon_account_p from 'imgs/icon_account_p.png';
import icon_account_n from 'imgs/icon_account_n.png';
import icon_password_p from 'imgs/icon_password_p.png';
import icon_password_n from 'imgs/icon_password_n.png';
export default {
    data() {
        return {
            langList: $GLOBAL_LANG,
            fiiLogo: fiicharger_logo,
            accountImg: icon_account_p,
            accountImg_n: icon_account_n,
            pwdImg: icon_password_p,
            pwdImg_n: icon_password_n,
            isLoading: false,
            isFocusAcc: false,
            isFocusPwd: false,
            loginForm: {
                account: "",
                password: "",
                lang: "en",
                captcha: ''
            },
            loginRule: {
                account: [{ required: true, message: i18n.t("login.pls_input_account"), trigger: "blur" }],
                password: [{ required: true, message: i18n.t("login.pls_input_pwd"), trigger: "blur" }],
                captcha: [{ required: true, message: i18n.t("login.pls_input_captcha"), trigger: "blur" }]
            },
            // vantaEffect: null,
            captchaImg: '',
            captchaTimer: null
        };
    },
    created() {
        let that = this;
    },
    mounted() {
        if (window.sessionStorage.getItem('fiics-lang')) {
            var lang = window.sessionStorage.getItem('fiics-lang');
            this.loginForm.lang = lang;
            this.$store.dispatch('setLang', this.loginForm.lang);
        }
        this.fetchCaptcha();
        this.setTimer();
        // this.vantaEffect = TOPOLOGY({
        //     el: this.$refs.loginContainer,
        //     mouseControls: true,
        //     touchControls: true,
        //     gyroControls: false,
        //     minHeight: 200.00,
        //     minWidth: 200.00,
        //     scale: 1.00,
        //     scaleMobile: 1.00,
        //     color: 0xf8fbff,
        //     backgroundColor: 0xcde8ff,
        //     p5: p5
        // });
    },
    beforeDestroy() {
        if (this.vantaEffect) {
            this.vantaEffect.destroy();
        }
        if (this.captchaTimer) {
            clearInterval(this.captchaTimer);
        }
    },
    methods: {
        handleSubmitLogin() {
            this.$refs.loginForm && this.$refs.loginForm.validate((isValid) => {
                if (isValid) {
                    this.isLoading = true;
                    const loginParams = {
                        account: this.loginForm.account,
                        password: this.loginForm.password,
                        lang: this.loginForm.lang,
                        captcha: this.loginForm.captcha
                    };
                    $HTTP_login(loginParams).then((data) => {
                        // console.log(data)
                        this.isLoading = false;
                        if (!data.success) {
                            if (data.code === 10012) {
                                this.refreshCaptchaImg();
                            }
                            this.$message({ type: "warning", message: this.loginForm.lang === 'en' ? data.message : data.reason });
                        } else {
                            let userData = {
                                accountInfo: data.accountInfo,
                                operatorList: data.operatorTypeInfo,
                                operatorId: parseInt(Object.keys(data.operatorTypeInfo)[0]) || 0
                            };
                            window.sessionStorage.setItem("fiics-token", md5(loginParams.account + " " + new Date().toString()));
                            window.sessionStorage.setItem("fiics-user", JSON.stringify(userData));
                            window.sessionStorage.setItem("fiics-lang", loginParams.lang);
                            this.$store.commit(types.LOGIN, window.sessionStorage.getItem("fiics-token"));
                            if (userData.accountInfo.accPermissionType !== 4) {
                                this.$router.push({ path: "/location" });
                            } else {
                                this.$router.push({ path: "/chargePoint" });
                            }
                        }
                    })
                    .catch((error) => {
                        this.isLoading = false;
                        console.log(error)
                        this.$message({ type: "error", message: i18n.t("error_network")});
                    });
                } else {
                    return false;
                }
            });
        },
        fetchCaptcha() {
            const that = this;
            $HTTP_getCaptcha().then((data) => {
                that.captchaImg = data;
            }).catch((err) => {
                console.log('getCaptcha', err);
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        handleChangeLang() {
            this.$store.dispatch('setLang', this.loginForm.lang);
        },
        handleFocus(type, isFocus) {
            if (type === 'acc') {
                this.isFocusAcc = isFocus;
            } else {
                this.isFocusPwd = isFocus;
            }
        },
        setTimer() {
            const that = this;
            this.captchaTimer = setInterval(() => {
                that.fetchCaptcha();
            }, 1000 * 55);
        },
        refreshCaptchaImg() {
            this.fetchCaptcha();
            clearInterval(this.captchaTimer);
            this.setTimer();
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
    // background-color: 0xcde8ff;
    background-image: url('~imgs/login_bg.jpg');
    background-color: transparent;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    .login-container {
        width: 30vw;
        max-width: 540px;
        height: 65vh;
        min-height: calc(12vh + 5.6vh + 390px);
        padding: 6vh 3.6vw;
        background: rgba(235,244,255,0.83);
        border: unset;
        position: absolute;
        top: 15vh;
        left: 35vw;
        box-sizing: border-box;
        border-radius: 10px;
        .login-title {
            text-align: center;
            margin-bottom: 5.6vh;
            img {
                width: 16.6vw;
                max-width: 318px;
                height: auto;
            }
        }
    }
}

.loginBtn.el-button {
    height: 40px;
    width: 100%;
    border: none;
    font-size: 0.9rem;
    color: #FFF;
    background: #007BFF;
    border-radius: 10px;
}
</style>