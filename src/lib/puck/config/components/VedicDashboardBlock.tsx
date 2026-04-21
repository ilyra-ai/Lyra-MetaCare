import { ComponentConfig } from '@puckeditor/core';
import { VedicDashboard } from '@/components/dashboard/VedicDashboard';

export type VedicDashboardBlockProps = {
  featureEnabled: boolean;
};

export const VedicDashboardBlock: ComponentConfig<VedicDashboardBlockProps> = {
  fields: {
    featureEnabled: {
      type: 'radio',
      options: [
        { label: 'Ativado', value: true },
        { label: 'Desativado', value: false },
      ],
    },
  },
  defaultProps: {
    featureEnabled: true,
  },
  render: ({ featureEnabled }) => {
    return <VedicDashboard featureEnabled={featureEnabled} />;
  },
};
