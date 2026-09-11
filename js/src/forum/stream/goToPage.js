import { scrollListTop } from '../common/Pager';
import { pagerScrollOffset } from '../common/configApp';

export default function goToPage(stream, page, perPage, noAnimation = false, scrollIndex = null) {
  const s = stream;

  const total = s.count();
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const target = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);

  const start = (target - 1) * perPage;
  const end = start + perPage;

  const anchor = scrollIndex != null ? scrollIndex : start;

  s.paused = true;
  s.animateScroll = !noAnimation;
  s.index = anchor;

  if (scrollIndex != null) {
    // Deep link: let core anchor the linked post.
    s.needsScroll = true;
    s.targetPost = { index: anchor };
  } else {
    // Page navigation: core's built-in anchor ignores the admin scroll offset,
    // so we take over once posts are rendered.
    s.needsScroll = false;
    s.targetPost = null;
  }

  const promise = s.loadRange(start, end)
    .then((posts) => {
      s.show(posts);
      m.redraw();

      if (scrollIndex == null) {
        scrollListTop('.PostStream', pagerScrollOffset());
      }
    })
    .catch(() => {
      s.paused = false;
      s.needsScroll = false;
      m.redraw();
    });

  s.loadPromise = promise;

  return promise;
}
