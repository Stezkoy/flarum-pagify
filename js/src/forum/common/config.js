// App-free helpers only: importing the forum app here would break the admin
// bundle (no core:forum/app module in the admin realm) via the shared Pager.
export function isPhone() {
  return window.matchMedia('(max-width: 767px)').matches;
}

export function setPageParam(page) {
  const url = new URL(window.location.href);

  if (page > 1) url.searchParams.set('page', String(page));
  else url.searchParams.delete('page');

  window.history.pushState(null, '', url.toString());
}

let activeList = null;

export function setActiveList(entry) {
  activeList = entry;
}

export function getActiveList() {
  return activeList;
}
