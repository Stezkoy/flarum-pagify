import app from 'flarum/forum/app';

export function pagerMode() {
  const value = app.forum.attribute('stezkoyPagify.pagerMode');
  return ['full', 'compact', 'mini', 'core'].includes(value) ? value : 'full';
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

export function pagerScrollOffset() {
  const value = parseInt(app.forum.attribute('stezkoyPagify.pagerScrollOffset'));
  return Number.isFinite(value) ? value : 80;
}

export function isPhone() {
  return window.matchMedia('(max-width: 767px)').matches;
}

const ICON_KEYS = ['First', 'Prev', 'Next', 'Last', 'Jump'];

export function pagerIcons() {
  const icons = {};

  for (const key of ICON_KEYS) {
    const value = (app.forum.attribute('stezkoyPagify.pagerIcon' + key) || '').trim();
    icons[key.toLowerCase()] = value || null;
  }

  return icons;
}

export function mobileCompact() {
  return !!app.forum.attribute('stezkoyPagify.mobileCompact');
}

export function mobileSmall() {
  return !!app.forum.attribute('stezkoyPagify.mobileSmall');
}

export function mobileHideJump() {
  return !!app.forum.attribute('stezkoyPagify.mobileHideJump');
}

export function mobileHideCounter() {
  return !!app.forum.attribute('stezkoyPagify.mobileHideCounter');
}

export function pagerTrans(key, params) {
  return app.translator.trans('stezkoy-pagify.' + key, params);
}
