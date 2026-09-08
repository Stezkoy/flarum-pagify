import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import DiscussionComposer from 'flarum/forum/components/DiscussionComposer';
import DiscussionControls from 'flarum/forum/utils/DiscussionControls';

import overrideDiscussionList from './list/overrideDiscussionList';
import overrideDiscussionPage from './stream/overrideDiscussionPage';

app.initializers.add('stezkoy-pagify', () => {
  overrideDiscussionList();
  overrideDiscussionPage();

  // After a discussion is deleted, re-fetch the current page in place.
  extend(DiscussionControls, 'deleteAction', function () {
    if (!app.forum.attribute('stezkoyPagify.enableDiscussionList')) return;
    if (app.discussions) {
      const page = app.discussions.getLocation().page;
      app.discussions.refresh(page);
    }
  });

  // After a discussion is created, refresh the list (page 1).
  extend(DiscussionComposer.prototype, 'onsubmit', function () {
    if (!app.forum.attribute('stezkoyPagify.enableDiscussionList')) return;
    if (app.discussions) {
      app.discussions.refresh();
    }
  });
}, -2);