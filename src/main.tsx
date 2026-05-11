import { createRoot, Root } from 'react-dom/client';
import App from './App.tsx';
import '@/assets/styles/main.less';

let root: Root | null = null;
export const RootID = 'root';
function render(props: { container?: HTMLDivElement | Document }) {
  const { container = document } = props;
  if (!container) {
    throw new Error('root element not found');
  }
  let rootEl = container.querySelector('#' + RootID);

  if (!rootEl) {
    rootEl = document.createElement('div');
    container.appendChild(rootEl);
  }

  root = createRoot(rootEl!);
  root.render(<App />);
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}

export async function bootstrap() {
  console.log('[react16] react app bootstraped');
}

export async function mount(props: { container?: HTMLDivElement }) {
  console.log('[react16] props from main framework', props);
  render(props);
}

export async function unmount() {
  if (root) {
    root.unmount();
    root = null;
  }
}
