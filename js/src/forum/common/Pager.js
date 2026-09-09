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
      items.push(this.navItem('fas fa-chevron-left', current - 1, current === 1, 'forum.list.previous'));
      items.push(<span className="PagifyPager-current">{current} / {totalPages}</span>);
      items.push(this.navItem('fas fa-chevron-right', current + 1, current === totalPages, 'forum.list.next'));
    } else if (mode === 'core') {
      items.push(this.navItem('fas fa-step-backward', 1, current === 1, 'forum.list.first'));
      items.push(this.navItem('fas fa-chevron-left', current - 1, current === 1, 'forum.list.previous'));
      items.push(
        <span className="PagifyPager-core">
          {trans('forum.list.pageInput', {
            input: (
              <input
                className="FormControl PagifyPager-numInput"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                value={String(current)}
                maxLength={String(totalPages).length}
                aria-label={trans('forum.list.jump')}
                autocomplete="off"
                onchange={(event) => {
                  const value = parseInt(event.target.value, 10);

                  if (!Number.isFinite(value)) {
                    event.target.value = String(current);
                    return;
                  }

                  const target = Math.min(Math.max(1, value), totalPages);
                  event.target.value = String(target);

                  if (target !== current) this.goto(state, target);
                }}
              />
            ),
            total: totalPages,
          })}
        </span>
      );
      items.push(this.navItem('fas fa-chevron-right', current + 1, current === totalPages, 'forum.list.next'));
      items.push(this.navItem('fas fa-step-forward', totalPages, current === totalPages, 'forum.list.last'));
    } else {
      const pages = mode === 'compact'
        ? this.pageList(current, totalPages, windowSize)
        : this.compactPageList(current, totalPages, windowSize);

      items.push(this.navItem('fas fa-step-backward', 1, current === 1, 'forum.list.first'));
      items.push(this.navItem('fas fa-chevron-left', current - 1, current === 1, 'forum.list.previous'));

      for (const page of pages) {
        items.push(page === '…' ? <span className="PagifyPager-ellipsis">…</span> : this.pageItem(page, current));
      }

      items.push(this.navItem('fas fa-chevron-right', current + 1, current === totalPages, 'forum.list.next'));
      items.push(this.navItem('fas fa-step-forward', totalPages, current === totalPages, 'forum.list.last'));
    }

    if (this.attrs.jump && mode !== 'core') {
      items.push(
        <span className="PagifyPager-jump">
          <input
            className="FormControl PagifyPager-numInput"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxLength={String(totalPages).length + 1}
            placeholder={String(current)}
            aria-label={trans('forum.list.jump')}
            autocomplete="off"
            onkeydown={(event) => {
              if (event.key === 'Enter') {
                event.redraw = false;
                this.jump(state, event.target.value);
              }
            }}
          />
          <Button
            title={trans('forum.list.jump')}
            aria-label={trans('forum.list.jump')}
            icon="fas fa-arrow-right"
            className="Button Button--icon PagifyPager-jumpGo"
            onclick={() => this.jump(state, this.element.querySelector('input')?.value)}
          />
        </span>
      );
    }

    return (
      <nav className="PagifyPager" aria-label={this.attrs.ariaLabel || trans('forum.list.aria_label')}>
        {items}
        {mode !== 'mini' && mode !== 'core' && this.attrs.counter ? (
          <span className="PagifyPager-counter">{trans('forum.list.pageOf', { page: current, total: totalPages })}</span>
        ) : null}
      </nav>
    );
  }

  navItem(icon, page, disabled, key) {
    return (
      <Button
        title={this.attrs.trans(key)}
        aria-label={this.attrs.trans(key)}
        icon={icon}
        className="Button Button--icon"
        onclick={() => this.goto(this.attrs.state, page)}
        disabled={disabled}
      />
    );
  }

  pageItem(page, current) {
    return (
      <Button
        title={String(page)}
        aria-label={String(page)}
        aria-current={page === current ? 'page' : undefined}
        className={page === current ? 'Button Button--primary Button--active' : 'Button'}
        onclick={() => this.goto(this.attrs.state, page)}
      >
        {page}
      </Button>
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
