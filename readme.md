# Pagify

![License](https://img.shields.io/badge/license-MIT-blue.svg) [![Latest Stable Version](https://img.shields.io/packagist/v/stezkoy/flarum-pagify.svg)](https://packagist.org/packages/stezkoy/flarum-pagify) [![Total Downloads](https://img.shields.io/packagist/dt/stezkoy/flarum-pagify.svg)](https://packagist.org/packages/stezkoy/flarum-pagify)

A Flarum extension that replaces "Load More" / infinite scrolling with numbered pagination for the discussion list and the post stream.

[Русская версия](readme_ru.md)

## Features

### Discussion List Pagination
Replaces the "Load More" button on the index page with a numbered pager.
- Choose the number of **discussions per page**
- Pick the pager position — **above**, **below** or **both** sides of the list
- Jump straight to a page using the **page-number field** (type the number and press Enter or the go button)

### Post Stream Pagination
Replaces infinite scrolling inside a discussion with numbered pages.
- Choose the number of **posts per page**
- Pick the pager position — **above**, **below** or **both** sides of the post stream
- **Posts per page applies only when post-stream pagination is enabled** — with it off, posts load the standard Flarum way

### Flexible per-Page Counts
- **Discussions per page** also works when list pagination is off: it controls the size of each "Load More" batch.
- When list pagination is on, the pager appears immediately without touching the main discussion list.

## Installation

```bash
composer require stezkoy/flarum-pagify
```

## Requirements

- Flarum 2.0
- PHP 8.3+

## Configuration

All settings are configured in **Admin > Extensions > Pagify**. Each feature can be toggled on/off independently:

- **Paginate the discussion list** — numbered pages on the index page
- **Discussions per page** — page size for the list (also the "Load More" batch size when pagination is off)
- **Pager position** — where the list pager shows (above / below / both)
- **Paginate posts inside a discussion** — numbered pages in the post stream
- **Posts per page** — page size inside a discussion (only when post-stream pagination is on)
- **Post pager position** — where the post pager shows (above / below / both)

## License

MIT