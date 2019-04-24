import * as Babylon from "@babylonjs/core";
import * as _ from "lodash";

import { ItemType, ItemInfo, EventSubscriber, EventPublisher, EventMessage, EventHandler, EventType } from './types';
import { SceneController } from "./scene";
import { EventDispatcher } from "./event_dispatcher";

export class Item implements EventPublisher, EventSubscriber {
    private _id: number;
    get id(): number { return this._id; }
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
        this.initEventDetector();
        this.registerEventHandler();
    }

    initMesh(location: Babylon.Vector3): void {
        if (location.z != 0) {
            throw Error("Item location.z is not 0 !");
        }
        this._mesh = Babylon.Mesh.CreateSphere(this._name, 16, 1, SceneController.getInstance().gameScene);
        this._mesh.position = location;
        this._mesh.collisionMask
        // set color ...
    }

    initEventDetector(): void {
        let player = SceneController.getInstance().player;
        let that = this;
        this._mesh.actionManager = new Babylon.ActionManager(SceneController.getInstance().gameScene);
        this._mesh.actionManager.registerAction(
            new Babylon.ExecuteCodeAction({
                trigger: Babylon.ActionManager.OnIntersectionEnterTrigger,
                parameter: {
                    mesh: SceneController.getInstance().player.playerMesh,
                    usePreciseIntersection: true
                }
            }, (evt: Babylon.ActionEvent) => {
                console.log("item collide with Player, OnIntersectionEnterTrigger");
                console.log(evt);
                EventDispatcher.getInstance().receiveEvent(EventType.ItemCollideWithPlayer, {
                    object: that,
                    message: "Item Collide With Player"
                });
            })
        )

    }

    registerEventHandler(): void {
        EventDispatcher.getInstance().addEventHandler(EventType.ItemCollideWithPlayer, this.onCollisionWithPlayer);
    }

    private onCollisionWithPlayer(eventType: EventType, eventMessage: EventMessage) {
        console.log(eventType, eventMessage);

        // self remove
        this._mesh.dispose();
    }
}

export class ItemFactory implements EventSubscriber {
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

    // interface EventSubscriber
    registerEventHandler(): void {
        EventDispatcher.getInstance().addEventHandler(EventType.ItemCollideWithPlayer, this.onItemCollideWithPlayer);
    }

    private onItemCollideWithPlayer(eventType: EventType, eventMessage: EventMessage): void {
        this.destroyItem(eventMessage.object.id);
    }
}