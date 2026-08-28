export type EmailCategory = 'Primary' | 'Social' | 'Promotions' | 'Updates' | 'Spam' | string;

export interface CustomRule {
  id: string;
  category: string;
  field: 'sender' | 'subject' | 'body' | 'any';
  operator: 'contains' | 'equals' | 'startsWith';
  value: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  sender: string;
  senderName?: string;
  senderEmail?: string;
  subject: string;
  body: string;
  snippet: string;
  date: string;
  category: EmailCategory;
  summary?: string;
  actionItems?: string[];
  classificationReason?: string;
  isRead: boolean;
  isMeetingRequest?: boolean;
  unsubscribeUrl?: string;
  unsubscribeMailto?: string;
  unsubscribed?: boolean;
}

export interface ProcessEmailsRequest {
  maxResults?: number;
  customRules: CustomRule[];
  customCategories: string[];
}

export interface ProcessEmailsResponse {
  emails: EmailMessage[];
}

export interface GenerateReplyRequest {
  email: {
    sender: string;
    subject: string;
    body: string;
  };
  tone: 'professional' | 'friendly' | 'concise' | 'direct' | 'apologetic';
  additionalInstructions?: string;
}

export interface GenerateReplyResponse {
  reply: string;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  threadId?: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId: string;
}

export interface FollowUpReminder {
  id: string;
  threadId: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  date: string;
  daysAgo: number;
}
