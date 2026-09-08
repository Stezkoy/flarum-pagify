<?php

namespace Stezkoy\Pagify\Middleware;

use Flarum\Settings\SettingsRepositoryInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as Handler;

/**
 * Align the server-side preloaded post window with the configured postsPerPage.
 *
 * Flarum v2 preloads the post stream through the LIST endpoint /posts with
 * filter[discussion] and a page[near]=<post number>, page[offset] and
 * page[limit] computed for the hard-coded 20-post window (see
 * Forum\Content\Discussion). This middleware rewrites that request so the
 * preloaded window is exactly one postsPerPage-sized page containing the
 * anchored post. `near` keeps its native "post number" meaning, so the frontend
 * (PostStreamState + the paginated stream's oncreate snap) works unchanged.
 *
 * The client's own runtime navigation (loadNearNumber) sends page[near]
 * WITHOUT page[limit], so it never matches here and is never touched.
 *
 * postsPerPage is an independent setting: the aligned preload window applies
 * whether the paginated stream or the core infinite-scroll/"Load more"
 * behaviour is active, so it must not depend on the enablePostStream toggle.
 */
class ConvertPostStreamNear implements MiddlewareInterface
{
    public function __construct(private SettingsRepositoryInterface $settings)
    {
    }

    public function process(Request $request, Handler $handler): Response
    {
        if ($request->getMethod() === 'GET'
            && preg_match('#/posts/?$#', $request->getUri()->getPath())
        ) {
            $params = $request->getQueryParams();

            if (isset($params['filter']['discussion'], $params['page']['near'], $params['page']['limit'])
                && is_numeric($params['page']['near'])
            ) {
                $near = (int) $params['page']['near'];
                $perPage = (int) ($this->settings->get('stezkoy-pagify.postsPerPage') ?: 20);

                if ($near > 0 && $perPage !== 20) {
                    $params['page']['offset'] = intdiv($near - 1, $perPage) * $perPage;
                    $params['page']['limit'] = $perPage;
                    $request = $request->withQueryParams($params);
                }
            }
        }

        return $handler->handle($request);
    }
}