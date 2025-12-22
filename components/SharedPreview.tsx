
import React from 'react';
import { ChatMessagePayload, CardV2 } from '../types';

const SharedPreview: React.FC<{ payload: ChatMessagePayload }> = ({ payload }) => {
  if (!payload) return null;

  if (payload.text) {
    return <div className="whitespace-pre-wrap p-3 text-xs text-slate-400 font-medium leading-relaxed">{payload.text}</div>;
  }

  if (payload.cards) {
    return (
      <div className="flex flex-col gap-3">
        {payload.cards.map((card, cardIndex) => (
          <div key={cardIndex} className="preview-card border border-white/5 rounded-2xl overflow-hidden bg-slate-900 shadow-xl w-full text-[11px]">
            {card.header && (
              <div className="card-header p-4 bg-white/5 border-b border-white/5">
                {card.header.title && <strong className="font-black block text-slate-100 tracking-tight">{card.header.title}</strong>}
                {card.header.subtitle && <span className="text-[10px] text-indigo-400 font-bold block mt-0.5">{card.header.subtitle}</span>}
                {card.header.imageUrl && <img src={card.header.imageUrl} alt="Header" className="w-full rounded-xl mt-3 border border-white/5" />}
              </div>
            )}
            {card.sections?.map((section, secIndex) => (
              <div key={secIndex} className="section p-4 flex flex-col gap-3">
                {section.widgets.map((widget, widIndex) => (
                  <div key={widIndex}>
                    {widget.textParagraph && <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">{widget.textParagraph.text}</p>}
                    {widget.image && <img src={widget.image.imageUrl} alt="Card content" className="max-w-full rounded-xl border border-white/5" />}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {widget.buttonList?.buttons.map((btn, btnIndex) => (
                        <div key={btnIndex} className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 font-black text-[9px] border border-indigo-500/20 uppercase tracking-widest">
                            {btn.textButton.text}
                        </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (payload.cardsV2) {
      return (
          <div className="flex flex-col gap-3">
              {payload.cardsV2.map((cardV2Item: CardV2, index: number) => (
                  <div key={index} className="preview-card border border-white/5 rounded-2xl overflow-hidden bg-slate-900 shadow-xl w-full text-[11px]">
                      {cardV2Item.card.header && (
                          <div className="card-header p-4 bg-white/5 border-b border-white/5">
                              {cardV2Item.card.header.title && <strong className="font-black block text-slate-100 tracking-tight">{cardV2Item.card.header.title}</strong>}
                              {cardV2Item.card.header.subtitle && <span className="text-[10px] text-teal-400 font-bold block mt-0.5">Poll Card</span>}
                          </div>
                      )}
                      {cardV2Item.card.sections.map((section, secIndex) => (
                          <div key={secIndex} className="section p-4 flex flex-col gap-2">
                              {section.widgets.map((widget, widIndex) => (
                                  <div key={widIndex} className="rounded-xl bg-white/5 p-3 text-slate-300 font-bold border border-white/5">
                                      {widget.decoratedText.text}
                                  </div>
                              ))}
                          </div>
                      ))}
                  </div>
              ))}
          </div>
      );
  }

  return null;
};

export default SharedPreview;
