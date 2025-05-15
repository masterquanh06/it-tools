import { translate } from '@/plugins/i18n.plugin';
import { BrandFacebook } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
    name: translate('tools.get-icons-fb.title'),
    path: '/get-icons-fb',
    description: translate('tools.get-icons-fb.description'),
    keywords: ['facebook', 'icons', 'reaction', 'emoji', 'fb icons'],
    component: () => import('./get-icons-fb.vue'),
    icon: BrandFacebook,
    redirectFrom: ['/fb-icons', '/facebook-icons'],
});
