import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const ICON_BG = "#0c0a08";
const ICON_EDGE = "#17110c";
const ICON_BONE = "#efe0c2";
const ICON_BONE_LIGHT = "#faf2e3";
const ICON_SHADOW = "#201710";
const ICON_AMBER = "#c9664e";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          borderRadius: "38px",
          background:
            `radial-gradient(circle at 32% 28%, rgba(201, 102, 78, 0.30) 0%, rgba(201, 102, 78, 0.12) 28%, ${ICON_BG} 72%)`,
          boxShadow: `0 0 0 1px ${ICON_EDGE} inset`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "14px",
            borderRadius: "30px",
            border: "1px solid rgba(239, 224, 194, 0.14)",
          }}
        />
        <svg
          width="124"
          height="124"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: "relative",
            zIndex: 1,
            overflow: "visible",
          }}
        >
          <defs>
            <linearGradient id="skull-fill" x1="16" y1="12" x2="46" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={ICON_BONE_LIGHT} />
              <stop offset="55%" stopColor={ICON_BONE} />
              <stop offset="100%" stopColor="#e1cfab" />
            </linearGradient>
          </defs>

          <circle cx="32" cy="31" r="22" fill="rgba(201, 102, 78, 0.10)" />
          <path
            d="M32 10C22.1 10 14 17.9 14 27.8C14 35.5 18.5 42.1 25.2 45.1V50C25.2 52.6 27.3 54.7 29.9 54.7H34.1C36.7 54.7 38.8 52.6 38.8 50V45.1C45.5 42.1 50 35.5 50 27.8C50 17.9 41.9 10 32 10Z"
            fill="url(#skull-fill)"
          />
          <path
            d="M20 26.2C20 22.4 22.8 19.4 26.5 19.4C29.7 19.4 32.1 21.3 33.1 24.1C32.1 25.3 30.6 26.2 28.4 26.9C26.4 27.5 24.1 27.8 20 26.2Z"
            fill={ICON_SHADOW}
            opacity="0.98"
          />
          <path
            d="M44 26.2C39.9 27.8 37.6 27.5 35.6 26.9C33.4 26.2 31.9 25.3 30.9 24.1C31.9 21.3 34.3 19.4 37.5 19.4C41.2 19.4 44 22.4 44 26.2Z"
            fill={ICON_SHADOW}
            opacity="0.98"
          />
          <path
            d="M28.2 31.2L32 26.4L35.8 31.2C36.2 31.7 36 32.5 35.4 32.8C34.4 33.4 33.3 33.7 32 33.7C30.7 33.7 29.6 33.4 28.6 32.8C28 32.5 27.8 31.7 28.2 31.2Z"
            fill={ICON_SHADOW}
          />
          <path
            d="M24.6 41.2V40.1C24.6 39.3 25.3 38.6 26.1 38.6H37.9C38.7 38.6 39.4 39.3 39.4 40.1V41.2C39.4 42 38.7 42.7 37.9 42.7H26.1C25.3 42.7 24.6 42 24.6 41.2Z"
            fill={ICON_SHADOW}
          />
          <path
            d="M25.8 44.8V42.6H28.6V44.8H25.8ZM29.8 44.8V42.6H32.6V44.8H29.8ZM33.8 44.8V42.6H36.6V44.8H33.8V44.8Z"
            fill={ICON_BONE_LIGHT}
            opacity="0.84"
          />
          <path
            d="M18.2 24.2C18.7 17.4 24.4 12.2 32 12.2C39.6 12.2 45.3 17.4 45.8 24.2"
            stroke={ICON_AMBER}
            strokeOpacity="0.22"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <path
            d="M22.4 49.8C25.1 51.5 28.4 52.4 32 52.4C35.6 52.4 38.9 51.5 41.6 49.8"
            stroke={ICON_AMBER}
            strokeOpacity="0.2"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
