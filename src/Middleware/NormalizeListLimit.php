<?php

namespace Stezkoy\Pagify\Middleware;

use Flarum\Settings\SettingsRepositoryInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as Handler;

/**
 * Give the discussion list a page size of the configured perPage.
 *
 * Flarum v2 preloads the list with page[number] (no page[limit], see
 * Forum\Content\Index), and the frontend only sends page[limit] once it knows
 * the page size from the response meta. Injecting page[limit] when it is absent
 * makes both the preloaded first page and the first frontend request use the
 * configured perPage; explicit client limits pass through untouched.
 *
 * perPage is an independent setting: it applies whether the page pagination
 * (numbered pager) or the core "Load more" behaviour is active, so a custom
 * value must not depend on the enableDiscussionList toggle.
 */
class NormalizeListLimit implements MiddlewareInterface
{
    public function __construct(private SettingsRepositoryInterface $settings)
    {
    }

    public function process(Request $request, Handler $handler): Response
    {
        if ($request->getMethod() === 'GET'
            && preg_match('#/discussions/?$#', $request->getUri()->getPath())
        ) {
            $perPage = (int) ($this->settings->get('stezkoy-pagify.perPage') ?: 20);

            if ($perPage !== 20) {
                $params = $request->getQueryParams();

                if (! isset($params['page']['limit'])) {
                    $params['page']['limit'] = $perPage;
                    $request = $request->withQueryParams($params);
                }
            }
        }

        return $handler->handle($request);
    }
}