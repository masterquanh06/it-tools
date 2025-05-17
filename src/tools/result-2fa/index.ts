import { translate } from '@/plugins/i18n.plugin';
import { BrandFacebook } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
    name: translate('tools.result-2fa.title'),
    path: '/result-2fa',
    description: translate('tools.result-2fa.description'),
    keywords: ['facebook', 'uid', 'get', 'extract', 'user id'],
    component: () => import('./result-2fa.vue'),
    icon: BrandFacebook,
    redirectFrom: ['/extract-uid'],
});
