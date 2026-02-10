import { baseApi } from "../../../shared/api/baseApi";
import type { Project } from "../../../shared/types/project";
import type { CheckRun } from "../../../shared/types/run";

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProjects: build.query<Project[], void>({
      query: () => "/projects",
      providesTags: ["Projects"],
    }),
    getProject: build.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: ["Projects"],
    }),
    getCheckRuns: build.query<CheckRun[], string>({
      query: (projectId) => `/projects/${projectId}/check-runs`,
      providesTags: ["CheckRuns"],
    }),
    startCheckRun: build.mutation<{ ok: boolean; runId: string }, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/check-runs`,
        method: "POST",
      }),
      invalidatesTags: ["CheckRuns"],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useGetCheckRunsQuery,
  useStartCheckRunMutation,
} = projectsApi;
