export default function goToPage(stream, page, perPage, noAnimation = false, scrollIndex = null) {
  const s = stream;

  const total = s.count();
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const target = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);

  const start = (target - 1) * perPage;
  const end = start + perPage;

  const anchor = scrollIndex != null ? scrollIndex : start;

  s.paused = true;
  s.needsScroll = true;
  s.targetPost = { index: anchor };
  s.animateScroll = !noAnimation;
  s.index = anchor;

  const promise = s.loadRange(start, end)
    .then((posts) => {
      s.show(posts);
      m.redraw();
    })
    .catch(() => {
      s.paused = false;
      s.needsScroll = false;
      m.redraw();
    });

  s.loadPromise = promise;

  return promise;
}