import '../global.css'
import '../styles/main.css';

import '../styles/app.css'
import App from '../components/App.svelte'

const target = document.getElementById('app');
if (!target) throw new Error('Application container is missing.');
const app = new App({
  target,
})

export default app
