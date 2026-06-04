export default function OrdersLoadingAnimation() {
  return (
    <div className="orders-loader" role="status" aria-live="polite" aria-label="Loading orders">
      <style>
        {`
          .orders-loader {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 14px;
            width: 100%;
            min-height: clamp(360px, 46vh, 560px);
            padding: clamp(28px, 5vw, 56px) 0;
            color: #6D28D9;
            font-family: Poppins, sans-serif;
            text-align: center;
          }

          .orders-loader__stage {
            width: clamp(116px, 17vw, 154px);
            aspect-ratio: 1;
            position: relative;
            display: grid;
            place-items: center;
          }

          .orders-loader__svg {
            width: 100%;
            height: 100%;
            overflow: visible;
            filter: drop-shadow(0 18px 34px rgba(139, 92, 246, 0.18));
          }

          .orders-loader__halo {
            transform-origin: 50px 50px;
            animation: orders-loader-breathe 2.6s ease-in-out infinite;
          }

          .orders-loader__orbit {
            transform-origin: 50px 50px;
            animation: orders-loader-spin 4.8s linear infinite;
          }

          .orders-loader__spark {
            transform-origin: 50px 50px;
            animation: orders-loader-spark 1.8s ease-in-out infinite;
          }

          .orders-loader__spark--two {
            animation-delay: 0.55s;
          }

          .orders-loader__spark--three {
            animation-delay: 1.1s;
          }

          .orders-loader__glyph {
            opacity: 0;
            transform-box: fill-box;
            transform-origin: center;
            animation: orders-loader-cycle 9.6s ease-in-out infinite;
          }

          .orders-loader__glyph--dna { animation-delay: 0s; }
          .orders-loader__glyph--flask { animation-delay: 1.6s; }
          .orders-loader__glyph--box { animation-delay: 3.2s; }
          .orders-loader__glyph--home { animation-delay: 4.8s; }
          .orders-loader__glyph--bike { animation-delay: 6.4s; }
          .orders-loader__glyph--report { animation-delay: 8s; }

          .orders-loader__label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: clamp(15px, 2vw, 18px);
            line-height: 1.35;
            font-weight: 500;
            color: #6D28D9;
          }

          .orders-loader__dots {
            display: inline-flex;
            gap: 4px;
            transform: translateY(2px);
          }

          .orders-loader__dots span {
            width: 5px;
            height: 5px;
            border-radius: 999px;
            background: #8B5CF6;
            animation: orders-loader-dot 1.2s ease-in-out infinite;
          }

          .orders-loader__dots span:nth-child(2) { animation-delay: 0.18s; }
          .orders-loader__dots span:nth-child(3) { animation-delay: 0.36s; }

          @keyframes orders-loader-cycle {
            0%, 13% {
              opacity: 1;
              transform: scale(1) rotate(0deg);
            }
            18%, 100% {
              opacity: 0;
              transform: scale(0.9) rotate(8deg);
            }
          }

          @keyframes orders-loader-breathe {
            0%, 100% {
              transform: scale(0.94);
              opacity: 0.78;
            }
            50% {
              transform: scale(1.04);
              opacity: 1;
            }
          }

          @keyframes orders-loader-spin {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes orders-loader-spark {
            0%, 100% {
              opacity: 0.35;
              transform: scale(0.72);
            }
            45% {
              opacity: 1;
              transform: scale(1.16);
            }
          }

          @keyframes orders-loader-dot {
            0%, 100% {
              opacity: 0.32;
              transform: translateY(0);
            }
            45% {
              opacity: 1;
              transform: translateY(-4px);
            }
          }

          @media (max-width: 640px) {
            .orders-loader {
              min-height: min(420px, calc(100vh - 250px));
              padding: 28px 0 36px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .orders-loader__halo,
            .orders-loader__orbit,
            .orders-loader__spark,
            .orders-loader__glyph,
            .orders-loader__dots span {
              animation: none;
            }

            .orders-loader__glyph--dna {
              opacity: 1;
              transform: none;
            }
          }
        `}
      </style>

      <div className="orders-loader__stage" aria-hidden="true">
        <svg className="orders-loader__svg" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="ordersLoaderMain" x1="20" y1="18" x2="78" y2="84" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A78BFA" />
              <stop offset="1" stopColor="#6D28D9" />
            </linearGradient>
            <linearGradient id="ordersLoaderSoft" x1="22" y1="16" x2="82" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F5F3FF" />
              <stop offset="1" stopColor="#E9D5FF" />
            </linearGradient>
          </defs>

          <circle className="orders-loader__halo" cx="50" cy="50" r="42" fill="url(#ordersLoaderSoft)" />
          <circle cx="50" cy="50" r="35" fill="#FFFFFF" stroke="#DDD6FE" strokeWidth="2" />
          <g className="orders-loader__orbit">
            <circle className="orders-loader__spark" cx="50" cy="10" r="3.4" fill="#8B5CF6" />
            <circle className="orders-loader__spark orders-loader__spark--two" cx="82" cy="63" r="2.8" fill="#41C9B3" />
            <circle className="orders-loader__spark orders-loader__spark--three" cx="20" cy="67" r="2.6" fill="#A78BFA" />
          </g>

          <g className="orders-loader__glyph orders-loader__glyph--dna" stroke="url(#ordersLoaderMain)" strokeWidth="4.2" strokeLinecap="round">
            <path d="M37 25c18 8 28 24 28 50" />
            <path d="M63 25C45 33 35 49 35 75" />
            <path d="M42 34h16" stroke="#41C9B3" strokeWidth="3.4" />
            <path d="M39 45h22" stroke="#C4B5FD" strokeWidth="3.4" />
            <path d="M39 57h22" stroke="#41C9B3" strokeWidth="3.4" />
            <path d="M42 68h16" stroke="#C4B5FD" strokeWidth="3.4" />
          </g>

          <g className="orders-loader__glyph orders-loader__glyph--flask" stroke="url(#ordersLoaderMain)" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M43 24h14" />
            <path d="M46 24v18L34 68a6 6 0 0 0 5.4 8.5h21.2A6 6 0 0 0 66 68L54 42V24" />
            <path d="M39 63h22" stroke="#41C9B3" />
            <circle cx="47" cy="69" r="2.4" fill="#A78BFA" stroke="none" />
          </g>

          <g className="orders-loader__glyph orders-loader__glyph--box" stroke="url(#ordersLoaderMain)" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M29 42 50 30l21 12v24L50 78 29 66V42Z" fill="#F5F3FF" />
            <path d="m29 42 21 12 21-12" />
            <path d="M50 54v24" />
            <path d="m39 36 21 12" stroke="#41C9B3" />
          </g>

          <g className="orders-loader__glyph orders-loader__glyph--home" stroke="url(#ordersLoaderMain)" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M28 49 50 30l22 19" />
            <path d="M33 47v27h13V60h8v14h13V47" fill="#F5F3FF" />
            <path d="M42 74h16" stroke="#41C9B3" />
          </g>

          <g className="orders-loader__glyph orders-loader__glyph--bike" stroke="url(#ordersLoaderMain)" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M32 68a7 7 0 1 0 14 0 7 7 0 0 0-14 0Z" fill="#F5F3FF" />
            <path d="M58 68a7 7 0 1 0 14 0 7 7 0 0 0-14 0Z" fill="#F5F3FF" />
            <path d="M39 67h12l7-12h-9" />
            <path d="M58 55h7l6 13" />
            <path d="M46 50h8" stroke="#41C9B3" />
            <path d="M52 67h6" />
          </g>

          <g className="orders-loader__glyph orders-loader__glyph--report" stroke="url(#ordersLoaderMain)" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M35 25h23l9 9v41H35V25Z" fill="#F5F3FF" />
            <path d="M58 25v10h9" />
            <path d="M43 47h16" stroke="#41C9B3" />
            <path d="M43 57h14" />
            <path d="M43 67h9" />
          </g>
        </svg>
      </div>

      <div className="orders-loader__label">
        <span>Loading orders</span>
        <span className="orders-loader__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  )
}
