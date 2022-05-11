import store from '../store/store'
import * as types from '../store/types'
import router from '../router/index'
import { $GLOBAL_REDIRECT_URL, $GLOBAL_BASE_URL } from "@/utils/global"
const redirect = () => {
    let fiics_auth = JSON.parse(window.localStorage.getItem('fiics-auth'));
    let uuid = window.localStorage.getItem('uuid')
    let redirectURI = $GLOBAL_REDIRECT_URL;
    let url = `/gatekeeper/auth/authorize?response_type=code&client_id=gatekeeper&redirect_uri=${redirectURI}&device_id=${uuid}`
    if (fiics_auth === null) {
        store.commit(types.LOGOUT);
        window.location.replace(url);
    } else {
        let fiics_user = JSON.parse(window.localStorage.getItem('fiics-user'));
        let userRole = fiics_user.roles;
        if (userRole.indexOf("Super") !== -1 || userRole.indexOf("Admin") !== -1 || userRole.indexOf("Owner") !== -1) {
            router.push('/location');
        } else {
            router.push('/contactadmin');

        }

    }
}

export default redirect