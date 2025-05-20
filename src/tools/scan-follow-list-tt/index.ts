import { BrandTiktok } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
    name: 'Scan follow list tiktok',
    path: '/scan-follow-list-tt',
    description: 'Scan follow list tiktok',
    keywords: ['tiktok', 'uid', 'get', 'extract', 'user id'],
    component: () => import('./scan-follow-list-tt.vue'),
    icon: BrandTiktok,
    redirectFrom: ['/scan-follow-list-tt'],
});
