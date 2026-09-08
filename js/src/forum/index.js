import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import DiscussionControls from 'flarum/forum/utils/DiscussionControls';

import overrideDiscussionList from './list/overrideDiscussionList';
import overrideDiscussionPage from './stream/overrideDiscussionPage';
import overridePostList from './posts/overridePostList';

app.initializers.add('stezkoy-pagify', () => {
  overrideDiscussionList();
  overrideDiscussionPage();
  overridePostList();

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