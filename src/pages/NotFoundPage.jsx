import { Link } from 'react-router-dom';
import { PageHeading } from '../components/common/PageHeading';

/**
 * Calm 404 page for unmatched routes.
 */
export function NotFoundPage() {
  return (
    <section className="py-20 md:py-32">
      <div className="page-container">
        <PageHeading
          title="الصفحة دي مش موجودة"
          description="ممكن الرابط يكون اتغير أو اتكتب غلط. ارجع للرئيسية أو شوف الجرابات المتاحة دلوقتي."
        />
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Link to="/" className="btn-primary">
            ارجع للرئيسية
          </Link>
          <Link to="/categories" className="btn-secondary">
            شوف الجرابات
          </Link>
        </div>
      </div>
    </section>
  );
}
