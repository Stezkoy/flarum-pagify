import app from 'flarum/forum/app';

export function pagerMode() {
  const value = app.forum.attribute('stezkoyPagify.pagerMode');
  return ['full', 'compact', 'mini'].includes(value) ? value : 'full';
}

export function pagerWindow() {
  return Math.max(1, parseInt(app.forum.attribute('stezkoyPagify.pagerWindow')) || 3);
}

export function pagerCounter() {
  return !!app.forum.attribute('stezkoyPagify.pagerCounter');
}

export function pagerJumpList() {
  return !!app.forum.attribute('stezkoyPagify.pagerJumpList');
}

export function pagerJumpStream() {
  return !!app.forum.attribute('stezkoyPagify.pagerJumpStream');
}

export function pagerJumpFeed() {
  return !!app.forum.attribute('stezkoyPagify.pagerJumpFeed');
}

export function pagerTrans(key, params) {
  return app.translator.trans('stezkoy-pagify.' + key, params);
}
