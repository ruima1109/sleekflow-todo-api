const { v4: uuidv4 } = require('uuid');

/**
 * A class for generating unique IDs.
 */
class IdGenerator {
    constructor() {
    }

    /**
     * Generates a version 4 UUID.
     * @returns {string} The generated UUID.
     */
    generateUUIDv4() {
      return uuidv4();
    }
}

module.exports = IdGenerator;