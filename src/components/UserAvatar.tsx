import { findPreset } from "@/lib/avatars";
import { DefaultAvatar } from "@/components/DefaultAvatar";

interface Props {
  value?: string | null;
  seed?: string | null;
  className?: string;
}

function Illustration({ kind, accent }: { kind: string; accent: string }) {
  const face = <><circle cx="38" cy="45" r="4" fill="#16202c" /><circle cx="62" cy="45" r="4" fill="#16202c" /><path d="M43 61 Q50 67 57 61" fill="none" stroke="#16202c" strokeWidth="3" strokeLinecap="round" /></>;
  const ears = <><path d="M25 32 L25 12 Q36 17 40 29" fill={accent} /><path d="M75 32 L75 12 Q64 17 60 29" fill={accent} /></>;
  const shapes: Record<string, React.ReactNode> = {
    moon: <><circle cx="50" cy="50" r="27" fill={accent} /><circle cx="61" cy="40" r="25" fill="#33466f" /></>,
    sun: <><circle cx="50" cy="50" r="23" fill={accent} />{[0,45,90,135,180,225,270,315].map((rotation) => <path key={rotation} d="M50 8 V19" stroke={accent} strokeWidth="5" strokeLinecap="round" transform={`rotate(${rotation} 50 50)`} />)}</>,
    popcorn: <><path d="M28 43 L72 43 L67 82 L33 82 Z" fill="#f5c46e" /><path d="M32 45 L40 78 M48 45 L50 80 M64 45 L59 78" stroke="#b94f4e" strokeWidth="7" /><circle cx="36" cy="38" r="12" fill={accent} /><circle cx="52" cy="34" r="14" fill={accent} /><circle cx="67" cy="39" r="11" fill={accent} /></>,
    ghost: <><path d="M25 75 V40 Q25 15 50 15 Q75 15 75 40 V75 L66 68 L58 75 L50 68 L42 75 L34 68 Z" fill={accent} />{face}</>,
    cat: <>{ears}<circle cx="50" cy="51" r="29" fill={accent} />{face}<path d="M50 52 l-4 4 h8z" fill="#9d5366" /></>,
    fox: <><path d="M22 25 L35 34 Q50 25 65 34 L78 25 L74 69 Q50 88 26 69Z" fill={accent} />{face}<path d="M50 54 L44 61 H56z" fill="#5e3428" /></>,
    panda: <><circle cx="50" cy="50" r="29" fill={accent} /><ellipse cx="35" cy="45" rx="9" ry="13" fill="#27303c" /><ellipse cx="65" cy="45" rx="9" ry="13" fill="#27303c" />{face}</>,
    alien: <><ellipse cx="50" cy="51" rx="29" ry="34" fill={accent} /><ellipse cx="38" cy="45" rx="7" ry="11" fill="#243447" /><ellipse cx="62" cy="45" rx="7" ry="11" fill="#243447" /><path d="M43 64 Q50 69 57 64" fill="none" stroke="#243447" strokeWidth="3" strokeLinecap="round" /></>,
    robot: <><rect x="24" y="25" width="52" height="52" rx="14" fill={accent} /><rect x="34" y="40" width="10" height="10" rx="3" fill="#243447" /><rect x="56" y="40" width="10" height="10" rx="3" fill="#243447" /><path d="M40 63 H60" stroke="#243447" strokeWidth="4" strokeLinecap="round" /><path d="M50 25 V15" stroke={accent} strokeWidth="4" /><circle cx="50" cy="12" r="4" fill={accent} /></>,
    rocket: <><path d="M50 16 Q78 34 64 67 L50 82 L36 67 Q22 34 50 16Z" fill={accent} /><circle cx="50" cy="42" r="8" fill="#314260" /><path d="M39 69 L30 79 M61 69 L70 79" stroke={accent} strokeWidth="6" strokeLinecap="round" /></>,
    wave: <><path d="M18 58 Q30 39 42 58 T66 58 T90 58 V82 H18Z" fill={accent} /><circle cx="50" cy="39" r="15" fill="#d5f6f0" /></>,
    flame: <><path d="M50 14 Q73 37 68 57 Q64 80 50 84 Q30 80 31 57 Q34 42 45 32 Q44 48 52 51 Q59 37 50 14Z" fill={accent} /></>,
    owl: <><circle cx="50" cy="52" r="31" fill={accent} /><circle cx="38" cy="47" r="13" fill="#39435e" /><circle cx="62" cy="47" r="13" fill="#39435e" /><circle cx="38" cy="47" r="5" fill="#f6d98b" /><circle cx="62" cy="47" r="5" fill="#f6d98b" /><path d="M50 55 L44 64 H56z" fill="#9e684b" /></>,
    bear: <><circle cx="31" cy="29" r="12" fill={accent} /><circle cx="69" cy="29" r="12" fill={accent} /><circle cx="50" cy="52" r="29" fill={accent} />{face}<ellipse cx="50" cy="59" rx="12" ry="9" fill="#eab985" /></>,
    frog: <><circle cx="35" cy="34" r="14" fill={accent} /><circle cx="65" cy="34" r="14" fill={accent} /><circle cx="50" cy="55" r="29" fill={accent} /><circle cx="36" cy="34" r="5" fill="#16202c" /><circle cx="64" cy="34" r="5" fill="#16202c" /><path d="M35 62 Q50 73 65 62" fill="none" stroke="#16202c" strokeWidth="3" /></>,
    tiger: <><circle cx="50" cy="51" r="30" fill={accent} />{face}<path d="M34 30 L42 39 M66 30 L58 39 M30 52 L43 53 M70 52 L57 53" stroke="#7b422b" strokeWidth="5" strokeLinecap="round" /></>,
    rabbit: <><path d="M36 35 Q26 12 37 8 Q48 15 47 36 M64 35 Q74 12 63 8 Q52 15 53 36" fill={accent} /><circle cx="50" cy="53" r="28" fill={accent} />{face}</>,
    whale: <><path d="M18 54 Q25 25 57 30 Q79 33 80 56 Q80 77 54 80 Q27 82 18 63Z" fill={accent} /><circle cx="65" cy="47" r="3" fill="#16202c" /><path d="M48 30 Q48 14 55 10 M54 30 Q65 18 69 18" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" /></>,
  };
  return <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">{shapes[kind] ?? shapes.moon}</svg>;
}

export function UserAvatar({ value, seed, className = "" }: Props) {
  const preset = findPreset(value);
  if (preset) return <span className={`grid place-items-center overflow-hidden rounded-full ring-1 ring-foreground/15 ${className}`} style={{ background: `linear-gradient(150deg, ${preset.from}, ${preset.to})` }}><Illustration kind={preset.kind} accent={preset.accent} /></span>;
  if (value) return <span className={`block overflow-hidden rounded-full ring-1 ring-foreground/15 ${className}`}><img src={value} alt="" className="h-full w-full object-cover" /></span>;
  return <DefaultAvatar seed={seed} className={className} />;
}
