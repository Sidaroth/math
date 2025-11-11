import { IUpdatable } from './IUpdatable';

// stub - todo
export class Entity implements IUpdatable {
    update(_deltaTime: number): void {
        throw new Error('Method not implemented.');
    }
}
