
export interface OpenLink {
  url: string;
}

export interface OnClick {
  openLink: OpenLink;
}

export interface TextButton {
  text: string;
  onClick: OnClick;
}

export interface Button {
  textButton: TextButton;
}

export interface Image {
  imageUrl: string;
}

export interface TextParagraph {
  text: string;
}

export interface ButtonList {
  buttons: Button[];
}

export interface Widget {
  textParagraph?: TextParagraph;
  image?: Image;
  buttonList?: ButtonList;
}

export interface Section {
  widgets: Widget[];
}

export interface CardHeader {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
}

export interface Card {
  header?: CardHeader;
  sections: Section[];
}

// --- Poll Card Types ---

export interface DecoratedText {
  text: string;
  onClick?: any;
}

export interface PollWidget {
  decoratedText: DecoratedText;
}

export interface PollSection {
  widgets: PollWidget[];
}

export interface PollCard {
  header?: CardHeader;
  sections: PollSection[];
}

export interface CardV2 {
  cardId: string;
  card: PollCard;
}

// --- Main Payload Type ---

export interface ChatMessagePayload {
  text?: string;
  cards?: Card[];
  cardsV2?: CardV2[];
}

export interface HistoryItem {
  timestamp: number;
  payload: ChatMessagePayload;
}

// --- New: Saved Webhook Type ---
export interface SavedWebhook {
  id: string;
  name: string;
  url: string;
}

// --- Sync Container ---
export interface UserDataContainer {
  history: HistoryItem[];
  webhooks: SavedWebhook[];
}
