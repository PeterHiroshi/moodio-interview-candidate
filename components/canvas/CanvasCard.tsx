import Image from 'next/image';
import { Copy } from 'lucide-react';
import type { CanvasCard as Card } from '@/lib/redux/services/canvasApi';

export function CanvasCard({ card, onCopy }: { card: Card; onCopy: (id: string) => void }) {
  return (
    <article className="card">
      <Image className="card-image" src={card.image} alt="" width={400} height={300} unoptimized />
      <div className="card-footer">
        <div className="min-w-0">
          <div className="card-title">{card.title}</div>
          <div className="card-subtitle">IMAGE · DIRECTION</div>
        </div>
        <button type="button" className="copy-button" aria-label={`Copy ${card.title}`} onClick={() => onCopy(card.id)}>
          <Copy aria-hidden="true" size={14} /> Copy
        </button>
      </div>
    </article>
  );
}
