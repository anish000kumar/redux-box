import Board from './components/Board';
import CardForm from './components/CardForm';
import ConfirmDialog from './components/ConfirmDialog';
import Toast from './components/Toast';

export default function App() {
  return (
    <main className="app">
      <Board />
      <CardForm />
      <ConfirmDialog />
      <Toast />
    </main>
  );
}
