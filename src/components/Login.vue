<template>
    <div><i class="fa fa-spinner fa-spin"></i> Redirecting</div>
</template>
<script type="text/javascript">
import { $HTTP_login_auth, $HTTP_getUserInfo, $HTTP_getOrganizations } from "@/api/api";
import * as types from "@/store/types";
import redirect from "../router/redirect";
import { $GLOBAL_REDIRECT_URL, $GLOBAL_CLIENT_ID, $ALL_DATA_COUNT } from "@/utils/global";

export default {
    name: "Login",
    data() {
        return {
            code: "",
            isLoading: true,
            uuid: "",
            globalRedirectUrl: $GLOBAL_REDIRECT_URL
        };
    },
    beforeMount() {
        let redirectUrl = window.location.href;
        //   plus 5 as length of code= =>5
        let authorizationCode = redirectUrl.slice(redirectUrl.indexOf("code=") + 5);
        let tempURL = decodeURIComponent(authorizationCode).replace(/ /g, "+");
        this.code = tempURL;
        let uuidValue = localStorage.getItem("fiics-uuid");
        this.uuid = uuidValue;
    },
    mounted() {
        const _data = {
            grant_type: "authorization_code",
            client_id: $GLOBAL_CLIENT_ID,
            code: this.code.trim(),
            redirect_uri: this.globalRedirectUrl,
            device_id: this.uuid
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
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            }
        };
        $HTTP_login_auth(formBody, config)
            .then((res) => {
                window.localStorage.setItem("fiics-auth", JSON.stringify(res));
                // pass in the access token
                this.$store.commit(types.LOGIN, JSON.parse(window.localStorage.getItem("fiics-auth")).access_token);
            })
            .then(() => {
                $HTTP_getUserInfo()
                    .then((res) => {
                        let _data = res;
                        this.$store.dispatch("setUser", res);
                        // get organizations
                        let orgParams = {
                            page: 1,
                            limit: $ALL_DATA_COUNT
                        };
                        // if is not admin
                        if (_data.roles.indexOf("Admin") === -1 && _data.roles.indexOf("Super") === -1) {
                            orgParams.userId = res.id;
                        }
                        $HTTP_getOrganizations(orgParams)
                            .then((res) => {
                                let organizationList = res.data;
                                // if is admin
                                if (_data.roles.indexOf("Super") !== -1 || _data.roles.indexOf("Admin") !== -1) {
                                    this.$store.commit(types.ROLE, "Admin");
                                    this.$store.commit(types.UPDATE_PERMISSION, true);
                                    this.$router.push({ path: "/location" });
                                    // add all if is admin
                                    organizationList.unshift({ name: "All", id: '0', logo: null });
                                    this.$store.commit(types.UPDATE_ORGANIZATIONS, organizationList);
                                } else {
                                    if (organizationList.length >= 1) {
                                        this.$store.commit(types.ROLE, "Other");
                                        this.$store.commit(types.UPDATE_PERMISSION, true);
                                        this.$router.push({ path: "/location" });
                                        this.$store.commit(types.UPDATE_ORGANIZATIONS, organizationList);
                                    } else {
                                        this.$store.commit(types.ROLE, "Other");
                                        this.$store.commit(types.UPDATE_PERMISSION, false);
                                        this.$router.push({ path: "/contactadmin" });
                                        this.$store.commit(types.UPDATE_ORGANIZATIONS, organizationList);
                                    }
                                }
                            })
                            .catch((err) => {
                                console.log("organizationListErr", err);
                                this.$message({
                                    type: "warning",
                                    message: i18n.t("error_network")
                                });
                            });
                    })
                    .catch((e) => console.log(e));
            })
            .catch(() => {
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
    }
};
</script>

<style scoped>
div {
    display: flex;
    justify-content: center;
    font-size: 2rem;
}
</style>
