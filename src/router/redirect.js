import store from '../store/store'
import * as types from '../store/types'

const redirect = () => {
    let fiics_auth = JSON.parse(window.localStorage.getItem('fiics-auth'));
    let uuid = window.localStorage.getItem('uuid')
    let redirectURI = process.env.VUE_APP_REDIRECT_URL;
    let baseURI = process.env.VUE_APP_BASE_LOGIN_URL;
    let url = `${baseURI}/Gatekeeper/auth/authorize?response_type=code&client_id=gatekeeper&redirect_uri=${redirectURI}&device_id=${uuid}`
    if (fiics_auth === null) {
        store.commit(types.LOGOUT);
        window.location.replace(url);
    } else {
        let fiics_user = JSON.parse(window.localStorage.getItem('fiics-user'));
        let userRole = fiics_user.roles;
        if (userRole.indexOf("Super") !== -1 || userRole.indexOf("Admin") !== -1 || userRole.indexOf("Owner") !== -1) {
            window.location.replace('/location');
        } else {
            window.location.replace('/contactadmin');

        }

    }
}

export default redirect