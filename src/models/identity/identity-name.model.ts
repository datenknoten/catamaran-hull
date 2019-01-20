/*!
 * @License MIT
 */

import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

import {
    Identity,
} from './identity.model';


/**
 * A name for an identity
 */
@Entity()
export class IdentityName {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name!: string;

    public identity!: Identity;

    @Column()
    public identityId!: string;

    @Column()
    public weight!: number;

    /**
     * Convert this entity to string
     */
    public toString() {
        return this.name;
    }
}
