import { ItemType } from './types'

export class Item {
    id: number;
    name: string;
    itemType: ItemType;
    quantity: number;
    price: number;
}

export class ItemFactory {
    private items = new Array<Item>();

    createNewItem(): void { }
    destroyItem(): void { }
}