import Button from 'flarum/common/components/Button';
import Component from 'flarum/common/Component';

export default class Pager extends Component {
  view() {
    const state = this.attrs.state;
    const trans = this.attrs.trans;
    const mode = this.attrs.mode || 'full';
    const windowSize = Math.max(1, parseInt(this.attrs.window, 10) || 3);

    const pageSize = state.pageSize || this.fallbackPerPage();
    const total = state.totalItems ?? this.payloadTotal(state) ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const current = Math.min(totalPages, state.getLocation().page || 1);

    const items = [];

    if (mode === 'mini') {
      items.push(this.navItem('fas fa-angle-left', current - 1, current === 1, 'forum.list.previous'));
      items.push(<li className="PagifyPager-current">{current} / {totalPages}</li>);
      items.push(this.navItem('fas fa-angle-right', current + 1, current === totalPages, 'forum.list.next'));
    } else {
      const pages = mode === 'compact'
        ? this.pageList(current, totalPages, windowSize)
        : this.compactPageList(current, totalPages, windowSize);

      items.push(this.navItem('fas fa-angle-double-left', 1, current === 1, 'forum.list.first'));
      items.push(this.navItem('fas fa-angle-left', current - 1, current === 1, 'forum.list.previous'));

      for (const page of pages) {
        items.push(page === '…' ? <li className="PagifyPager-ellipsis">…</li> : this.pageItem(page, current));
      }

      items.push(this.navItem('fas fa-angle-right', current + 1, current === totalPages, 'forum.list.next'));
      items.push(this.navItem('fas fa-angle-double-right', totalPages, current === totalPages, 'forum.list.last'));

      if (this.attrs.jump) {
        items.push(
          <li className="PagifyPager-jump">
            <input
              className="FormControl"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxLength={String(totalPages).length + 1}
              placeholder={String(current)}
              aria-label={trans('forum.list.jump')}
              title={trans('forum.list.jump')}
              onkeydown={(event) => {
                if (event.key === 'Enter') {
                  event.redraw = false;
                  this.jump(state, event.target.value);
                }
              }}
            />
          </li>,
          <li>
            <Button
              title={trans('forum.list.jump')}
              icon="fas fa-arrow-right"
              className="Button Button--icon"
              onclick={() => this.jump(state, this.element.querySelector('input')?.value)}
            />
          </li>
        );
      }
    }

    return (
      <div className="PagifyPager" aria-label={this.attrs.ariaLabel}>
        <ul className="PagifyPager-list">{items}</ul>
        {mode !== 'mini' && this.attrs.counter ? (
          <div className="PagifyPager-counter">{trans('forum.list.pageOf', { page: current, total: totalPages })}</div>
        ) : null}
      </div>
    );
  }

  navItem(icon, page, disabled, key) {
    return (
      <li>
        <Button
          title={this.attrs.trans(key)}
          icon={icon}
          className="Button Button--icon"
          onclick={() => this.goto(this.attrs.state, page)}
          disabled={disabled}
        />
      </li>
    );
  }

  pageItem(page, current) {
    return (
      <li>
        <Button
          title={String(page)}
          className={page === current ? 'Button Button--primary Button--active' : 'Button'}
          onclick={() => this.goto(this.attrs.state, page)}
        >
          {page}
        </Button>
      </li>
    );
  }

  fallbackPerPage() {
    return typeof this.attrs.perPage === 'function' ? this.attrs.perPage() : 20;
  }

  payloadTotal(state) {
    const firstPage = state.getPages()[0];
    const meta = firstPage && firstPage.items && firstPage.items.payload ? firstPage.items.payload.meta : null;
    const total = meta && meta.page ? meta.page.total : null;

    return total != null ? parseInt(total, 10) : null;
  }

  pageList(current, totalPages, windowSize) {
    const pages = [];
    const left = Math.max(1, current - windowSize);
    const right = Math.min(totalPages, current + windowSize);

    for (let i = left; i <= right; i++) pages.push(i);

    return pages;
  }

  compactPageList(current, totalPages, windowSize) {
    const items = [];
    const left = Math.max(2, current - windowSize);
    const right = Math.min(totalPages - 1, current + windowSize);

    items.push(1);
    if (left > 2) items.push('…');
    for (let i = left; i <= right; i++) items.push(i);
    if (right < totalPages - 1) items.push('…');
    if (totalPages > 1) items.push(totalPages);

    return items;
  }

  goto(state, page) {
    const pageSize = state.pageSize || this.fallbackPerPage();
    const total = state.totalItems ?? this.payloadTotal(state) ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const target = Math.min(Math.max(1, page), totalPages);

    if (target === (state.getLocation().page || 1)) return;

    state.goto(target).then(() => this.scrollToTop());
  }

  jump(state, rawValue) {
    const value = parseInt(rawValue, 10);
    if (!Number.isFinite(value) || !Number.isSafeInteger(value)) return;

    this.goto(state, value);
  }

  scrollToTop() {
    // This pager instance unmounts mid-request — resolve the list from the live DOM.
    // The post stream anchors its own scroll (goToPage), so it opts out.
    if (this.attrs.scroll === false) return;

    setTimeout(() => {
      const list = document.querySelector(this.attrs.scrollSelector || '.DiscussionList')
        || document.querySelector('.Page-content');
      const header = document.getElementById('header');
      const offsetY = header ? header.clientHeight : 0;
      const scrollOffset = parseInt(this.attrs.scrollOffset, 10);
      const extra = Number.isFinite(scrollOffset) ? scrollOffset : 80;

      if (list) {
        const targetPosition = list.getBoundingClientRect().top + window.scrollY - offsetY - extra;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    }, 50);
  }
}
