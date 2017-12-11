export enum Operation {
    /** Create new token */
    CREATE = 0,
    /** New token created ok */
    CREATED = 1,
    /** Get token validity and value */
    REQUEST = 2,
    /** Token valid, value enclosed */
    VALUE = 3,
    /** Token invalid */
    NOVALUE = 4,
    /** Delete token (log out) */
    DELETE = 5,
    /** Token deleted ok */
    DELETED = 6,
    /** Data sync operations */
    SYNC = 7,
    /** Update token payload */
    UPDATE = 10,
    /** Token payload updated ok */
    UPDATED = 11,
    /** Check machine auth signature */
    CHECKSIG = 12,
}
