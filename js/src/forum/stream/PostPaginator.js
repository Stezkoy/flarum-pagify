import Component from 'flarum/common/Component';

import goToPage from './goToPage';
import Pager from '../common/Pager';
import { postsPerPage, streamEnabled } from './config';
import { pagerMode, pagerWindow, pagerCounter, pagerJumpStream, pagerIcons, mobileCompact, mobileSmall, mobileHideJump, mobileHideCounter, pagerTrans } from '../common/config';

export default class PostPaginator extends Component {
  view() {
    const stream = this.attrs.stream;

    if (!streamEnabled()) return null;

    const perPage = postsPerPage();
    const total = stream.count();
    const pageCount = Math.max(1, Math.ceil(total / perPage));

    if (pageCount <= 1) return null;

    const current = Math.min(pageCount, Math.floor(stream.visibleStart / perPage) + 1);

    const state = {
      pageSize: perPage,
      totalItems: total,
      getLocation: () => ({ page: current }),
      goto: (page) => goToPage(stream, page, perPage),
      getPages: () => [],
    };

    return (
      <Pager
        state={state}
        perPage={() => perPage}
        trans={pagerTrans}
        mode={pagerMode()}
        window={pagerWindow()}
        counter={pagerCounter()}
        jump={pagerJumpStream()}
        scroll={false}
        ariaLabel={pagerTrans('forum.post_stream.aria_label')}
        icons={pagerIcons()}
        mobileCompact={mobileCompact()}
        mobileSmall={mobileSmall()}
        mobileHideJump={mobileHideJump()}
        mobileHideCounter={mobileHideCounter()}
      />
    );
  }
}
