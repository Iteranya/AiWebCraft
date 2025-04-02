export interface ApiSettings {
  endpoint: string;
  apiKey: string;
  model: string;
  maxTokens: number;
}

export type EditorTab = "html" | "css" | "js";

export interface EditorContent {
  html: string;
  css: string;
  js: string;
}

export interface PreviewDevice {
  name: string;
  width: string;
  icon: string;
}

export interface Project {
  id?: number;
  name: string;
  htmlContent: string;
  cssContent?: string;
  jsContent?: string;
}
