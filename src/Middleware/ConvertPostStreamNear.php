<?php

namespace Stezkoy\Pagify\Middleware;

use Flarum\Http\RequestUtil;
use Flarum\Settings\SettingsRepositoryInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as Handler;

/**
 * Realign the preloaded /posts window (filter[discussion] + page[near/limit])
 * to one postsPerPage-sized page containing the anchored post, keeping the
 * native "post number" meaning of near. Applies only with post pagination on;
 * runtime loadNearNumber requests carry no page[limit] and are never touched.
 */
class ConvertPostStreamNear implements MiddlewareInterface
{
    public function __construct(private SettingsRepositoryInterface $settings)
    {
    }

    public function process(Request $request, Handler $handler): Response
    {
        // Only server-side preloads are rewritten: the browser's own
        // loadNearNumber sends page[near] without page[limit], and external
        // clients are free to fetch any window they ask for.
        if ($request->getMethod() === 'GET'
            && RequestUtil::isInternal($request)
            && $this->settings->get('stezkoy-pagify.enablePostStream')
            && preg_match('#/posts/?$#', $request->getUri()->getPath())
        ) {
            $params = $request->getQueryParams();

            if (isset($params['filter']['discussion'], $params['page']['near'], $params['page']['limit'])
                && is_numeric($params['page']['near'])
            ) {
                $near = (int) $params['page']['near'];
                $perPage = min(50, max(1, (int) ($this->settings->get('stezkoy-pagify.postsPerPage') ?: 20)));

                if ($near > 0) {
                    $params['page']['offset'] = intdiv($near - 1, $perPage) * $perPage;
                    $params['page']['limit'] = $perPage;
                    $request = $request->withQueryParams($params);
                }
            }
        }

        return $handler->handle($request);
    }
}