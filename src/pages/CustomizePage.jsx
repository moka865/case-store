import { PageHeading } from '../components/common/PageHeading';
import { CaseCustomizer } from '../components/customizer/CaseCustomizer';

/**
 * Dedicated Customizer page (`/customize`):
 * Full-page studio room wrapping the existing reusable CaseCustomizer component.
 */
export function CustomizePage() {
  return (
    <div className="page-band-top">
      <div className="page-container">
        <PageHeading
          title="صمّم جرابك بنفسك"
          description="ارفع صورتك واكتب اسمك لو حابب. فريق التصميم عندنا بيظبط القص ومكان الكاميرا قبل الطباعة."
        />
      </div>
      <CaseCustomizer hideHeader />
    </div>
  );
}
