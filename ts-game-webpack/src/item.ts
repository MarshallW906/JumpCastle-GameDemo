import * as Babylon from "@babylonjs/core";
import * as _ from "lodash";

import { ItemType, ItemInfo } from './types';
import { SceneController } from "./scene";
import { type } from "os";

export class Item {
    private _id: number;
    private _name: string;
    private _type: ItemType;
    get type(): ItemType { return this._type; }
    private _quantity: number;
    private _price: number = 0;

    private _mesh: Babylon.Mesh;

    constructor(id: number, name: string, location: Babylon.Vector3, itemInfo: ItemInfo) {
        this._id = id;
        this._name = name;
        this._type = itemInfo.type;
        this._quantity = itemInfo.quantity;
        this._price = itemInfo.price;

        this.initMesh(location);
    }

    initMesh(location: Babylon.Vector3): void {
        if (location.z != 0) {
            throw Error("Item location.z is not 0 !");
        }
        this._mesh = Babylon.Mesh.CreateSphere(this._name, 16, 1, SceneController.getInstance().gameScene);
        // then add a collider
        // this._mesh.collider = 
        this._mesh.position = location;
        // set color ...
    }
}

export class ItemFactory {
    private _items: Array<Item>;

    constructor() {
        this.init();
    }

    init(): void {
        this._items = new Array<Item>();
    }

    test(): void {
        this.createNewItem({
            type: ItemType.SoulBall,
            quantity: 10,
            price: 0
        }, new Babylon.Vector3(15, 7, 0));
    }

    createNewItem(itemInfo: ItemInfo, location: Babylon.Vector3): void {
        let newItemName = _.join(["Item", itemInfo.type, this._items.length.toString()], '-');
        this._items.push(new Item(this._items.length, newItemName, location, itemInfo));
    }

    /**
     * This sets the _items[itemId] to undefined. So the index incrementation will not be affected.
     * @param itemId item's index in _item
     */
    destroyItem(itemId: number): void {
        delete this._items[itemId];
    }
}