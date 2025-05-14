import { BrandFacebook, FileText } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.check-uid-fb.title'),
  path: '/check-uid-fb',
  description: translate('tools.check-uid-fb.description'),
  keywords: ['text', 'statistics', 'length', 'characters', 'count', 'size', 'bytes'],
  component: () => import('./check-uid-fb.vue'),
  icon: BrandFacebook,
  redirectFrom: ['/text-stats'],
});
