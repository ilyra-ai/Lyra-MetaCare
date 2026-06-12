import fs from 'fs';

const pages = [
  { file: 'src/app/onboarding/page.tsx', key: 'onboarding' },
  { file: 'src/app/profile/page.tsx', key: 'profile' },
  { file: 'src/app/appointments/page.tsx', key: 'appointments' },
  { file: 'src/app/monitoring/page.tsx', key: 'monitoring' },
  { file: 'src/app/chat/page.tsx', key: 'chat' },
  { file: 'src/app/connect/page.tsx', key: 'connect' },
  { file: 'src/app/goals/page.tsx', key: 'goals' },
  { file: 'src/app/instruments/page.tsx', key: 'instruments' },
  { file: 'src/app/billing/success/page.tsx', key: 'billing-success' },
  { file: 'src/app/billing/cancel/page.tsx', key: 'billing-cancel' },
  { file: 'src/app/admin/dashboard/page.tsx', key: 'admin-dashboard' },
  { file: 'src/app/admin/users/page.tsx', key: 'admin-users' },
  { file: 'src/app/admin/plans/page.tsx', key: 'admin-plans' },
  { file: 'src/app/admin/reports/page.tsx', key: 'admin-reports' },
  { file: 'src/app/admin/data-health/page.tsx', key: 'admin-data-health' },
  { file: 'src/app/admin/content/page.tsx', key: 'admin-content' },
  { file: 'src/app/admin/ai-config/page.tsx', key: 'admin-ai-config' },
  { file: 'src/app/admin/page-builder/page.tsx', key: 'admin-page-builder' },
];

for (const p of pages) {
  if (!fs.existsSync(p.file)) {
    console.warn('File not found:', p.file);
    continue;
  }
  let content = fs.readFileSync(p.file, 'utf8');
  if (content.includes('PuckClientRenderer')) continue;

  const importStatement =
    "import { PuckClientRenderer } from '@/components/puck/PuckClientRenderer';\n";
  const lastImportIndex = content.lastIndexOf('import ');
  const nextLineIndex = content.indexOf('\n', lastImportIndex) + 1;
  content =
    content.slice(0, nextLineIndex) +
    importStatement +
    content.slice(nextLineIndex);

  if (content.includes('<Header />')) {
    content = content.replace(
      '<Header />',
      `<Header />\n        <PuckClientRenderer documentKey="${p.key}" className="w-full flex-shrink-0" />`
    );
  } else if (content.includes('<main')) {
    const mainMatch = content.match(/<main[^>]*>/);
    if (mainMatch) {
      content = content.replace(
        mainMatch[0],
        `${mainMatch[0]}\n        <PuckClientRenderer documentKey="${p.key}" className="w-full flex-shrink-0" />`
      );
    }
  } else {
    const returnRegex = /return\s*\(\s*(<div[^>]*>|<React.Fragment>|<>)/;
    const returnMatch = content.match(returnRegex);
    if (returnMatch) {
      content = content.replace(
        returnMatch[0],
        `${returnMatch[0]}\n        <PuckClientRenderer documentKey="${p.key}" className="w-full flex-shrink-0" />`
      );
    }
  }

  fs.writeFileSync(p.file, content, 'utf8');
  console.log(`Injected PuckClientRenderer into ${p.key} (${p.file})`);
}
console.log('Process completed!');
