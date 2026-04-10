import { Maximize2, Monitor, Smartphone, Tablet } from 'lucide-react';

/**
 * Viewports do editor Puck Lyra — Mobile, Tablet, Desktop e Wide.
 * O array é passado diretamente para o prop `viewports` do componente <Puck>.
 * Os ícones são instâncias React de Lucide que correspondem ao dispositivo.
 */
export const lyraPuckViewports = [
  {
    width: 390,
    label: 'Mobile',
    icon: <Smartphone size={14} />,
  },
  {
    width: 768,
    label: 'Tablet',
    icon: <Tablet size={14} />,
  },
  {
    width: 1280,
    label: 'Desktop',
    icon: <Monitor size={14} />,
  },
  {
    width: 1536,
    label: 'Wide',
    icon: <Maximize2 size={14} />,
  },
] as const;
