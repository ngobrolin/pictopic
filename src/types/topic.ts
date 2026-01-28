export interface Topic {
  id: number;
  title: string;
  url: string;
  author: string;
  votes: number;
  comments: number;
  category?: string;
}

export interface TopicHistory {
  pickedTopics: number[];
  lastUpdated: number;
}

export interface TopicWithStatus extends Topic {
  isPicked: boolean;
}
