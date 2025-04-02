import { 
  User, 
  InsertUser, 
  ApiSettings, 
  InsertApiSettings, 
  Project, 
  InsertProject 
} from "@shared/schema";

// Storage interface with methods for CRUD operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // API Settings methods
  getApiSettings(userId: string): Promise<ApiSettings | undefined>;
  saveApiSettings(settings: InsertApiSettings): Promise<ApiSettings>;

  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  getUserProjects(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private apiSettings: Map<string, ApiSettings>;
  private projects: Map<number, Project>;
  private userIdCounter: number;
  private apiSettingsIdCounter: number;
  private projectIdCounter: number;

  constructor() {
    this.users = new Map();
    this.apiSettings = new Map();
    this.projects = new Map();
    this.userIdCounter = 1;
    this.apiSettingsIdCounter = 1;
    this.projectIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // API Settings methods
  async getApiSettings(userId: string): Promise<ApiSettings | undefined> {
    return Array.from(this.apiSettings.values()).find(
      (setting) => setting.userId === userId
    );
  }

  async saveApiSettings(settings: InsertApiSettings): Promise<ApiSettings> {
    // Check if settings already exist for this user
    const existingSettings = await this.getApiSettings(settings.userId);
    
    if (existingSettings) {
      const updatedSettings: ApiSettings = {
        ...existingSettings,
        endpoint: settings.endpoint,
        apiKey: settings.apiKey,
        model: settings.model
      };
      this.apiSettings.set(existingSettings.id, updatedSettings);
      return updatedSettings;
    } else {
      const id = this.apiSettingsIdCounter++;
      const newSettings: ApiSettings = { ...settings, id };
      this.apiSettings.set(id, newSettings);
      return newSettings;
    }
  }

  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId
    );
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const newProject: Project = { ...project, id };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = await this.getProject(id);
    
    if (existingProject) {
      const updatedProject: Project = { 
        ...existingProject,
        ...project,
        updatedAt: new Date().toISOString()
      };
      this.projects.set(id, updatedProject);
      return updatedProject;
    }
    
    return undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }
}

export const storage = new MemStorage();
