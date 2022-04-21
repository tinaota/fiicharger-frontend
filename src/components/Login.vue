<template>
    <div><i class="fa fa-spinner fa-spin"></i> Redirecting</div>
</template>
<script type="text/javascript">
import { $HTTP_login_auth } from "@/api/api";
import axios from "axios";
import * as types from "@/store/types";
import redirect from "../router/redirect";

export default {
    name: "Login",
    data() {
        return {
            code: "",
            isLoading: true,
            uuid: "",
        };
    },
    beforeMount() {
        let redirectUrl = window.location.href;
        //   plus 5 as length of code= =>5
        let authorizationCode = redirectUrl.slice(redirectUrl.indexOf("code=") + 5);
        let tempURL = decodeURIComponent(authorizationCode).replace(/ /g, "+");
        this.code = tempURL;
        let uuidValue = localStorage.getItem("uuid");
        this.uuid = uuidValue;
    },
    mounted() {
        const _data = {
            grant_type: "authorization_code",
            client_id: "gatekeeper",
            code: this.code.trim(),
            redirect_uri: process.env.VUE_APP_REDIRECT_URL,
            device_id: this.uuid,
        };
        
        var formBody = [];
        for (var property in _data) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(_data[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }

        formBody = formBody.join("&");
        let config = {
            header: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
        };
        $HTTP_login_auth(formBody, config)
            .then((res) => {
                window.sessionStorage.setItem("fiics-auth", JSON.stringify(res));
                // pass in the access token
                this.$store.commit(types.LOGIN, JSON.parse(window.sessionStorage.getItem("fiics-auth")).access_token);
            })
            .then(() => {
                axios
                    .get("/Gatekeeper/api/Users/user-info")
                    .then((res) => {
                        // console.log(res);
                        let _data = res?.data;
                        sessionStorage.setItem("fiics-user", JSON.stringify(_data));
                        if (_data.roles.indexOf("Super") != -1) {
                            this.$router.push({ path: "/location" });
                            this.$store.commit(types.ROLE, "Super");
                        } else if (_data.roles.indexOf("Admin") != -1) {
                            this.$router.push({ path: "/location" });
                            this.$store.commit(types.ROLE, "Admin");
                        } else if (_data.roles.indexOf("Owner") != -1) {
                            this.$router.push({ path: "/location" });
                            this.$store.commit(types.ROLE, "Owner");
                        } else {
                            this.$router.push({ path: "/contactadmin" });
                            this.$store.commit(types.ROLE, "Guest");
                        }
                    })
                    .catch((e) => console.log(e));
            })
            .catch((error) => {
                this.isLoading = false;
                this.$message({ type: "error", message: i18n.t("error_network") });
                this.$store.commit(types.LOGIN, null);
                this.$router.push({ path: "/404" });
            });

        // redirect if it a user is not logged in 5 seconds
        this.redirectTimeout = setTimeout(() => {
            redirect();
        }, 5000);
    },
    beforeDestroy() {
        if (this.redirectTimeout) {
            clearTimeout(this.redirectTimeout);
        }
    },
};
</script>

<style scoped>
div {
    display: flex;
    justify-content: center;
    font-size: 2rem;
}
</style>