import PostList from './components/PostList';
import PostForm from './components/PostForm';
import ConfirmDialog from './components/ConfirmDialog';
import Toast from './components/Toast';

export default function App() {
  return (
    <main className="app">
      <header className="app-header">
        <h1>Posts</h1>
        <p>
          A complete CRUD example backed by{' '}
          <a
            href="https://jsonplaceholder.typicode.com/"
            target="_blank"
            rel="noreferrer"
          >
            JSONPlaceholder
          </a>
          , Redux Box and redux-saga.
        </p>
      </header>

      <PostList />
      <PostForm />
      <ConfirmDialog />
      <Toast />
    </main>
  );
}
