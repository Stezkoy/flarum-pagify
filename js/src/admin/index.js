import app from 'flarum/admin/app';
import PagifySettingsPage from './components/PagifySettingsPage';

app.initializers.add('stezkoy-pagify', () => {
  app.registry.for('stezkoy-pagify').registerPage(PagifySettingsPage);
});