
export enum Sender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: number;
  isToolOutput?: boolean;
  toolName?: string;
}

export interface DomCommand {
  id: string;
  type: 'click' | 'type' | 'select';
  selector: string;
  value?: string;
}

export interface BrowserState {
  url: string;
  title: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  contentPreview: string;
  htmlContent?: string; 
  pendingCommand?: DomCommand; 
}

export interface ActionLog {
  id: string;
  timestamp: number;
  action: string;
  details: string;
  status: 'pending' | 'success' | 'error';
}

export type Theme = 'dark' | 'light';

export interface ScheduledTask {
  id: string;
  time: string; // Format "HH:mm" (24h)
  command: string;
  active: boolean;
  lastRun?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  theme: Theme;
  data: {
    messages: Message[];
    browserState: BrowserState;
    logs: ActionLog[];
    tasks: ScheduledTask[]; // Added tasks
  };
  created: number;
}
