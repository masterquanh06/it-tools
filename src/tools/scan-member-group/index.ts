import { BrandFacebook } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
    name: 'Scan member group',
    path: '/scan-member-group',
    description: 'Scan member group',
    keywords: ['facebook', 'uid', 'get', 'extract', 'user id'],
    component: () => import('./scan-member-group.vue'),
    icon: BrandFacebook,
    redirectFrom: ['/scan-member-group'],
});
