import { BuffType, Property } from "./types";

export interface Buff {
    /**
     * Permanent, Time, dependOnMap
     */
    type: BuffType,
    /**
     * count in milliseconds. Applicable if BuffType is "Time"
     */
    time?: number,
    /**
     * One property per buff. If some buff has multiple effects then it will be divided.
     */
    propertyAffected: Property,
    /**
     * use negative number to represent "subtract".
     */
    quantityToChange: number,
}