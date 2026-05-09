/**
 * GraphQL documents kept in one file so changes to the schema land in a
 * single, reviewable diff. Everything is plain template literal — no
 * `gql` tag is needed because we send the query as a string.
 */

export const GET_TODOS = /* GraphQL */ `
  query GetTodos($limit: Int!) {
    todos(options: { paginate: { limit: $limit } }) {
      data {
        id
        title
        completed
        user {
          id
          name
        }
      }
    }
  }
`;

export const CREATE_TODO = /* GraphQL */ `
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      id
      title
      completed
    }
  }
`;

export const UPDATE_TODO = /* GraphQL */ `
  mutation UpdateTodo($id: ID!, $input: UpdateTodoInput!) {
    updateTodo(id: $id, input: $input) {
      id
      title
      completed
    }
  }
`;

export const DELETE_TODO = /* GraphQL */ `
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;

// --- response shapes -----------------------------------------------------

export interface RemoteTodo {
  id: string;
  title: string;
  completed: boolean;
  user?: { id: string; name: string } | null;
}

export interface GetTodosData {
  todos: { data: RemoteTodo[] };
}

export interface CreateTodoVariables {
  input: { title: string; completed: boolean };
}
export interface CreateTodoData {
  createTodo: RemoteTodo;
}

export interface UpdateTodoVariables {
  id: string;
  input: { title?: string; completed?: boolean };
}
export interface UpdateTodoData {
  updateTodo: RemoteTodo;
}

export interface DeleteTodoVariables {
  id: string;
}
export interface DeleteTodoData {
  deleteTodo: boolean;
}
