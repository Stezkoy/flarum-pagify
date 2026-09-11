import app from 'flarum/forum/app';
import { override, extend } from 'flarum/common/extend';
import DiscussionList from 'flarum/forum/components/DiscussionList';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import DiscussionListState from 'flarum/forum/states/DiscussionListState';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Placeholder from 'flarum/common/components/Placeholder';
import classList from 'flarum/common/utils/classList';

import Pager from '../common/Pager';
import { listEnabled, perPage, position } from './config';
import { pagerMode, pagerWindow, pagerCounter, pagerJumpList, pagerScrollOffset, pagerButtonSize, pagerIcons, mobileCompact, mobileSmall, mobileButtonSize, mobileHideJump, mobileHideCounter, pagerTrans, urlPage, readPageParam } from '../common/configApp';
import { setActiveList } from '../common/config';

export default function overrideDiscussionList() {
  override(DiscussionListState.prototype, 'loadPage', function (original, page) {
    const preloaded = app.preloadedApiDocument();
    if (preloaded) {
      this.initialLoading = false;
      this.pageSize = perPage();

      // A deep link like /?page=5 preloads page 5 server-side — adopt it as
      // the current page instead of mislabelling it as page 1.
      const requested = readPageParam();
      if (requested > 1) this.location = { page: requested };

      // The preloaded doc bypasses core's response parsing — apply the same
      // meta extraction core does in PaginatedListState.parseResults.
      const meta = preloaded && preloaded.payload && preloaded.payload.meta;
      const usedTotal = meta && meta.page ? meta.page.total : null;

      if (usedTotal && this.totalItems !== parseInt(usedTotal, 10)) {
        this.totalItems = parseInt(usedTotal, 10);
      }

      return Promise.resolve(preloaded);
    }

    this.pageSize = perPage();

    return original(page);
  });

  override(DiscussionList.prototype, 'view', function (original) {
    const state = this.attrs.state;

    setActiveList({ state, scrollSelector: '.DiscussionList', scrollOffset: pagerScrollOffset() });

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

    const pager = () => Pager.component({
      state,
      perPage,
      scrollSelector: '.DiscussionList',
      trans: pagerTrans,
      updateUrl: urlPage(),
      mode: pagerMode(),
      window: pagerWindow(),
      counter: pagerCounter(),
      jump: pagerJumpList(),
      scrollOffset: pagerScrollOffset(),
      buttonSize: pagerButtonSize(),
      icons: pagerIcons(),
      mobileCompact: mobileCompact(),
      mobileSmall: mobileSmall(),
      mobileButtonSize: mobileButtonSize(),
      mobileHideJump: mobileHideJump(),
      mobileHideCounter: mobileHideCounter(),
    });

    return (
      <div className={classList('DiscussionList', { 'DiscussionList--searchResults': state.isSearchResults() })}>
        {pos === 'above' || pos === 'both' ? pager() : null}
        {discussionList}
        {pos === 'under' || pos === 'both' ? pager() : null}
      </div>
    );
  });

  extend(DiscussionList.prototype, 'onremove', function () {
    if (urlPage()) setActiveList(null);
  });
}