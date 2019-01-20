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
 * Image of an identity
 */
@Entity()
export class IdentityImage {
    @PrimaryGeneratedColumn()
    public id: number;

    /**
     * The blob id of the image
     */
    @Column()
    public blobId!: string;

    public identity!: Identity;

    @Column()
    public identityId!: string;

    @Column()
    public weight!: number;

    /**
     * Convert the object to string
     */
    public toString() {
        return this.blobId;
    }
}
