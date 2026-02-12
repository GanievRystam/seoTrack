import {type Metrics} from  './metrics'
export type ProjectStatus = "ok" | "warning" | "error";

export type ProjectScript = {
  url: string;
  domain: string;
  type: string;
  impactMs: number;
  impactDescription: string;
};
export type Project = {
    id: string;
    name: string;
    status: ProjectStatus;
    description: string;
    alerts: number;
    lastIncidentAt: string;
    user: {
      id: string,
      email: string,
      createAt:string,
      name: string
    };
    metrics: Metrics;
    scripts:ProjectScript[]
  };
