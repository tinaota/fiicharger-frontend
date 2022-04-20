import store from '../store/store'
import * as types from '../store/types'

const redirect = () => {
    store.commit(types.LOGOUT);
    let redirectURI = process.env.VUE_APP_REDIRECT_URL;
    let baseURI = process.env.VUE_APP_BASE_LOGIN_URL;
    let url = `${baseURI}/Gatekeeper/auth/authorize?response_type=code&client_id=gatekeeper&redirect_uri=${redirectURI}`
    window.location.replace(url);
}

export default redirect