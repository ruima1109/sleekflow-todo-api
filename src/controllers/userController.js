/**
 * Controller class for handling user-related operations.
 */
class UserController {

    /**
     * Creates an instance of UserController.
     * @param {UserService} userService - The user service instance.
     */
    constructor(userService) {
        /** @type {import('../services/userService')} */
        this.userService = userService;
        this.getUsersByList = this.getUsersByList.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this);
    }

    /**
     * Retrieves users by list ID.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     */
    async getUsersByList(req, res) {
        const listId = req.query.listId;

        if (!listId) {
            res.status(400).send('Missing list id');
            return;
        }

        try {
            const userToLists = await this.userService.getUsersByList(listId);
            res.json(userToLists);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = UserController;