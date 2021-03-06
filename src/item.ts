import * as BABYLON from "@babylonjs/core";
import * as _ from "lodash";

import * as MyTypes from './types';
import { SceneController } from "./scene";
import { EventDispatcher } from "./event_dispatcher";

export class Item implements MyTypes.EventPublisher, MyTypes.EventSubscriber {
    private _id: number;
    get id(): number { return this._id; }
    private _name: string;
    private _type: MyTypes.ItemType;
    get type(): MyTypes.ItemType { return this._type; }
    private _quantity: number;
    get quantity(): number { return this._quantity; }
    private _price: number = 0;
    get price(): number { return this._price; }

    private _mesh: BABYLON.Mesh;
    get mesh(): BABYLON.Mesh { return this._mesh; }

    constructor(id: number, name: string, itemInfo: MyTypes.ItemInfo) {
        this._id = id;
        this._name = name;
        this._type = itemInfo.type;
        this._quantity = itemInfo.quantity;
        this._price = itemInfo.price;

        this.initMesh(itemInfo.location);
        this.initEventDetector();
        this.registerEventHandler();
    }

    initMesh(location: BABYLON.Vector3): void {
        if (location.z != 0) {
            throw Error("Item location.z is not 0 !");
        }
        let gameScene = SceneController.getInstance().gameScene;
        this._mesh = BABYLON.Mesh.CreateSphere(this._name, 16, 1, gameScene);
        this._mesh.position = location;

        let material = new BABYLON.StandardMaterial(_.join(["Item", "Material", this._id.toString()], '-'), gameScene);

        switch (this._type) {
            case MyTypes.ItemType.SoulBall:
                material.diffuseColor = new BABYLON.Color3(0, 238, 238);
                break;
            case MyTypes.ItemType.HPRecovery:
                material.diffuseColor = BABYLON.Color3.Red();
                break;
            case MyTypes.ItemType.SPRecovery:
                material.diffuseColor = new BABYLON.Color3(106, 90, 205);
                break;
            case MyTypes.ItemType.AddAttackDamage:
                material.diffuseColor = new BABYLON.Color3(192, 192, 192);
                break;
            case MyTypes.ItemType.AddMoveSpeed:
                material.diffuseColor = new BABYLON.Color3(238, 130, 238);
                break;
            case MyTypes.ItemType.AddSpRecoverSpeed:
                material.diffuseColor = BABYLON.Color3.Green();
                break;
        }

        this._mesh.material = material;
    }

    destroyMesh(): void {
        this._mesh.dispose();
    }

    initEventDetector(): void {
        let that = this;
        this._mesh.actionManager = new BABYLON.ActionManager(SceneController.getInstance().gameScene);
        this._mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction({
                trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
                parameter: {
                    mesh: SceneController.getInstance().player.playerMesh,
                    usePreciseIntersection: true
                }
            }, (evt: BABYLON.ActionEvent) => {
                if (SceneController.getInstance().gameStatus != MyTypes.GameStatus.GameRuntime) return;

                EventDispatcher.getInstance().receiveEvent(MyTypes.EventType.ItemCollideWithPlayer, {
                    object: that,
                    message: "Item Collide With Player"
                });
            })
        )

        // item with a price
        if (this._price > 0) {
            this._mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction({
                    trigger: BABYLON.ActionManager.OnIntersectionExitTrigger,
                    parameter: {
                        mesh: SceneController.getInstance().player.playerMesh,
                        usePreciseIntersection: true
                    }
                }, (evt: BABYLON.ActionEvent) => {
                    if (SceneController.getInstance().gameStatus != MyTypes.GameStatus.GameRuntime) return;

                    EventDispatcher.getInstance().receiveEvent(MyTypes.EventType.PlayerLeaveAnItem, {
                        object: that,
                        message: "Player leaves an purchas-able item"
                    });
                })

            )
        }

    }

    static getSoulBallItemInfo(quantity: number, location: BABYLON.Vector3): MyTypes.ItemInfo {
        return {
            type: MyTypes.ItemType.SoulBall,
            quantity: 10,
            price: 0,
            location: location,
        }
    }

    registerEventHandler(): void {
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.ItemCollideWithPlayer, Item.getFnOnCollisionWithPlayer(this));

        if (this._price > 0) {
            EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.ItemBePurchased, Item.getFnOnItemBePurchased(this));
        }
    }

    static getFnOnCollisionWithPlayer(item: Item): MyTypes.EventHandler {
        return (eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) => {
            if (item == undefined) return;
            if (item == eventMessage.object) {
                if (item._price == 0) {
                    setTimeout(() => {
                        (<Item>item).destroyMesh() // might have some post-error
                    }, 100);
                } else {
                    // maybe: a color change / price text show up
                }
            }
        }
    }

    static getFnOnItemBePurchased(item: Item): MyTypes.EventHandler {
        return (eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) => {
            if (item == undefined) return;
            if (item == eventMessage.object) {
                setTimeout(() => {
                    item.destroyMesh();
                }, 100);
            }
        }
    }
}

export class ItemFactory implements MyTypes.EventSubscriber {
    private _items: Array<Item>;

    constructor() {
        this._items = new Array<Item>();

        this.registerEventHandler();
    }

    reset(): void {
        this._items.forEach((item) => {
            if (item !== undefined) {
                item.destroyMesh();
            }
        })
        this._items = new Array<Item>();
    }

    test(): void {
        this.createNewItem({
            type: MyTypes.ItemType.SoulBall,
            quantity: 10,
            price: 0,
            location: new BABYLON.Vector3(15, 7, 0),
        });

        // test an item which needs to be purchased
        this.createNewItem({
            type: MyTypes.ItemType.HPRecovery,
            quantity: 20,
            price: 20,
            location: new BABYLON.Vector3(12, 6, 0),
        });
    }

    createItemsByItemInfoCollection(itemInfo: Array<MyTypes.ItemInfo>) {
        itemInfo.forEach((itemInfo: MyTypes.ItemInfo) => {
            this.createNewItem(itemInfo);
        });
    }

    createNewItem(itemInfo: MyTypes.ItemInfo): void {
        let newItemName = _.join(["Item", itemInfo.type, this._items.length.toString()], '-');
        this._items.push(new Item(this._items.length, newItemName, itemInfo));
    }

    /**
     * This sets the _items[itemId] to undefined. So the index incrementation will not be affected.
     * @param itemId item's index in _item
     */
    removeItemById(itemId: number): void {
        delete this._items[itemId];
    }

    // interface EventSubscriber
    registerEventHandler(): void {
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.ItemCollideWithPlayer, ItemFactory.getFnOnItemCollideWithPlayer(this));
    }

    static getFnOnItemCollideWithPlayer(object: any) {
        return (eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) => {
            if (object == undefined) return;
            <ItemFactory>object.removeItemById(eventMessage.object.id);
        }
    }

}