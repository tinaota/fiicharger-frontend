import { $GLOBAL_CLIENT_ID, $GLOBAL_REDIRECT_URL } from "@/utils/global"
import router from '../router/index'
import store from '../store/store'
import * as types from '../store/types'
const redirect = () => {
    let fiics_auth = JSON.parse(window.localStorage.getItem('fiics-auth'));
    let uuid = window.localStorage.getItem('fiics-uuid')
    let redirectURI = $GLOBAL_REDIRECT_URL;
    let url = `/gatekeeper/auth/authorize?response_type=code&client_id=${$GLOBAL_CLIENT_ID
        }&redirect_uri=${redirectURI}&device_id=${uuid}`
    if (fiics_auth === null) {
        store.commit(types.LOGOUT);
        window.location.replace(url);
    } else {
        let fiics_user = JSON.parse(window.localStorage.getItem("fiics-user"));
        store.dispatch("setUser", fiics_user);
        let userRole = fiics_user.roles;
        // for admin
        if (userRole.indexOf("Super") !== -1 || userRole.indexOf("Admin") !== -1) {
            router.push("/location");
        } else {
            // for other users
            let fiics_organization = JSON.parse(window.localStorage.getItem("fiics-organizationList"));
            if (fiics_organization.length >= 1) {
                router.push("/location");
            } else {
                router.push("/contactadmin");
            }
        }
    }
}

export default redirect
