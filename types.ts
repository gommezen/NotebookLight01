
export interface Source {
  id: string;
  title: string;
  content: string;
}

export enum MessageSender {
  USER = 'user',
  BOT = 'bot',
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: MessageSender;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}