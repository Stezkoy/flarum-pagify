import app from 'flarum/forum/app';

export function streamEnabled() {
  return !!app.forum.attribute('stezkoyPagify.enablePostStream');
}

export function postsPerPage() {
  return parseInt(app.forum.attribute('stezkoyPagify.postsPerPage')) || 20;
}

export function streamPosition() {
  const value = app.forum.attribute('stezkoyPagify.postStreamPosition');
  return ['above', 'under', 'both'].includes(value) ? value : 'both';
}