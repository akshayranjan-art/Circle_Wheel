import { useState } from "react";
import { BRAND_ICONS } from "@/lib/brand-icons";
import { ICON_PACKS, type LauncherIconPack } from "@/lib/wheel-apps";

export function PackGlyph({ pack, brand }: { pack: LauncherIconPack; brand: string }) {
  return <span className={`launcher-pack-sample launcher-icon-pack--${pack} ${ICON_PACKS.indexOf(pack) >= 10 ? "launcher-themed-pack" : ""}`}><span className="launcher-brand-glyph" style={{ maskImage: `url(${BRAND_ICONS[brand]})`, WebkitMaskImage: `url(${BRAND_ICONS[brand]})` }} /></span>;
}

export function IconPackPreview({ pack }: { pack: LauncherIconPack }) {
  const [rotation, setRotation] = useState(0);
  const brands = Object.keys(BRAND_ICONS);
  return <><div className="pack-orbit-preview" aria-label="Second and third circle live preview"><div className="pack-preview-ring pack-preview-ring--second" /><div className="pack-preview-ring pack-preview-ring--third" />{[20, 4].map((count, ring) => Array.from({ length: count }, (_, index) => {
    const angle = (index * 360 / count + rotation * (ring === 0 ? -1.2 : 1.6)) * Math.PI / 180;
    const radius = ring === 0 ? 42 : 20;
    return <span key={`${ring}-${index}`} className="pack-preview-position" style={{ left: `${50 + Math.cos(angle) * radius}%`, top: `${50 + Math.sin(angle) * radius}%` }}><PackGlyph pack={pack} brand={brands[index % brands.length] ?? "whatsapp"} /></span>;
  }))}</div><input aria-label="Rotate preview circles" type="range" min="0" max="360" value={rotation} onChange={(event) => setRotation(Number(event.target.value))} className="w-full accent-primary" /></>;
}