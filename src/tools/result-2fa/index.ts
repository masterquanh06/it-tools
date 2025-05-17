import { BrandFacebook } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
    name: 'Two-factor authentication',
    path: '/result-2fa',
    description: ' Adds extra security by requiring a second verification step after password login',
    keywords: ['facebook', 'uid', 'get', 'extract', 'user id'],
    component: () => import('./result-2fa.vue'),
    icon: BrandFacebook,
    redirectFrom: ['/2fa'],
});
