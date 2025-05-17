import { BrandFacebook } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
    name: ('Get id Facebook'),
    path: '/get-uid-fb',
    description: (' Retrieves user ID from Firebase or Facebook for authentication'),
    keywords: ['facebook', 'uid', 'get', 'extract', 'user id'],
    component: () => import('./get-uid-fb.vue'),
    icon: BrandFacebook,
    redirectFrom: ['/extract-uid'],
});
