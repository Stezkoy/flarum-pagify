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

export function pagerButtonSize() {
  const value = parseInt(app.forum.attribute('stezkoyPagify.pagerButtonSize'));
  return value >= 24 && value <= 72 ? value : 36;
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

export function mobileButtonSize() {
  const value = parseInt(app.forum.attribute('stezkoyPagify.mobileButtonSize'));
  return value >= 14 && value <= 60 ? value : 22;
}

export function mobileHideJump() {
  return !!app.forum.attribute('stezkoyPagify.mobileHideJump');
}

export function mobileHideCounter() {
  return !!app.forum.attribute('stezkoyPagify.mobileHideCounter');
}

export function urlPage() {
  return !!app.forum.attribute('stezkoyPagify.urlPage');
}

export function readPageParam() {
  if (!urlPage()) return 1;

  const page = parseInt(m.route.param('page'), 10);

  return Number.isFinite(page) && page > 1 ? page : 1;
}

export function pagerTrans(key, params) {
  return app.translator.trans('stezkoy-pagify.' + key, params);
}
