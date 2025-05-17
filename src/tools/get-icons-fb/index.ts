import { BrandFacebook } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
    name: ('Get icons Facebook'),
    path: '/get-icons-fb',
    description: (' Retrieves Facebook reaction icons'),
    keywords: ['facebook', 'icons', 'reaction', 'emoji', 'fb icons'],
    component: () => import('./get-icons-fb.vue'),
    icon: BrandFacebook,
    redirectFrom: ['/fb-icons', '/facebook-icons'],
});
