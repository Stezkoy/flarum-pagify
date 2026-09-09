import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import DiscussionControls from 'flarum/forum/utils/DiscussionControls';

import overrideDiscussionList from './list/overrideDiscussionList';
import overrideDiscussionPage from './stream/overrideDiscussionPage';
import overridePostList from './posts/overridePostList';
import { urlPage, getActiveList, readPageParam } from './common/config';
import { scrollListTop } from './common/Pager';

app.initializers.add('stezkoy-pagify', () => {
  overrideDiscussionList();
  overrideDiscussionPage();
  overridePostList();

  // Redraw when the phone breakpoint flips so mobile pager settings apply live.
  window.matchMedia('(max-width: 767px)').addEventListener('change', () => m.redraw());

  // Browser back/forward across paginated pages (?page=N).
  window.addEventListener('popstate', () => {
    if (!urlPage()) return;

    const active = getActiveList();
    if (!active) return;

    const urlSearchParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlSearchParams.get('page'), 10) || 1;
    const current = active.state.getLocation().page || 1;

    if (page === current) return;

    active.state.goto(page).then(() => scrollListTop(active.scrollSelector, active.scrollOffset));
  });

  extend(DiscussionControls, 'deleteAction', function () {
    if (!app.forum.attribute('stezkoyPagify.enableDiscussionList')) return;
    if (app.discussions) {
      const page = app.discussions.getLocation().page;
      app.discussions.refresh(page);
    }
  });

  extend('flarum/forum/components/DiscussionComposer', 'onsubmit', function () {
    if (!app.forum.attribute('stezkoyPagify.enableDiscussionList')) return;
    if (app.discussions) {
      app.discussions.refresh();
    }
  });
}, -2);