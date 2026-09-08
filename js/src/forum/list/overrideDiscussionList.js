import app from 'flarum/forum/app';
import { override } from 'flarum/common/extend';
import DiscussionList from 'flarum/forum/components/DiscussionList';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import DiscussionListState from 'flarum/forum/states/DiscussionListState';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Placeholder from 'flarum/common/components/Placeholder';
import classList from 'flarum/common/utils/classList';

import Pager from '../common/Pager';
import { listEnabled, perPage, position } from './config';

/**
 * Render the discussion list as a single page plus a numbered pager.
 *
 * Two problems needed fixing on top of the stock state:
 *
 * 1. View — show the current page alone, drop the "Load more" button, and
 *    render a numbered pager above and/or under the list.
 *
 * 2. Page size — v2's list responses carry pagination dimensions in
 *    `meta.page.{offset,limit,total}`, NOT a top-level `meta.perPage`, so the
 *    stock PaginatedListState always keeps `pageSize = DEFAULT_PAGE_SIZE` (20).
 *    The NormalizeListLimit middleware trims the server-side preload to our
 *    configured perPage, which makes page 1 look right, but every subsequent
 *    fetch would then be asked for offset/limit on the core's hard-coded 20.
 *    `loadPage` is re-implemented below to force `pageSize = perPage()` for
 *    both the preloaded document and all live requests.
 */
export default function overrideDiscussionList() {
  // Force the configured perPage onto the list state so that every live
  // request, the pager's page math, and (in "Load more" mode) each batch the
  // stock DiscussionList fetches agree with what the middleware trims the
  // server-side preload (page 1) to. perPage is independent of the
  // enableDiscussionList toggle.
  override(DiscussionListState.prototype, 'loadPage', function (original, page) {
    const preloaded = app.preloadedApiDocument();
    if (preloaded) {
      this.initialLoading = false;
      this.pageSize = perPage();

      return Promise.resolve(preloaded);
    }

    this.pageSize = perPage();

    return original(page);
  });

  override(DiscussionList.prototype, 'view', function (original) {
    const state = this.attrs.state;

    if (!listEnabled()) {
      return original();
    }

    if (state.isEmpty()) {
      const text = app.translator.trans('core.forum.discussion_list.empty_text');
      return (
        <div className="DiscussionList">
          <Placeholder text={text} />
        </div>
      );
    }

    const params = state.getParams();
    const isLoading = state.isLoading();
    const pageSize = perPage();
    const pageNum = state.getLocation().page || 1;

    let items = [];
    for (const page of state.getPages()) {
      if (page.number === pageNum) {
        items = page.items;
        break;
      }
    }

    if (!items.length) {
      return (
        <div className={classList('DiscussionList', { 'DiscussionList--searchResults': state.isSearchResults() })}>
          <ul role="feed" aria-busy={isLoading} className="DiscussionList-discussions"></ul>
          <div className="DiscussionList-loadMore">
            <LoadingIndicator />
          </div>
        </div>
      );
    }

    const discussionList = (
      <ul role="feed" aria-busy={isLoading} className="DiscussionList-discussions">
        {items.map((discussion, itemNum) => (
          <li key={discussion.id()} data-id={discussion.id()} role="article" aria-setsize="-1" aria-posinset={(pageNum - 1) * pageSize + itemNum + 1}>
            <DiscussionListItem discussion={discussion} params={params} />
          </li>
        ))}
      </ul>
    );

    const pos = position();

    const pager = () => Pager.component({ state, perPage, scrollSelector: '.DiscussionList' });

    return (
      <div className={classList('DiscussionList', { 'DiscussionList--searchResults': state.isSearchResults() })}>
        {pos === 'above' || pos === 'both' ? pager() : null}
        {discussionList}
        {pos === 'under' || pos === 'both' ? pager() : null}
      </div>
    );
  });
}