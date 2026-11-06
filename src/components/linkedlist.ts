import { berechnungErforderlich } from "../pages/globals";

class Node {
    data: any;
    next: Node | null;
    prev: Node | null;

    constructor(data: any) {
        this.data = data;
        this.next = null;
        this.prev = null;
    }
}

export class LinkedList {
    head: Node | null;
    tail: Node | null;
    size: number;
    current_pos: number;

    current_next: Node | null;

    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
        this.current_pos = -1
        this.current_next = null;
    }

    // add a data to the end of the list (TAIL)
    append(data: any): void {
        berechnungErforderlich(true);
        const newNode: Node = new Node(data);
        if (this.tail) {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        } else {
            this.head = newNode;
            this.tail = newNode;
        }
        this.size++;
    }

    // add data to the start of the list (HEAD)
    prepend(data: any): void {
        berechnungErforderlich(true);
        const newNode: Node = new Node(data);
        if (this.head) {
            this.head.prev = newNode;
            newNode.next = this.head;
            this.head = newNode;
        } else {
            this.head = newNode;
            this.tail = newNode;
        }
        this.size++;
    }

    // insert data at a specific position (0 ... size, size = append)
    insertAt(data: any, position: number): void {
        if (position < 0 || position > this.size) {
            throw Error('Position ' + position + ' is not in the list');
        }
        if (position == 0) {
            this.prepend(data);
            return;
        }
        if (position == this.size) {
            this.append(data);
            return;
        }
        berechnungErforderlich(true);
        const currentNode = this.nodeAt(position);
        const newNode: Node = new Node(data);
        newNode.next = currentNode;
        newNode.prev = currentNode.prev;
        (currentNode.prev as Node).next = newNode;
        currentNode.prev = newNode;
        this.size++;
    }

    // remove a node at a specific position and return its data
    removeAt(position: number): any {
        if (position < 0 || position > this.size - 1) {
            throw Error('Position ' + position + ' is not in the list');
        }
        const node = this.nodeAt(position);
        this.unlink(node);
        return node.data;
    }

    // remove the first node holding data (identity), returns true if found
    remove(data: any): boolean {
        for (let node = this.head; node; node = node.next) {
            if (node.data === data) {
                this.unlink(node);
                return true;
            }
        }
        return false;
    }

    // position of data (identity) or -1
    indexOf(data: any): number {
        let index = 0;
        for (let node = this.head; node; node = node.next) {
            if (node.data === data) return index;
            index++;
        }
        return -1;
    }

    // return node data at a specific position
    getAt(position: number): any {
        if (position < 0 || position >= this.size) {
            throw Error('Position ' + position + ' is not in the list');
        }
        return this.nodeAt(position).data;
    }

    // get next data, only to be used in for loop (i=0 ... list.size)
    // ACHTUNG: es gibt nur einen Cursor pro Liste, verschachtelte Schleifen über
    // dieselbe Liste stören sich gegenseitig. Dafür besser for (const obj of list) verwenden.
    getNext(ind: number): any {
        if (ind === 0) {
            if (!this.head) throw Error('getNext on an empty list');
            this.current_pos = 0
            this.current_next = this.head.next;
            return this.head.data;
        } else {
            if (!this.current_next) throw Error('getNext beyond the end of the list');
            const data = this.current_next.data
            this.current_next = this.current_next.next;
            this.current_pos = ind;
            return data;
        }
    }

    // unabhängiger Iterator, verschachtelbar:  for (const obj of list) { ... }
    *[Symbol.iterator](): IterableIterator<any> {
        let node = this.head;
        while (node) {
            const next = node.next;    // vorher merken, falls node während der Schleife entfernt wird
            yield node.data;
            node = next;
        }
    }

    // return head data
    getHead(): any {
        if (this.size == 0) {
            throw Error('No head in an empty list');
        }
        this.current_pos = 0
        return (this.head as Node).data;
    }

    // return tail data
    getTail(): any {
        if (this.size == 0) {
            throw Error('No tail in an empty list');
        }
        return (this.tail as Node).data;
    }

    // remove list head and return its data
    removeHead(): any {
        if (this.size == 0) {
            throw Error('No head in an empty list');
        }
        const node = this.head as Node;
        this.unlink(node);
        return node.data;
    }

    // remove list tail and return its data
    removeTail(): any {
        if (this.size == 0) {
            throw Error('No tail in an empty list');
        }
        const node = this.tail as Node;
        this.unlink(node);
        return node.data;
    }

    // remove all entries
    clear(): void {
        if (this.size > 0) berechnungErforderlich(true);
        this.head = null;
        this.tail = null;
        this.size = 0;
        this.current_pos = -1;
        this.current_next = null;
    }

    // print list content in the console
    log(): void {
        if (this.size == 0) {
            console.log('Empty list');
            return;
        }
        console.log([...this].join(' <-> '));
    }

    //------------------------------------------------------------------------------------------------
    private nodeAt(position: number): Node {
        // von der näheren Seite her laufen
        if (position < this.size / 2) {
            let node = this.head as Node;
            for (let i = 0; i < position; i++) node = node.next as Node;
            return node;
        } else {
            let node = this.tail as Node;
            for (let i = this.size - 1; i > position; i--) node = node.prev as Node;
            return node;
        }
    }

    private unlink(node: Node): void {
        berechnungErforderlich(true);
        if (node.prev) node.prev.next = node.next;
        else this.head = node.next;
        if (node.next) node.next.prev = node.prev;
        else this.tail = node.prev;

        // getNext-Cursor nicht auf einem entfernten Knoten stehen lassen
        if (this.current_next === node) this.current_next = node.next;

        node.next = null;
        node.prev = null;
        this.size--;
    }
}
