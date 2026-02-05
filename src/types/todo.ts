export type Todo = {
  id: string;
  title: string;
  memo: string;
  completed: boolean;
  createdAt: string;
};

export type FilterType = "all" | "active" | "completed";
