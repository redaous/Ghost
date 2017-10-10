var utils = require('../utils'),
    filters = require('../filters'),
    handleError = require('./frontend/error'),
    postLookup = require('./frontend/post-lookup'),
    renderPost = require('./frontend/render-post'),
    setRequestIsSecure = require('./frontend/secure');

module.exports = function single(req, res, next) {
    // Query database to find post
    return postLookup(req.path).then(function then(lookup) {
        var post = lookup ? lookup.post : false;

        if (!post) {
            return next();
        }

        // CASE: postlookup can detect options for example /edit, unknown options get ignored and end in 404
        if (lookup.isUnknownOption) {
            return next();
        }

        // CASE: last param is of url is /edit, redirect to admin
        if (lookup.isEditURL) {
            return res.redirect(utils.url.urlJoin(utils.url.urlFor('admin'), 'editor', post.id, '/'));
        }

        // CASE: permalink is not valid anymore, we redirect him permanently to the correct one
        if (post.url !== req.path) {
            return res.redirect(301, post.url);
        }

        setRequestIsSecure(req, post);

        filters.doFilter('prePostsRender', post, res.locals)
            .then(renderPost(req, res));
    }).catch(handleError(next));
};
