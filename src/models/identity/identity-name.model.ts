import {
    Identity,
} from './identity.model';

export class IdentityName {
    public name!: string;
    public identity!: Identity;
    public weight!: number;

    public toString() {
        return this.name;
    }
}
