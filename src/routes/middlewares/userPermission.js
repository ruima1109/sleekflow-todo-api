/**
 * Middleware to check user authentication permission.
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const userAuthPermission = (req, res, next) => {
    const awsUsername = req.apiGateway?.event?.requestContext?.authorizer?.claims?.['cognito:username'];
    const reqUsername = req.params?.id;

    if (awsUsername !== reqUsername) {
        console.error(`Invalid user request aws username: ${awsUsername}, req username: ${reqUsername}`);
        return res.status(401).send('The request is not authorized.');
    }
    next();
};

/**
 * Middleware to check user list permissions.
 * @param {import('../../services/todoListService')} todoListService - The service for managing todo lists
 * @param {number[]} allowedRoles - Array of allowed roles
 * @returns {Function} - Middleware function
 */
const userListPermission = (todoListService, allowedRoles) => {
    return async (req, res, next) => {
        try {
            const username = req.params.id;
            const listId = req.params.lid;
            if (!listId) {
                return res.status(400).json({ error: 'Missing list ID' });
            }
            const userToListData = await todoListService.findUserToListKeys(username, listId);
            if (!userToListData || !allowedRoles.includes(userToListData.role)) {
                return res.status(403).json({ error: 'You do not have permission for this list' });
            }
            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    };
};

module.exports = {
    userAuthPermission,
    userListPermission
};