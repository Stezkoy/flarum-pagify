import app from 'flarum/forum/app';
import { override } from 'flarum/common/extend';
import DiscussionList from 'flarum/forum/components/DiscussionList';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Placeholder from 'flarum/common/components/Placeholder';
import classList from 'flarum/common/utils/classList';

import DiscussionListPager from './DiscussionListPager';
import { listEnabled, perPage, position } from './config';

/**
 * Render the discussion list as a single page plus a numbered pager.
 *
 * The v2 core's PaginatedListState already knows pageSize (from meta.perPage)
 * and totalItems (from meta.page.total) and already has goto(page), which swaps
 * the loaded page — so the pagination state needs no custom overrides. We only
 * take over the view: show the current page alone, drop the "Load more"
 * button, and render the pager above and/or under the list.
 */
export default function overrideDiscussionList() {
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

    return (
      <div className={classList('DiscussionList', { 'DiscussionList--searchResults': state.isSearchResults() })}>
        {pos === 'above' || pos === 'both' ? DiscussionListPager.component({ state }) : null}
        {discussionList}
        {pos === 'under' || pos === 'both' ? DiscussionListPager.component({ state }) : null}
      </div>
    );
  });
}