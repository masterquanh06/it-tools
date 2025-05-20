import { BrandTiktok } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
    name: 'Scan comment list tiktok',
    path: '/scan-comment-list-tt',
    description: 'Scan comment list tiktok',
    keywords: ['tiktok', 'uid', 'get', 'extract', 'user id'],
    component: () => import('./scan-comment-list-tt.vue'),
    icon: BrandTiktok,
    redirectFrom: ['/scan-comment-list-tt'],
});
