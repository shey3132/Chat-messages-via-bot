import React from 'react';
import { ChatMessagePayload, CardV2 } from '../types';

const SharedPreview: React.FC<{ payload: ChatMessagePayload }> = ({ payload }) => {
  if (!payload) return null;

  if (payload.text) {
    return <div className="whitespace-pre-wrap p-4 text-sm">{payload.text}</div>;
  }

  if (payload.cards) {
    return (
      <div className="flex flex-col gap-2">
        {payload.cards.map((card, cardIndex) => (
          <div key={cardIndex} className="preview-card border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm w-full text-sm">
            {card.header && (
              <div className="card-header p-2">
                {card.header.title && <strong className="font-semibold block text-slate-900">{card.header.title}</strong>}
                {card.header.subtitle && <span className="text-xs text-slate-500 block">{card.header.subtitle}</span>}
                {card.header.imageUrl && <img src={card.header.imageUrl} alt="Header" className="w-full rounded-md mt-2" />}
              </div>
            )}
            {card.sections?.map((section, secIndex) => (
              <div key={secIndex} className="section border-t border-slate-200 p-2 flex flex-col gap-2">
                {section.widgets.map((widget, widIndex) => (
                  <div key={widIndex}>
                    {widget.textParagraph && <p className="text-slate-700 leading-normal whitespace-pre-wrap text-sm">{widget.textParagraph.text}</p>}
                    {widget.image && <img src={widget.image.imageUrl} alt="Card content" className="max-w-full rounded-md" />}
                    {widget.buttonList?.buttons.map((btn, btnIndex) => (
                      <a key={btnIndex} href={btn.textButton.onClick.openLink.url} target="_blank" rel="noopener noreferrer" className="action-button inline-block mt-1 px-2 py-1 rounded-md bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors">
                        {btn.textButton.text}
                      </a>
                    ))}
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
          <div className="flex flex-col gap-2">
              {payload.cardsV2.map((cardV2Item: CardV2, index: number) => (
                  <div key={index} className="preview-card border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm w-full text-sm">
                      {cardV2Item.card.header && (
                          <div className="card-header p-2">
                              {cardV2Item.card.header.title && <strong className="font-semibold block text-slate-900">{cardV2Item.card.header.title}</strong>}
                              {cardV2Item.card.header.subtitle && <span className="text-xs text-slate-500 block">{cardV2Item.card.header.subtitle}</span>}
                          </div>
                      )}
                      {cardV2Item.card.sections.map((section, secIndex) => (
                          <div key={secIndex} className="section border-t border-slate-200 p-2 flex flex-col gap-1">
                              {section.widgets.map((widget, widIndex) => (
                                  <div key={widIndex} className="rounded-md bg-slate-200/50 p-2 text-slate-800 text-sm">
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
