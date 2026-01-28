export interface Topic {
  id: number;
  title: string;
  url: string;
  author: string;
  votes: number;
  comments: number;
  category?: string;
}
