import app from 'flarum/forum/app';

export function postListEnabled() {
  return !!app.forum.attribute('stezkoyPagify.enablePostList');
}

export function postListPerPage() {
  return parseInt(app.forum.attribute('stezkoyPagify.postListPerPage')) || 20;
}

export function postListPosition() {
  const value = app.forum.attribute('stezkoyPagify.postListPosition');
  return ['above', 'under', 'both'].includes(value) ? value : 'under';
}
