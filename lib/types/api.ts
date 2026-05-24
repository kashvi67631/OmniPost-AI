export type ApiUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  timezone: string | null;
  company: string | null;
  createdAt: string;
};

export type ApiUserResponse = {
  user: ApiUser;
  usage: ApiUsage;
};

export type ApiUsage = {
  used: number;
  limit: number;
  percent: number;
};

export type HistoryItem = {
  id: string;
  title: string;
  date: string;
  channels: string[];
  status: string;
  contentType: string;
};

export type GeneratedPostResponse = {
  dispatchId: string;
  twitterThread: string[];
  linkedinPost: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type AnalyticsResponse = {
  kpis: Array<{
    label: string;
    value: string;
    change: string;
    up: boolean;
  }>;
  platformPerformance: Array<{
    name: string;
    value: number;
  }>;
  engagementTimeline: Array<{
    date: string;
    value: number;
  }>;
  totalDispatches: number;
};

export type TemplateItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  content: string | null;
  useCount: number;
};

export type PlatformResult = {
  platform: string;
  status: string;
  postUrl: string | null;
  errorMessage: string | null;
};

export type IntegrationItem = {
  platform: string;
  connected: boolean;
  accountName: string | null;
  tokenPreview: string | null;
  externalId: string | null;
  updatedAt: string | null;
};

export type PublishResponse = {
  dispatchId: string;
  status: string;
  message: string;
  distributedTo: string[];
  generatedPost: GeneratedPostResponse;
  platformResults: PlatformResult[];
  analytics: {
    impressions: number;
    engagements: number;
    clicks: number;
  } | null;
};
