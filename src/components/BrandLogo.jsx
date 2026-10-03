// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
export default function BrandLogo({ compact = false, className = "" }) {
  return (
    <span className={`brand-logo ${compact ? "brand-logo-compact" : ""} ${className}`.trim()}>
      <img src="./favicon.svg" alt="" className="brand-logo-mark" width="28" height="28" aria-hidden="true" />
      {!compact && <span className="logo-text">PyPath</span>}
    </span>
  );
}
