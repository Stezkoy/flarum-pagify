<?php

use Flarum\Extend;
use Stezkoy\Pagify\Middleware\ConvertPostStreamNear;
use Stezkoy\Pagify\Middleware\NormalizeListLimit;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),

    new Extend\Locales(__DIR__.'/locale'),

    (new Extend\Settings())
        ->default('stezkoy-pagify.enableDiscussionList', '1')
        ->default('stezkoy-pagify.enablePostStream', '1')
        ->default('stezkoy-pagify.enablePostList', '1')
        ->default('stezkoy-pagify.perPage', 20)
        ->default('stezkoy-pagify.postsPerPage', 20)
        ->default('stezkoy-pagify.postListPerPage', 20)
        ->default('stezkoy-pagify.paginationPosition', 'under')
        ->default('stezkoy-pagify.postStreamPosition', 'both')
        ->default('stezkoy-pagify.postListPosition', 'under')
        ->default('stezkoy-pagify.pagerMode', 'full')
        ->default('stezkoy-pagify.pagerWindow', 3)
        ->default('stezkoy-pagify.pagerCounter', '')
        ->default('stezkoy-pagify.pagerJumpList', '1')
        ->default('stezkoy-pagify.pagerJumpStream', '1')
        ->default('stezkoy-pagify.pagerJumpFeed', '1')
        ->serializeToForum('stezkoyPagify.enableDiscussionList', 'stezkoy-pagify.enableDiscussionList', fn ($value) => (bool) $value)
        ->serializeToForum('stezkoyPagify.enablePostStream', 'stezkoy-pagify.enablePostStream', fn ($value) => (bool) $value)
        ->serializeToForum('stezkoyPagify.enablePostList', 'stezkoy-pagify.enablePostList', fn ($value) => (bool) $value)
        ->serializeToForum('stezkoyPagify.perPage', 'stezkoy-pagify.perPage', fn ($value) => (int) $value)
        ->serializeToForum('stezkoyPagify.postsPerPage', 'stezkoy-pagify.postsPerPage', fn ($value) => (int) $value)
        ->serializeToForum('stezkoyPagify.postListPerPage', 'stezkoy-pagify.postListPerPage', fn ($value) => (int) $value)
        ->serializeToForum('stezkoyPagify.paginationPosition', 'stezkoy-pagify.paginationPosition')
        ->serializeToForum('stezkoyPagify.postStreamPosition', 'stezkoy-pagify.postStreamPosition')
        ->serializeToForum('stezkoyPagify.postListPosition', 'stezkoy-pagify.postListPosition')
        ->serializeToForum('stezkoyPagify.pagerMode', 'stezkoy-pagify.pagerMode')
        ->serializeToForum('stezkoyPagify.pagerWindow', 'stezkoy-pagify.pagerWindow', fn ($value) => (int) $value)
        ->serializeToForum('stezkoyPagify.pagerCounter', 'stezkoy-pagify.pagerCounter', fn ($value) => (bool) $value)
        ->serializeToForum('stezkoyPagify.pagerJumpList', 'stezkoy-pagify.pagerJumpList', fn ($value) => (bool) $value)
        ->serializeToForum('stezkoyPagify.pagerJumpStream', 'stezkoy-pagify.pagerJumpStream', fn ($value) => (bool) $value)
        ->serializeToForum('stezkoyPagify.pagerJumpFeed', 'stezkoy-pagify.pagerJumpFeed', fn ($value) => (bool) $value),

    // API-мiddleware: в v2 браузер получает количество страниц/элементов уже в
    // meta.page.total, поэтому никаких кастомных count/serializer не нужно —
    // достаточно подправить page[limit] списка и окно прелоада постов.
    (new Extend\Middleware('api'))
        ->add(NormalizeListLimit::class)
        ->add(ConvertPostStreamNear::class),
];