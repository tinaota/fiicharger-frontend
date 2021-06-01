const isPro = Object.is(process.env.NODE_ENV, 'production')
import { $GLOBAL_PROJECT } from '@/utils/global';
export default {
    isProduction: isPro,
    baseUrl: isPro ? '' : '/api',
    staticUrl: isPro ? '' : `/${$GLOBAL_PROJECT}`,
}