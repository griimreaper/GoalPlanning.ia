// services/metaService.ts
import { mainApi } from "../apis";
import { getToken } from "../tokenService";

export interface Objective {
  id: number;
  title: string;
  description: string;
  scheduled_at: string;
  youtube_links: string;
  status: string;
}

export interface GoalDetail {
  id: number;
  title: string;
  deadline: number;
  availability: string;
  state: string;
  objectives: Objective[];
}

export interface NewGoal {
  meta: string;
  disponibilidad: string;
  plazo_dias: number; // usar número de días en el payload (más claro que "30 days")

  // Campos nuevos
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  formats?: Array<'Video' | 'Exercises' | string>; // permití strings por si agregás otros
  session_length?: number; // minutos
  focus?: 'Depth' | 'Breadth' | 'Speed';
  language?: 'es' | 'en' | string;
  checkpoints?: 'weekly' | 'biweekly' | 'none' | string;

  // ubicación opcional
  location?: {
    country: {
      code: string;
      name: string;
    }
  } | null;
}


// CREATE GOAL
export const createGoal = async (newGoal: NewGoal) => {
  const token = await getToken();
  if (!token) throw new Error("User not authenticated");

  try {
    const payload = { ...newGoal };
    const { data } = await mainApi.post("/goals/generate-objectives/", payload, {
      headers: { Authorization: `Token ${token}` }
    });
    return data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.error ||
        error.response.data?.message ||
        "Error creating goal"
      );
    }
    throw new Error(error.message || "Error creating goal");
  }
};

// GET ALL GOALS
export const getGoals = async () => {
  const token = await getToken();

  if (!token) throw new Error("User not authenticated");

  const { data } = await mainApi.get("/goals/", {
    headers: { Authorization: `Token ${token}` }
  });

  return data;
};

// GET GOAL DETAIL
export const getGoalDetail = async (goal_id: number): Promise<GoalDetail> => {
  const token = await getToken();
  if (!token) throw new Error("User not authenticated");

  const { data } = await mainApi.get(`/goals/${goal_id}/`, {
    headers: { Authorization: `Token ${token}` }
  });
  return data;
};

// UPDATE GOAL
export const updateGoal = async (goal_id: number, updatedGoal: Partial<NewGoal>) => {
  const token = await getToken();
  if (!token) throw new Error("User not authenticated");

  try {
    const { data } = await mainApi.patch(`/goals/${goal_id}/update/`, updatedGoal, {
      headers: { Authorization: `Token ${token}` }
    });
    return data;
  } catch (error: any) {
    if (error.response) throw new Error(error.response.data?.error || error.response.data?.message || "Error updating goal");
    throw new Error(error.message || "Error updating goal");
  }
};

// DELETE GOAL
export const deleteGoal = async (goal_id: number) => {
  const token = await getToken();
  if (!token) throw new Error("User not authenticated");

  try {
    await mainApi.delete(`/goals/${goal_id}/delete/`, {
      headers: { Authorization: `Token ${token}` }
    });
    return { success: true };
  } catch (error: any) {
    if (error.response) throw new Error(error.response.data?.error || error.response.data?.message || "Error deleting goal");
    throw new Error(error.message || "Error deleting goal");
  }
};

// UPDATE OBJECTIVE
export const updateObjectiveStatus = async (goal_id: number, objective_id: number, updatedObjective: Partial<Objective>) => {
  const token = await getToken();
  if (!token) throw new Error("User not authenticated");

  try {
    const { data } = await mainApi.patch(
      `/goals/${goal_id}/objectives/${objective_id}/update/`,
      updatedObjective,
      { headers: { Authorization: `Token ${token}` } }
    );
    return data;
  } catch (error: any) {
    if (error.response) throw new Error(error.response.data?.error || error.response.data?.message || "Error updating objective");
    throw new Error(error.message || "Error updating objective");
  }
};

// REVIEW OBJECTIVE (adapt objective with AI feedback)
export const reviewObjective = async (
  goal_id: number,
  objective_id: number,
  reviewData: {
    difficulty: string;
    interest: string;
    time: string;
    comment?: string;
  }
) => {
  const token = await getToken();
  if (!token) throw new Error("User not authenticated");

  try {
    const { data } = await mainApi.post(
      `/goals/${goal_id}/objectives/${objective_id}/review/`,
      reviewData,
      { headers: { Authorization: `Token ${token}` } }
    );
    return data;
  } catch (error: any) {
    if (error.response)
      throw new Error(
        error.response.data?.error ||
        error.response.data?.message ||
        "Error reviewing objective"
      );
    throw new Error(error.message || "Error reviewing objective");
  }
};

// EXTEND GOAL OBJECTIVES
export const extendGoal = async (
  goal_id: number,
  payload: {
    extension: '1 week' | '1 month';
    level: 'easier' | 'harder' | 'same';
    priority: string;
    comment?: string;
  }
) => {
  const token = await getToken();
  if (!token) throw new Error("User not authenticated");

  try {
    const { data } = await mainApi.post(
      `/goals/${goal_id}/extend/`,
      payload,
      {
        headers: { Authorization: `Token ${token}` }
      }
    );
    // data puede devolver los nuevos objetivos
    return data;
  } catch (error: any) {
    if (error.response)
      throw new Error(
        error.response.data?.error ||
        error.response.data?.message ||
        "Error extending goal"
      );
    throw new Error(error.message || "Error extending goal");
  }
};
