import app from 'flarum/forum/app';

export function listEnabled() {
  return !!app.forum.attribute('stezkoyPagify.enableDiscussionList');
}

export function perPage() {
  return parseInt(app.forum.attribute('stezkoyPagify.perPage')) || 20;
}

export function position() {
  const value = app.forum.attribute('stezkoyPagify.paginationPosition');
  return ['above', 'under', 'both'].includes(value) ? value : 'under';
}