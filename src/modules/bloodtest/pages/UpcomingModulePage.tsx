import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Navbar, Footer } from '../components'
import UpcomingIcon from '../components/UpcomingIcon'
import { getUpcomingModuleContent } from '../data/upcomingModuleContent'
import { bloodTestPath } from '../utils/routes'
import { findUpcomingModule, upcomingPath } from '../utils/upcomingModules'

const NAV_LINKS = [
  { label: 'Tests', href: '/' },
  { label: 'Packages', href: '/packages' },
  { label: 'Reports', href: '/reports' },
  { label: 'Metrics', href: '/metrics' },
  { label: 'Orders', href: '/orders' },
]

export default function UpcomingModulePage({ cartCount }: { cartCount?: number }) {
  const navigate = useNavigate()
  const { moduleSlug } = useParams<{ moduleSlug: string }>()
  const module = findUpcomingModule(moduleSlug)

  if (!module) return <Navigate to={upcomingPath('genetic-testing')} replace />

  const content = getUpcomingModuleContent(module.slug)
  const hasImage = Boolean(content.image)

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Poppins, sans-serif' }}>
      <style>
        {`
          .upcoming-module-main {
            background:
              linear-gradient(180deg, #FFFFFF 0%, #FAFAFF 48%, #F5F3FF 100%);
            padding: clamp(44px, 8vw, 84px) clamp(18px, 4vw, 32px);
          }

          .upcoming-module-shell {
            width: min(1120px, 100%);
            margin: 0 auto;
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: clamp(30px, 5vw, 58px);
            align-items: center;
          }

          .upcoming-module-shell--media {
            grid-template-columns: minmax(0, 0.92fr) minmax(340px, 0.82fr);
          }

          .upcoming-module-copy {
            display: flex;
            flex-direction: column;
            gap: clamp(18px, 2.8vw, 28px);
            max-width: 680px;
          }

          .upcoming-module-shell--plain .upcoming-module-copy {
            margin: 0 auto;
            text-align: center;
            align-items: center;
          }

          .upcoming-module-kicker {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            width: fit-content;
            padding: 8px 14px;
            border-radius: 999px;
            background: #FFFFFF;
            border: 1px solid #E7E1FF;
            color: #8B5CF6;
            box-shadow: 0 10px 35px rgba(139, 92, 246, 0.12);
            font-size: 13px;
            font-weight: 600;
            line-height: 1.2;
          }

          .upcoming-module-icon {
            width: 72px;
            height: 72px;
            border-radius: 24px;
            background: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #E7E1FF;
            box-shadow: 0 16px 45px rgba(139, 92, 246, 0.16);
          }

          .upcoming-module-title {
            margin: 0;
            color: #101129;
            font-size: clamp(34px, 7vw, 62px);
            line-height: 1.04;
            font-weight: 500;
            letter-spacing: -0.03em;
          }

          .upcoming-module-description {
            margin: 0;
            color: #6B7280;
            font-size: clamp(16px, 2vw, 19px);
            line-height: 1.72;
            font-weight: 400;
          }

          .upcoming-module-discover {
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: 100%;
          }

          .upcoming-module-discover-title {
            margin: 0;
            color: #101129;
            font-size: clamp(18px, 2.5vw, 22px);
            font-weight: 500;
            line-height: 1.35;
          }

          .upcoming-module-list {
            list-style: none;
            margin: 0;
            padding: 0;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px 14px;
          }

          .upcoming-module-shell--plain .upcoming-module-list {
            text-align: left;
          }

          .upcoming-module-list li {
            display: grid;
            grid-template-columns: 22px minmax(0, 1fr);
            gap: 9px;
            align-items: start;
            color: #6B7280;
            font-size: 14px;
            line-height: 1.55;
          }

          .upcoming-module-check {
            width: 22px;
            height: 22px;
            border-radius: 999px;
            background: #EDE9FE;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #8B5CF6;
            margin-top: 1px;
          }

          .upcoming-module-media {
            position: relative;
            min-height: clamp(320px, 44vw, 520px);
            border-radius: 24px;
            border: 1px solid #E7E1FF;
            background: #FFFFFF;
            box-shadow: 0 24px 75px rgba(139, 92, 246, 0.16);
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .upcoming-module-media img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
            padding: clamp(12px, 2.4vw, 22px);
            box-sizing: border-box;
          }

          @media (max-width: 900px) {
            .upcoming-module-shell,
            .upcoming-module-shell--media {
              grid-template-columns: 1fr;
            }

            .upcoming-module-shell--plain .upcoming-module-copy,
            .upcoming-module-copy {
              align-items: flex-start;
              text-align: left;
            }

            .upcoming-module-list {
              grid-template-columns: 1fr;
            }

            .upcoming-module-media {
              min-height: 280px;
              border-radius: 18px;
            }
          }
        `}
      </style>
      <Navbar
        logoSrc="/favicon.svg"
        logoAlt="Nucleotide"
        links={NAV_LINKS}
        ctaLabel="My Cart"
        cartCount={cartCount}
        hideSearchOnMobile
        onCtaClick={() => navigate(bloodTestPath('cart'))}
      />
      <main className="upcoming-module-main">
        <section className={`upcoming-module-shell ${hasImage ? 'upcoming-module-shell--media' : 'upcoming-module-shell--plain'}`}>
          <div className="upcoming-module-copy">
            <div className="upcoming-module-icon">
              <UpcomingIcon icon={module.icon} size={46} />
            </div>

            <div className="upcoming-module-kicker">
              <span>Coming soon</span>
            </div>

            <div>
              <h1 className="upcoming-module-title">{content.title}</h1>
              <p className="upcoming-module-description" style={{ marginTop: 16 }}>
                {content.description}
              </p>
            </div>

            <div className="upcoming-module-discover">
              <p className="upcoming-module-discover-title">{content.discoverLabel}</p>
              <ul className="upcoming-module-list">
                {content.bullets.map(item => (
                  <li key={item}>
                    <span className="upcoming-module-check" aria-hidden="true">
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                        <path d="M1.5 5.2 4.5 8 10.5 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {content.image && (
            <div className="upcoming-module-media">
              <img src={content.image} alt={content.imageAlt ?? content.title} />
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
