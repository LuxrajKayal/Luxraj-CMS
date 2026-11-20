import mark from '../../../Luxraj-App-Icon.svg?url';
import './brand.css';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? 'luxraj-brand luxraj-brand--compact' : 'luxraj-brand'}>
      <img src={mark} alt={compact ? 'Luxraj CMS' : ''} width={36} height={36} />
      {!compact && <strong>Luxraj CMS</strong>}
    </span>
  );
}
