import { translate } from '@/plugins/i18n.plugin';
import { BrandFacebook } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
    name: translate('tools.get-uid-fb.title'),
    path: '/get-uid-fb',
    description: translate('tools.get-uid-fb.description'),
    keywords: ['facebook', 'uid', 'get', 'extract', 'user id'],
    component: () => import('./get-uid-fb.vue'),
    icon: BrandFacebook,
    redirectFrom: ['/extract-uid'],
});
